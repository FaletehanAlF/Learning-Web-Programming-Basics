/* Panduan Jurusan — form masukan halaman Kontak (via WhatsApp, tanpa backend) */
(function () {
  'use strict';

  var form = document.getElementById('kontakForm');
  if (!form) return;

  var namaEl = document.getElementById('kontakNama');
  var pesanEl = document.getElementById('kontakPesan');
  var errorEl = document.getElementById('kontakError');
  var countEl = document.getElementById('kontakCount');
  var MAX = 500;

  function showError(msg) {
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.classList.add('is-visible');
  }

  function hideError() {
    if (!errorEl) return;
    errorEl.textContent = '';
    errorEl.classList.remove('is-visible');
  }

  function updateCount() {
    if (!countEl || !pesanEl) return;
    var len = pesanEl.value.length;
    if (len > MAX) pesanEl.value = pesanEl.value.slice(0, MAX);
    countEl.textContent = String(Math.min(len, MAX)) + ' / ' + MAX + ' karakter';
  }

  if (pesanEl) pesanEl.addEventListener('input', function () { updateCount(); hideError(); });
  if (namaEl) namaEl.addEventListener('input', hideError);
  updateCount();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    hideError();
    var nama = namaEl ? namaEl.value.trim() : '';
    var pesan = pesanEl ? pesanEl.value.trim() : '';

    if (!nama) {
      showError('Isi nama / panggilan dulu ya, mis. “Ibu Ratna”.');
      if (namaEl) namaEl.focus();
      return;
    }
    if (!pesan || pesan.length < 10) {
      showError('Tulis pesan minimal 10 karakter agar jelas maksudnya.');
      if (pesanEl) pesanEl.focus();
      return;
    }

    var text = 'Halo! Saya ' + nama + ' (pembaca Panduan Jurusan).\n\nMasukan saya:\n' + pesan
      + '\n\nDikirim dari halaman Kontak: ' + window.location.href;
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
  });
})();
