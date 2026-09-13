/* Panduan Jurusan — favorit (wishlist) + bandingkan jurusan */
(function () {
  'use strict';

  var FAV_KEY = 'panduan-jurusan-favorit';
  var MAX_CMP = 3;
  var selected = [];

  function feather() {
    try { if (window.feather) window.feather.replace(); } catch (e) {}
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function getFav() {
    try {
      var raw = localStorage.getItem(FAV_KEY);
      var d = raw ? JSON.parse(raw) : [];
      return Array.isArray(d) ? d : [];
    } catch (e) { return []; }
  }

  function setFav(list) {
    try { localStorage.setItem(FAV_KEY, JSON.stringify(list)); } catch (e) {}
  }

  function isFav(name) { return getFav().indexOf(name) > -1; }

  function toggleFav(name) {
    var list = getFav();
    var i = list.indexOf(name);
    if (i > -1) { list.splice(i, 1); toast('Dihapus dari favorit'); }
    else { list.push(name); toast('Ditambah ke favorit'); }
    setFav(list);
    refreshCards();
  }

  var toastTimer = null;
  function toast(msg) {
    try {
      var t = document.getElementById('pjToast');
      if (!t) {
        t = document.createElement('div');
        t.id = 'pjToast';
        t.className = 'pj-toast';
        t.setAttribute('role', 'status');
        document.body.appendChild(t);
      }
      t.textContent = msg;
      t.classList.add('is-show');
      if (toastTimer) window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(function () { t.classList.remove('is-show'); }, 2000);
    } catch (e) {}
  }

  function cardName(card) {
    try {
      var h = card.querySelector('h3');
      return h ? h.textContent.trim() : '';
    } catch (e) { return ''; }
  }

  function refreshCards() {
    try {
      var cards = document.querySelectorAll('.jurusan-card');
      for (var i = 0; i < cards.length; i++) {
        (function (card) {
          var name = cardName(card);
          var fb = card.querySelector('.fav-btn');
          var cb = card.querySelector('.cmp-btn');
          if (fb) {
            fb.classList.toggle('is-active', isFav(name));
            fb.setAttribute('aria-pressed', String(isFav(name)));
            fb.setAttribute('aria-label', (isFav(name) ? 'Hapus dari favorit: ' : 'Simpan favorit: ') + name);
          }
          if (cb) {
            var on = selected.indexOf(name) > -1;
            cb.classList.toggle('is-active', on);
            cb.setAttribute('aria-pressed', String(on));
          }
        })(cards[i]);
      }
    } catch (e) {}
    renderBar();
  }

  function toggleCmp(name) {
    var i = selected.indexOf(name);
    if (i > -1) { selected.splice(i, 1); }
    else {
      if (selected.length >= MAX_CMP) { toast('Maksimal ' + MAX_CMP + ' jurusan'); return; }
      selected.push(name);
    }
    refreshCards();
  }

  function renderBar() {
    try {
      var bar = document.getElementById('cmpBar');
      if (!bar) return;
      if (!selected.length) { bar.hidden = true; return; }
      bar.hidden = false;
      var label = document.getElementById('cmpCount');
      if (label) label.textContent = selected.length + ' dipilih';
      var open = document.getElementById('cmpOpen');
      if (open) open.disabled = selected.length < 2;
    } catch (e) {}
  }

  function dataOf(name) {
    try {
      if (window.JURUSAN_BY_NAME) return window.JURUSAN_BY_NAME(name);
    } catch (e) {}
    return null;
  }

  function openModal() {
    try {
      if (selected.length < 2) return;
      var ov = document.getElementById('cmpModal');
      if (!ov) return;
      var items = [];
      for (var i = 0; i < selected.length; i++) {
        var d = dataOf(selected[i]);
        if (d) items.push(d);
      }
      if (items.length < 2) return;
      var head = '<th></th>' + items.map(function (j) {
        return '<th><span class="cmp-cat">' + esc(j.catLabel) + '</span><br>' + esc(j.name) + '</th>';
      }).join('');
      function row(label, fn) {
        return '<tr><th>' + label + '</th>' + items.map(function (j) { return '<td>' + fn(j) + '</td>'; }).join('') + '</tr>';
      }
      document.getElementById('cmpTable').innerHTML =
        '<thead><tr>' + head + '</tr></thead><tbody>'
        + row('Gambaran', function (j) { return esc(j.desc); })
        + row('Durasi', function (j) { return esc(j.durasi); })
        + row('Estimasi biaya', function (j) { return esc(j.biaya); })
        + row('Keunggulan', function (j) { return esc(j.tags.join(' • ')); })
        + row('Cocok untuk', function (j) { return esc(j.cocok); })
        + '</tbody>';
      ov.hidden = false;
      document.body.style.overflow = 'hidden';
      var close = document.getElementById('cmpClose');
      if (close) { try { close.focus(); } catch (e) {} }
      feather();
    } catch (e) {}
  }

  function closeModal() {
    try {
      var ov = document.getElementById('cmpModal');
      if (ov) ov.hidden = true;
      document.body.style.overflow = '';
    } catch (e) {}
  }

  function mount() {
    try {
      var cards = document.querySelectorAll('.jurusan-card');
      for (var i = 0; i < cards.length; i++) {
        (function (card) {
          if (card.querySelector('.card-mini-actions')) return;
          var name = cardName(card);
          if (!name) return;
          var wrap = document.createElement('div');
          wrap.className = 'card-mini-actions';
          wrap.innerHTML =
            '<button type="button" class="fav-btn" aria-pressed="false" aria-label="Simpan favorit: ' + esc(name) + '" title="Favorit"><i data-feather="bookmark" aria-hidden="true"></i></button>'
            + '<button type="button" class="cmp-btn" aria-pressed="false" aria-label="Pilih untuk dibandingkan: ' + esc(name) + '" title="Bandingkan"><i data-feather="columns" aria-hidden="true"></i></button>';
          card.appendChild(wrap);
          wrap.querySelector('.fav-btn').addEventListener('click', function () { toggleFav(name); });
          wrap.querySelector('.cmp-btn').addEventListener('click', function () { toggleCmp(name); });
        })(cards[i]);
      }

      if (!document.getElementById('cmpBar')) {
        var bar = document.createElement('div');
        bar.id = 'cmpBar';
        bar.className = 'compare-bar';
        bar.hidden = true;
        bar.innerHTML = '<span id="cmpCount">0 dipilih</span>'
          + '<button type="button" class="btn btn-primary btn-sm" id="cmpOpen">Bandingkan</button>'
          + '<button type="button" class="btn btn-ghost btn-sm" id="cmpClear">Hapus</button>';
        document.body.appendChild(bar);
        document.getElementById('cmpOpen').addEventListener('click', openModal);
        document.getElementById('cmpClear').addEventListener('click', function () { selected = []; refreshCards(); });
      }

      if (!document.getElementById('cmpModal')) {
        var ov = document.createElement('div');
        ov.id = 'cmpModal';
        ov.className = 'compare-modal';
        ov.hidden = true;
        ov.innerHTML = '<div class="compare-dialog" role="dialog" aria-modal="true" aria-label="Perbandingan jurusan">'
          + '<div class="compare-head"><strong>Bandingkan Jurusan</strong>'
          + '<button type="button" class="asst-close" id="cmpClose" aria-label="Tutup perbandingan"><i data-feather="x" aria-hidden="true"></i></button></div>'
          + '<div class="compare-scroll"><table class="compare-table" id="cmpTable"></table></div>'
          + '<p class="compare-note">Estimasi kasar — hitung angka pastinya di kalkulator biaya.</p></div>';
        document.body.appendChild(ov);
        document.getElementById('cmpClose').addEventListener('click', closeModal);
        ov.addEventListener('click', function (e) { if (e.target === ov) closeModal(); });
        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape' && !ov.hidden) closeModal();
        });
      }

      refreshCards();
      feather();
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else { mount(); }

  window.PanduanJurusanFav = {
    list: getFav,
    toggle: function (n) { toggleFav(n); },
    isFav: isFav,
    toast: toast
  };
})();
