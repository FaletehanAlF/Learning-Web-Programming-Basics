/* Panduan Jurusan — panel pengaturan AI (OpenAI/Gemini, localStorage saja, tidak di-commit) */
(function () {
  'use strict';

  var PROVIDER_STORE = 'pj-ai-provider';

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    var provEl = document.getElementById('aiProvider');
    // Gemini
    var gKeyEl = document.getElementById('geminiKey');
    var gModelEl = document.getElementById('geminiModel');
    var gSaveBtn = document.getElementById('geminiSave');
    var gClearBtn = document.getElementById('geminiClear');
    // OpenAI
    var oKeyEl = document.getElementById('openaiKey');
    var oModelEl = document.getElementById('openaiModel');
    var oSaveBtn = document.getElementById('openaiSave');
    var oClearBtn = document.getElementById('openaiClear');
    var statusEl = document.getElementById('aiKeyStatus');
    var badgeEl = document.getElementById('aiBadge');
    if (!gSaveBtn && !oSaveBtn) return;

    function gem() {
      try { return window.GeminiChat || null; } catch (e) { return null; }
    }
    function oai() {
      try { return window.OpenAIChat || null; } catch (e) { return null; }
    }

    function mask(k) {
      if (!k || k.length < 8) return '';
      return k.slice(0, 4) + '••••' + k.slice(-4);
    }

    function getProvider() {
      try { return localStorage.getItem(PROVIDER_STORE) || 'auto'; } catch (e) { return 'auto'; }
    }

    function activeProvider() {
      var p = getProvider();
      var g = gem(), o = oai();
      var hasG = false, hasO = false;
      try { hasG = g && g.hasKey(); } catch (e) {}
      try { hasO = o && o.hasKey(); } catch (e) {}
      if (p === 'offline') return null;
      if (p === 'openai') return hasO ? 'openai' : null;
      if (p === 'gemini') return hasG ? 'gemini' : null;
      if (hasO) return 'openai';
      if (hasG) return 'gemini';
      return null;
    }

    function notify() {
      try { document.dispatchEvent(new CustomEvent('ai-settings-changed')); } catch (e) {}
      try { document.dispatchEvent(new CustomEvent('gemini-key-changed')); } catch (e) {}
    }

    function refresh() {
      var g = gem(), o = oai();
      if (provEl) provEl.value = getProvider();
      if (g && gModelEl) { try { gModelEl.value = g.getModel(); } catch (e) {} }
      if (o && oModelEl) { try { oModelEl.value = o.getModel(); } catch (e) {} }
      var hasG = false, hasO = false, curG = '', curO = '';
      try { hasG = g && g.hasKey(); curG = g ? g.getKey() : ''; } catch (e) {}
      try { hasO = o && o.hasKey(); curO = o ? o.getKey() : ''; } catch (e) {}
      if (gKeyEl) {
        gKeyEl.value = '';
        gKeyEl.placeholder = hasG ? 'Tersimpan: ' + mask(curG) + ' (kosongkan = tetap)' : 'AIza…';
      }
      if (oKeyEl) {
        oKeyEl.value = '';
        oKeyEl.placeholder = hasO ? 'Tersimpan: ' + mask(curO) + ' (kosongkan = tetap)' : 'sk-proj-…';
      }
      var act = activeProvider();
      if (statusEl) {
        var bits = [];
        if (hasO) bits.push('OpenAI ' + mask(curO));
        if (hasG) bits.push('Gemini ' + mask(curG));
        if (act === 'openai') statusEl.textContent = 'AI aktif via OpenAI. Key tersimpan lokal (' + bits.join(' • ') + ').';
        else if (act === 'gemini') statusEl.textContent = 'AI aktif via Gemini. Key tersimpan lokal (' + bits.join(' • ') + ').';
        else if (hasO || hasG) statusEl.textContent = 'Key tersimpan (' + bits.join(' • ') + ') tapi provider nonaktif — cek pilihan provider.';
        else statusEl.textContent = 'Mode offline. Tempel salah satu key untuk aktifkan AI.';
      }
      if (badgeEl) {
        if (act === 'openai') { badgeEl.textContent = 'AI: OpenAI'; badgeEl.classList.add('on'); }
        else if (act === 'gemini') { badgeEl.textContent = 'AI: Gemini'; badgeEl.classList.add('on'); }
        else { badgeEl.textContent = 'Offline'; badgeEl.classList.remove('on'); }
      }
      notify();
    }

    function saveKey(client, keyEl, modelEl, statusOk) {
      if (!client) return;
      var v = (keyEl.value || '').trim();
      var m = modelEl ? modelEl.value : null;
      if (m) { try { client.setModel(m); } catch (e) {} }
      if (v) {
        if (v.length < 10 || v.indexOf(' ') > -1) {
          if (statusEl) statusEl.textContent = 'Key terlihat tidak valid (kependekan / ada spasi). Pastikan copy penuh.';
          return;
        }
        client.setKey(v);
        keyEl.value = '';
        if (statusEl) statusEl.textContent = statusOk;
      } else if (statusEl) {
        statusEl.textContent = client.hasKey() ? 'Model diganti ke ' + m + '. Key lama tetap dipakai.' : 'Isi key dulu untuk aktifkan AI.';
      }
      refresh();
    }

    if (provEl) provEl.addEventListener('change', function () {
      try { localStorage.setItem(PROVIDER_STORE, provEl.value); } catch (e) {}
      refresh();
    });
    if (gSaveBtn) gSaveBtn.addEventListener('click', function () {
      saveKey(gem(), gKeyEl, gModelEl, 'Key Gemini tersimpan. Coba tanya lanjutan.');
    });
    if (gClearBtn) gClearBtn.addEventListener('click', function () {
      var g = gem();
      if (!g) return;
      g.setKey('');
      gKeyEl.value = '';
      if (statusEl) statusEl.textContent = 'Key Gemini dihapus.';
      refresh();
    });
    if (oSaveBtn) oSaveBtn.addEventListener('click', function () {
      saveKey(oai(), oKeyEl, oModelEl, 'Key OpenAI tersimpan. Coba tanya lanjutan, mis. "kalau begitu biayanya gimana?".');
    });
    if (oClearBtn) oClearBtn.addEventListener('click', function () {
      var o = oai();
      if (!o) return;
      o.setKey('');
      oKeyEl.value = '';
      if (statusEl) statusEl.textContent = 'Key OpenAI dihapus.';
      refresh();
    });

    if (window.GeminiChat || window.OpenAIChat) refresh();
    else window.addEventListener('load', refresh);
  });
})();
