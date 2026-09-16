/* Panduan Jurusan — Ringkasan keluarga (cetak / simpan PDF, tanpa dependensi) */
(function () {
  'use strict';

  var HIST_KEY = 'panduan-jurusan-kuis-10-history';
  var SC_KEY = 'panduan-jurusan-calc-scenarios';
  var TIPS_KEY = 'panduan-jurusan-tips';
  var FAV_KEY = 'panduan-jurusan-favorit';

  var TIPS_TITLES = {
    1: 'Ajak anak mengenali minatnya',
    2: 'Cari informasi bersama',
    3: 'Bicarakan kemampuan dan kondisi keluarga',
    4: 'Beri ruang untuk anak memutuskan'
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function read(key, fb) {
    try {
      var raw = localStorage.getItem(key);
      if (raw == null) return fb;
      var d = JSON.parse(raw);
      return d == null ? fb : d;
    } catch (e) { return fb; }
  }

  function fmtRp(n) {
    try {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
    } catch (e) {
      return 'Rp ' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
  }

  function fmtToday() {
    try {
      return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) { return ''; }
  }

  function getData() {
    var hist = read(HIST_KEY, []);
    var quiz = Array.isArray(hist) && hist.length ? hist[0] : null;
    var plan = null;
    try { if (window.PanduanJurusanAksi) plan = window.PanduanJurusanAksi.getPlan(); } catch (e) {}
    var sc = read(SC_KEY, []);
    if (!Array.isArray(sc)) sc = [];
    var tips = read(TIPS_KEY, []);
    if (!Array.isArray(tips)) tips = [];
    var fav = read(FAV_KEY, []);
    if (!Array.isArray(fav)) fav = [];
    var rems = [];
    try { if (window.PanduanJurusanReminder) rems = window.PanduanJurusanReminder.activeEvents() || []; } catch (e) {}
    return { quiz: quiz, plan: plan, scenarios: sc.slice(0, 6), tipsDone: tips, fav: fav, reminders: rems };
  }

  function hasAny(d) {
    return !!(d.quiz || d.plan || d.scenarios.length || d.tipsDone.length || d.fav.length || d.reminders.length);
  }

  function li(items) {
    return (items || []).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');
  }

  function buildDoc(d) {
    var h = [];
    h.push('<!DOCTYPE html><html lang="id"><head><meta charset="utf-8">');
    h.push('<title>Ringkasan Panduan Jurusan</title>');
    h.push('<style>body{font-family:Arial,Helvetica,sans-serif;color:#0f172a;max-width:720px;margin:0 auto;padding:24px;font-size:13px;line-height:1.6;}'
      + 'h1{font-size:22px;margin:0 0 2px;}h2{font-size:15px;margin:22px 0 8px;padding-bottom:4px;border-bottom:2px solid #0f766e;}'
      + 'h3{font-size:13.5px;margin:12px 0 4px;}p{margin:4px 0;}ul,ol{margin:4px 0 8px;padding-left:20px;}li{margin-bottom:3px;}'
      + 'table{border-collapse:collapse;width:100%;margin:6px 0;}th,td{border:1px solid #94a3b8;padding:5px 8px;text-align:left;font-size:12.5px;}th{background:#f1f5f9;}'
      + '.muted{color:#64748b;}.box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;margin:6px 0;}'
      + '.check{font-weight:bold;}.foot{margin-top:24px;font-size:11.5px;color:#64748b;border-top:1px solid #e2e8f0;padding-top:8px;}</style>');
    h.push('</head><body>');
    h.push('<h1>Ringkasan Panduan Jurusan</h1>');
    h.push('<p class="muted">Dicetak ' + esc(fmtToday()) + ' • bahan obrolan keluarga 15 menit</p>');

    /* 1. Kuis */
    h.push('<h2>1. Hasil kuis minat</h2>');
    if (d.quiz) {
      var q = d.quiz;
      var det = q.detail || {};
      h.push('<p><b>Dominan: ' + esc(det.topTitle || det.topLabel || q.top || '-') + '</b> (' + (q.score != null ? q.score : '-') + '/10'
        + (q.percent != null ? ', ' + q.percent + '%' : '') + (q.consistencyLabel ? ' • ' + esc(q.consistencyLabel) : '') + ')</p>');
      if (det.topDesc) h.push('<p>' + esc(det.topDesc) + '</p>');
      if (Array.isArray(det.rows) && det.rows.length) {
        h.push('<table><tr><th>Rumpun</th><th>Skor</th><th>Persen</th></tr>');
        det.rows.forEach(function (r) {
          h.push('<tr><td>' + esc(r.label) + '</td><td>' + r.score + '/10</td><td>' + r.percent + '%</td></tr>');
        });
        h.push('</table>');
      }
      if (Array.isArray(det.jurusan) && det.jurusan.length) {
        h.push('<h3>Jurusan yang cocok</h3><ul>');
        det.jurusan.forEach(function (j) { h.push('<li><b>' + esc(j.name) + '</b>' + (j.sub ? ' — ' + esc(j.sub) : '') + '</li>'); });
        h.push('</ul>');
      }
      if (det.coba) h.push('<h3>Uji coba 2 minggu</h3><p>' + esc(det.coba) + '</p>');
    } else {
      h.push('<p class="muted">Belum ada hasil kuis di perangkat ini.</p>');
    }

    /* 2. Rencana aksi */
    h.push('<h2>2. Rencana aksi 2 minggu</h2>');
    if (d.plan && d.plan.items.length) {
      h.push('<ul>');
      d.plan.items.forEach(function (it, i) {
        var done = d.plan.done.indexOf(i) > -1;
        h.push('<li><span class="check">' + (done ? '☑' : '☐') + '</span> <b>' + esc(it.t) + '</b>' + (it.s ? '<br><span class="muted">' + esc(it.s) + '</span>' : '') + '</li>');
      });
      h.push('</ul>');
    } else {
      h.push('<p class="muted">Belum ada rencana aksi (isi kuis dulu).</p>');
    }

    /* 3. Biaya */
    h.push('<h2>3. Estimasi biaya</h2>');
    if (d.scenarios.length) {
      h.push('<table><tr><th>Skenario</th><th>Total lulus</th><th>UKT/smt</th></tr>');
      d.scenarios.forEach(function (s) {
        h.push('<tr><td>' + esc(s.name || '-') + ' (' + (s.smt || '-') + ' smt)</td><td>' + esc(fmtRp(s.total || 0)) + '</td><td>' + esc(fmtRp(s.ukt || 0)) + '</td></tr>');
      });
      h.push('</table>');
    } else {
      h.push('<p class="muted">Belum ada skenario tersimpan — hitung di kalkulator lalu simpan.</p>');
    }

    /* 4. Favorit + diskusi */
    h.push('<h2>4. Favorit & diskusi keluarga</h2>');
    if (d.fav.length) h.push('<p><b>Jurusan favorit:</b> ' + esc(d.fav.join(', ')) + '</p>');
    var doneTitles = d.tipsDone.map(function (k) { return TIPS_TITLES[k] || ('Langkah ' + k); });
    h.push('<p><b>Tips dibahas:</b> ' + d.tipsDone.length + ' dari 4'
      + (doneTitles.length ? ' (' + esc(doneTitles.join('; ')) + ')' : '') + '</p>');

    /* 5. Pengingat */
    h.push('<h2>5. Pengingat seleksi</h2>');
    if (d.reminders.length) {
      h.push('<ul>');
      d.reminders.forEach(function (ev) {
        var when = '';
        try { when = window.PanduanJurusanReminder.fmtDateId(ev.date); } catch (e) { when = ev.date; }
        h.push('<li><b>' + esc(ev.name) + '</b> — ' + esc(when) + ' (perkiraan)</li>');
      });
      h.push('</ul>');
    } else {
      h.push('<p class="muted">Tidak ada pengingat aktif.</p>');
    }

    h.push('<p class="foot">Bukan tes psikologi formal & bukan info resmi kampus. Tanggal seleksi = perkiraan, cek pengumuman resmi SNPMB & kampus tujuan. Data hanya di perangkat ini.</p>');
    h.push('</body></html>');
    return h.join('');
  }

  function cetak() {
    var d = getData();
    if (!hasAny(d)) {
      try { window.alert('Belum ada data. Isi kuis, hitung biaya, atau centang tips dulu.'); } catch (e) {}
      return false;
    }
    try {
      var w = window.open('', '_blank');
      if (!w) {
        try { window.alert('Izinkan popup agar ringkasan bisa dicetak.'); } catch (e) {}
        return false;
      }
      w.document.write(buildDoc(d));
      w.document.close();
      w.focus();
      window.setTimeout(function () { try { w.print(); } catch (e) {} }, 350);
      return true;
    } catch (e) { return false; }
  }

  window.PanduanJurusanRingkasan = { getData: getData, hasAny: hasAny, buildDoc: buildDoc, cetak: cetak };

  /* Tombol dinamis/statis: #resultPdf (hasil kuis), #dashPdf (dashboard) */
  function bind() {
    try {
      document.addEventListener('click', function (e) {
        var t = e.target && e.target.closest ? e.target.closest('#resultPdf,#dashPdf') : null;
        if (!t) return;
        e.preventDefault();
        cetak();
      });
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else { bind(); }
})();
