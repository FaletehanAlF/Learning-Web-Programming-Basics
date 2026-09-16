/* Panduan Jurusan — Rencana Aksi 2 minggu (personal dari hasil kuis, tersimpan lokal) */
(function () {
  'use strict';

  var PLAN_KEY = 'panduan-jurusan-action-plan';
  var RESULT_KEY = 'panduan-jurusan-kuis-10-result';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function feather() {
    try { if (window.feather) window.feather.replace(); } catch (e) {}
  }

  function toast(msg) {
    try { if (window.PanduanJurusanFav) window.PanduanJurusanFav.toast(msg); } catch (e) {}
  }

  function getStoredResult() {
    try {
      var raw = localStorage.getItem(RESULT_KEY);
      if (!raw) return null;
      var d = JSON.parse(raw);
      if (!d || !d.top || !Array.isArray(d.list) || !d.list.length) return null;
      return d;
    } catch (e) { return null; }
  }

  function metaOf(stored) {
    try {
      for (var i = 0; i < stored.list.length; i++) {
        if (stored.list[i] && stored.list[i].key === stored.top) return stored.list[i].meta || null;
      }
      return (stored.list[0] && stored.list[0].meta) || null;
    } catch (e) { return null; }
  }

  function sigOf(stored) {
    try {
      var parts = stored.list.map(function (x) { return x.key + ':' + x.score; });
      return stored.top + '|' + parts.join(',');
    } catch (e) { return ''; }
  }

  /* 6 langkah: 3 personal (coba + 2 tanya) + 3 umum. t = judul, s = sub-teks */
  function buildItems(meta, topLabel) {
    var items = [];
    var coba = meta && meta.coba ? String(meta.coba) : '';
    var tanya = meta && Array.isArray(meta.tanya) ? meta.tanya : [];
    items.push({
      t: 'Lakukan uji coba 2 minggu',
      s: coba || 'Pilih satu kegiatan kecil sesuai minat anak dan jalani 2 minggu.'
    });
    items.push({
      t: 'Tanya ke anak: "' + (tanya[0] ? String(tanya[0]) : 'bagian mana yang paling bikin betah?') + '"',
      s: 'Dengarkan sampai selesai, tanpa dikoreksi.'
    });
    items.push({
      t: 'Tanya ke anak: "' + (tanya[1] ? String(tanya[1]) : 'masih mau lanjut kalau sulit?') + '"',
      s: 'Catat jawabannya sebagai bahan obrolan berikutnya.'
    });
    items.push({
      t: 'Bandingkan 2–3 jurusan ' + (topLabel || 'pilihan'),
      s: 'Buka katalog jurusan, tandai favorit, lalu bandingkan.',
      href: '../index.html#jurusan'
    });
    items.push({
      t: 'Hitung biaya sampai lulus',
      s: 'Pakai kalkulator biaya bareng anak agar angka jelas.',
      href: '../index.html#kalkulator-biaya'
    });
    items.push({
      t: 'Sepakati 1 utama + 1 cadangan',
      s: 'Tulis pilihannya dan tempel di kulkas — evaluasi lagi 2 minggu.'
    });
    return items;
  }

  function loadPlan() {
    try {
      var raw = localStorage.getItem(PLAN_KEY);
      if (!raw) return null;
      var d = JSON.parse(raw);
      if (!d || typeof d.sig !== 'string' || !Array.isArray(d.done)) return null;
      return d;
    } catch (e) { return null; }
  }

  function savePlan(p) {
    try { localStorage.setItem(PLAN_KEY, JSON.stringify(p)); } catch (e) {}
  }

  /* API bersama: dipakai halaman hasil, dashboard, dan ringkasan PDF */
  function getPlan() {
    var stored = getStoredResult();
    if (!stored) return null;
    var meta = metaOf(stored);
    var topLabel = '';
    try {
      var labelMap = { teknologi: 'Teknologi', kesehatan: 'Kesehatan', soshum: 'Soshum', bisnis: 'Bisnis', kreatif: 'Kreatif' };
      topLabel = (meta && meta.label) || labelMap[stored.top] || stored.top;
    } catch (e) {}
    var sig = sigOf(stored);
    var saved = loadPlan();
    var done = saved && saved.sig === sig ? saved.done.filter(function (n) { return typeof n === 'number'; }) : [];
    var items = buildItems(meta, topLabel);
    done = done.filter(function (n) { return n >= 0 && n < items.length; });
    return { sig: sig, top: stored.top, topLabel: topLabel, items: items, done: done };
  }

  function toggle(plan, idx, on) {
    var i = plan.done.indexOf(idx);
    if (on && i === -1) plan.done.push(idx);
    if (!on && i > -1) plan.done.splice(i, 1);
    savePlan({ sig: plan.sig, top: plan.top, done: plan.done });
  }

  function progressHtml(plan) {
    var pct = plan.items.length ? Math.round((plan.done.length / plan.items.length) * 100) : 0;
    return '<div class="tips-progress-info"><strong>' + plan.done.length + ' dari ' + plan.items.length
      + ' langkah selesai</strong><span>Centang yang sudah dilakukan bareng anak. Tersimpan otomatis.</span></div>'
      + '<div class="progress-bar" aria-hidden="true"><span style="width:' + pct + '%"></span></div>';
  }

  function renderInto(box, plan, compact) {
    var html = '<div class="tips-progress" role="status" aria-live="polite">' + progressHtml(plan) + '</div>';
    html += '<ol class="tips-list" style="margin-top:12px;">';
    plan.items.forEach(function (it, i) {
      var checked = plan.done.indexOf(i) > -1;
      html += '<li class="tips-item' + (checked ? ' is-done' : '') + '">'
        + '<span class="tips-number" aria-hidden="true">' + (i + 1) + '</span>'
        + '<div class="tips-content"><h3>' + esc(it.t) + '</h3><p>' + esc(it.s) + '</p>'
        + (it.href && !compact ? '<p><a href="' + esc(it.href) + '">Buka →</a></p>' : '')
        + '<label class="tips-check"><input type="checkbox" data-aksi="' + i + '"' + (checked ? ' checked' : '') + ' /> Sudah dilakukan</label>'
        + '</div></li>';
    });
    html += '</ol>';
    box.innerHTML = html;
    var checks = box.querySelectorAll('[data-aksi]');
    for (var k = 0; k < checks.length; k++) {
      (function (c) {
        c.addEventListener('change', function () {
          var idx = parseInt(c.getAttribute('data-aksi'), 10);
          toggle(plan, idx, c.checked);
          var fresh = getPlan();
          if (fresh) renderInto(box, fresh, compact);
          if (c.checked) toast('Langkah ' + (idx + 1) + ' selesai — lanjutkan!');
        });
      })(checks[k]);
    }
    feather();
  }

  /* ---------- halaman hasil kuis: suntik seksi setelah .result-try ---------- */
  function mountResult() {
    var resultEl = document.getElementById('quizFullResult');
    if (!resultEl) return;
    function tryInject() {
      try {
        if (resultEl.hidden || document.getElementById('aksiPlan')) return;
        var anchor = resultEl.querySelector('.result-try');
        if (!anchor) return;
        var plan = getPlan();
        if (!plan) return;
        var sec = document.createElement('div');
        sec.className = 'result-aksi';
        sec.id = 'aksiPlan';
        sec.innerHTML = '<h3><i data-feather="clipboard" aria-hidden="true"></i> Rencana aksi 2 minggu — ' + esc(plan.topLabel) + '</h3>'
          + '<p class="result-jurusan-desc">Dicentang bareng anak. Progres ikut ke PDF ringkasan.</p><div class="aksi-body"></div>';
        anchor.parentNode.insertBefore(sec, anchor.nextSibling);
        renderInto(sec.querySelector('.aksi-body'), plan, false);
      } catch (e) {}
    }
    tryInject();
    try {
      var obs = new MutationObserver(function () { tryInject(); });
      obs.observe(resultEl, { childList: true, subtree: false });
    } catch (e) {}
  }

  /* ---------- dashboard: panel ringkas ---------- */
  function renderDash(box) {
    var plan = getPlan();
    if (!plan) {
      box.innerHTML = '<div class="dash-empty">Belum ada rencana. Selesaikan kuis — rencana aksi 2 minggu dibuat otomatis.</div>';
      return;
    }
    var pct = Math.round((plan.done.length / plan.items.length) * 100);
    var html = '<p class="dash-panel-desc">Rumpun ' + esc(plan.topLabel) + ' • ' + plan.done.length + ' dari ' + plan.items.length + ' selesai</p>'
      + '<div class="progress-bar" role="img" aria-label="' + pct + '% selesai"><span style="width:' + pct + '%"></span></div>'
      + '<div class="dash-hist" style="margin-top:12px;">';
    plan.items.forEach(function (it, i) {
      var checked = plan.done.indexOf(i) > -1;
      html += '<label class="tips-check" style="margin-top:0;"><input type="checkbox" data-dash-aksi="' + i + '"' + (checked ? ' checked' : '') + ' /> <span>' + esc(it.t) + '</span></label>';
    });
    html += '</div><p style="margin-top:10px;"><a class="btn btn-outline btn-sm" href="kuis.html">Buka detail di halaman kuis</a></p>';
    box.innerHTML = html;
    var checks = box.querySelectorAll('[data-dash-aksi]');
    for (var k = 0; k < checks.length; k++) {
      (function (c) {
        c.addEventListener('change', function () {
          var idx = parseInt(c.getAttribute('data-dash-aksi'), 10);
          var p = getPlan();
          if (!p) return;
          toggle(p, idx, c.checked);
          renderDash(box);
          var res = document.getElementById('aksiPlan');
          if (res) { var f = getPlan(); if (f) renderInto(res.querySelector('.aksi-body'), f, false); }
        });
      })(checks[k]);
    }
    feather();
  }

  function renderAll() {
    var box = document.getElementById('dashAksi');
    if (box) renderDash(box);
  }

  window.PanduanJurusanAksi = { getPlan: getPlan, buildItems: buildItems };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { mountResult(); renderAll(); });
  } else { mountResult(); renderAll(); }
})();
