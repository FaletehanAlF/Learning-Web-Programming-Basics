/* Panduan Jurusan — panel pengaturan Gemini API key (localStorage saja, tidak di-commit) */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    var keyEl = document.getElementById('geminiKey');
    var modelEl = document.getElementById('geminiModel');
    var saveBtn = document.getElementById('geminiSave');
    var clearBtn = document.getElementById('geminiClear');
    var statusEl = document.getElementById('aiKeyStatus');
    var badgeEl = document.getElementById('aiBadge');
    if (!keyEl || !saveBtn) return;

    function gem() {
      try { return window.GeminiChat || null; } catch (e) { return null; }
    }

    function mask(k) {
      if (!k || k.length < 8) return '';
      return k.slice(0, 4) + '••••' + k.slice(-4);
    }

    function refresh() {
      var g = gem();
      if (!g) return;
      var has = false;
      try { has = g.hasKey(); } catch (e) {}
      var cur = '';
      try { cur = g.getKey(); } catch (e) {}
      var model = DEFAULT_MODEL();
      try { model = g.getModel(); } catch (e) {}
      if (modelEl) modelEl.value = model;
      if (has) {
        keyEl.value = '';
        keyEl.placeholder = 'Tersimpan: ' + mask(cur) + ' (kosongkan = tetap)';
        if (statusEl) statusEl.textContent = 'AI aktif • key tersimpan lokal (' + mask(cur) + ').';
        if (badgeEl) { badgeEl.textContent = 'AI Aktif'; badgeEl.classList.add('on'); }
      } else {
        keyEl.placeholder = 'AIza…';
        if (statusEl) statusEl.textContent = 'Mode offline. Tempel key untuk aktifkan AI.';
        if (badgeEl) { badgeEl.textContent = 'Offline'; badgeEl.classList.remove('on'); }
      }
      document.dispatchEvent(new CustomEvent('gemini-key-changed'));
    }

    function DEFAULT_MODEL() {
      try { return (window.GeminiChat && window.GeminiChat.DEFAULT_MODEL) || 'gemini-2.0-flash'; }
      catch (e) { return 'gemini-2.0-flash'; }
    }

    if (saveBtn) saveBtn.addEventListener('click', function () {
      var g = gem();
      if (!g) return;
      var v = (keyEl.value || '').trim();
      var m = modelEl ? modelEl.value : DEFAULT_MODEL();
      try { g.setModel(m); } catch (e) {}
      if (v) {
        if (v.length < 10 || v.indexOf(' ') > -1) {
          if (statusEl) statusEl.textContent = 'Key terlihat tidak valid. Pastikan copy penuh mulai AIza… tanpa spasi.';
          return;
        }
        g.setKey(v);
        keyEl.value = '';
        if (statusEl) statusEl.textContent = 'Key tersimpan. Coba tanya lanjutan, mis. "kalau begitu biayanya gimana?".';
      } else {
        // Tidak isi key baru: hanya ganti model, pakai key lama jika ada
        if (statusEl) statusEl.textContent = g.hasKey() ? 'Model diganti ke ' + m + '. Key lama tetap dipakai.' : 'Isi key dulu untuk aktifkan AI. Lihat cara dapat key di bawah.';
      }
      refresh();
    });

    if (clearBtn) clearBtn.addEventListener('click', function () {
      var g = gem();
      if (!g) return;
      g.setKey('');
      keyEl.value = '';
      if (statusEl) statusEl.textContent = 'Key dihapus. Kembali ke mode offline.';
      refresh();
    });

    // Inisialisasi (gemini.js dimuat dengan defer, jadi tunggu load)
    if (window.GeminiChat) refresh();
    else window.addEventListener('load', refresh);
  });
})();
