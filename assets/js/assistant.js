(function () {
  'use strict';

  var API_URL = 'http://localhost:3000/api/chat';
  var SESSION_KEY = 'pj-ai-chat-session';
  var msgsEl, inputEl, sendBtn, chipsEl, panel, fab;
  var isLoading = false;
  var convo = [];

  function pageLink(page, anchor) {
    var a = anchor || '';
    try {
      var inViews = location.pathname.indexOf('/views/') > -1;
      if (page === 'asisten') return inViews ? 'asisten.html' + a : 'views/asisten.html' + a;
    } catch (e) {}
    return a || '#';
  }

  function getSession() {
    try {
      var raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed.convo)) {
          convo = parsed.convo.filter(function (m) {
            return m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string';
          }).slice(-20);
          return convo.length > 0;
        }
      }
    } catch (e) {}
    return false;
  }

  function saveSession() {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ convo: convo.slice(-20) })); } catch (e) {}
  }

  // ---------- Safe lite-markdown renderer (XSS-safe, tanpa innerHTML dari AI) ----------
  // Mendukung: **bold**, *italic*, `code`, bullet -, *, •, numbered 1., heading #.
  // Semua teks AI dimasukkan via textContent / createTextNode, tidak pernah via innerHTML.
  function appendInline(parent, text) {
    var s = String(text == null ? '' : text);
    // Hilangkan sisa marker bold yang gagal dipasangkan supaya tidak terlihat mentah.
    // Parsing utama di bawah menangani yang berpasangan.
    var re = /(\*\*[^*\n]+?\*\*|__[^_\n]+?__|`[^`\n]+?`|\*[^*\n]+?\*)/g;
    var last = 0;
    var m;
    while ((m = re.exec(s)) !== null) {
      if (m.index > last) {
        parent.appendChild(document.createTextNode(cleanPlain(s.slice(last, m.index))));
      }
      var tok = m[0];
      var inner, el;
      if (tok.slice(0, 2) === '**' && tok.slice(-2) === '**') {
        inner = tok.slice(2, -2);
        el = document.createElement('strong');
        el.textContent = inner;
        parent.appendChild(el);
      } else if (tok.slice(0, 2) === '__' && tok.slice(-2) === '__') {
        inner = tok.slice(2, -2);
        el = document.createElement('strong');
        el.textContent = inner;
        parent.appendChild(el);
      } else if (tok.charAt(0) === '`' && tok.charAt(tok.length - 1) === '`') {
        inner = tok.slice(1, -1);
        el = document.createElement('code');
        el.textContent = inner;
        parent.appendChild(el);
      } else if (tok.charAt(0) === '*' && tok.charAt(tok.length - 1) === '*') {
        inner = tok.slice(1, -1);
        el = document.createElement('em');
        el.textContent = inner;
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
    // Hapus marker ** / __ yang tersisa agar tidak tampil mentah. Biarkan teks lain apa adanya.
    return String(s).replace(/\*\*/g, '').replace(/__/g, '');
  }

  function isBullet(line) {
    var m = /^\s*[-*\u2022]\s+(.*\S)\s*$/.exec(line);
    return m ? m[1] : null;
  }

  function isNumbered(line) {
    var m = /^\s*\d{1,2}[.)]\s+(.*\S)\s*$/.exec(line);
    return m ? m[1] : null;
  }

  function isHeading(line) {
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
    items.forEach(function (itemText) {
      var li = document.createElement('li');
      appendInline(li, itemText);
      list.appendChild(li);
    });
    container.appendChild(list);
  }

  function renderBlocks(container, src) {
    var lines = String(src).split('\n');
    var para = [];
    var listItems = [];
    var listOrdered = false;
    var inList = false;

    function flushPara() {
      if (para.length) { appendParagraph(container, para); para = []; }
    }
    function flushList() {
      if (inList && listItems.length) { appendList(container, listOrdered, listItems); }
      listItems = [];
      inList = false;
    }

    lines.forEach(function (line) {
      var trimmed = line.trim();
      if (!trimmed) { flushPara(); flushList(); return; }

      var head = isHeading(trimmed);
      if (head !== null) {
        flushPara(); flushList();
        appendParagraph(container, [head]);
        return;
      }
      var b = isBullet(line);
      if (b !== null) {
        flushPara();
        if (!inList || listOrdered) { flushList(); inList = true; listOrdered = false; }
        listItems.push(b);
        return;
      }
      var n = isNumbered(line);
      if (n !== null) {
        flushPara();
        if (!inList || !listOrdered) { flushList(); inList = true; listOrdered = true; }
        listItems.push(n);
        return;
      }
      // Baris teks biasa: akhiri list yang sedang berjalan, lanjutkan paragraf.
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
    // Tangani code fence ```...``` : render sebagai teks polos, bukan markdown.
    var parts = s.split(/```/);
    for (var i = 0; i < parts.length; i++) {
      if (i % 2 === 1) {
        var pre = document.createElement('p');
        var code = document.createElement('code');
        code.textContent = parts[i].trim();
        pre.appendChild(code);
        container.appendChild(pre);
      } else if (parts[i].trim()) {
        renderBlocks(container, parts[i]);
      }
    }
  }
  // ---------- akhir renderer ----------

  function createBubble(who, text, opts) {
    if (!msgsEl) return null;
    var d = document.createElement('div');
    d.className = 'asst-msg asst-' + who;
    if (who === 'bot' && opts && opts.isAI) {
      var badge = document.createElement('div');
      badge.className = 'asst-bot-badge';
      badge.textContent = 'Panduan AI';
      d.appendChild(badge);
    }
    var body = document.createElement('div');
    body.className = 'asst-text';
    if (who === 'user') {
      // Pesan user: tampilkan polos, tanpa parsing markdown.
      body.textContent = String(text == null ? '' : text);
    } else {
      renderAssistantText(body, text);
    }
    d.appendChild(body);
    msgsEl.appendChild(d);
    scrollDown();
    return d;
  }

  function showTyping() {
    if (!msgsEl) return null;
    var d = document.createElement('div');
    d.className = 'asst-typing';
    d.id = 'asstTyping';
    d.setAttribute('aria-label', 'Asisten mengetik');
    for (var i = 0; i < 3; i++) d.appendChild(document.createElement('span'));
    msgsEl.appendChild(d);
    scrollDown();
    return d;
  }

  function removeTyping() {
    var tp = document.getElementById('asstTyping');
    if (tp && tp.parentNode) tp.parentNode.removeChild(tp);
  }

  function showError(message) {
    if (!msgsEl) return;
    var d = document.createElement('div');
    d.className = 'asst-msg asst-error';
    var body = document.createElement('div');
    body.className = 'asst-text';
    var p = document.createElement('p');
    p.textContent = String(message);
    body.appendChild(p);
    d.appendChild(body);
    msgsEl.appendChild(d);
    scrollDown();
  }

  function scrollDown() {
    try { msgsEl.scrollTop = msgsEl.scrollHeight; } catch (e) {}
  }

  function setLoading(on) {
    isLoading = on;
    if (sendBtn) sendBtn.disabled = on;
    if (inputEl) inputEl.disabled = on;
  }

  async function sendMessage() {
    if (!msgsEl || !inputEl) return;
    var text = (inputEl ? inputEl.value : '').trim();
    if (!text || isLoading) return;
    if (text.length > 500) text = text.slice(0, 500);

    createBubble('user', text);
    if (inputEl) inputEl.value = '';
    setLoading(true);

    showTyping();
    var historyPayload = convo.slice(-10);
    convo.push({ role: 'user', content: text });

    try {
      var response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: historyPayload })
      });

      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }

      var data = await response.json();

      removeTyping();
      setLoading(false);

      if (data.success && data.reply) {
        convo.push({ role: 'assistant', content: data.reply });
        createBubble('bot', data.reply, { isAI: true });
      } else {
        throw new Error('Respons tidak valid');
      }
    } catch (err) {
      removeTyping();
      setLoading(false);
      convo.push({ role: 'assistant', content: 'Maaf, server AI sedang tidak dapat dihubungi.' });
      showError('Maaf, Panduan AI sedang tidak dapat dihubungi. Coba lagi beberapa saat.');
    }

    saveSession();
    try { inputEl.focus(); } catch (e) {}
  }

  function togglePanel(open) {
    var willOpen = open != null ? open : panel.hidden;
    panel.hidden = !willOpen;
    try { panel.classList.toggle('is-open', !!willOpen); } catch (e) {}
    fab.setAttribute('aria-expanded', String(willOpen));
    if (willOpen) {
      if (!msgsEl.children.length) {
        showWelcome();
      }
      scrollDown();
      try { inputEl.focus(); } catch (e) {}
    }
  }

  function showWelcome() {
    createBubble('bot',
      'Halo! Saya Panduan AI.\n\n' +
      'Ceritakan jurusan yang sedang kamu pertimbangkan, pelajaran yang kamu suka, ' +
      'atau hal yang ingin kamu pelajari. Kita bisa membahasnya bersama.',
      { isAI: true });
  }

  function restoreHistory() {
    try { msgsEl.innerHTML = ''; } catch (e) {}
    var items = convo.slice(-20);
    if (!items.length) {
      showWelcome();
      return;
    }
    items.forEach(function (m) {
      if (m.role === 'user') createBubble('user', m.content);
      else createBubble('bot', m.content, { isAI: true });
    });
  }

  function handleKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function mount() {
    // Jangan tampilkan widget mengambang di halaman live-chat penuh (asisten.html)
    // untuk menghindari UI ganda / tumpuk seperti di laporan bug.
    try {
      if (document.getElementById('chatCard') || document.getElementById('chatMsgs')) {
        try { document.body.classList.add('has-full-chat'); } catch (e) {}
        return;
      }
    } catch (e) {}
    if (document.getElementById('asstFab')) return;

    fab = document.createElement('button');
    fab.id = 'asstFab';
    fab.className = 'asst-fab';
    fab.type = 'button';
    fab.setAttribute('aria-label', 'Buka Panduan AI Assistant');
    fab.setAttribute('aria-expanded', 'false');
    fab.innerHTML = '<i data-feather="message-circle" aria-hidden="true"></i>';

    panel = document.createElement('div');
    panel.id = 'asstPanel';
    panel.className = 'asst-panel';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Panduan AI Assistant');
    panel.innerHTML =
      '<div class="asst-head">' +
        '<span class="asst-avatar" aria-hidden="true"><i data-feather="compass"></i></span>' +
        '<div class="asst-head-info">' +
          '<strong>Panduan AI</strong>' +
          '<span class="asst-status"><span class="dot-live" aria-hidden="true"></span> Siap membantu</span>' +
        '</div>' +
        '<button type="button" class="asst-close" id="asstClose" aria-label="Tutup Panduan AI"><i data-feather="x" aria-hidden="true"></i></button>' +
      '</div>' +
      '<div class="asst-msgs" id="asstMsgs" aria-live="polite" aria-label="Riwayat percakapan"></div>' +
      '<div class="asst-chips" id="asstChips"></div>' +
      '<div class="asst-input">' +
        '<input id="asstText" type="text" placeholder="Ceritakan apa yang sedang kamu pertimbangkan..." aria-label="Tulis pertanyaan" autocomplete="off" maxlength="500" />' +
        '<button type="button" id="asstSend" aria-label="Kirim pertanyaan"><i data-feather="send" aria-hidden="true"></i></button>' +
      '</div>' +
      '<div class="asst-foot"><a id="asstFull" href="' + pageLink('asisten', '') + '">Buka Live Chat penuh →</a></div>';

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    msgsEl = document.getElementById('asstMsgs');
    inputEl = document.getElementById('asstText');
    sendBtn = document.getElementById('asstSend');
    chipsEl = document.getElementById('asstChips');

    var quickQuestions = [
      'Jurusan untuk yang suka coding?',
      'Kalau suka menggambar?',
      'Informatika vs Sistem Informasi',
      'Bagaimana memilih jurusan?',
      'Biaya kuliah perlu dipertimbangkan?'
    ];
    quickQuestions.forEach(function (q) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'asst-chip';
      b.textContent = q;
      b.addEventListener('click', function () {
        if (inputEl) inputEl.value = q;
        sendMessage();
      });
      chipsEl.appendChild(b);
    });

    fab.addEventListener('click', function () { togglePanel(); });
    document.getElementById('asstClose').addEventListener('click', function () { togglePanel(false); });
    sendBtn.addEventListener('click', sendMessage);
    inputEl.addEventListener('keydown', handleKeydown);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) togglePanel(false);
    });

    var hasHistory = getSession();
    if (hasHistory) restoreHistory();
    else showWelcome();
    scrollDown();
    renderFeather();

    try { if (window.feather && typeof window.feather.replace === 'function') window.feather.replace(); } catch (e) {}
  }

  function renderFeather() {
    try {
      if (window.feather && typeof window.feather.replace === 'function') {
        window.feather.replace();
      }
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      mount();
      renderFeather();
    });
  } else {
    mount();
    renderFeather();
  }

  window.PanduanAI = { sendMessage: sendMessage };
})();
