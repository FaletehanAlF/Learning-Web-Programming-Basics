/* Panduan Jurusan — skenario kalkulator A/B (bandingkan hitungan) */
(function () {
  'use strict';

  var SC_KEY = 'panduan-jurusan-calc-scenarios';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function fmtRp(n) {
    try {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
    } catch (e) {
      return 'Rp ' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
  }

  function getSc() {
    try {
      var raw = localStorage.getItem(SC_KEY);
      var d = raw ? JSON.parse(raw) : [];
      return Array.isArray(d) ? d : [];
    } catch (e) { return []; }
  }

  function setSc(list) {
    try { localStorage.setItem(SC_KEY, JSON.stringify(list.slice(0, 6))); } catch (e) {}
  }

  function autoName(list) {
    var letters = 'ABCDEF';
    for (var i = 0; i < letters.length; i++) {
      var n = 'Skenario ' + letters[i];
      var used = false;
      for (var j = 0; j < list.length; j++) { if (list[j].name === n) used = true; }
      if (!used) return n;
    }
    return 'Skenario ' + (list.length + 1);
  }

  function setInput(id, val, evName) {
    var el = document.getElementById(id);
    if (!el) return false;
    try {
      if (el.type === 'checkbox') { el.checked = !!val; }
      else { el.value = String(val); }
      el.dispatchEvent(new Event(evName || 'input', { bubbles: true }));
      return true;
    } catch (e) { return false; }
  }

  function render() {
    var listEl = document.getElementById('calcScenarioList');
    var cmpEl = document.getElementById('calcScenarioCompare');
    if (!listEl && !cmpEl) return;
    var list = getSc();

    if (listEl) {
      if (!list.length) {
        listEl.innerHTML = '<p class="sc-empty">Belum ada. Atur angka di atas, lalu simpan sebagai skenario.</p>';
      } else {
        var html = '<div class="sc-list">';
        list.forEach(function (s, i) {
          html += '<div class="sc-row"><div class="sc-main"><strong>' + esc(s.name) + '</strong>'
            + '<span>' + fmtRp(s.total) + ' • ' + s.smt + ' smt' + (s.beasiswa ? ' • beasiswa' : '') + '</span></div>'
            + '<button type="button" class="sc-load" data-load="' + i + '">Muat</button>'
            + '<button type="button" class="dash-hist-del" data-sdel="' + i + '" aria-label="Hapus ' + esc(s.name) + '"><i data-feather="trash-2" aria-hidden="true"></i></button></div>';
        });
        listEl.innerHTML = html + '</div>';
        var loads = listEl.querySelectorAll('[data-load]');
        for (var a = 0; a < loads.length; a++) {
          (function (btn) {
            btn.addEventListener('click', function () {
              var cur = getSc();
              var s = cur[parseInt(btn.getAttribute('data-load'), 10)];
              if (!s) return;
              setInput('calcUkt', s.ukt);
              setInput('calcUktRange', s.ukt);
              setInput('calcHidup', s.hidup);
              setInput('calcSemester', s.smt, 'change');
              setInput('calcBeasiswa', s.beasiswa, 'change');
              var sec = document.getElementById('kalkulator-biaya');
              if (sec) { try { sec.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {} }
            });
          })(loads[a]);
        }
        var dels = listEl.querySelectorAll('[data-sdel]');
        for (var d = 0; d < dels.length; d++) {
          (function (btn) {
            btn.addEventListener('click', function () {
              var cur = getSc();
              var i = parseInt(btn.getAttribute('data-sdel'), 10);
              if (!isNaN(i) && i >= 0 && i < cur.length) { cur.splice(i, 1); setSc(cur); render(); }
            });
          })(dels[d]);
        }
      }
    }

    if (cmpEl) {
      if (list.length < 2) { cmpEl.innerHTML = ''; return; }
      var min = null;
      list.forEach(function (s) { if (min === null || s.total < min) min = s.total; });
      var t = '<table class="sc-table"><thead><tr><th></th>' + list.map(function (s) {
        return '<th>' + esc(s.name) + (s.total === min ? ' <span class="sc-cheap">Termurah</span>' : '') + '</th>';
      }).join('') + '</tr></thead><tbody>';
      t += '<tr><th>Total lulus</th>' + list.map(function (s) { return '<td><strong>' + fmtRp(s.total) + '</strong></td>'; }).join('') + '</tr>';
      t += '<tr><th>Per tahun</th>' + list.map(function (s) { return '<td>' + fmtRp(s.perTahun) + '</td>'; }).join('') + '</tr>';
      t += '<tr><th>UKT / smt</th>' + list.map(function (s) { return '<td>' + fmtRp(s.ukt) + '</td>'; }).join('') + '</tr>';
      t += '</tbody></table>';
      cmpEl.innerHTML = t;
    }
    try { if (window.feather) window.feather.replace(); } catch (e) {}
  }

  function mount() {
    var saveBtn = document.getElementById('calcSaveScenario');
    if (!saveBtn && !document.getElementById('calcScenarioList')) return;
    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        var last = null;
        try { last = window._calcLast || null; } catch (e) {}
        if (!last || typeof last.total !== 'number') return;
        var list = getSc();
        if (list.length >= 6) {
          try { if (window.PanduanJurusanFav) window.PanduanJurusanFav.toast('Maksimal 6 skenario'); } catch (e) {}
          return;
        }
        list.push({ name: autoName(list), ukt: last.ukt, hidup: last.hidup, smt: last.smt, beasiswa: last.beasiswa, total: last.total, perTahun: last.perTahun, ts: Date.now() });
        setSc(list);
        render();
        try { if (window.PanduanJurusanFav) window.PanduanJurusanFav.toast('Skenario tersimpan'); } catch (e) {}
      });
    }
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else { mount(); }
})();
