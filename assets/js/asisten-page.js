(function () {
  'use strict';

  var API_URL = 'http://localhost:3000/api/chat';
  var HIST_KEY = 'pj-asisten-history-v2';
  var OLD_HIST_KEY = 'pj-asisten-history-v1';
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

  // ---------- Safe lite-markdown renderer (tanpa innerHTML dari AI) ----------
  function appendInline(parent, text) {
    var s = String(text == null ? '' : text);
    var re = /(\*\*[^*\n]+?\*\*|__[^_\n]+?__|`[^`\n]+?`|\*[^*\n]+?\*)/g;
    var last = 0;
    var m;
    while ((m = re.exec(s)) !== null) {
      if (m.index > last) {
        parent.appendChild(document.createTextNode(cleanPlain(s.slice(last, m.index))));
      }
      var tok = m[0];
      var el;
      if (tok.slice(0, 2) === '**' && tok.slice(-2) === '**') {
        el = document.createElement('strong');
        el.textContent = tok.slice(2, -2);
        parent.appendChild(el);
      } else if (tok.slice(0, 2) === '__' && tok.slice(-2) === '__') {
        el = document.createElement('strong');
        el.textContent = tok.slice(2, -2);
        parent.appendChild(el);
      } else if (tok.charAt(0) === '`' && tok.charAt(tok.length - 1) === '`') {
        el = document.createElement('code');
        el.textContent = tok.slice(1, -1);
        parent.appendChild(el);
      } else if (tok.charAt(0) === '*' && tok.charAt(tok.length - 1) === '*') {
        el = document.createElement('em');
        el.textContent = tok.slice(1, -1);
        parent.appendChild(el);
      } else {
        parent.appendChild(document.createTextNode(cleanPlain(tok)));
      }
      last = m.index + tok.length;
    }
    if (last < s.length) {
      parent.appendChild(document.createTextNode(cleanPlain(s.slice(last))));
    }
  }

  function cleanPlain(s) {
    return String(s).replace(/\*\*/g, '').replace(/__/g, '');
  }

  function bulletOf(line) {
    var m = /^\s*[-*\u2022]\s+(.*\S)\s*$/.exec(line);
    return m ? m[1] : null;
  }

  function numberedOf(line) {
    var m = /^\s*\d{1,2}[.)]\s+(.*\S)\s*$/.exec(line);
    return m ? m[1] : null;
  }

  function headingOf(line) {
    var m = /^\s*#{1,6}\s+(.*\S)\s*$/.exec(line);
    return m ? m[1] : null;
  }

  function appendParagraph(container, lines) {
    var text = lines.join(' ').replace(/\s+/g, ' ').trim();
    if (!text) return;
    var p = document.createElement('p');
    appendInline(p, text);
    container.appendChild(p);
  }

  function appendList(container, ordered, items) {
    if (!items.length) return;
    var list = document.createElement(ordered ? 'ol' : 'ul');
    list.className = ordered ? 'asst-list-num' : 'asst-list';
    items.forEach(function (t) {
      var li = document.createElement('li');
      appendInline(li, t);
      list.appendChild(li);
    });
    container.appendChild(list);
  }

  function renderBlocks(container, src) {
    var lines = String(src).split('\n');
    var para = [];
    var items = [];
    var ordered = false;
    var inList = false;
    function flushPara() { if (para.length) { appendParagraph(container, para); para = []; } }
    function flushList() {
      if (inList && items.length) appendList(container, ordered, items);
      items = []; inList = false;
    }
    lines.forEach(function (line) {
      var trimmed = line.trim();
      if (!trimmed) { flushPara(); flushList(); return; }
      var h = headingOf(trimmed);
      if (h !== null) { flushPara(); flushList(); appendParagraph(container, [h]); return; }
      var b = bulletOf(line);
      if (b !== null) {
        flushPara();
        if (!inList || ordered) { flushList(); inList = true; ordered = false; }
        items.push(b);
        return;
      }
      var n = numberedOf(line);
      if (n !== null) {
        flushPara();
        if (!inList || !ordered) { flushList(); inList = true; ordered = true; }
        items.push(n);
        return;
      }
      flushList();
      para.push(trimmed);
    });
    flushPara();
    flushList();
  }

  function renderAssistantText(container, raw) {
    var s = String(raw == null ? '' : raw).replace(/\r\n?/g, '\n').trim().slice(0, 4000);
    if (!s) {
      var p = document.createElement('p');
      p.textContent = 'Maaf, saya belum punya jawaban untuk itu. Coba ceritakan sedikit lagi?';
      container.appendChild(p);
      return;
    }
    var parts = s.split(/```/);
    for (var i = 0; i < parts.length; i++) {
      if (i % 2 === 1) {
        var pw = document.createElement('p');
        var code = document.createElement('code');
        code.textContent = parts[i].trim();
        pw.appendChild(code);
        container.appendChild(pw);
      } else if (parts[i].trim()) {
        renderBlocks(container, parts[i]);
      }
    }
  }
  // ---------- akhir renderer ----------

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function timeNow() {
    try { return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; }
  }

  function save() {
    try { localStorage.setItem(HIST_KEY, JSON.stringify({ convo: convo.slice(-50) })); } catch (e) {}
  }

  function scrollDown() {
    try { msgsEl.scrollTop = msgsEl.scrollHeight; } catch (e) {}
  }

  function isSafeHref(h) {
    return typeof h === 'string' && /^(#|\.\.?\/|views\/|..\/index\.html)/.test(h);
  }

  function bubble(who, text, link, opts) {
    var d = document.createElement('div');
    d.className = 'asst-msg asst-' + who;
    var body = document.createElement('div');
    body.className = 'asst-text';
    if (who === 'user') {
      body.textContent = String(text == null ? '' : text);
    } else {
      renderAssistantText(body, text);
    }
    d.appendChild(body);
    if (link && link.h && isSafeHref(link.h)) {
      var a = document.createElement('a');
      a.setAttribute('href', link.h);
      a.textContent = link.t || 'Buka →';
      d.appendChild(a);
    }
    var src = (who === 'user') ? 'Anda' : 'Panduan AI';
    var meta = document.createElement('span');
    meta.className = 'chat-meta';
    meta.textContent = src + ' • ' + timeNow();
    d.appendChild(meta);
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
    var wrap = document.createElement('span');
    wrap.className = 'chat-typing';
    wrap.setAttribute('aria-label', 'Asisten mengetik');
    for (var i = 0; i < 3; i++) wrap.appendChild(document.createElement('span'));
    d.appendChild(wrap);
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
    var historyPayload = convo.slice(-10);
    convo.push({ role: 'user', content: text });
    save();
    inputEl.value = '';
    setLoading(true);

    typing();

    try {
      var response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: historyPayload })
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
      // HP: tampilkan 6 tombol dulu agar input tidak terdorong jauh ke bawah.
      try {
        var total = jurusanEl.querySelectorAll('.jurusan-quick').length;
        if (total > 7) {
          jurusanEl.classList.add('is-collapsed');
          var more = document.createElement('button');
          more.type = 'button';
          more.className = 'jurusan-more';
          more.textContent = 'Lihat semua (' + total + ')';
          more.setAttribute('aria-expanded', 'false');
          more.addEventListener('click', function () {
            var collapsed = jurusanEl.classList.toggle('is-collapsed');
            more.textContent = collapsed ? 'Lihat semua (' + total + ')' : 'Tutup daftar';
            more.setAttribute('aria-expanded', String(!collapsed));
          });
          jurusanEl.appendChild(more);
        }
      } catch (e2) {}
      if (window.feather) window.feather.replace();
    } catch (e) {}
  }
  if (window.JURUSAN_DATA) renderJurusan();
  else window.addEventListener('load', renderJurusan);

  function renderCtx() {
    try {
      if (!ctxEl) return;
      ctxEl.innerHTML = '';
      var raw = localStorage.getItem('panduan-jurusan-kuis-10-result');
      var filter = localStorage.getItem('panduan-jurusan-quiz-filter');
      var strong = document.createElement('strong');
      var span = document.createElement('span');
      if (raw) {
        var parsed = JSON.parse(raw);
        var top = parsed.top || parsed;
        strong.textContent = 'Hasil kuis terakhir tersimpan';
        span.textContent = 'Top rumpun: ' + String(top).toUpperCase() + (filter ? ' • filter: ' + filter : '') + '. Ceritakan di chat mis. "hasil kuisku teknologi, cocoknya apa?"';
      } else if (filter) {
        strong.textContent = 'Ada hasil kuis: ' + filter;
        span.textContent = 'Ketik "jurusan ' + filter + ' apa saja?" untuk lanjut konsultasi.';
      } else {
        strong.textContent = 'Belum ada hasil kuis';
        span.textContent = 'Isi kuis 10 soal dulu (~3 menit), lalu balik ke sini untuk konsultasi hasilnya. ';
        var a = document.createElement('a');
        a.setAttribute('href', 'kuis.html');
        a.textContent = 'Isi kuis 10 soal';
        span.appendChild(a);
      }
      ctxEl.appendChild(strong);
      ctxEl.appendChild(span);
    } catch (e) {}
  }
  renderCtx();

  if (sendBtn) sendBtn.addEventListener('click', function () { send(); });
  if (inputEl) inputEl.addEventListener('keydown', function (e) { if (e.key === 'Enter') send(); });
  if (clearBtn) clearBtn.addEventListener('click', function () {
    msgsEl.innerHTML = '';
    convo = [];
    try { localStorage.removeItem(HIST_KEY); localStorage.removeItem(OLD_HIST_KEY); } catch (e) {}
    if (fallbackEl) fallbackEl.hidden = true;
    setLoading(false);
    bubble('bot', 'Riwayat dihapus. Yuk mulai lagi — ceritakan pelajaran atau kegiatan yang kamu sukai.');
  });
  function openWa() {
    var lastUser = '';
    try {
      var users = msgsEl.querySelectorAll('.asst-user .asst-text');
      if (users.length) lastUser = users[users.length - 1].textContent;
    } catch (e) {}
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

  // Restore: format baru (JSON convo). Format lama (innerHTML) dibuang demi keamanan XSS.
  var restored = false;
  try {
    var saved = localStorage.getItem(HIST_KEY);
    if (saved) {
      var parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.convo) && parsed.convo.length) {
        convo = parsed.convo.filter(function (m) {
          return m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string';
        }).slice(-50);
        msgsEl.innerHTML = '';
        convo.forEach(function (m) { bubble(m.role === 'user' ? 'user' : 'bot', m.content); });
        restored = true;
      }
    }
    if (!restored) localStorage.removeItem(OLD_HIST_KEY);
  } catch (e) {}
  if (!restored && !msgsEl.children.length) {
  bubble('bot', 'Halo! Saya Panduan AI.\n\nCeritakan jurusan yang sedang kamu pertimbangkan, pelajaran yang kamu suka, atau hal yang ingin kamu pelajari. Kita bisa membahasnya bersama.');
  }
  scrollDown();
})();
