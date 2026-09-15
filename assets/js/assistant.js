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
          convo = parsed.convo;
          return true;
        }
      }
    } catch (e) {}
    return false;
  }

  function saveSession() {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ convo: convo.slice(-50) })); } catch (e) {}
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function createBubble(who, text, opts) {
    var d = document.createElement('div');
    d.className = 'asst-msg asst-' + who;
    var html = '';
    if (who === 'bot' && opts && opts.isAI) {
      html += '<div class="asst-bot-badge">Panduan AI</div>';
    }
    html += '<p>' + esc(text) + '</p>';
    d.innerHTML = html;
    msgsEl.appendChild(d);
    scrollDown();
    return d;
  }

  function showTyping() {
    var d = document.createElement('div');
    d.className = 'asst-typing';
    d.id = 'asstTyping';
    d.innerHTML = '<span></span><span></span><span></span>';
    d.setAttribute('aria-label', 'Asisten mengetik');
    msgsEl.appendChild(d);
    scrollDown();
    return d;
  }

  function removeTyping() {
    var tp = document.getElementById('asstTyping');
    if (tp && tp.parentNode) tp.parentNode.removeChild(tp);
  }

  function showError(message) {
    var d = document.createElement('div');
    d.className = 'asst-msg asst-error';
    d.innerHTML = '<p>' + esc(message) + '</p>';
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
    var text = (inputEl ? inputEl.value : '').trim();
    if (!text || isLoading) return;
    if (text.length > 500) text = text.slice(0, 500);

    bubbleUser(text);
    inputEl.value = '';
    setLoading(true);

    var typing = showTyping();
    convo.push({ role: 'user', content: text });

    try {
      var response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
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
      convo.push({ role: 'assistant', content: 'Maaf, server AI sedang tidak dapat dihubungi. Pastikan server berjalan di localhost:3000, lalu coba lagi.' });
      createBubble('bot', 'Maaf, server AI sedang tidak dapat dihubungi. Pastikan server berjalan di localhost:3000, lalu coba lagi.', { isAI: true });
    }

    saveSession();
    try { inputEl.focus(); } catch (e) {}
  }

  function bubbleUser(text) {
    createBubble('user', text);
    if (inputEl) inputEl.value = '';
  }

  function togglePanel(open) {
    var willOpen = open != null ? open : panel.hidden;
    panel.hidden = !willOpen;
    fab.setAttribute('aria-expanded', String(willOpen));
    if (willOpen) {
      if (!msgsEl.children.length) {
        showWelcome();
      }
      try { inputEl.focus(); } catch (e) {}
    }
  }

  function showWelcome() {
    createBubble('bot',
      'Halo! Saya Panduan AI\n' +
      'Saya bisa membantu kamu memahami dan memilih jurusan kuliah berdasarkan minat, kemampuan, dan tujuanmu.\n\n' +
      'Coba ceritakan pelajaran atau bidang yang kamu sukai.',
      { isAI: true });
  }

  function handleKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function mount() {
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
        '<span class="chat-avatar" aria-hidden="true"><i data-feather="cpu"></i></span>' +
        '<div class="chat-head-info">' +
          '<strong>Panduan AI</strong>' +
          '<span class="chat-status" id="aiStatus"><span class="dot-live" aria-hidden="true"></span> Online</span>' +
        '</div>' +
        '<button type="button" class="asst-close" id="asstClose" aria-label="Tutup Panduan AI"><i data-feather="x" aria-hidden="true"></i></button>' +
      '</div>' +
      '<div class="asst-msgs" id="asstMsgs" aria-live="polite" aria-label="Riwayat percakapan"></div>' +
      '<div class="asst-chips" id="asstChips"></div>' +
      '<div class="asst-input">' +
        '<input id="asstText" type="text" placeholder="Tanya Panduan AI tentang jurusan…" aria-label="Tulis pertanyaan" autocomplete="off" maxlength="500" />' +
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
      'Teknik Informatika itu belajar apa?',
      'Anak suka menggambar cocok apa?',
      'Informatika vs Psikologi',
      'Biaya kuliah sampai lulus?',
      'SNBP vs SNBT bedanya?',
      'Anak masih bingung pilih apa'
    ];
    quickQuestions.forEach(function (q) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'asst-chip';
      b.textContent = q;
      b.addEventListener('click', function () {
        inputEl.value = q;
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

    getSession();
    if (!msgsEl.children.length) {
      showWelcome();
    } else {
      var botMsgs = msgsEl.querySelectorAll('.asst-bot p');
      if (botMsgs.length && !botMsgs[0].textContent.startsWith('Halo!')) {
        showWelcome();
      }
    }
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
