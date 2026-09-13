/* Panduan Jurusan — Dashboard Evaluasi (halaman terpisah) */
(function () {
  'use strict';

  var statsEl = document.getElementById('dashStats');
  var trendEl = document.getElementById('dashTrend');
  var avgEl = document.getElementById('dashAvg');
  var histEl = document.getElementById('dashHistory');
  var favEl = document.getElementById('dashFav');
  var linkEl = document.getElementById('dashLink');
  var clearBtn = document.getElementById('dashClear');
  var wordBtn = document.getElementById('dashWord');
  var linkBtn = document.getElementById('dashLinkBtn');

  if (!statsEl && !trendEl && !avgEl && !histEl && !favEl && !linkEl) return;

  var HISTORY_KEY = 'panduan-jurusan-kuis-10-history';
  var ORDER = ['teknologi', 'kesehatan', 'soshum', 'bisnis', 'kreatif'];
  var LABELS = {
    teknologi: { label: 'Teknologi', color: '#0f172a' },
    kesehatan: { label: 'Kesehatan', color: '#0f766e' },
    soshum: { label: 'Soshum', color: '#334155' },
    bisnis: { label: 'Bisnis', color: '#475569' },
    kreatif: { label: 'Kreatif', color: '#92400e' }
  };

  var reduced = false;
  try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function feather() {
    try { if (window.feather) window.feather.replace(); } catch (e) {}
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function getHistory() {
    try {
      var raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return [];
      var d = JSON.parse(raw);
      return Array.isArray(d) ? d : [];
    } catch (e) { return []; }
  }

  function saveHistory(h) {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 20))); } catch (e) {}
  }

  function fmtDate(ts) {
    try {
      var loc = (window.__LANG === 'en') ? 'en-GB' : 'id-ID';
      var dt = new Date(ts);
      return dt.toLocaleDateString(loc, { day: 'numeric', month: 'short', year: 'numeric' })
        + ' • ' + dt.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' });
    } catch (e) { return ''; }
  }

  function labelOf(key) { return (LABELS[key] && LABELS[key].label) || key; }

  /* ---------- kartu ringkasan ---------- */
  function renderStats(h) {
    if (!statsEl) return;
    if (!h.length) {
      statsEl.innerHTML =
        '<div class="dash-card"><small>Percobaan</small><strong>0</strong><span>Isi kuis untuk mengisi dashboard.</span></div>' +
        '<div class="dash-card"><small>Dominan</small><strong>—</strong><span>Belum ada data.</span></div>' +
        '<div class="dash-card"><small>Dominansi</small><strong>—</strong><span>Belum ada data.</span></div>' +
        '<div class="dash-card"><small>Terakhir</small><strong>—</strong><span>Belum ada data.</span></div>';
      return;
    }
    var freq = {};
    var domSum = 0;
    h.forEach(function (x) {
      freq[x.top] = (freq[x.top] || 0) + 1;
      if (typeof x.consistency === 'number') domSum += x.consistency;
    });
    var fav = Object.keys(freq).sort(function (a, b) { return freq[b] - freq[a]; })[0];
    var last = h[0];
    statsEl.innerHTML =
      '<div class="dash-card"><small>Percobaan</small><strong>' + h.length + '×</strong><span>Di perangkat ini.</span></div>' +
      '<div class="dash-card"><small>Dominan</small><strong>' + esc(labelOf(fav)) + '</strong><span>' + freq[fav] + '× dari ' + h.length + '.</span></div>' +
      '<div class="dash-card"><small>Dominansi</small><strong>' + Math.round(domSum / h.length) + '%</strong><span>Rata-rata skor tertinggi.</span></div>' +
      '<div class="dash-card"><small>Terakhir</small><strong>' + esc(labelOf(last.top)) + '</strong><span>' + last.score + '/10 • ' + esc(last.consistencyLabel || '') + '</span></div>';
  }

  /* ---------- diagram garis tren ---------- */
  function renderTrend(h) {
    if (!trendEl) return;
    if (!h.length) {
      trendEl.innerHTML = '<div class="dash-empty trend-empty">Belum ada data. Selesaikan kuis — garis tren muncul di sini.<br><a class="btn btn-primary btn-sm" href="kuis.html" style="margin-top:12px;">Mulai Kuis</a></div>';
      return;
    }
    var pts = h.slice(0, 10).reverse(); // terlama -> terbaru
    var W = 600, H = 220, PL = 34, PR = 14, PT = 16, PB = 28;
    var iw = W - PL - PR, ih = H - PT - PB;
    function X(i) { return pts.length === 1 ? PL + iw / 2 : PL + (iw * i) / (pts.length - 1); }
    function Y(p) { return PT + ih - (Math.max(0, Math.min(100, p)) / 100) * ih; }

    var svg = '<svg class="trend-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Garis tren dominansi">';
    svg += '<defs><linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">'
      + '<stop offset="0" stop-color="#0f766e" stop-opacity="0.25"/>'
      + '<stop offset="1" stop-color="#0f766e" stop-opacity="0"/></linearGradient></defs>';
    [0, 25, 50, 75, 100].forEach(function (g) {
      svg += '<line class="trend-grid-line" x1="' + PL + '" y1="' + Y(g) + '" x2="' + (W - PR) + '" y2="' + Y(g) + '"/>'
        + '<text class="trend-grid-label" x="2" y="' + (Y(g) + 3) + '">' + g + '</text>';
    });
    var line = pts.map(function (p, i) { return (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(p.percent).toFixed(1); }).join(' ');
    if (pts.length > 1) {
      var area = line + ' L' + X(pts.length - 1).toFixed(1) + ' ' + (PT + ih) + ' L' + X(0).toFixed(1) + ' ' + (PT + ih) + ' Z';
      svg += '<path class="trend-area" id="trendArea" d="' + area + '"/>';
      svg += '<path class="trend-line" id="trendLine" d="' + line + '"/>';
    }
    pts.forEach(function (p, i) {
      svg += '<text class="trend-x-label" x="' + X(i).toFixed(1) + '" y="' + (H - 8) + '">#' + (i + 1) + '</text>';
      svg += '<circle class="trend-dot' + (i === pts.length - 1 ? ' is-top' : '') + '" cx="' + X(i).toFixed(1) + '" cy="' + Y(p.percent).toFixed(1) + '" r="5"/>';
      svg += '<text class="trend-val" x="' + X(i).toFixed(1) + '" y="' + (Y(p.percent) - 12).toFixed(1) + '">' + p.percent + '%</text>';
    });
    svg += '</svg>';
    if (pts.length < 2) svg += '<p class="dash-panel-desc" style="margin:10px 0 0;">Isi kuis sekali lagi untuk melihat garis tren.</p>';
    trendEl.innerHTML = svg;

    // animasi garis naik perlahan
    try {
      var lineEl = document.getElementById('trendLine');
      var areaEl = document.getElementById('trendArea');
      var dots = trendEl.querySelectorAll('.trend-dot');
      var vals = trendEl.querySelectorAll('.trend-val');
      if (!lineEl || reduced) {
        if (areaEl) areaEl.classList.add('is-drawn');
        for (var a = 0; a < dots.length; a++) { dots[a].classList.add('is-shown'); vals[a].classList.add('is-shown'); }
        return;
      }
      var len = lineEl.getTotalLength();
      lineEl.style.strokeDasharray = String(len);
      lineEl.style.strokeDashoffset = String(len);
      lineEl.getBoundingClientRect();
      lineEl.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(0.2, 0.8, 0.3, 1)';
      lineEl.style.strokeDashoffset = '0';
      for (var d = 0; d < dots.length; d++) {
        (function (k) {
          window.setTimeout(function () {
            if (dots[k]) dots[k].classList.add('is-shown');
            if (vals[k]) vals[k].classList.add('is-shown');
            if (k === dots.length - 1 && areaEl) areaEl.classList.add('is-drawn');
          }, 300 + Math.round((1100 * (k + 1)) / dots.length));
        })(d);
      }
    } catch (e) {}
  }

  /* ---------- rata-rata ---------- */
  function renderAvg(h) {
    if (!avgEl) return;
    if (!h.length) {
      avgEl.innerHTML = '<div class="dash-empty">Rata-rata muncul setelah ada hasil tersimpan.</div>';
      return;
    }
    var sums = { teknologi: 0, kesehatan: 0, soshum: 0, bisnis: 0, kreatif: 0 };
    h.forEach(function (x) {
      ORDER.forEach(function (k) { if (x.scores && typeof x.scores[k] === 'number') sums[k] += x.scores[k]; });
    });
    var avgs = ORDER.map(function (k) { return { key: k, avg: sums[k] / h.length }; })
      .sort(function (a, b) { return b.avg - a.avg; });
    var html = '';
    avgs.forEach(function (x) {
      html += '<div class="dash-avg-row"><span class="stat-label">' + esc(LABELS[x.key].label) + '</span>'
        + '<div class="stat-bar-track"><span class="stat-bar-fill" style="width:' + Math.round((x.avg / 10) * 100) + '%; background:' + LABELS[x.key].color + '"></span></div>'
        + '<span class="stat-percent">' + x.avg.toFixed(1) + '</span></div>';
    });
    avgEl.innerHTML = html;
  }

  /* ---------- riwayat ---------- */
  function renderHistory(h) {
    if (!histEl) return;
    if (!h.length) {
      histEl.innerHTML = '<div class="dash-empty">Riwayat kosong. Tiap kuis yang selesai tercatat otomatis.</div>';
      return;
    }
    var html = '<div class="dash-hist">';
    h.forEach(function (x, i) {
      html += '<div class="dash-hist-row"><div class="dash-hist-main"><strong>' + esc(labelOf(x.top)) + ' • ' + x.score + '/10</strong>'
        + '<span>' + esc(fmtDate(x.ts)) + ' • ' + esc(x.consistencyLabel || '') + '</span></div>'
        + '<span class="dash-hist-badge">' + x.percent + '%</span>'
        + '<button type="button" class="dash-hist-del" data-hdel="' + i + '" aria-label="Hapus catatan ' + esc(labelOf(x.top)) + '"><i data-feather="trash-2" aria-hidden="true"></i></button></div>';
    });
    histEl.innerHTML = html + '</div>';
    var dels = histEl.querySelectorAll('[data-hdel]');
    for (var d = 0; d < dels.length; d++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          var i = parseInt(btn.getAttribute('data-hdel'), 10);
          var cur = getHistory();
          if (!isNaN(i) && i >= 0 && i < cur.length) { cur.splice(i, 1); saveHistory(cur); renderAll(); }
        });
      })(dels[d]);
    }
  }

  /* ---------- hasil dari tautan + favorit ---------- */
  function clearHash() {
    try {
      if (history.replaceState) history.replaceState(null, '', location.pathname + location.search);
      else location.hash = '';
    } catch (e) { try { location.hash = ''; } catch (err) {} }
  }

  function renderLinkPreview() {
    if (!linkEl) return;
    var data = null;
    try { data = window.PanduanJurusanShare ? window.PanduanJurusanShare.decodeHash() : null; } catch (e) {}
    if (!data) { linkEl.innerHTML = ''; return; }
    var sc = (data.s && typeof data.s[data.t] === 'number') ? data.s[data.t] : 0;
    linkEl.innerHTML = '<div class="dash-resume"><i data-feather="link" aria-hidden="true"></i>'
      + '<span><strong>Hasil dari tautan:</strong> ' + esc(labelOf(data.t)) + ' • ' + sc + '/10.</span>'
      + '<button class="btn btn-primary btn-sm" id="dashLinkSave" type="button">Simpan</button>'
      + '<button class="btn btn-ghost btn-sm" id="dashLinkHide" type="button">Tutup</button></div>';
    var saveB = document.getElementById('dashLinkSave');
    var hideB = document.getElementById('dashLinkHide');
    if (saveB) saveB.addEventListener('click', function () {
      var h = getHistory();
      h.unshift({ ts: Date.now(), top: data.t, score: sc, percent: sc * 10, consistency: sc * 10, consistencyLabel: data.c || '', scores: data.s, detail: null });
      saveHistory(h);
      clearHash();
      renderAll();
    });
    if (hideB) hideB.addEventListener('click', function () { clearHash(); linkEl.innerHTML = ''; });
    feather();
  }

  function renderFav() {
    if (!favEl) return;
    var list = [];
    try {
      if (window.PanduanJurusanFav && window.PanduanJurusanFav.list) list = window.PanduanJurusanFav.list() || [];
      else { var raw = localStorage.getItem('panduan-jurusan-favorit'); list = raw ? JSON.parse(raw) : []; }
      if (!Array.isArray(list)) list = [];
    } catch (e) { list = []; }
    if (!list.length) {
      favEl.innerHTML = '<div class="dash-empty">Belum ada favorit. Tandai jurusan <a href="../index.html#jurusan">di katalog beranda</a>.</div>';
      return;
    }
    var html = '<div class="dash-hist">';
    list.forEach(function (name) {
      var j = null;
      try { if (window.JURUSAN_BY_NAME) j = window.JURUSAN_BY_NAME(name); } catch (e) {}
      html += '<div class="dash-hist-row"><div class="dash-hist-main"><strong>' + esc(name) + '</strong>'
        + '<span>' + esc(j ? j.catLabel + ' • ' + j.durasi : '') + '</span></div>'
        + '<button type="button" class="dash-hist-del" data-fdel="' + esc(name) + '" aria-label="Hapus favorit ' + esc(name) + '"><i data-feather="x" aria-hidden="true"></i></button></div>';
    });
    favEl.innerHTML = html + '</div>';
    var dels = favEl.querySelectorAll('[data-fdel]');
    for (var d = 0; d < dels.length; d++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          var name = btn.getAttribute('data-fdel');
          try {
            if (window.PanduanJurusanFav && window.PanduanJurusanFav.toggle) window.PanduanJurusanFav.toggle(name);
            else {
              var r2 = localStorage.getItem('panduan-jurusan-favorit');
              var cur = r2 ? JSON.parse(r2) : [];
              var i = cur.indexOf(name);
              if (i > -1) { cur.splice(i, 1); localStorage.setItem('panduan-jurusan-favorit', JSON.stringify(cur)); }
            }
          } catch (e) {}
          renderFav();
          feather();
        });
      })(dels[d]);
    }
  }

  function docFromEntry(x) {
    if (x.detail) {
      return {
        dateStr: fmtDate(x.ts), topLabel: x.detail.topLabel, topTitle: x.detail.topTitle,
        topDesc: x.detail.topDesc, topScore: x.score, topPercent: x.percent,
        consLabel: x.consistencyLabel, consValue: x.consistency, consDesc: x.detail.consDesc,
        rows: x.detail.rows, whys: x.detail.whys, pros: x.detail.pros, consList: x.detail.consList,
        jurusan: x.detail.jurusan, coba: x.detail.coba, tanya: x.detail.tanya,
        review: x.detail.review || []
      };
    }
    return {
      dateStr: fmtDate(x.ts), topLabel: labelOf(x.top), topTitle: 'Rumpun ' + labelOf(x.top),
      topDesc: '', topScore: x.score, topPercent: x.percent,
      consLabel: x.consistencyLabel, consValue: x.consistency, consDesc: '',
      rows: ORDER.map(function (k) {
        var s = (x.scores && typeof x.scores[k] === 'number') ? x.scores[k] : 0;
        return { label: labelOf(k), score: s, percent: Math.round(s / 10 * 100) };
      }),
      whys: [], pros: [], consList: [], jurusan: [], coba: '', tanya: [], review: []
    };
  }

  function renderAll() {
    var h = getHistory();
    renderLinkPreview();
    renderStats(h);
    renderTrend(h);
    renderAvg(h);
    renderHistory(h);
    renderFav();
    feather();
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      if (!getHistory().length) return;
      var ok = true;
      try { ok = window.confirm('Hapus seluruh riwayat di perangkat ini?'); } catch (e) { ok = true; }
      if (!ok) return;
      saveHistory([]);
      renderAll();
    });
  }

  if (wordBtn) {
    wordBtn.addEventListener('click', function () {
      var h = getHistory();
      if (!h.length) {
        try { window.alert('Belum ada hasil. Isi kuis dulu.'); } catch (e) {}
        return;
      }
      if (window.PanduanJurusanExport) {
        window.PanduanJurusanExport.downloadWord('hasil-evaluasi-kuis.doc', window.PanduanJurusanExport.buildWordDoc(docFromEntry(h[0])));
      }
    });
  }

  if (linkBtn) {
    linkBtn.addEventListener('click', function () {
      var h = getHistory();
      if (!h.length || !window.PanduanJurusanShare) {
        try { window.alert('Belum ada hasil. Isi kuis dulu.'); } catch (e) {}
        return;
      }
      var url = window.PanduanJurusanShare.buildResultLink({ t: h[0].top, s: h[0].scores, c: h[0].consistencyLabel });
      if (!url) return;
      var original = linkBtn.innerHTML;
      window.PanduanJurusanShare.copyText(url).then(function (ok) {
        linkBtn.innerHTML = ok ? '<i data-feather="check" aria-hidden="true"></i> Tersalin!' : original;
        feather();
        if (ok) window.setTimeout(function () { linkBtn.innerHTML = original; feather(); }, 1800);
      });
    });
  }

  renderAll();
  feather();
  window.addEventListener('load', feather);

})();
