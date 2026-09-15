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
  var aiStatusEl = document.getElementById('aiStatus');
  var convo = []; // [{who:'user'|'bot', text}] untuk konteks Gemini (max 10 terkirim)

  function useAI() {
    try { return window.GeminiChat && window.GeminiChat.hasKey(); } catch (e) { return false; }
  }

  function updateAiStatus() {
    if (!aiStatusEl) return;
    if (useAI()) {
      var m = '';
      try { m = window.GeminiChat.getModel(); } catch (e) {}
      aiStatusEl.innerHTML = '<span class="dot-live" aria-hidden="true"></span> AI Aktif (' + esc(m) + ') • offline siap cadangan';
      aiStatusEl.classList.add('is-ai');
    } else {
      aiStatusEl.innerHTML = '<span class="dot-live" aria-hidden="true"></span> Mode offline • tambah API key untuk AI';
      aiStatusEl.classList.remove('is-ai');
    }
  }

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
    var src = (opts && opts.source === 'ai') ? 'AI Gemini' : (who === 'user' ? 'Anda' : (useAI() ? 'Asisten • AI' : 'Asisten • offline'));
    if (who === 'user') src = 'Anda';
    else if (opts && opts.source === 'offline-fallback') src = 'Asisten • offline (AI gagal)';
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

  function askOffline(text) {
    try {
      if (window.PanduanJurusanAssistant) return window.PanduanJurusanAssistant.ask(text);
    } catch (e) {}
    return { text: 'Maaf, ada gangguan. Coba lagi.' };
  }

  function pushConvo(who, text) {
    convo.push({ who: who, text: String(text).slice(0, 1000) });
    if (convo.length > 20) convo = convo.slice(-20);
  }

  function send(q) {
    var text = String(q != null ? q : inputEl.value || '').trim();
    if (!text) { try { inputEl.focus(); } catch (e) {} return; }
    if (text.length > 500) text = text.slice(0, 500);
    bubble('user', text);
    pushConvo('user', text);
    inputEl.value = '';
    var tp = typing();

    // Mode AI: jika ada API key, coba Gemini dulu
    if (useAI()) {
      var history = convo.slice(0, -1); // tanpa pesan terakhir (dikirim terpisah)
      window.GeminiChat.sendMessage(text, history).then(function (reply) {
        try { tp.remove(); } catch (e) { if (tp.parentNode) tp.parentNode.removeChild(tp); }
        pushConvo('bot', reply);
        bubble('bot', reply, null, { source: 'ai' });
      }).catch(function (err) {
        try { tp.remove(); } catch (e) { if (tp.parentNode) tp.parentNode.removeChild(tp); }
        var msg = (err && err.message) || 'AI gagal.';
        if (msg === 'NO_KEY') {
          var r = askOffline(text);
          pushConvo('bot', r.text);
          bubble('bot', r.text, r.link, r);
        } else {
          // Fallback offline agar user tetap dapat jawaban
          var f = askOffline(text);
          pushConvo('bot', f.text);
          bubble('bot', 'AI gagal (' + msg + '). Saya jawab mode offline dulu ya.\n\n' + f.text, f.link, { source: 'offline-fallback', lowConfidence: true });
        }
        updateAiStatus();
      });
      return;
    }

    var delay = 350 + Math.min(600, text.length * 8);
    window.setTimeout(function () {
      try { tp.remove(); } catch (e) { if (tp.parentNode) tp.parentNode.removeChild(tp); }
      var r = askOffline(text);
      pushConvo('bot', r.text);
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
      cmp.innerHTML = '<i data-feather="layers"></i><span>Bandingkan 2 jurusan</span>';
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
    convo = [];
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
    window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(text), '_blank', 'noopener');
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
  updateAiStatus();
  document.addEventListener('gemini-key-changed', updateAiStatus);
  window.addEventListener('storage', function (e) {
    if (e.key === 'pj-gemini-key' || e.key === 'pj-gemini-model') updateAiStatus();
  });
  if (!msgsEl.children.length) {
    if (useAI()) bubble('bot', 'Halo! Mode AI Gemini aktif. Cerita bebas — mis. "anakku kelas 12 suka biologi tapi takut darah, cocoknya apa?" — saya jawab sesuai konteks.', null, { source: 'ai' });
    else bubble('bot', 'Halo! Saya Asisten Jurusan (mode offline). Tanya apa saja soal 6 jurusan, mis. "informatika vs hukum". Tambahkan API key Gemini di panel samping untuk jawaban AI yang lebih nyambung.');
  }
  scrollDown();
})();
