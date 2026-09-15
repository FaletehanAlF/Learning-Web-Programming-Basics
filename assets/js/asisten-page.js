/* Panduan Jurusan — Live Chat halaman Ask the Assistant (offline, pakai assistant.js) */
(function () {
  'use strict';

  var msgsEl = document.getElementById('chatMsgs');
  var inputEl = document.getElementById('chatText');
  var sendBtn = document.getElementById('chatSend');
  var chipsEl = document.getElementById('chatChips');
  var jurusanEl = document.getElementById('jurusanShortcuts');
  var clearBtn = document.getElementById('chatClear');
  var waBtn = document.getElementById('chatWaBtn');
  var fallbackEl = document.getElementById('chatFallback');
  var ctxEl = document.getElementById('quizCtx');
  if (!msgsEl || !inputEl) return;

  var HIST_KEY = 'pj-asisten-history-v1';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function timeNow() {
    try {
      return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch (e) { return ''; }
  }

  function save() {
    try { localStorage.setItem(HIST_KEY, msgsEl.innerHTML); } catch (e) {}
  }

  function scrollDown() {
    try { msgsEl.scrollTop = msgsEl.scrollHeight; } catch (e) {}
  }

  function bubble(who, text, link, opts) {
    var d = document.createElement('div');
    d.className = 'asst-msg asst-' + who;
    var html = '<p>' + esc(text) + '</p>';
    if (link && link.h) html += '<a href="' + esc(link.h) + '">' + esc(link.t || 'Buka →') + ' →</a>';
    html += '<span class="chat-meta">' + (who === 'user' ? 'Anda' : 'Asisten') + ' • ' + esc(timeNow()) + '</span>';
    d.innerHTML = html;
    msgsEl.appendChild(d);
    scrollDown();
    save();
    if (who === 'bot' && opts && opts.lowConfidence && fallbackEl) fallbackEl.hidden = false;
    if (who === 'bot' && !(opts && opts.lowConfidence) && fallbackEl) fallbackEl.hidden = true;
    try { if (window.feather) window.feather.replace(); } catch (e) {}
    return d;
  }

  function typing() {
    var d = document.createElement('div');
    d.className = 'asst-msg asst-bot';
    d.id = 'chatTyping';
    d.innerHTML = '<span class="chat-typing" aria-label="Asisten mengetik"><span></span><span></span><span></span></span>';
    msgsEl.appendChild(d);
    scrollDown();
    return d;
  }

  function ask(text) {
    try {
      if (window.PanduanJurusanAssistant) return window.PanduanJurusanAssistant.ask(text);
    } catch (e) {}
    return { text: 'Maaf, ada gangguan. Coba lagi.' };
  }

  function send(q) {
    var text = String(q != null ? q : inputEl.value || '').trim();
    if (!text) { try { inputEl.focus(); } catch (e) {} return; }
    if (text.length > 300) text = text.slice(0, 300);
    bubble('user', text);
    inputEl.value = '';
    var tp = typing();
    var delay = 350 + Math.min(600, text.length * 8);
    window.setTimeout(function () {
      try { tp.remove(); } catch (e) { if (tp.parentNode) tp.parentNode.removeChild(tp); }
      var r = ask(text);
      bubble('bot', r.text, r.link, r);
    }, delay);
  }

  // Topik cepat konsultasi jurusan
  var topics = [
    'Informatika itu belajar apa?',
    'Anak suka menggambar cocok apa?',
    'Informatika vs Psikologi',
    'Kedokteran vs Psikologi',
    'Biaya kuliah sampai lulus?',
    'SNBP vs SNBT bedanya?',
    'Anak masih bingung pilih apa'
  ];
  topics.forEach(function (t) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'asst-chip';
    b.textContent = t;
    b.addEventListener('click', function () { send(t); });
    if (chipsEl) chipsEl.appendChild(b);
  });

  // Shortcut semua jurusan dari JURUSAN_DATA
  function renderJurusan() {
    try {
      var data = window.JURUSAN_DATA || [];
      if (!jurusanEl) return;
      jurusanEl.innerHTML = '';
      data.forEach(function (j) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'jurusan-quick';
        b.innerHTML = '<i data-feather="book-open"></i><span></span>';
        b.querySelector('span').textContent = j.name;
        b.addEventListener('click', function () { send(j.name + ' itu belajar apa?'); });
        jurusanEl.appendChild(b);
      });
      // Tombol banding cepat
      var cmp = document.createElement('button');
      cmp.type = 'button';
      cmp.className = 'jurusan-quick';
      cmp.innerHTML = '<i data-feather="git-compare"></i><span>Bandingkan 2 jurusan</span>';
      cmp.addEventListener('click', function () {
        send('Bandingkan Teknik Informatika vs Desain Komunikasi Visual');
      });
      jurusanEl.appendChild(cmp);
      if (window.feather) window.feather.replace();
    } catch (e) {}
  }
  // JURUSAN_DATA dimuat dengan defer, tunggu sebentar
  if (window.JURUSAN_DATA) renderJurusan();
  else window.addEventListener('load', renderJurusan);

  // Konteks hasil kuis terakhir (kalau ada)
  function renderCtx() {
    try {
      if (!ctxEl) return;
      var raw = localStorage.getItem('panduan-jurusan-kuis-10-result');
      // fallback: filter terakhir
      var filter = localStorage.getItem('panduan-jurusan-quiz-filter');
      if (raw) {
        var parsed = JSON.parse(raw);
        var top = parsed.top || parsed;
        ctxEl.innerHTML = '<strong>Hasil kuis terakhir tersimpan</strong><span>Top rumpun: ' + esc(String(top).toUpperCase()) + (filter ? ' • filter: ' + esc(filter) : '') + '. Ceritakan di chat mis. "hasil kuisku teknologi, cocoknya apa?"</span>';
      } else if (filter) {
        ctxEl.innerHTML = '<strong>Ada hasil kuis: ' + esc(filter) + '</strong><span>Ketik "jurusan ' + esc(filter) + ' apa saja?" untuk lanjut konsultasi.</span>';
      } else {
        ctxEl.innerHTML = '<strong>Belum ada hasil kuis</strong><span><a href="kuis.html">Isi kuis 10 soal</a> dulu (~3 menit), lalu balik ke sini untuk konsultasi hasilnya.</span>';
      }
    } catch (e) {}
  }
  renderCtx();

  if (sendBtn) sendBtn.addEventListener('click', function () { send(); });
  if (inputEl) inputEl.addEventListener('keydown', function (e) { if (e.key === 'Enter') send(); });
  if (clearBtn) clearBtn.addEventListener('click', function () {
    msgsEl.innerHTML = '';
    try { localStorage.removeItem(HIST_KEY); } catch (e) {}
    if (fallbackEl) fallbackEl.hidden = true;
    bubble('bot', 'Riwayat dihapus. Yuk mulai lagi — ceritakan hobi / pelajaran favorit anak, mis. "suka matematika dan game".');
  });
  function openWa() {
    var lastUser = '';
    try {
      var users = msgsEl.querySelectorAll('.asst-user p');
      if (users.length) lastUser = users[users.length - 1].textContent;
    } catch (e) {}
    var text = 'Halo! Saya konsultasi soal jurusan via Panduan Jurusan.\n\nPertanyaan terakhir saya:\n' + (lastUser || inputEl.value || '-') + '\n\nMohon dibantu ya.';
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
  }
  if (waBtn) waBtn.addEventListener('click', openWa);
  var fallbackWa = document.getElementById('chatFallbackWa');
  if (fallbackWa) fallbackWa.addEventListener('click', function (e) { e.preventDefault(); openWa(); });

  // Topik populer di sidebar (pakai event delegation)
  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest ? e.target.closest('[data-ask]') : null;
    if (!btn) return;
    send(btn.getAttribute('data-ask'));
    try {
      document.getElementById('chatCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {}
  });

  // Restore history
  try {
    var saved = localStorage.getItem(HIST_KEY);
    if (saved) msgsEl.innerHTML = saved;
  } catch (e) {}
  if (!msgsEl.children.length) {
    bubble('bot', 'Halo! Saya Asisten Jurusan. Tanya apa saja soal 6 jurusan, mis. "informatika vs hukum", atau cerita minat anak mis. "suka menggambar dan desain".');
  }
  scrollDown();
})();
