/* Panduan Jurusan — mesin translate ID/EN (otomatis semua halaman, tanpa ubah konten) */
(function () {
  'use strict';

  var KEY = 'pj-lang';
  var DICT = window.PJ_I18N || {};
  var PATTERNS = [];
  var origText = new WeakMap();
  var origAttr = new WeakMap();

  function norm(s) {
    return String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
  }

  function escRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Susun pola '#' -> regex, kunci terpanjang dulu agar pola spesifik menang.
  // Tiap pola menyimpan potongan literal terpanjang sebagai penyaring cepat
  // agar tidak menjalankan puluhan regex untuk setiap node teks.
  (function build() {
    try {
      var keys = Object.keys(DICT).filter(function (k) { return k.indexOf('#') > -1; });
      keys.sort(function (a, b) { return b.length - a.length; });
      PATTERNS = keys.map(function (k) {
        var parts = k.split('#').map(escRe);
        var chunk = '';
        for (var i = 0; i < parts.length; i++) {
          var plain = parts[i].replace(/\\/g, '');
          if (plain.length > chunk.length) chunk = plain;
        }
        return { key: k, en: DICT[k], re: new RegExp('^' + parts.join('(.+?)') + '$'), chunk: chunk.length >= 3 ? chunk : '' };
      });
    } catch (e) { PATTERNS = []; }
  })();

  function cur() {
    try { return localStorage.getItem(KEY) || 'id'; } catch (e) { return 'id'; }
  }
  window.__LANG = cur() === 'en' ? 'en' : 'id';

  function segTranslate(s) {
    // Terjemahkan isi slot bertingkat (label di dalam kalimat dinamis)
    try {
      if (DICT[s]) return DICT[s];
    } catch (e) {}
    return s;
  }

  function lookup(text) {
    var key = norm(text);
    if (!key) return null;
    if (Object.prototype.hasOwnProperty.call(DICT, key)) return { t: DICT[key], pat: null };
    for (var i = 0; i < PATTERNS.length; i++) {
      var p = PATTERNS[i];
      if (p.chunk && key.indexOf(p.chunk) === -1) continue;
      var m = p.re.exec(key);
      if (m) return { t: p.en, pat: m.slice(1) };
    }
    return null;
  }

  function fillSlots(tmpl, slots) {
    var i = 0;
    return String(tmpl).replace(/#/g, function () {
      var s = slots[i++];
      if (s == null) return '#';
      return segTranslate(norm(s));
    });
  }

  function pad(orig, translated) {
    var m = /^(\s*)([\s\S]*?)(\s*)$/.exec(orig);
    if (!m) return translated;
    return m[1] + translated + m[3];
  }

  function translateNode(node) {
    try {
      var v = node.nodeValue;
      if (!v || !/\S/.test(v)) return;
      // Jalur cepat: mode ID dan node belum pernah diterjemahkan = tidak ada kerjaan
      if (window.__LANG !== 'en' && !origText.has(node)) return;
      if (window.__LANG === 'en') {
        var hit = lookup(v);
        if (hit) {
          if (!origText.has(node)) origText.set(node, v);
          node.nodeValue = pad(v, hit.pat ? fillSlots(hit.t, hit.pat) : hit.t);
        }
      } else if (origText.has(node)) {
        node.nodeValue = origText.get(node);
      }
    } catch (e) {}
  }

  var ATTRS = ['placeholder', 'aria-label', 'title', 'alt'];

  function translateElAttrs(el) {
    try {
      for (var i = 0; i < ATTRS.length; i++) {
        var a = ATTRS[i];
        if (!el.hasAttribute || !el.hasAttribute(a)) continue;
        var v = el.getAttribute(a);
        if (window.__LANG === 'en') {
          var hit = lookup(v);
          if (hit) {
            var saved = origAttr.get(el);
            if (!saved) { saved = {}; origAttr.set(el, saved); }
            if (!(a in saved)) saved[a] = v;
            el.setAttribute(a, hit.pat ? fillSlots(hit.t, hit.pat) : hit.t);
          }
        } else {
          var s2 = origAttr.get(el);
          if (s2 && (a in s2)) el.setAttribute(a, s2[a]);
        }
      }
    } catch (e) {}
  }

  function skipNode(node) {
    try {
      var el = node.nodeType === 1 ? node : node.parentElement;
      if (!el || !el.closest) return false;
      return !!el.closest('script,style,noscript,svg,[data-i18n-skip]');
    } catch (e) {}
    return false;
  }

  function walk(root) {
    try {
      var w = document.createTreeWalker(root || document.documentElement, NodeFilter.SHOW_TEXT, {
        acceptNode: function (n) { return skipNode(n) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }
      });
      var nodes = [];
      var n;
      while ((n = w.nextNode())) nodes.push(n);
      nodes.forEach(translateNode);
      var els = (root && root.querySelectorAll) ? root.querySelectorAll('[placeholder],[aria-label],[title],[alt]') : [];
      for (var i = 0; i < els.length; i++) translateElAttrs(els[i]);
      if (root && root.hasAttribute) translateElAttrs(root);
    } catch (e) {}
  }

  function observe() {
    try {
      // Antrekan perubahan diproses sekali per frame agar tidak lag
      // saat banyak DOM disuntik sekaligus (mis. feather.replace).
      var queued = [];
      var scheduled = false;
      var inProcess = false;
      function process() {
        scheduled = false;
        if (inProcess) return;
        inProcess = true;
        try {
          var muts = queued;
          queued = [];
          for (var i = 0; i < muts.length; i++) {
            var m = muts[i];
            if (m.type === 'characterData') {
              if (!skipNode(m.target)) translateNode(m.target);
            } else if (m.type === 'attributes') {
              if (ATTRS.indexOf(m.attributeName) > -1) translateElAttrs(m.target);
            } else {
              for (var j = 0; j < m.addedNodes.length; j++) {
                var nd = m.addedNodes[j];
                if (nd.nodeType === 3) { if (!skipNode(nd)) translateNode(nd); }
                else if (nd.nodeType === 1) {
                  if (nd.tagName === 'SCRIPT' || nd.tagName === 'STYLE' || nd.tagName === 'NOSCRIPT') continue;
                  walk(nd);
                }
              }
            }
          }
        } catch (e) {}
        inProcess = false;
      }
      var obs = new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) queued.push(muts[i]);
        if (queued.length > 2000) queued.splice(0, queued.length - 2000);
        if (!scheduled) {
          scheduled = true;
          if (window.requestAnimationFrame) window.requestAnimationFrame(process);
          else window.setTimeout(process, 0);
        }
      });
      obs.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    } catch (e) {}
  }

  function paintToggle() {
    try {
      var btn = document.getElementById('langToggle');
      if (!btn) return;
      btn.textContent = window.__LANG === 'en' ? 'ID' : 'EN';
      btn.setAttribute('aria-pressed', String(window.__LANG === 'en'));
    } catch (e) {}
  }

  function apply(lang) {
    window.__LANG = lang === 'en' ? 'en' : 'id';
    try { localStorage.setItem(KEY, window.__LANG); } catch (e) {}
    try { document.documentElement.setAttribute('lang', window.__LANG); } catch (e) {}
    walk(document.documentElement);
    paintToggle();
    try {
      var ev;
      if (typeof CustomEvent === 'function') ev = new CustomEvent('pj:lang', { detail: { lang: window.__LANG } });
      else { ev = document.createEvent('CustomEvent'); ev.initCustomEvent('pj:lang', false, false, { lang: window.__LANG }); }
      window.dispatchEvent(ev);
    } catch (e) {}
  }

  window.PJ_setLang = apply;

  function mountToggle() {
    try {
      var btn = document.getElementById('langToggle');
      if (btn) btn.addEventListener('click', function () {
        apply(window.__LANG === 'en' ? 'id' : 'en');
      });
    } catch (e) {}
  }

  apply(window.__LANG);
  observe();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { paintToggle(); mountToggle(); });
  } else { paintToggle(); mountToggle(); }
})();
