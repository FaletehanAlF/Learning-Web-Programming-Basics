/* Panduan Jurusan — tema gelap/terang (tersimpan otomatis, semua halaman) */
(function () {
  'use strict';

  var KEY = 'pj-theme';

  function current() {
    try {
      var s = localStorage.getItem(KEY);
      if (s === 'dark' || s === 'light') return s;
    } catch (e) {}
    return 'light';
  }

  function paint() {
    try {
      var btn = document.getElementById('themeToggle');
      if (!btn) return;
      var dark = document.documentElement.getAttribute('data-theme') === 'dark';
      btn.innerHTML = '<i data-feather="' + (dark ? 'sun' : 'moon') + '" aria-hidden="true"></i>';
      btn.setAttribute('aria-pressed', String(dark));
      btn.setAttribute('data-mode', dark ? 'dark' : 'light');
      if (window.feather && typeof window.feather.replace === 'function') {
        try { window.feather.replace(); } catch (e) {}
      }
    } catch (e) {}
  }

  function apply(t) {
    try { document.documentElement.setAttribute('data-theme', t); } catch (e) {}
    try { localStorage.setItem(KEY, t); } catch (e) {}
    paint();
  }

  // Samakan dengan init kilat di <head> (anti kedip)
  try {
    var init = document.documentElement.getAttribute('data-theme');
    if (init !== 'dark' && init !== 'light') apply(current());
    else paint();
  } catch (e) {}

  function mount() {
    try {
      var btn = document.getElementById('themeToggle');
      if (btn) btn.addEventListener('click', function () {
        var dark = document.documentElement.getAttribute('data-theme') === 'dark';
        apply(dark ? 'light' : 'dark');
      });
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { paint(); mount(); });
  } else { paint(); mount(); }
  window.addEventListener('load', paint);
})();
