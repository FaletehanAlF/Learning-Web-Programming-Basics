/* Panduan Jurusan — export laporan evaluasi ke file Word (.doc) */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function li(items) {
    return (items || []).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');
  }

  /* data: { dateStr, topLabel, topTitle, topDesc, topScore, topPercent,
     consLabel, consValue, consDesc, rows:[{label,score,percent}],
     whys, pros, consList, jurusan:[{name,sub,p}], coba, tanya, review:[{q,answer,label}] } */
  function buildWordDoc(d) {
    d = d || {};
    var rows = (d.rows || []).map(function (r) {
      return '<tr><td>' + esc(r.label) + '</td><td>' + r.score + '/10</td><td>' + r.percent + '%</td></tr>';
    }).join('');
    var jur = (d.jurusan || []).map(function (j, i) {
      return '<h3>' + (i + 1) + '. ' + esc(j.name) + '</h3><p><i>' + esc(j.sub) + '</i></p><p>' + esc(j.p) + '</p>';
    }).join('');
    var rev = (d.review || []).map(function (r, i) {
      return '<tr><td>' + (i + 1) + '</td><td>' + esc(r.q) + '</td><td>' + esc(r.answer) + '</td><td>' + esc(r.label) + '</td></tr>';
    }).join('');

    return '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">'
      + '<head><meta charset="utf-8"><title>' + esc(d.title || 'Hasil Evaluasi Kuis Minat') + '</title></head>'
      + '<body style="font-family:Calibri,Arial,sans-serif;color:#0f172a;">'
      + '<h1>' + esc(d.title || 'Hasil Evaluasi Kuis Minat — Panduan Jurusan') + '</h1>'
      + '<p><i>' + esc(d.dateStr || '') + '</i></p>'
      + '<h2>Hasil Utama: ' + esc(d.topTitle || d.topLabel || '-') + '</h2>'
      + '<p><b>Skor: ' + (d.topScore != null ? d.topScore : '-') + '/10 (' + (d.topPercent != null ? d.topPercent : '-') + '%) • ' + esc(d.consLabel || '') + '</b></p>'
      + '<p>' + esc(d.topDesc || '') + '</p>'
      + '<h2>Skor per Rumpun</h2>'
      + '<table border="1" cellpadding="6" cellspacing="0"><tr><th>Rumpun</th><th>Skor</th><th>Persen</th></tr>' + rows + '</table>'
      + '<p><b>Konsistensi:</b> ' + esc(d.consLabel || '') + ' (' + (d.consValue != null ? d.consValue : '-') + '% dominan). ' + esc(d.consDesc || '') + '</p>'
      + '<h2>Kenapa ' + esc(d.topLabel || '') + ' Cocok?</h2><ol>' + li(d.whys) + '</ol>'
      + '<h2>Kelebihan</h2><ul>' + li(d.pros) + '</ul>'
      + '<h2>Tantangan</h2><ul>' + li(d.consList) + '</ul>'
      + '<h2>Jurusan yang Cocok Dipilih</h2>' + jur
      + '<h2>Langkah 2 Minggu</h2><p>' + esc(d.coba || '') + '</p>'
      + '<p><b>Tanyakan ke anak:</b></p><ul>' + li(d.tanya) + '</ul>'
      + '<h2>Rincian 10 Jawaban</h2>'
      + '<table border="1" cellpadding="6" cellspacing="0"><tr><th>No</th><th>Soal</th><th>Jawaban</th><th>Rumpun</th></tr>' + rev + '</table>'
      + '<p><i>Bukan tes psikologi formal — gunakan sebagai bahan diskusi keluarga.</i></p>'
      + '</body></html>';
  }

  function downloadWord(filename, html) {
    try {
      var blob = new Blob(['\ufeff', html || ''], { type: 'application/msword' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename || 'hasil-evaluasi.doc';
      document.body.appendChild(a);
      a.click();
      window.setTimeout(function () {
        try { document.body.removeChild(a); URL.revokeObjectURL(url); } catch (e) {}
      }, 500);
      return true;
    } catch (e) { return false; }
  }

  window.PanduanJurusanExport = { buildWordDoc: buildWordDoc, downloadWord: downloadWord };
})();
