/* Panduan Jurusan — Pengingat timeline seleksi (SNBP/SNBT/Mandiri 2027, perkiraan) */
(function () {
  'use strict';

  var KEY = 'panduan-jurusan-reminders';
  var OFFICIAL = 'https://snpmb.bppp.kemdikbud.go.id';

  /* Tanggal = titik tengah jendela pendaftaran (perkiraan, bukan pengumuman resmi). */
  var EVENTS = [
    { id: 'snbp', name: 'SNBP 2027', desc: 'Seleksi rapor • pendaftaran dibuka', date: '2027-02-10', gdate: '20270210' },
    { id: 'snbt', name: 'SNBT / UTBK 2027', desc: 'Ujian tulis • pendaftaran dibuka', date: '2027-04-25', gdate: '20270425' },
    { id: 'mandiri', name: 'Mandiri 2027', desc: 'Seleksi tiap kampus • gelombang awal', date: '2027-06-15', gdate: '20270615' }
  ];

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

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      var d = raw ? JSON.parse(raw) : {};
      return d && typeof d === 'object' ? d : {};
    } catch (e) { return {}; }
  }

  function save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  function isOn(state, id) { return !!(state && state[id]); }

  function daysUntil(iso) {
    try {
      var t = new Date(iso + 'T00:00:00');
      var now = new Date();
      now.setHours(0, 0, 0, 0);
      return Math.ceil((t.getTime() - now.getTime()) / 86400000);
    } catch (e) { return null; }
  }

  function fmtDateId(iso) {
    try {
      return new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) { return iso; }
  }

  function countLabel(days) {
    if (days === null) return '';
    if (days < 0) return 'Sudah lewat — cek jadwal resmi';
    if (days === 0) return 'Hari ini (perkiraan)';
    if (days <= 30) return days + ' hari lagi — segera siapkan';
    return '±' + days + ' hari lagi';
  }

  function icsDate(d) { return d.replace(/-/g, ''); }

  function eventIcs(ev) {
    var stamp = '';
    try {
      stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    } catch (e) { stamp = '20260101T000000Z'; }
    var lines = [
      'BEGIN:VEVENT',
      'UID:' + ev.id + '-2027@panduan-jurusan',
      'DTSTAMP:' + stamp,
      'DTSTART;VALUE=DATE:' + icsDate(ev.date),
      'SUMMARY:' + ev.name + ' (perkiraan)',
      'DESCRIPTION:Pendaftaran ' + ev.name + ' diperkirakan dibuka. Cek pengumuman resmi: ' + OFFICIAL,
      'END:VEVENT'
    ];
    return lines.join('\r\n');
  }

  function downloadIcs(evs) {
    try {
      var body = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//PanduanJurusan//ID\r\n'
        + evs.map(eventIcs).join('\r\n') + '\r\nEND:VCALENDAR\r\n';
      var blob = new Blob([body], { type: 'text/calendar;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'pengingat-seleksi-2027.ics';
      document.body.appendChild(a);
      a.click();
      window.setTimeout(function () {
        try { document.body.removeChild(a); URL.revokeObjectURL(url); } catch (e) {}
      }, 500);
      toast('File kalender diunduh');
      return true;
    } catch (e) { return false; }
  }

  function gcalUrl(ev) {
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE'
      + '&text=' + encodeURIComponent(ev.name + ' (perkiraan)')
      + '&dates=' + ev.gdate + '/' + ev.gdate
      + '&details=' + encodeURIComponent('Perkiraan jadwal ' + ev.name + '. Cek pengumuman resmi: ' + OFFICIAL);
  }

  function activeEvents() {
    var state = load();
    return EVENTS.filter(function (ev) { return isOn(state, ev.id); });
  }

  /* ---------- beranda: tombol di tiap .timeline-item[data-event] ---------- */
  function mountTimeline() {
    var items = document.querySelectorAll('.timeline-item[data-event]');
    if (!items.length) return;
    var state = load();
    for (var i = 0; i < items.length; i++) {
      (function (box) {
        var id = box.getAttribute('data-event');
        var ev = null;
        for (var k = 0; k < EVENTS.length; k++) { if (EVENTS[k].id === id) ev = EVENTS[k]; }
        if (!ev || box.querySelector('[data-rem-toggle]')) return;
        var row = document.createElement('div');
        row.className = 'reminder-row';
        var on = isOn(state, id);
        row.innerHTML = '<button type="button" class="reminder-btn' + (on ? ' is-on' : '') + '" data-rem-toggle="' + esc(id) + '" aria-pressed="' + (on ? 'true' : 'false') + '">'
          + '<i data-feather="bell" aria-hidden="true"></i> ' + (on ? 'Diingatkan ✓' : 'Ingatkan') + '</button>'
          + '<a class="reminder-cal" href="' + gcalUrl(ev) + '" target="_blank" rel="noopener" aria-label="Simpan ' + esc(ev.name) + ' ke Google Kalender"><i data-feather="calendar" aria-hidden="true"></i></a>'
          + '<span class="reminder-count">' + esc(countLabel(daysUntil(ev.date))) + '</span>';
        box.appendChild(row);
      })(items[i]);
    }
    feather();
    var toggles = document.querySelectorAll('[data-rem-toggle]');
    for (var t = 0; t < toggles.length; t++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.getAttribute('data-rem-toggle');
          var st = load();
          st[id] = !st[id];
          if (!st[id]) delete st[id];
          save(st);
          var nowOn = !!st[id];
          btn.classList.toggle('is-on', nowOn);
          btn.setAttribute('aria-pressed', String(nowOn));
          btn.innerHTML = '<i data-feather="bell" aria-hidden="true"></i> ' + (nowOn ? 'Diingatkan ✓' : 'Ingatkan');
          feather();
          toast(nowOn ? 'Pengingat aktif — cek dashboard' : 'Pengingat dimatikan');
          renderDash();
        });
      })(toggles[t]);
    }
  }

  /* ---------- dashboard: panel #dashReminder ---------- */
  function renderDash() {
    var box = document.getElementById('dashReminder');
    if (!box) return;
    var state = load();
    var html = '<p class="dash-panel-desc">Tanggal perkiraan 2027. Cek pengumuman resmi <a href="' + OFFICIAL + '" target="_blank" rel="noopener">SNPMB</a>.</p>';
    html += '<div class="dash-hist">';
    EVENTS.forEach(function (ev) {
      var on = isOn(state, ev.id);
      var days = daysUntil(ev.date);
      html += '<div class="dash-hist-row"><div class="dash-hist-main"><strong>' + esc(ev.name) + '</strong>'
        + '<span>' + esc(fmtDateId(ev.date)) + ' • ' + esc(countLabel(days)) + '</span></div>'
        + '<button type="button" class="reminder-btn' + (on ? ' is-on' : '') + '" data-dash-rem="' + esc(ev.id) + '" aria-pressed="' + (on ? 'true' : 'false') + '">'
        + '<i data-feather="bell" aria-hidden="true"></i> ' + (on ? 'Aktif ✓' : 'Ingatkan') + '</button>'
        + '<button type="button" class="dash-hist-del" data-dash-ics="' + esc(ev.id) + '" aria-label="Unduh ' + esc(ev.name) + ' ke kalender"><i data-feather="calendar" aria-hidden="true"></i></button></div>';
    });
    html += '</div><p style="margin-top:10px;"><button type="button" class="btn btn-outline btn-sm" id="dashIcsAll"><i data-feather="download" aria-hidden="true"></i> Unduh semua (.ics)</button></p>';
    box.innerHTML = html;
    var ts = box.querySelectorAll('[data-dash-rem]');
    for (var i = 0; i < ts.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.getAttribute('data-dash-rem');
          var st = load();
          st[id] = !st[id];
          if (!st[id]) delete st[id];
          save(st);
          renderDash();
        });
      })(ts[i]);
    }
    var icsBtns = box.querySelectorAll('[data-dash-ics]');
    for (var j = 0; j < icsBtns.length; j++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.getAttribute('data-dash-ics');
          for (var k = 0; k < EVENTS.length; k++) { if (EVENTS[k].id === id) downloadIcs([EVENTS[k]]); }
        });
      })(icsBtns[j]);
    }
    var all = document.getElementById('dashIcsAll');
    if (all) all.addEventListener('click', function () { downloadIcs(EVENTS); });
    feather();
  }

  window.PanduanJurusanReminder = {
    activeEvents: activeEvents,
    allEvents: function () { return EVENTS.slice(); },
    isOn: function (id) { return isOn(load(), id); },
    fmtDateId: fmtDateId,
    countLabel: countLabel,
    daysUntil: daysUntil
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { mountTimeline(); renderDash(); });
  } else { mountTimeline(); renderDash(); }
})();
