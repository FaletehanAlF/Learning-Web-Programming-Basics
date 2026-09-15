/* Panduan Jurusan — Asisten Tanya-Jawab mini (rule-based, offline) */
(function () {
  'use strict';

  function prefixIndex() {
    try {
      return location.pathname.indexOf('/views/') > -1 ? '../index.html' : 'index.html';
    } catch (e) { return 'index.html'; }
  }

  function pageLink(page, anchor) {
    var a = anchor || '';
    try {
      var inViews = location.pathname.indexOf('/views/') > -1;
      if (page === 'index') return (inViews ? '../index.html' : '') + a;
      if (page === 'kuis') return inViews ? 'kuis.html' + a : 'views/kuis.html' + a;
      if (page === 'dashboard') return inViews ? 'dashboard.html' + a : 'views/dashboard.html' + a;
      if (page === 'kampus') return inViews ? 'kampus.html' + a : 'views/kampus.html' + a;
      if (page === 'kontak') return inViews ? 'kontak.html' + a : 'views/kontak.html' + a;
      if (page === 'asisten') return inViews ? 'asisten.html' + a : 'views/asisten.html' + a;
    } catch (e) {}
    return a || '#';
  }

  var MINAT_MAP = [
    { k: ['gambar', 'lukis', 'desain', 'foto', 'video', 'kreatif', 'warna', 'musik'], rumpun: 'kreatif', jurusan: 'Desain Komunikasi Visual', saran: 'coba bikin 1 poster / konten 2 minggu, nilai dari karya.' },
    { k: ['coding', 'ngoding', 'komputer', 'game', 'robot', 'matematika', 'logika', 'ngoprek'], rumpun: 'teknologi', jurusan: 'Teknik Informatika', saran: 'coba kelas coding gratis 2 minggu + 1 proyek kecil.' },
    { k: ['sakit', 'dokter', 'biologi', 'tubuh', 'obat', 'suka menolong orang sakit'], rumpun: 'kesehatan', jurusan: 'Kedokteran', saran: 'siap kuliah 5–6 tahun, intip silabus semester 1 dulu.' },
    { k: ['curhat', 'mendengar', 'empati', 'psikolog', 'perilaku', 'memahami orang'], rumpun: 'soshum', jurusan: 'Psikologi', saran: 'coba jadi pendengar di organisasi / ekstrakurikuler.' },
    { k: ['uang', 'hitung', 'dagang', 'jualan', 'bisnis', 'untung', 'akuntan', 'keuangan'], rumpun: 'bisnis', jurusan: 'Akuntansi', saran: 'coba catat keuangan keluarga / jualan kecil 2 minggu.' },
    { k: ['debat', 'argumen', 'hukum', 'aturan', 'adil', 'baca'], rumpun: 'soshum', jurusan: 'Hukum', saran: 'coba ikut debat / baca 1 kasus nyata per minggu.' }
  ];

  var STATIC_QA = [
    { k: ['biaya', 'ukt', 'mahal', 'bayar', 'ongkos'], t: 'Biaya kuliah beda tiap kampus & penghasilan ortu. Hitung estimasi sampai lulus di kalkulator, lalu bandingkan PTN vs PTS.', l: 'Hitung Biaya', p: 'index', a: '#kalkulator-biaya' },
    { k: ['beasiswa', 'kip', 'gratis', 'keringanan'], t: 'Cek KIP Kuliah, beasiswa prestasi, dan UKT berjenjang sejak kelas 11–12. Di kalkulator ada simulasi potongan 50% UKT.', l: 'Hitung Biaya', p: 'index', a: '#kalkulator-biaya' },
    { k: ['bingung', 'ragu', 'belum tahu', 'galau', 'pilih mana'], t: 'Wajar. Mulai dari kuis 10 soal (~3 menit) bareng anak, lalu bahas 2 rumpun tertinggi. Atau ceritakan hobi anak di sini, mis. "anak suka menggambar".', l: 'Mulai Kuis', p: 'kuis', a: '' },
    { k: ['konsultasi', 'konsul', 'saran jurusan', 'rekomendasi jurusan', 'cocok jurusan apa', 'tanya jurusan'], t: 'Bisa! Ceritakan 3 hal: pelajaran favorit, hobi, dan nilai kuat anak. Contoh: "anak suka matematika dan ngoprek komputer". Nanti saya petakan ke 1–2 jurusan + cara uji 2 minggu.', l: 'Buka Live Chat', p: 'asisten', a: '' },
    { k: ['banding', ' vs ', 'bedanya apa', 'bagus mana', 'pilih antara', 'mending mana'], t: 'Ketik 2 nama jurusan sekaligus, mis. "informatika vs psikologi" — nanti saya bandingkan isi belajar, cocok untuk siapa, durasi & estimasi biaya.', l: 'Buka Live Chat', p: 'asisten', a: '' },
    { k: ['kampus', 'ptn', 'pts', 'ptln', 'negeri', 'swasta', 'universitas', 'rekomendasi kampus'], t: 'Ada 36 kampus (12 PTN + 12 PTS + 12 PTLN) di halaman Kampus — klik untuk detail biaya, jalur masuk, beasiswa, dan prospek.', l: 'Lihat Kampus', p: 'kampus', a: '' },
    { k: ['prospek', 'minat', 'hobi', 'bakat', 'cocok'], t: 'Ceritakan hobi / pelajaran favorit anak, mis. "suka menggambar", "suka matematika", "suka curhat". Saya petakan ke jurusan yang nyambung.', l: 'Buka Live Chat', p: 'asisten', a: '' },
    { k: ['snbp', 'rapor', 'undangan'], t: 'SNBP pakai nilai rapor (sekitar Feb–Mar). Fokus jaga nilai + pilih jurusan realistis. Lihat jadwal di Tips.', l: 'Lihat Jadwal', p: 'index', a: '#tips' },
    { k: ['snbt', 'utbk', 'tes tulis'], t: 'SNBT lewat tes UTBK (sekitar Apr–Jun). Latihan soal rutin + siapkan 1–2 pilihan cadangan.', l: 'Lihat Jadwal', p: 'index', a: '#tips' },
    { k: ['mandiri', 'seleksi kampus'], t: 'Jalur Mandiri diadakan tiap kampus (sekitar Jun–Jul) dengan syarat & biaya berbeda. Cek web kampus tujuan.', l: null },
    { k: ['salah pilih', 'menyesal', 'pindah jurusan'], t: 'Masih bisa dievaluasi: ajak ngobrol kakak tingkat + lihat silabus semester 1, sepakati evaluasi setelah 1 semester.', l: null },
    { k: ['beda pilihan', 'tidak setuju', 'melarang', 'memaksa', 'bertengkar'], t: 'Dengarkan alasan anak sampai selesai, sampaikan khawatir dengan kalimat "Ayah/Ibu khawatir soal…", cari jalan tengah.', l: null },
    { k: ['stres', 'tertekan', 'cemas', 'takut', 'nangis'], t: 'Kurangi pertanyaan menekan, bagi keputusan jadi langkah kecil mingguan. Kalau menarik diri terus, ajak bicara guru BK.', l: null },
    { k: ['nilai', 'pas-pasan', 'lolos', 'passing'], t: 'Siapkan rencana A–B–C (SNBP → SNBT → Mandiri) dan 3–4 kampus dengan passing grade berbeda.', l: null },
    { k: ['ikut teman', 'tren', 'semua ke it', 'fomo'], t: 'Uji minatnya: tanya "bagian mana yang paling kamu suka?" lalu coba kelas/proyek gratis 2 minggu.', l: 'Mulai Kuis', p: 'kuis', a: '' },
    { k: ['kerja', 'lowongan', 'nganggur', 'gaji'], t: 'Yang dicari kerja adalah skill terbukti. Minta anak cari 5 lowongan nyata + 1 skill tambahan sejak kuliah.', l: 'Daftar Jurusan', p: 'index', a: '#jurusan' },
    { k: ['hasil', 'riwayat', 'dashboard', 'statistik'], t: 'Semua hasil kuis tersimpan otomatis dan bisa dipantau trennya di dashboard.', l: 'Buka Dashboard', p: 'dashboard', a: '' },
    { k: ['halo', 'cara pakai', 'bantuan', 'help', 'mulai'], t: 'Saya bisa bantu: 1) jelaskan tiap jurusan, 2) bandingkan 2 jurusan ("informatika vs hukum"), 3) tebak arah dari hobi ("suka menggambar"), 4) info biaya & jalur masuk.', l: 'Buka Live Chat', p: 'asisten', a: '' }
  ];

  function norm(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function tokens(s) {
    return norm(s).split(' ').filter(function (w) { return w.length > 2; });
  }

  function faqKB() {
    var out = [];
    try {
      var items = document.querySelectorAll('.faq-item');
      for (var i = 0; i < items.length; i++) {
        var q = items[i].querySelector('summary');
        var a = items[i].querySelector('.faq-answer');
        if (!q || !a) continue;
        var at = (a.innerText || a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 420);
        out.push({ q: q.textContent.replace(/\s+/g, ' ').trim(), a: at });
      }
    } catch (e) {}
    return out;
  }

  function findJurusan(t) {
    var data = window.JURUSAN_DATA || [];
    var found = [];
    var alias = { informatika: 'Teknik Informatika', ti: null, coding: 'Teknik Informatika', program: 'Teknik Informatika', dokter: 'Kedokteran', kedokteran: 'Kedokteran', obat: 'Kedokteran', psikolog: 'Psikologi', psikologi: 'Psikologi', akuntan: 'Akuntansi', akuntansi: 'Akuntansi', keuangan: 'Akuntansi', dkv: 'Desain Komunikasi Visual', desain: 'Desain Komunikasi Visual', gambar: 'Desain Komunikasi Visual', visual: 'Desain Komunikasi Visual', hukum: 'Hukum', pengacara: 'Hukum', teknologi: null, kesehatan: null, soshum: null, bisnis: null, kreatif: null };
    var spaced = ' ' + t + ' ';
    data.forEach(function (j) {
      if (spaced.indexOf(j.name.toLowerCase()) > -1 && found.indexOf(j) === -1) found.push(j);
    });
    Object.keys(alias).forEach(function (key) {
      if (key.length <= 2) return;
      if (spaced.indexOf(key) > -1 && alias[key]) {
        for (var i = 0; i < data.length; i++) {
          if (data[i].name === alias[key] && found.indexOf(data[i]) === -1) found.push(data[i]);
        }
      }
    });
    return found;
  }

  function jurusanAnswer(text) {
    var data = window.JURUSAN_DATA || [];
    var t = ' ' + norm(text) + ' ';
    var hit = findJurusan(norm(text));
    // Bandingkan 2+ jurusan: "informatika vs psikologi"
    if (hit.length >= 2) {
      var a = hit[0], b = hit[1];
      return {
        text: 'Perbandingan singkat — ' + a.name + ' vs ' + b.name + ': ' +
          a.name + ' (' + a.desc + ' Cocok: ' + a.cocok + ' ' + a.durasi + ', ' + a.biaya + ') | ' +
          b.name + ' (' + b.desc + ' Cocok: ' + b.cocok + ' ' + b.durasi + ', ' + b.biaya + '). ' +
          'Tanya anak: kegiatan mana yang tahan dilakukan 2 jam tanpa disuruh? Itu sinyal minat aslinya.',
        link: { t: 'Bandingkan di Daftar Jurusan', h: pageLink('index', '#jurusan') },
        compare: [a.name, b.name]
      };
    }
    if (hit.length === 1) return fmtJur(hit[0]);
    var catHit = null;
    ['teknologi', 'kesehatan', 'soshum', 'bisnis', 'kreatif'].forEach(function (c) {
      if (t.indexOf(c) > -1) catHit = c;
    });
    if (catHit) {
      var names = [];
      for (var k = 0; k < data.length; k++) { if (data[k].cat === catHit) names.push(data[k].name); }
      if (names.length) return { text: 'Rumpun ' + catHit + ' berisi: ' + names.join(', ') + '. Ketik salah satu namanya untuk detail, mis. "' + names[0] + ' itu belajar apa?".', link: { t: 'Daftar Jurusan', h: pageLink('index', '#jurusan') } };
    }
    return null;
  }

  function minatAnswer(t) {
    var hits = [];
    MINAT_MAP.forEach(function (m) {
      for (var i = 0; i < m.k.length; i++) {
        if ((' ' + t + ' ').indexOf(m.k[i]) > -1) { hits.push(m); break; }
      }
    });
    if (!hits.length) return null;
    var m0 = hits[0];
    var data = window.JURUSAN_DATA || [];
    var j = null;
    for (var i = 0; i < data.length; i++) { if (data[i].name === m0.jurusan) j = data[i]; }
    var extra = hits.length > 1 ? ' Selain itu terlihat juga sinyal ke ' + hits[1].jurusan + '.' : '';
    return {
      text: 'Dari cerita itu, arah kuat ke ' + m0.jurusan + ' (rumpun ' + m0.rumpun + ').' + extra +
        (j ? ' ' + j.desc + ' Cocok untuk anak yang: ' + j.cocok : '') +
        ' Uji coba: ' + m0.saran + ' Lalu isi kuis 10 soal biar skornya kelihatan.',
      link: { t: 'Mulai Kuis 10 Soal', h: pageLink('kuis', '') }
    };
  }

  function fmtJur(j) {
    return {
      text: j.name + ' — ' + j.desc + ' Cocok untuk anak yang: ' + j.cocok + ' Durasi: ' + j.durasi + '. Estimasi: ' + j.biaya + '. Tips: uji 2 minggu sesuai aktivitasnya, lalu bandingkan dengan 1 jurusan lain.',
      link: { t: 'Daftar Jurusan', h: pageLink('index', '#jurusan') }
    };
  }

  function ask(text) {
    var t = norm(text);
    if (!t) return { text: 'Tulis pertanyaan dulu, mis. "informatika itu belajar apa?" atau "anak suka menggambar cocoknya apa?".' };
    if (/^(halo|halo min|hai|pagi|siang|sore|malam|assalamualaikum|tes|p)\b/.test(t)) {
      return { text: 'Halo! Saya bantu konsultasi jurusan. Bisa tanya: 1) "informatika vs psikologi", 2) "anak suka menggambar cocok apa?", 3) "biaya kuliah?", 4) "SNBP vs SNBT?". Silakan cerita.', link: { t: 'Buka Live Chat penuh', h: pageLink('asisten', '') } };
    }
    if (t.indexOf('makasih') > -1 || t.indexOf('terima kasih') > -1 || t.indexOf('thanks') > -1 || t.indexOf('oke') === 0) {
      return { text: 'Sama-sama! Kalau sudah ada 2 jurusan kandidat, ketik "X vs Y" biar saya bandingkan. Semoga obrolan dengan anak makin nyambung.' };
    }
    var j = jurusanAnswer(t);
    if (j) return j;
    var mn = minatAnswer(t);
    if (mn) return mn;

    var best = null;
    var bestScore = 0;
    STATIC_QA.forEach(function (item) {
      var s = 0;
      item.k.forEach(function (kw) { if (t.indexOf(kw) > -1) s += kw.length > 5 ? 2 : 1; });
      if (s > bestScore) { bestScore = s; best = item; }
    });
    var faqs = faqKB();
    var toks = tokens(t);
    var bestFaq = null;
    var bestFaqScore = 0;
    faqs.forEach(function (f) {
      var hay = norm(f.q + ' ' + f.a);
      var s = 0;
      toks.forEach(function (w) { if (hay.indexOf(w) > -1) s++; });
      if (s > bestFaqScore) { bestFaqScore = s; bestFaq = f; }
    });

    if (best && bestScore >= 2 && bestScore >= bestFaqScore) {
      return { text: best.t, link: best.l ? { t: best.l, h: pageLink(best.p, best.a) } : null };
    }
    if (bestFaq && bestFaqScore >= 2) return { text: bestFaq.a };
    if (best && bestScore >= 1) {
      return { text: best.t, link: best.l ? { t: best.l, h: pageLink(best.p, best.a) } : null };
    }
    return {
      text: 'Saya belum yakin maksudnya. Coba: "informatika itu belajar apa?", "anak suka menggambar cocok apa?", "informatika vs psikologi", atau "biaya kuliah?".',
      link: { t: 'Buka Live Chat penuh', h: pageLink('asisten', '') },
      lowConfidence: true
    };
  }

  /* ---------- UI (disuntik otomatis) ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function mount() {
    try {
      if (document.getElementById('asstFab')) return;
      var fab = document.createElement('button');
      fab.id = 'asstFab';
      fab.className = 'asst-fab';
      fab.type = 'button';
      fab.setAttribute('aria-label', 'Buka asisten tanya-jawab');
      fab.setAttribute('aria-expanded', 'false');
      fab.innerHTML = '<i data-feather="message-circle" aria-hidden="true"></i>';
      var panel = document.createElement('div');
      panel.id = 'asstPanel';
      panel.className = 'asst-panel';
      panel.hidden = true;
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-label', 'Asisten Panduan Jurusan');
      panel.innerHTML =
        '<div class="asst-head"><strong>Tanya Asisten</strong><span>Offline • jawaban instan</span>'
        + '<button type="button" class="asst-close" id="asstClose" aria-label="Tutup asisten"><i data-feather="x" aria-hidden="true"></i></button></div>'
        + '<div class="asst-msgs" id="asstMsgs" aria-live="polite"></div>'
        + '<div class="asst-chips" id="asstChips"></div>'
        + '<div class="asst-input"><input id="asstText" type="text" placeholder="Tulis pertanyaan…" aria-label="Tulis pertanyaan" autocomplete="off" maxlength="200">'
        + '<button type="button" id="asstSend" aria-label="Kirim pertanyaan"><i data-feather="send" aria-hidden="true"></i></button></div>'
        + '<div class="asst-foot"><a id="asstFull" href="' + esc(pageLink('asisten', '')) + '">Buka Live Chat penuh →</a></div>';
      document.body.appendChild(fab);
      document.body.appendChild(panel);

      var msgs = document.getElementById('asstMsgs');
      var chips = document.getElementById('asstChips');
      var input = document.getElementById('asstText');

      function bubble(who, text, link) {
        var d = document.createElement('div');
        d.className = 'asst-msg asst-' + who;
        d.innerHTML = '<p>' + esc(text) + '</p>'
          + (link ? '<a href="' + esc(link.h) + '">' + esc(link.t) + ' →</a>' : '');
        msgs.appendChild(d);
        try { msgs.scrollTop = msgs.scrollHeight; } catch (e) {}
      }

      function send(q) {
        var text = (q != null ? q : (input ? input.value : '')).trim();
        if (!text) return;
        bubble('user', text);
        if (input) input.value = '';
        var r;
        try { r = ask(text); } catch (e) { r = { text: 'Maaf, ada gangguan. Coba lagi.' }; }
        window.setTimeout(function () { bubble('bot', r.text, r.link); }, 250);
      }

      ['Informatika itu apa?', 'Anak suka gambar', 'Informatika vs Psikologi', 'Biaya kuliah?'].forEach(function (c) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'asst-chip';
        b.textContent = c;
        b.addEventListener('click', function () { send(c); });
        chips.appendChild(b);
      });

      function toggle(open) {
        var willOpen = open != null ? open : panel.hidden;
        panel.hidden = !willOpen;
        fab.setAttribute('aria-expanded', String(willOpen));
        if (willOpen && !msgs.children.length) {
          bubble('bot', 'Halo! Tanya apa saja soal jurusan, biaya, atau jalur masuk.');
        }
        if (willOpen && input) { try { input.focus(); } catch (e) {} }
      }

      fab.addEventListener('click', function () { toggle(); });
      document.getElementById('asstClose').addEventListener('click', function () { toggle(false); });
      document.getElementById('asstSend').addEventListener('click', function () { send(); });
      if (input) input.addEventListener('keydown', function (e) { if (e.key === 'Enter') send(); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !panel.hidden) toggle(false);
      });

      try { if (window.feather) window.feather.replace(); } catch (e) {}
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else { mount(); }

  window.PanduanJurusanAssistant = { ask: ask, pageLink: pageLink, minatMap: MINAT_MAP };
})();
