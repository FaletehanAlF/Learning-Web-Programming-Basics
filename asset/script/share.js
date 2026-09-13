/* Panduan Jurusan — bagikan hasil: gambar PNG + tautan hash */
(function () {
  'use strict';

  var ORDER = ['teknologi', 'kesehatan', 'soshum', 'bisnis', 'kreatif'];

  function b64urlEncode(str) {
    try {
      var b64 = btoa(unescape(encodeURIComponent(str)));
      return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch (e) { return ''; }
  }

  function b64urlDecode(code) {
    try {
      var b64 = String(code).replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      return decodeURIComponent(escape(atob(b64)));
    } catch (e) { return ''; }
  }

  /* obj: {t:top, s:{...scores}, c:consistencyLabel} */
  function encodeResult(obj) {
    try { return b64urlEncode(JSON.stringify(obj)); } catch (e) { return ''; }
  }

  function decodeResult(code) {
    try {
      var d = JSON.parse(b64urlDecode(code));
      if (!d || typeof d !== 'object' || !d.t || !d.s) return null;
      if (ORDER.indexOf(d.t) === -1) return null;
      return d;
    } catch (e) { return null; }
  }

  function buildResultLink(obj) {
    var code = encodeResult(obj);
    if (!code) return '';
    try {
      var u = new URL('dashboard.html', location.href);
      u.hash = 'h=' + code;
      return u.toString();
    } catch (e) { return ''; }
  }

  function decodeHash() {
    try {
      var h = location.hash || '';
      var m = h.match(/#h=([A-Za-z0-9\-_]+)/);
      return m ? decodeResult(m[1]) : null;
    } catch (e) { return null; }
  }

  function copyTextNow(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return fallback(); });
    }
    return Promise.resolve(fallback());
    function fallback() {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        return !!ok;
      } catch (e) { return false; }
    }
  }

  /* ---------- kartu gambar hasil (1080x1350, cocok Status WA) ---------- */
  function roundRect(ctx, x, y, w, h, r) {
    try {
      if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); return; }
    } catch (e) {}
    ctx.beginPath();
    ctx.rect(x, y, w, h);
  }

  /* data: {topLabel, topColor, score, percent, rows:[{label,percent,color}], majors:[3 nama]} */
  function drawResultCard(data) {
    var W = 1080, H = 1350;
    var cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    var ctx = cv.getContext('2d');
    if (!ctx) return null;
    var F = '"Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", sans-serif';

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
    // header
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, 240);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 40px ' + F;
    ctx.fillText('Panduan Jurusan', 72, 100);
    ctx.font = '400 32px ' + F;
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('Hasil Kuis Minat 10 Soal', 72, 155);
    ctx.fillStyle = '#0f766e';
    roundRect(ctx, 72, 185, 220, 10, 5);
    ctx.fill();

    // hasil utama
    var y = 360;
    ctx.fillStyle = '#0f766e';
    ctx.font = '700 30px ' + F;
    ctx.fillText('RUMPUN DOMINAN', 72, y);
    ctx.fillStyle = data.topColor || '#0f172a';
    roundRect(ctx, 72, y + 24, 26, 78, 8);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.font = '800 64px ' + F;
    ctx.fillText(String(data.topLabel || '-'), 120, y + 88);
    ctx.font = '800 120px ' + F;
    ctx.fillText(String(data.score) + '/10', 72, y + 230);
    ctx.font = '700 44px ' + F;
    ctx.fillStyle = '#475569';
    ctx.fillText(String(data.percent) + '% jawaban', 400, y + 215);

    // batang skor
    y = y + 310;
    ctx.fillStyle = '#0f766e';
    ctx.font = '700 30px ' + F;
    ctx.fillText('SKOR PER RUMPUN', 72, y);
    y += 30;
    (data.rows || []).forEach(function (r) {
      y += 62;
      ctx.fillStyle = '#0f172a';
      ctx.font = '700 30px ' + F;
      ctx.fillText(String(r.label), 72, y + 8);
      ctx.fillStyle = '#f1f5f9';
      roundRect(ctx, 330, y - 22, 560, 34, 17);
      ctx.fill();
      ctx.fillStyle = r.color || '#0f766e';
      var w = Math.max(34, Math.round((560 * (r.percent || 0)) / 100));
      roundRect(ctx, 330, y - 22, w, 34, 17);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.font = '700 30px ' + F;
      ctx.fillText(String(r.percent) + '%', 910, y + 8);
    });

    // jurusan cocok
    y += 90;
    ctx.fillStyle = '#0f766e';
    ctx.font = '700 30px ' + F;
    ctx.fillText('JURUSAN YANG COCOK', 72, y);
    y += 20;
    (data.majors || []).slice(0, 3).forEach(function (m, i) {
      y += 84;
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      roundRect(ctx, 72, y - 52, 936, 72, 16);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#0f766e';
      ctx.beginPath();
      ctx.arc(120, y - 16, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.font = '700 32px ' + F;
      ctx.fillText((i + 1) + '.  ' + String(m), 150, y - 5);
    });

    ctx.fillStyle = '#64748b';
    ctx.font = '400 26px ' + F;
    ctx.fillText('Bukan tes psikologi formal — bahan diskusi keluarga.', 72, H - 60);
    return cv;
  }

  function canvasToBlob(cv) {
    return new Promise(function (resolve) {
      try {
        if (cv.toBlob) { cv.toBlob(function (b) { resolve(b); }, 'image/png'); }
        else { resolve(null); }
      } catch (e) { resolve(null); }
    });
  }

  function shareImage(data) {
    var cv;
    try { cv = drawResultCard(data); } catch (e) { return Promise.resolve('error'); }
    if (!cv) return Promise.resolve('unsupported');
    return canvasToBlob(cv).then(function (blob) {
      if (!blob) return 'error';
      try {
        var file = new File([blob], 'hasil-kuis-minat.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          return navigator.share({ files: [file], title: 'Hasil Kuis Minat' }).then(
            function () { return 'shared'; },
            function () { return 'cancelled'; }
          );
        }
      } catch (e) {}
      try {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'hasil-kuis-minat.png';
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
          try { document.body.removeChild(a); URL.revokeObjectURL(url); } catch (err) {}
        }, 500);
        return 'downloaded';
      } catch (e) { return 'error'; }
    });
  }

  window.PanduanJurusanShare = {
    encodeResult: encodeResult,
    decodeResult: decodeResult,
    buildResultLink: buildResultLink,
    decodeHash: decodeHash,
    copyText: copyTextNow,
    drawResultCard: drawResultCard,
    shareImage: shareImage
  };
})();
