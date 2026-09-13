(function () {
  'use strict';

  var bodyEl = document.getElementById('quizFullBody');
  var prevBtn = document.getElementById('quizFullPrev');
  var nextBtn = document.getElementById('quizFullNext');
  var nextLabel = document.getElementById('quizFullNextLabel');
  var stepEl = document.getElementById('quizFullStep');
  var barEl = document.getElementById('quizFullBar');
  var percentEl = document.getElementById('quizFullPercent');
  var resultEl = document.getElementById('quizFullResult');
  var headEl = document.getElementById('quizFullHead');
  var navEl = document.getElementById('quizFullNav');
  var wrapEl = document.getElementById('quizFullWrap');
  var dotsEl = document.getElementById('quizDots');
  var timeEl = document.getElementById('quizFullTime');
  var footnoteEl = document.getElementById('quizFootnote');

  if (!bodyEl || !prevBtn || !nextBtn) return;

  var prefersReduced = false;
  try { prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function feather() {
    try { if (window.feather) window.feather.replace(); } catch (e) {}
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function scrollToEl(el) {
    if (!el) return;
    try {
      el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    } catch (e) {
      el.scrollIntoView();
    }
  }

  var isAdvancing = false;
  var resultShown = false;

  var quizData = [
    {
      title: 'Kalau ada waktu luang tanpa tugas, anak paling betah ngapain?',
      hint: 'Pilih yang paling sering dilakukan, bukan yang paling keren menurut orang lain.',
      options: [
        { key: 'teknologi', label: 'Ngoprek HP/laptop, bikin sesuatu yang jalan', sub: 'Senang coba-coba sampai berhasil' },
        { key: 'kesehatan', label: 'Merawat orang, hewan, atau tanaman', sub: 'Puas kalau bisa membantu' },
        { key: 'soshum', label: 'Ngobrol, baca, nulis, atau diskusi', sub: 'Betah dengar cerita orang lain' },
        { key: 'bisnis', label: 'Jualan kecil atau atur uang jajan', sub: 'Teliti hitung untung-rugi' },
        { key: 'kreatif', label: 'Gambar, edit foto/video, desain', sub: 'Suka bikin yang enak dilihat' },
      ]
    },
    {
      title: 'Pelajaran yang paling enak tanpa harus dipaksa?',
      hint: 'Yang nilainya stabil walau tanpa les tambahan.',
      options: [
        { key: 'teknologi', label: 'Matematika / Fisika / Informatika', sub: 'Suka logika & angka' },
        { key: 'kesehatan', label: 'Biologi / Kimia', sub: 'Penasaran tubuh & alam' },
        { key: 'soshum', label: 'Bahasa / Sosiologi / Sejarah', sub: 'Suka memahami manusia' },
        { key: 'bisnis', label: 'Ekonomi / Akuntansi / Kewirausahaan', sub: 'Tertarik uang & usaha' },
        { key: 'kreatif', label: 'Seni Budaya / Prakarya / Desain', sub: 'Nilai bagus saat bikin karya' },
      ]
    },
    {
      title: 'Cara belajar yang paling cocok untuk anak?',
      hint: 'Bayangkan mengerjakan tugas kelompok 3 orang.',
      options: [
        { key: 'teknologi', label: 'Langsung coba, pecahkan masalah', sub: 'Trial & error' },
        { key: 'kesehatan', label: 'Hafalan rapi + praktik teliti', sub: 'Harus urut & tepat' },
        { key: 'soshum', label: 'Diskusi & dengarkan pendapat', sub: 'Belajar dari cerita' },
        { key: 'bisnis', label: 'Rapi, terstruktur, pakai checklist', sub: 'Suka tabel & rencana' },
        { key: 'kreatif', label: 'Bebas, coba gaya baru', sub: 'Tidak suka dikekang' },
      ]
    },
    {
      title: 'Lingkungan kerja yang bikin mata berbinar kalau dibayangkan?',
      hint: 'Tidak harus realistis dulu — pilih yang paling bikin semangat.',
      options: [
        { key: 'teknologi', label: 'Di depan komputer, bikin aplikasi/sistem', sub: 'Fokus & tenang' },
        { key: 'kesehatan', label: 'Rumah sakit / lab / lapangan, bantu orang sehat', sub: 'Seragam & tanggung jawab' },
        { key: 'soshum', label: 'Sekolah / kantor / lembaga sosial', sub: 'Ketemu banyak orang' },
        { key: 'bisnis', label: 'Kantor / perusahaan, kelola keuangan & strategi', sub: 'Rapat & angka' },
        { key: 'kreatif', label: 'Studio / agensi / kafe, karya visual', sub: 'Bebas & ekspresif' },
      ]
    },
    {
      title: 'Saat ada masalah sulit, reaksi pertama anak?',
      hint: 'Ingat kejadian terakhir — bukan yang ideal.',
      options: [
        { key: 'teknologi', label: 'Bongkar, debug, cari sumber error', sub: 'Cari penyebab logis' },
        { key: 'kesehatan', label: 'Cek detail, pastikan aman dulu', sub: 'Hati-hati & teliti' },
        { key: 'soshum', label: 'Ajak ngobrol, tanya pendapat orang', sub: 'Cari perspektif' },
        { key: 'bisnis', label: 'Hitung risiko & biaya, bikin rencana', sub: 'Praktis & terukur' },
        { key: 'kreatif', label: 'Cari cara baru yang belum dicoba', sub: 'Coba sudut beda' },
      ]
    },
    {
      title: 'Paling nyaman kerja gimana?',
      hint: 'Ini soal energi, bukan kemampuan.',
      options: [
        { key: 'teknologi', label: 'Sendiri fokus, minim gangguan', sub: 'Deep work' },
        { key: 'kesehatan', label: 'Tim kecil saling bantu (2–4 orang)', sub: 'Saling jaga' },
        { key: 'soshum', label: 'Diskusi kelompok besar, banyak ide', sub: 'Ramai & kolaboratif' },
        { key: 'bisnis', label: 'Rapi dengan pembagian tugas jelas', sub: 'Terstruktur' },
        { key: 'kreatif', label: 'Bebas pindah tempat & jam fleksibel', sub: 'Flow' },
      ]
    },
    {
      title: 'Hal yang paling bikin bangga kalau berhasil?',
      hint: 'Yang bikin cerita ke keluarga dengan semangat.',
      options: [
        { key: 'teknologi', label: 'Berhasil bikin sesuatu yang jalan', sub: 'Aplikasi / alat jadi' },
        { key: 'kesehatan', label: 'Dipuji karena membantu orang', sub: 'Orang jadi terbantu' },
        { key: 'soshum', label: 'Didengarkan & dipercaya teman', sub: 'Jadi tempat cerita' },
        { key: 'bisnis', label: 'Dapat untung / kelola uang dengan rapi', sub: 'Angka jelas' },
        { key: 'kreatif', label: 'Karya dipuji & dipajang orang', sub: 'Visual diapresiasi' },
      ]
    },
    {
      title: 'Kalau sore disuruh pilih kegiatan, lebih milih?',
      hint: 'Yang dipilih tanpa disuruh orang tua.',
      options: [
        { key: 'teknologi', label: 'Ekskul coding / robotik / TIK', sub: 'Ngulik teknologi' },
        { key: 'kesehatan', label: 'PMR / pramuka bakti / volunteering', sub: 'Aksi sosial' },
        { key: 'soshum', label: 'Debat / OSIS / jurnalistik', sub: 'Ngomong & nulis' },
        { key: 'bisnis', label: 'Koperasi / market day / entrepreneur club', sub: 'Jualan & hitung' },
        { key: 'kreatif', label: 'Seni / desain / fotografi / musik', sub: 'Bikin karya' },
      ]
    },
    {
      title: 'Tipe tugas sekolah yang paling ditunggu?',
      hint: 'Yang deadline-nya justru dikerjakan duluan.',
      options: [
        { key: 'teknologi', label: 'Proyek bikin program / alat', sub: 'Bikin sistem' },
        { key: 'kesehatan', label: 'Praktikum lab / observasi', sub: 'Amati & catat' },
        { key: 'soshum', label: 'Presentasi / esai / wawancara', sub: 'Cerita & argumen' },
        { key: 'bisnis', label: 'Laporan keuangan / business plan', sub: 'Rapi & hitung' },
        { key: 'kreatif', label: 'Bikin poster / video / karya', sub: 'Visual & cerita' },
      ]
    },
    {
      title: '5 tahun lagi ingin dikenal sebagai?',
      hint: 'Jawaban jujur, bukan yang diharapkan orang tua.',
      options: [
        { key: 'teknologi', label: 'Orang yang jago bikin solusi digital', sub: 'Problem solver' },
        { key: 'kesehatan', label: 'Tenaga kesehatan yang dipercaya', sub: 'Membantu banyak orang' },
        { key: 'soshum', label: 'Orang yang paham & bantu orang lain', sub: 'Pendengar & penengah' },
        { key: 'bisnis', label: 'Pengelola bisnis/keuangan yang rapi', sub: 'Dipercaya urus uang' },
        { key: 'kreatif', label: 'Kreator karya yang dikenal', sub: 'Portofolio kuat' },
      ]
    },
  ];

  var meta = {
    teknologi: {
      label: 'Teknologi',
      title: 'Rumpun Teknologi — Logis & Problem Solver',
      icon: 'cpu',
      desc: 'Kuat di logika, suka ngoprek, dan tahan mencoba sampai jalan. Cocok untuk jurusan yang banyak praktik di depan komputer dan butuh ketelitian.',
      whys: [
        'Jawaban paling banyak mengarah ke aktivitas coba-coba, angka, dan menyelesaikan masalah langkah demi langkah.',
        'Anak terlihat betah fokus sendiri dan puas saat sesuatu yang dibuat akhirnya berfungsi.',
        'Motivasi lebih ke “bikin yang jalan” daripada “tampil di depan orang”.',
      ],
      pros: ['Peluang kerja luas (IT ada di semua industri)', 'Skill bisa dilatih lewat proyek kecil di rumah'],
      cons: ['Butuh jam terbang & portofolio, bukan hanya nilai', 'Harus nyaman duduk lama & update teknologi terus'],
      jurusan: [
        { name: 'Teknik Informatika', sub: 'Bikin aplikasi, website, AI', p: 'Cocok jika suka logika & debug. Banyak tugas proyek.' },
        { name: 'Sistem Informasi', sub: 'Teknologi + bisnis', p: 'Pas jika suka atur sistem agar rapi & kepakai orang.' },
        { name: 'DKV / UI-UX (irisan kreatif)', sub: 'Desain aplikasi', p: 'Opsi jika suka teknologi tapi juga visual.' },
      ],
      coba: 'Ikut kelas gratis 2 minggu (logika pemrograman atau bikin landing page 1 halaman), lalu tanya: masih betah ngulik 3 jam tanpa disuruh?',
      tanya: ['Bagian ngoprek mana yang paling bikin betah?', 'Kalau error 2 hari, masih mau lanjut atau ganti haluan?'],
      filter: 'teknologi',
      color: '#0f172a'
    },
    kesehatan: {
      label: 'Kesehatan',
      title: 'Rumpun Kesehatan — Teliti & Peduli',
      icon: 'activity',
      desc: 'Peduli orang lain, teliti, dan tahan belajar lama dengan urutan yang harus tepat. Jurusan kesehatan butuh komitmen & empati tinggi.',
      whys: [
        'Pilihan banyak ke merawat, membantu, dan memastikan aman — bukan sekadar cepat selesai.',
        'Nilai dan kegiatan mengarah ke Biologi/Kimia dan praktik teliti.',
        'Kebanggaan muncul saat dipuji karena membantu, bukan karena karya visual.',
      ],
      pros: ['Dampak sosial jelas & dibutuhkan', 'Jalur karier terstruktur'],
      cons: ['Masa kuliah panjang & padat praktik', 'Butuh ketahanan mental & fisik'],
      jurusan: [
        { name: 'Kedokteran', sub: 'Tubuh & penyakit', p: 'Butuh ketekunan 5–6 tahun + koas. Diskusikan biaya dengan kalkulator.' },
        { name: 'Keperawatan / Farmasi', sub: 'Perawatan & obat', p: 'Opsi jika suka bantu langsung tapi durasi lebih pendek.' },
        { name: 'Psikologi (kesehatan mental)', sub: 'Pikiran & perilaku', p: 'Jika suka bantu lewat mendengarkan.' },
      ],
      coba: 'Ikut volunteer 1 hari atau tonton 3 video bedah jurusan + silabus semester 1, lalu tanya: sanggup baca tebal tiap minggu?',
      tanya: ['Kenapa ingin bantu orang lewat kesehatan?', 'Siap dengan jadwal padat & praktik?'],
      filter: 'kesehatan',
      color: '#0f766e'
    },
    soshum: {
      label: 'Sosial Humaniora',
      title: 'Rumpun Sosial Humaniora — Empati & Komunikasi',
      icon: 'users',
      desc: 'Senang memahami orang, membaca, menulis, dan berdiskusi. Kuat di komunikasi, mendengarkan, dan analisis sosial.',
      whys: [
        'Jawaban dominan ke ngobrol, diskusi, dan memahami orang lain.',
        'Tugas yang ditunggu adalah presentasi/esai, bukan hitungan.',
        'Energi naik saat kerja bareng orang banyak, bukan sendiri di depan layar.',
      ],
      pros: ['Fleksibel lintas bidang (pendidikan, HR, sosial)', 'Kuat di soft skill yang dicari kerja'],
      cons: ['Harus aktif bangun portofolio & pengalaman organisasi', 'Nama jurusan tidak langsung = pekerjaan spesifik'],
      jurusan: [
        { name: 'Psikologi', sub: 'Pikiran & perilaku', p: 'Cocok jika betah mendengarkan tanpa menghakimi.' },
        { name: 'Hukum', sub: 'Aturan & keadilan', p: 'Pas jika suka baca, debat runtut, dan argumen.' },
        { name: 'Ilmu Komunikasi', sub: 'Pesan & media', p: 'Jika suka menulis & tampil.' },
      ],
      coba: 'Coba jadi pewawancara: wawancara 2 kakak tingkat soshum 15 menit, lalu bandingkan ceritanya.',
      tanya: ['Topik sosial apa yang bikin penasaran?', 'Lebih suka dengar atau bicara?'],
      filter: 'soshum',
      color: '#334155'
    },
    bisnis: {
      label: 'Bisnis',
      title: 'Rumpun Bisnis — Rapi & Terstruktur',
      icon: 'briefcase',
      desc: 'Teliti, rapi, dan senang hitungan. Cocok untuk jurusan yang mengelola uang, data, dan strategi.',
      whys: [
        'Pilihan mengarah ke mengatur, menghitung, dan merencanakan dengan checklist.',
        'Bangga saat angka klop dan untung jelas.',
        'Nyaman dengan pembagian tugas yang terstruktur.',
      ],
      pros: ['Dibutuhkan hampir semua perusahaan', 'Skill terukur (laporan, analisis)'],
      cons: ['Harus tahan repetisi & detail kecil', 'Persaingan ketat — perlu pembeda (magang/sertifikasi)'],
      jurusan: [
        { name: 'Akuntansi', sub: 'Kelola keuangan', p: 'Cocok jika teliti & suka angka rapi. Butuh konsistensi.' },
        { name: 'Manajemen', sub: 'Kelola tim & strategi', p: 'Pas jika suka atur orang & rencana.' },
        { name: 'Ekonomi / Bisnis Digital', sub: 'Analisis pasar', p: 'Jika suka tren & hitung peluang.' },
      ],
      coba: 'Coba kelola uang kas kelas 2 minggu atau bikin business plan 1 halaman untuk ide jualan.',
      tanya: ['Bagian hitung mana yang tidak membosankan?', 'Mau bisnis sendiri atau kelola perusahaan?'],
      filter: 'bisnis',
      color: '#475569'
    },
    kreatif: {
      label: 'Kreatif',
      title: 'Rumpun Kreatif — Imajinatif & Visual',
      icon: 'pen-tool',
      desc: 'Peka visual, suka bereksperimen, dan butuh ruang bebas. Hasil dinilai dari karya, bukan hanya ujian.',
      whys: [
        'Jawaban banyak ke gambar, desain, dan cara baru yang belum dicoba.',
        'Tugas yang ditunggu adalah bikin karya, bukan laporan angka.',
        'Ingin dikenal lewat portofolio yang bisa dilihat orang.',
      ],
      pros: ['Karya bisa langsung jadi portofolio', 'Industri kreatif luas (desain, media, content)'],
      cons: ['Butuh jam terbang & kritik yang tidak enak', 'Penghasilan awal naik-turun — perlu rencana'],
      jurusan: [
        { name: 'Desain Komunikasi Visual', sub: 'Pesan lewat visual', p: 'Cocok jika betah revisi desain berjam-jam.' },
        { name: 'Desain Produk / Interior', sub: 'Bentuk & fungsi', p: 'Jika suka gambar + fungsi.' },
        { name: 'Film / Animasi', sub: 'Cerita visual', p: 'Jika suka video & storytelling.' },
      ],
      coba: 'Bikin 3 karya dalam 2 minggu (poster, feed IG, video 30 detik) — lalu minta feedback jujur.',
      tanya: ['Karya mana yang paling mau ditunjukkan ke orang lain?', 'Sanggup revisi 5×?'],
      filter: 'kreatif',
      color: '#92400e'
    }
  };

  var ORDER = ['teknologi', 'kesehatan', 'soshum', 'bisnis', 'kreatif'];

  var idx = 0;
  var answers = Array(quizData.length).fill(null);
  var startedAt = Date.now();
  var timerId = null;
  var STORAGE_KEY = 'panduan-jurusan-kuis-10';
  var HISTORY_KEY = 'panduan-jurusan-kuis-10-history';

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers: answers, idx: idx, startedAt: startedAt })); } catch (e) {}
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var d = JSON.parse(raw);
      if (d && Array.isArray(d.answers) && d.answers.length === quizData.length) {
        answers = d.answers;
        if (typeof d.idx === 'number' && d.idx >= 0 && d.idx < quizData.length) idx = d.idx;
        if (typeof d.startedAt === 'number' && d.startedAt > 0) startedAt = d.startedAt;
      }
    } catch (e) {}
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

  function pushHistory(entry) {
    var h = getHistory();
    h.unshift(entry);
    saveHistory(h);
    return h;
  }

  function fmtElapsed(ms) {
    var s = Math.max(0, Math.floor(ms / 1000));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return (m < 10 ? '0' + m : '' + m) + ':' + (r < 10 ? '0' + r : '' + r);
  }

  function answeredCount() {
    var n = 0;
    for (var i = 0; i < answers.length; i++) { if (answers[i] !== null) n++; }
    return n;
  }

  function tick() {
    if (!timeEl || resultShown) return;
    try { timeEl.textContent = fmtElapsed(Date.now() - startedAt) + ' • ' + answeredCount() + '/10 terjawab'; } catch (e) {}
  }

  function startTimer() {
    if (timerId) return;
    tick();
    try { timerId = window.setInterval(tick, 1000); } catch (e) { timerId = null; }
  }

  function stopTimer() {
    if (timerId) { try { window.clearInterval(timerId); } catch (e) {} timerId = null; }
  }

  /* ---------- render pertanyaan ---------- */
  function render() {
    var q = quizData[idx];
    if (!q) return;
    var sel = answers[idx];
    var html = '<div class="quiz-q-card">';
    html += '<p class="quiz-q-number">Pertanyaan ' + (idx + 1) + ' dari ' + quizData.length + '</p>';
    html += '<h2 class="quiz-q-title">' + esc(q.title) + '</h2>';
    html += '<p class="quiz-q-hint">' + esc(q.hint) + '</p>';
    html += '<div class="quiz-options" role="radiogroup" aria-label="' + esc(q.title) + '">';
    q.options.forEach(function (opt, i) {
      var letter = String.fromCharCode(65 + i);
      var isSel = sel === opt.key;
      html += '<button type="button" class="quiz-option' + (isSel ? ' is-selected' : '') + '" data-key="' + esc(opt.key) + '" role="radio" aria-checked="' + (isSel ? 'true' : 'false') + '">'
        + '<input type="radio" name="q' + idx + '" value="' + esc(opt.key) + '"' + (isSel ? ' checked' : '') + ' tabindex="-1" aria-hidden="true">'
        + '<span class="quiz-option-letter">' + letter + '</span>'
        + '<span class="quiz-option-text"><strong>' + esc(opt.label) + '</strong><span>' + esc(opt.sub) + '</span></span>'
        + '<span class="quiz-option-check" aria-hidden="true"><i data-feather="check"></i></span>'
        + '</button>';
    });
    html += '</div></div>';
    bodyEl.innerHTML = html;

    var btns = bodyEl.querySelectorAll('.quiz-option');
    for (var b = 0; b < btns.length; b++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          if (isAdvancing || resultShown) return;
          var key = btn.getAttribute('data-key');
          if (!key) return;
          answers[idx] = key;
          save();
          render();
          if (idx < quizData.length - 1) {
            isAdvancing = true;
            window.setTimeout(function () {
              try {
                if (answers[idx] && idx < quizData.length - 1) {
                  idx++;
                  save();
                  render();
                  scrollToEl(wrapEl);
                }
              } finally {
                isAdvancing = false;
              }
            }, 320);
          }
        });
      })(btns[b]);
    }

    if (stepEl) stepEl.textContent = (idx + 1) + ' dari ' + quizData.length;
    if (barEl) barEl.style.width = (((idx + 1) / quizData.length) * 100) + '%';
    if (percentEl) percentEl.textContent = Math.round(((idx + 1) / quizData.length) * 100) + '%';
    renderDots();
    updateNav();
    tick();
    feather();
  }

  function renderDots() {
    if (!dotsEl) return;
    var html = '';
    for (var i = 0; i < quizData.length; i++) {
      var cls = 'quiz-dot';
      if (answers[i] !== null) cls += ' is-done';
      if (i === idx) cls += ' is-current';
      html += '<button type="button" class="' + cls + '" data-i="' + i + '" role="tab" aria-selected="' + (i === idx ? 'true' : 'false') + '" aria-label="Soal ' + (i + 1) + (answers[i] !== null ? ' (terjawab)' : '') + '">' + (i + 1) + '</button>';
    }
    dotsEl.innerHTML = html;
    var dots = dotsEl.querySelectorAll('.quiz-dot');
    for (var d = 0; d < dots.length; d++) {
      (function (dot) {
        dot.addEventListener('click', function () {
          if (isAdvancing || resultShown) return;
          var i = parseInt(dot.getAttribute('data-i'), 10);
          if (isNaN(i) || i < 0 || i >= quizData.length) return;
          idx = i;
          save();
          render();
        });
      })(dots[d]);
    }
  }

  var lastNavLabel = '';
  function updateNav() {
    prevBtn.disabled = idx === 0 || isAdvancing;
    var has = answers[idx] !== null;
    var label = idx === quizData.length - 1 ? (has ? 'Lihat Hasil Analisis' : 'Pilih jawaban dulu') : 'Selanjutnya';
    if (label !== lastNavLabel) {
      if (nextLabel) nextLabel.textContent = label;
      else nextBtn.textContent = label;
      lastNavLabel = label;
      feather();
    }
    nextBtn.disabled = !has || isAdvancing;
  }

  function computeScores() {
    var scores = { teknologi: 0, kesehatan: 0, soshum: 0, bisnis: 0, kreatif: 0 };
    answers.forEach(function (k) { if (k && scores.hasOwnProperty(k)) scores[k]++; });
    var total = quizData.length;
    var list = ORDER.map(function (k) {
      return { key: k, score: scores[k], percent: Math.round(scores[k] / total * 100), meta: meta[k] };
    }).sort(function (a, b) { return b.score - a.score || ORDER.indexOf(a.key) - ORDER.indexOf(b.key); });
    return { scores: scores, list: list, total: total };
  }

  function consistencyInfo(top, list, total) {
    var consistency = Math.round(top.score / total * 100);
    var label = 'Menyebar';
    var desc = 'Jawaban tersebar ke beberapa rumpun — wajar di usia SMA. Fokus eksplor 2 rumpun tertinggi dulu.';
    if (top.score >= 5) { label = 'Cukup bulat'; desc = 'Lebih dari separuh jawaban mengarah ke 1 rumpun — sinyal minat yang cukup konsisten.'; }
    if (top.score >= 7) { label = 'Sangat bulat'; desc = 'Dominan jelas. Tetap cek rumpun kedua sebagai opsi cadangan.'; }
    if (top.score <= 3 && list.filter(function (x) { return x.score >= 2; }).length >= 3) { label = 'Menyebar'; }
    return { value: consistency, label: label, desc: desc };
  }

  function buildShareText(top, list, cons) {
    var lines = [];
    lines.push('Hasil Kuis Minat 10 Soal — Panduan Jurusan');
    lines.push('');
    lines.push('Skor tertinggi: ' + top.meta.title + ' (' + top.score + '/10, ' + top.percent + '%)');
    lines.push(top.meta.desc);
    lines.push('');
    lines.push('Rincian skor:');
    list.forEach(function (x) { lines.push('- ' + x.meta.label + ': ' + x.score + '/10 (' + x.percent + '%)'); });
    lines.push('');
    lines.push('Konsistensi: ' + cons.label + ' (' + cons.value + '% dominan)');
    lines.push('Rekomendasi: ' + top.meta.jurusan.map(function (j) { return j.name; }).join(', '));
    lines.push('');
    lines.push('Lihat kuis: ' + location.href);
    lines.push('');
    lines.push('Yuk diskusikan bareng anak — tanya "bagian mana yang paling bikin betah?"');
    return lines.join('\n');
  }

  function copyText(text, btn) {
    function done(ok) {
      if (!btn) return;
      var original = btn.getAttribute('data-label') || btn.innerHTML;
      btn.setAttribute('data-label', original);
      btn.innerHTML = ok ? '<i data-feather="check" aria-hidden="true"></i> Tersalin!' : '<i data-feather="alert-circle" aria-hidden="true"></i> Gagal menyalin';
      feather();
      window.setTimeout(function () { btn.innerHTML = original; feather(); }, 1800);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { fallback(); });
    } else { fallback(); }
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
        done(!!ok);
      } catch (e) { done(false); }
    }
  }

  function downloadTxt(filename, text) {
    try {
      var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.setTimeout(function () {
        try { document.body.removeChild(a); URL.revokeObjectURL(url); } catch (e) {}
      }, 500);
    } catch (e) {}
  }

  function fmtDateId(ts) {
    try {
      var loc = (window.__LANG === 'en') ? 'en-GB' : 'id-ID';
      var dt = new Date(ts);
      return dt.toLocaleDateString(loc, { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) { return ''; }
  }

  function downloadResultWord(top, list, cons) {
    var review = quizData.map(function (q, i) {
      var ansKey = answers[i];
      var opt = null;
      for (var o = 0; o < q.options.length; o++) { if (q.options[o].key === ansKey) { opt = q.options[o]; break; } }
      var m = ansKey ? meta[ansKey] : null;
      return { q: q.title, answer: opt ? opt.label : '-', label: m ? m.label : '-' };
    });
    if (window.PanduanJurusanExport) {
      var html = window.PanduanJurusanExport.buildWordDoc({
        dateStr: fmtDateId(Date.now()),
        topLabel: top.meta.label, topTitle: top.meta.title, topDesc: top.meta.desc,
        topScore: top.score, topPercent: top.percent,
        consLabel: cons.label, consValue: cons.value, consDesc: cons.desc,
        rows: list.map(function (x) { return { label: x.meta.label, score: x.score, percent: x.percent }; }),
        whys: top.meta.whys, pros: top.meta.pros, consList: top.meta.cons,
        jurusan: top.meta.jurusan, coba: top.meta.coba, tanya: top.meta.tanya, review: review
      });
      window.PanduanJurusanExport.downloadWord('hasil-evaluasi-kuis.doc', html);
    } else {
      downloadTxt('hasil-evaluasi-kuis.txt', buildShareText(top, list, cons));
    }
  }

  /* ---------- hasil ---------- */
  function showResult() {
    if (resultShown) return;
    resultShown = true;
    stopTimer();
    var computed = computeScores();
    var list = computed.list;
    var total = computed.total;
    var scores = computed.scores;
    var top = list[0];
    var second = list[1];
    var cons = consistencyInfo(top, list, total);
    var shareText = buildShareText(top, list, cons);

    var html = '<div class="result-head">';
    html += '<span class="quiz-badge">Hasil analisis — untuk bahan ngobrol</span>';
    html += '<h2><span class="result-icon" style="background:' + top.meta.color + '"><i data-feather="' + top.meta.icon + '"></i></span> ' + esc(top.meta.title) + '</h2>';
    html += '<p class="result-desc">' + esc(top.meta.desc) + '</p>';
    html += '<div class="result-score-main">';
    html += '<div class="score-big"><strong>' + top.score + '</strong><span>/10</span></div>';
    html += '<div class="score-big-meta"><b>' + top.percent + '%</b> jawaban ke ' + esc(top.meta.label) + ' • ' + esc(cons.label) + '</div>';
    html += '</div></div>';

    html += '<div class="result-stats">';
    html += '<h3><i data-feather="bar-chart-2" aria-hidden="true"></i> Skor per rumpun</h3>';
    html += '<p class="result-stats-desc">Batang = jumlah jawaban (' + total + ' soal). Persentase di kanan.</p>';
    html += '<div class="stats-bars">';
    list.forEach(function (item) {
      var isTop = item.key === top.key;
      html += '<div class="stat-row' + (isTop ? ' is-top' : '') + '">';
      html += '<span class="stat-label">' + esc(item.meta.label) + '</span>';
      html += '<div class="stat-bar-track"><span class="stat-bar-fill" style="width:' + item.percent + '%; background:' + item.meta.color + '"></span></div>';
      html += '<span class="stat-score"><b>' + item.score + '</b>/10</span>';
      html += '<span class="stat-percent">' + item.percent + '%</span>';
      html += '</div>';
    });
    html += '</div>';
    html += '<div class="stat-consistency"><span class="cons-badge">' + esc(cons.label) + ' • ' + cons.value + '% dominan</span><p>' + esc(cons.desc) + '</p></div>';
    html += '</div>';

    html += '<div class="result-why">';
    html += '<h3><i data-feather="check-circle" aria-hidden="true"></i> Kenapa ' + esc(top.meta.label) + ' terlihat cocok?</h3>';
    html += '<p class="result-why-intro">Diambil dari pola 10 jawaban — bukan satu soal saja.</p>';
    html += '<ol class="why-list">';
    top.meta.whys.forEach(function (w, i) { html += '<li><span class="why-num">' + (i + 1) + '</span><span>' + esc(w) + '</span></li>'; });
    html += '</ol>';
    html += '<div class="why-procons"><div><strong><i data-feather="thumbs-up" aria-hidden="true"></i> Kelebihan jika lanjut</strong><ul>' + top.meta.pros.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul></div><div><strong><i data-feather="alert-circle" aria-hidden="true"></i> Tantangan jujur</strong><ul>' + top.meta.cons.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul></div></div>';
    html += '</div>';

    if (second.score >= 2 && second.key !== top.key) {
      html += '<div class="result-second">';
      html += '<h3><i data-feather="layers" aria-hidden="true"></i> Rumpun kedua: ' + esc(second.meta.label) + ' (' + second.score + '/10)</h3>';
      html += '<p>' + esc(second.meta.desc) + '</p>';
      html += '<small>Jika anak ragu di ' + esc(top.meta.label) + ', ' + esc(second.meta.label) + ' bisa jadi opsi cadangan atau kombinasi (mis. ' + esc(top.meta.label) + ' + ' + esc(second.meta.label) + ').</small>';
      html += '</div>';
    }

    html += '<div class="result-jurusan">';
    html += '<h3><i data-feather="layout" aria-hidden="true"></i> Jurusan yang cocok</h3>';
    html += '<p class="result-jurusan-desc">3 jurusan paling nyambung dengan pola jawaban.</p>';
    html += '<div class="result-jurusan-grid">';
    top.meta.jurusan.forEach(function (j) {
      html += '<article class="result-jurusan-card"><span class="label">' + esc(top.meta.label) + '</span><h4>' + esc(j.name) + '</h4><small>' + esc(j.sub) + '</small><p>' + esc(j.p) + '</p></article>';
    });
    html += '</div></div>';

    html += '<div class="result-try">';
    html += '<h3><i data-feather="clock" aria-hidden="true"></i> Langkah coba 2 minggu</h3>';
    html += '<p>' + esc(top.meta.coba) + '</p>';
    html += '<div class="try-questions"><strong>Tanya ke anak setelah coba:</strong><ul>' + top.meta.tanya.map(function (t) { return '<li>“' + esc(t) + '”</li>'; }).join('') + '</ul></div>';
    html += '</div>';

    html += '<div class="result-review">';
    html += '<h3><i data-feather="list" aria-hidden="true"></i> Rincian jawaban (10 soal)</h3>';
    html += '<div class="review-list">';
    quizData.forEach(function (q, i) {
      var ansKey = answers[i];
      var opt = null;
      for (var o = 0; o < q.options.length; o++) { if (q.options[o].key === ansKey) { opt = q.options[o]; break; } }
      var m = ansKey ? meta[ansKey] : null;
      html += '<div class="review-item"><span class="review-num">' + (i + 1) + '</span><div><strong>' + esc(q.title) + '</strong><span>Jawab: ' + esc(opt ? opt.label : '-') + ' • ' + esc(m ? m.label : '') + '</span></div><span class="review-badge" style="background:' + (m ? m.color : '#e2e8f0') + '">' + esc(m ? m.label : '-') + '</span></div>';
    });
    html += '</div></div>';

    html += '<div class="result-actions">';
    html += '<a href="../index.html#jurusan" class="btn btn-primary" id="resultToJurusan"><i data-feather="layout" aria-hidden="true"></i> Lihat Jurusan ' + esc(top.meta.label) + '</a>';
    html += '<button class="btn btn-outline" id="resultShareWa" type="button"><i data-feather="share-2" aria-hidden="true"></i> WhatsApp</button>';
    html += '<button class="btn btn-outline" id="resultCopy" type="button"><i data-feather="copy" aria-hidden="true"></i> Salin Hasil</button>';
    html += '<button class="btn btn-outline" id="resultImage" type="button"><i data-feather="image" aria-hidden="true"></i> Gambar</button>';
    html += '<button class="btn btn-outline" id="resultWord" type="button"><i data-feather="file-text" aria-hidden="true"></i> Unduh Word</button>';
    html += '<button class="btn btn-outline" id="resultLink" type="button"><i data-feather="link" aria-hidden="true"></i> Salin Link</button>';
    html += '<a href="dashboard.html" class="btn btn-outline" id="resultDash"><i data-feather="bar-chart-2" aria-hidden="true"></i> Dashboard</a>';
    html += '<button class="btn btn-ghost" id="resultRetry" type="button"><i data-feather="refresh-cw" aria-hidden="true"></i> Ulangi Kuis</button>';
    html += '</div>';
    html += '<p class="quiz-disclaimer">Bukan tes psikologi formal — gunakan sebagai bahan obrolan keluarga.</p>';

    resultEl.innerHTML = html;
    resultEl.hidden = false;
    if (headEl) headEl.style.display = 'none';
    if (navEl) navEl.style.display = 'none';
    if (dotsEl) dotsEl.style.display = 'none';
    bodyEl.style.display = 'none';
    bodyEl.innerHTML = '';
    if (footnoteEl) footnoteEl.style.display = 'none';

    scrollToEl(resultEl);
    feather();

    try {
      localStorage.setItem(STORAGE_KEY + '-result', JSON.stringify({ top: top.key, scores: scores, list: list }));
      localStorage.setItem('panduan-jurusan-quiz-filter', top.meta.filter);
    } catch (e) {}

    var histReview = quizData.map(function (q, i) {
      var ansKey = answers[i];
      var opt = null;
      for (var o = 0; o < q.options.length; o++) { if (q.options[o].key === ansKey) { opt = q.options[o]; break; } }
      var m = ansKey ? meta[ansKey] : null;
      return { q: q.title, answer: opt ? opt.label : '-', label: m ? m.label : '-' };
    });
    pushHistory({
      ts: Date.now(), top: top.key, score: top.score, percent: top.percent,
      consistency: cons.value, consistencyLabel: cons.label, scores: scores,
      detail: {
        topLabel: top.meta.label, topTitle: top.meta.title, topDesc: top.meta.desc,
        consDesc: cons.desc,
        rows: list.map(function (x) { return { label: x.meta.label, score: x.score, percent: x.percent }; }),
        whys: top.meta.whys, pros: top.meta.pros, consList: top.meta.cons,
        jurusan: top.meta.jurusan, coba: top.meta.coba, tanya: top.meta.tanya, review: histReview
      }
    });

    var toJurusan = document.getElementById('resultToJurusan');
    if (toJurusan) toJurusan.addEventListener('click', function () {
      try { localStorage.setItem('panduan-jurusan-quiz-filter', top.meta.filter); } catch (e) {}
    });
    var shareBtn = document.getElementById('resultShareWa');
    if (shareBtn) shareBtn.addEventListener('click', function () {
      window.open('https://wa.me/?text=' + encodeURIComponent(shareText), '_blank', 'noopener');
    });
    var copyBtn = document.getElementById('resultCopy');
    if (copyBtn) copyBtn.addEventListener('click', function () { copyText(shareText, copyBtn); });
    var imgBtn = document.getElementById('resultImage');
    if (imgBtn) imgBtn.addEventListener('click', function () {
      if (!window.PanduanJurusanShare) return;
      var original = imgBtn.innerHTML;
      imgBtn.disabled = true;
      imgBtn.innerHTML = 'Membuat…';
      window.PanduanJurusanShare.shareImage({
        topLabel: top.meta.label, topColor: top.meta.color, score: top.score, percent: top.percent,
        rows: list.map(function (x) { return { label: x.meta.label, percent: x.percent, color: x.meta.color }; }),
        majors: top.meta.jurusan.map(function (j) { return j.name; })
      }).then(function () {
        imgBtn.disabled = false;
        imgBtn.innerHTML = original;
        feather();
        try { if (window.PanduanJurusanFav) window.PanduanJurusanFav.toast('Gambar hasil siap dibagikan'); } catch (e) {}
      });
    });
    var linkBtn = document.getElementById('resultLink');
    if (linkBtn) linkBtn.addEventListener('click', function () {
      if (!window.PanduanJurusanShare) return;
      var url = window.PanduanJurusanShare.buildResultLink({ t: top.key, s: scores, c: cons.label });
      if (!url) return;
      var original = linkBtn.innerHTML;
      window.PanduanJurusanShare.copyText(url).then(function (ok) {
        linkBtn.innerHTML = ok ? '<i data-feather="check" aria-hidden="true"></i> Link tersalin!' : original;
        feather();
        if (ok) window.setTimeout(function () { linkBtn.innerHTML = original; feather(); }, 1800);
      });
    });
    var wordBtn = document.getElementById('resultWord');
    if (wordBtn) wordBtn.addEventListener('click', function () { downloadResultWord(top, list, cons); });
    var retryBtn = document.getElementById('resultRetry');
    if (retryBtn) retryBtn.addEventListener('click', function () { resetQuiz(); });
  }

  function restoreQuizView() {
    resultShown = false;
    isAdvancing = false;
    resultEl.hidden = true;
    resultEl.innerHTML = '';
    if (headEl) headEl.style.display = '';
    if (navEl) navEl.style.display = '';
    if (dotsEl) dotsEl.style.display = '';
    bodyEl.style.display = '';
    if (footnoteEl) footnoteEl.style.display = '';
    lastNavLabel = '';
    render();
    startTimer();
  }

  function resetQuiz() {
    answers = Array(quizData.length).fill(null);
    idx = 0;
    startedAt = Date.now();
    save();
    restoreQuizView();
    scrollToEl(wrapEl);
  }

  /* ---------- events ---------- */
  prevBtn.addEventListener('click', function () {
    if (isAdvancing) return;
    if (resultEl && !resultEl.hidden) { restoreQuizView(); return; }
    if (idx > 0) { idx--; save(); render(); }
  });

  nextBtn.addEventListener('click', function () {
    if (isAdvancing) return;
    if (resultEl && !resultEl.hidden) return;
    if (!answers[idx]) return;
    if (idx < quizData.length - 1) {
      idx++; save(); render();
    } else {
      showResult();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (resultShown || !resultEl || !resultEl.hidden) return;
    if (!e || !e.key) return;
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.key >= '1' && e.key <= '5') {
      var i = parseInt(e.key, 10) - 1;
      var q = quizData[idx];
      if (q && q.options[i]) {
        var btns = bodyEl.querySelectorAll('.quiz-option');
        if (btns[i]) { try { btns[i].click(); } catch (err) {} }
      }
    } else if (e.key === 'ArrowRight') {
      if (!nextBtn.disabled) { try { nextBtn.click(); } catch (err) {} }
    } else if (e.key === 'ArrowLeft') {
      if (!prevBtn.disabled) { try { prevBtn.click(); } catch (err) {} }
    }
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { stopTimer(); }
    else if (!resultShown) { startTimer(); }
  });

  /* ---------- init ---------- */
  load();
  render();
  startTimer();
  feather();
  window.addEventListener('load', feather);

})();
