(function () {
  'use strict';

  var API_URL = 'http://localhost:3000/api/chat';
  var HIST_KEY = 'pj-asisten-history-v1';
  var msgsEl = document.getElementById('chatMsgs');
  var inputEl = document.getElementById('chatText');
  var sendBtn = document.getElementById('chatSend');
  var chipsEl = document.getElementById('chatChips');
  var jurusanEl = document.getElementById('jurusanShortcuts');
  var clearBtn = document.getElementById('chatClear');
  var waBtn = document.getElementById('chatWaBtn');
  var fallbackEl = document.getElementById('chatFallback');
  var ctxEl = document.getElementById('quizCtx');
  var aiStatusEl = document.getElementById('aiStatus');
  var isLoading = false;
  var convo = [];

  if (!msgsEl || !inputEl) return;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function timeNow() {
    try { return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; }
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
    var html = '<p>' + esc(text).replace(/\n/g, '<br>') + '</p>';
    if (link && link.h) html += '<a href="' + esc(link.h) + '">' + esc(link.t || 'Buka →') + ' →</a>';
    var src = (who === 'user') ? 'Anda' : 'Panduan AI';
    html += '<span class="chat-meta">' + esc(src) + ' • ' + esc(timeNow()) + '</span>';
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

  function removeTyping() {
    var tp = document.getElementById('chatTyping');
    if (tp && tp.parentNode) tp.parentNode.removeChild(tp);
  }

  function setLoading(on) {
    isLoading = on;
    if (sendBtn) sendBtn.disabled = on;
    if (inputEl) inputEl.disabled = on;
    if (aiStatusEl) {
      if (on) aiStatusEl.innerHTML = '<span class="dot-live" aria-hidden="true"></span> Sedang berpikir…';
      else aiStatusEl.innerHTML = '<span class="dot-live" aria-hidden="true"></span> Siap membantu';
    }
  }

  async function send(q) {
    var text = String(q != null ? q : inputEl.value || '').trim();
    if (!text || isLoading) { try { inputEl.focus(); } catch (e) {} return; }
    if (text.length > 500) text = text.slice(0, 500);

    bubble('user', text);
    convo.push({ role: 'user', content: text });
    inputEl.value = '';
    setLoading(true);

    var tp = typing();

    try {
      var response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      if (!response.ok) throw new Error('HTTP ' + response.status);

      var data = await response.json();
      removeTyping();
      setLoading(false);

      if (data.success && data.reply) {
        convo.push({ role: 'assistant', content: data.reply });
        bubble('bot', data.reply);
      } else {
        throw new Error('Respons tidak valid');
      }
    } catch (err) {
      removeTyping();
      setLoading(false);
      convo.push({ role: 'assistant', content: 'Maaf, server AI sedang tidak dapat dihubungi.' });
      bubble('bot', 'Maaf, Panduan AI sedang tidak dapat dihubungi. Coba lagi beberapa saat.');
    }

    scrollDown();
  }

  var topics = [
    'Jurusan untuk yang suka coding?',
    'Kalau suka menggambar, cocok apa?',
    'Informatika vs Sistem Informasi',
    'Bagaimana memilih jurusan?',
    'Biaya kuliah perlu dipertimbangkan?'
  ];
  topics.forEach(function (t) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'asst-chip';
    b.textContent = t;
    b.addEventListener('click', function () { send(t); });
    if (chipsEl) chipsEl.appendChild(b);
  });

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
      var cmp = document.createElement('button');
      cmp.type = 'button';
      cmp.className = 'jurusan-quick';
      cmp.innerHTML = '<i data-feather="layers"></i><span>Bandingkan 2 jurusan</span>';
      cmp.addEventListener('click', function () {
        send('Bandingkan Teknik Informatika vs Desain Komunikasi Visual');
      });
      jurusanEl.appendChild(cmp);
      if (window.feather) window.feather.replace();
    } catch (e) {}
  }
  if (window.JURUSAN_DATA) renderJurusan();
  else window.addEventListener('load', renderJurusan);

  function renderCtx() {
    try {
      if (!ctxEl) return;
      var raw = localStorage.getItem('panduan-jurusan-kuis-10-result');
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
    convo = [];
    try { localStorage.removeItem(HIST_KEY); } catch (e) {}
    if (fallbackEl) fallbackEl.hidden = true;
    setLoading(false);
    bubble('bot', 'Riwayat dihapus. Yuk mulai lagi — ceritakan pelajaran atau kegiatan yang kamu sukai.');
  });
  function openWa() {
    var lastUser = '';
    try { var users = msgsEl.querySelectorAll('.asst-user p'); if (users.length) lastUser = users[users.length - 1].textContent; } catch (e) {}
    var text = 'Halo! Saya konsultasi soal jurusan via Panduan Jurusan.\n\nPertanyaan terakhir saya:\n' + (lastUser || inputEl.value || '-') + '\n\nMohon dibantu ya.';
    window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(text), '_blank', 'noopener');
  }
  if (waBtn) waBtn.addEventListener('click', openWa);
  var fallbackWa = document.getElementById('chatFallbackWa');
  if (fallbackWa) fallbackWa.addEventListener('click', function (e) { e.preventDefault(); openWa(); });

  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest ? e.target.closest('[data-ask]') : null;
    if (!btn) return;
    send(btn.getAttribute('data-ask'));
    try { document.getElementById('chatCard').scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (err) {}
  });

  try { var saved = localStorage.getItem(HIST_KEY); if (saved) msgsEl.innerHTML = saved; } catch (e) {}
  if (!msgsEl.children.length) {
  bubble('bot', 'Halo! Saya Panduan AI.\n\nSaya bisa membantu kamu memahami pilihan jurusan berdasarkan minat, kemampuan, dan hal yang ingin kamu pelajari.\n\nCoba ceritakan:\n• pelajaran yang kamu sukai\n• kegiatan yang kamu senangi\n• jurusan yang sedang kamu pertimbangkan\n\nTidak perlu langsung tahu jawabannya. Kita bisa membahasnya bersama.');
  }
  scrollDown();
})();
