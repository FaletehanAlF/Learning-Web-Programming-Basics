(function () {
  'use strict';

  const bodyEl = document.getElementById('quizFullBody');
  const prevBtn = document.getElementById('quizFullPrev');
  const nextBtn = document.getElementById('quizFullNext');
  const stepEl = document.getElementById('quizFullStep');
  const barEl = document.getElementById('quizFullBar');
  const percentEl = document.getElementById('quizFullPercent');
  const resultEl = document.getElementById('quizFullResult');
  const headEl = document.getElementById('quizFullHead');
  const navEl = document.getElementById('quizFullNav');

  if (!bodyEl || !prevBtn || !nextBtn) return;

  function feather() {
    try { if (window.feather) window.feather.replace(); } catch(e){}
  }

  const quizData = [
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

  const meta = {
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
        { name: 'Sistem Informasi', sub: 'Teknologi + bisnis', p: 'Pas jika suka atur sistem agar rapi &kepakai orang.' },
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

  const ORDER = ['teknologi','kesehatan','soshum','bisnis','kreatif'];

  let idx = 0;
  let answers = Array(quizData.length).fill(null);
  const STORAGE_KEY = 'panduan-jurusan-kuis-10';

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, idx })); } catch(e){}
  }
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (Array.isArray(d.answers) && d.answers.length === quizData.length) {
        answers = d.answers;
        if (typeof d.idx === 'number' && d.idx >=0 && d.idx < quizData.length) idx = d.idx;
      }
    } catch(e){}
  }
  load();

  function render() {
    const q = quizData[idx];
    const sel = answers[idx];
    let html = `<div class="quiz-q-card">`;
    html += `<p class="quiz-q-number">Pertanyaan ${idx+1} dari ${quizData.length}</p>`;
    html += `<h2 class="quiz-q-title">${q.title}</h2>`;
    html += `<p class="quiz-q-hint">${q.hint}</p>`;
    html += `<div class="quiz-options" role="radiogroup" aria-label="${q.title}">`;
    q.options.forEach((opt, i) => {
      const letter = String.fromCharCode(65+i);
      const isSel = sel === opt.key;
      html += `<button type="button" class="quiz-option ${isSel ? 'is-selected' : ''}" data-key="${opt.key}" role="radio" aria-checked="${isSel?'true':'false'}">
        <input type="radio" name="q${idx}" value="${opt.key}" ${isSel?'checked':''} tabindex="-1" aria-hidden="true">
        <span class="quiz-option-letter">${letter}</span>
        <span class="quiz-option-text"><strong>${opt.label}</strong><span>${opt.sub}</span></span>
        <span class="quiz-option-check" aria-hidden="true"><i data-feather="check"></i></span>
      </button>`;
    });
    html += `</div></div>`;
    bodyEl.innerHTML = html;
    bodyEl.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-key');
        answers[idx] = key;
        save();
        render();
        updateNav();
        // auto advance slightly delayed for parents to see selection
        if (idx < quizData.length - 1) {
          setTimeout(() => {
            if (answers[idx]) {
              idx++;
              save();
              render();
              updateNav();
              bodyEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 320);
        } else {
          updateNav();
        }
      });
    });
    if (stepEl) stepEl.textContent = `${idx+1} dari ${quizData.length}`;
    if (barEl) barEl.style.width = `${((idx+1)/quizData.length)*100}%`;
    if (percentEl) percentEl.textContent = `${Math.round(((idx+1)/quizData.length)*100)}%`;
    feather();
    updateNav();
  }

  function updateNav() {
    prevBtn.disabled = idx === 0;
    const has = answers[idx] !== null;
    if (idx === quizData.length - 1) {
      nextBtn.textContent = has ? 'Lihat Hasil Analisis' : 'Pilih jawaban dulu';
      nextBtn.disabled = !has;
    } else {
      nextBtn.textContent = 'Selanjutnya';
      nextBtn.disabled = !has;
    }
    // feather icon after text change? Keep text simple, no icon swap
  }

  function computeScores() {
    const scores = { teknologi:0, kesehatan:0, soshum:0, bisnis:0, kreatif:0 };
    answers.forEach(k => { if (k && scores.hasOwnProperty(k)) scores[k]++; });
    const total = quizData.length;
    const list = ORDER.map(k => ({
      key: k,
      score: scores[k],
      percent: Math.round(scores[k]/total*100),
      meta: meta[k]
    })).sort((a,b) => b.score - a.score || ORDER.indexOf(a.key) - ORDER.indexOf(b.key));
    return { scores, list, total };
  }

  function showResult() {
    const { scores, list, total } = computeScores();
    const top = list[0];
    const second = list[1];
    const consistency = Math.round(top.score/total*100);
    let consistencyLabel = 'Menyebar';
    let consistencyDesc = 'Jawaban tersebar ke beberapa rumpun — wajar di usia SMA. Fokus eksplor 2 rumpun tertinggi dulu.';
    if (top.score >= 5) { consistencyLabel = 'Cukup bulat'; consistencyDesc = 'Lebih dari separuh jawaban mengarah ke 1 rumpun — sinyal minat yang cukup konsisten.'; }
    if (top.score >= 7) { consistencyLabel = 'Sangat bulat'; consistencyDesc = 'Dominan jelas. Tetap cek rumpun kedua sebagai opsi cadangan.'; }
    if (top.score <= 3 && list.filter(x=>x.score>=2).length >=3) { consistencyLabel = 'Menyebar'; }

    // Build result HTML
    let html = `<div class="result-head">`;
    html += `<span class="quiz-badge">Hasil analisis — untuk bahan ngobrol</span>`;
    html += `<h2><span class="result-icon" style="background:${top.meta.color}"><i data-feather="${top.meta.icon}"></i></span> ${top.meta.title}</h2>`;
    html += `<p class="result-desc">${top.meta.desc}</p>`;
    html += `<div class="result-score-main">`;
    html += `<div class="score-big"><strong>${top.score}</strong><span>/10</span></div>`;
    html += `<div class="score-big-meta"><b>${top.percent}%</b> jawaban ke ${top.meta.label} • ${consistencyLabel}</div>`;
    html += `</div></div>`;

    // Stats - bar chart
    html += `<div class="result-stats">`;
    html += `<h3><i data-feather="bar-chart-2" aria-hidden="true"></i> Skor per rumpun</h3>`;
    html += `<p class="result-stats-desc">Batang = jumlah jawaban (${total} soal). Persentase di kanan.</p>`;
    html += `<div class="stats-bars">`;
    list.forEach(item => {
      const isTop = item.key === top.key;
      html += `<div class="stat-row ${isTop ? 'is-top' : ''}">`;
      html += `<span class="stat-label">${item.meta.label}</span>`;
      html += `<div class="stat-bar-track"><span class="stat-bar-fill" style="width:${item.percent}%; background:${item.meta.color}"></span></div>`;
      html += `<span class="stat-score"><b>${item.score}</b>/10</span>`;
      html += `<span class="stat-percent">${item.percent}%</span>`;
      html += `</div>`;
    });
    html += `</div>`;
    html += `<div class="stat-consistency"><span class="cons-badge">${consistencyLabel} • ${consistency}% dominan</span><p>${consistencyDesc}</p></div>`;
    html += `</div>`;

    // Why cocok
    html += `<div class="result-why">`;
    html += `<h3><i data-feather="check-circle" aria-hidden="true"></i> Kenapa ${top.meta.label} terlihat cocok?</h3>`;
    html += `<p class="result-why-intro">Diambil dari pola 10 jawaban — bukan satu soal saja.</p>`;
    html += `<ol class="why-list">`;
    top.meta.whys.forEach((w, i) => { html += `<li><span class="why-num">${i+1}</span><span>${w}</span></li>`; });
    html += `</ol>`;
    html += `<div class="why-procons"><div><strong><i data-feather="thumbs-up" aria-hidden="true"></i> Kelebihan jika lanjut</strong><ul>${top.meta.pros.map(p=>`<li>${p}</li>`).join('')}</ul></div><div><strong><i data-feather="alert-circle" aria-hidden="true"></i> Tantangan jujur</strong><ul>${top.meta.cons.map(c=>`<li>${c}</li>`).join('')}</ul></div></div>`;
    html += `</div>`;

    // Runner up if second score >=2
    if (second.score >= 2 && second.key !== top.key) {
      html += `<div class="result-second">`;
      html += `<h3><i data-feather="layers" aria-hidden="true"></i> Rumpun kedua: ${second.meta.label} (${second.score}/10)</h3>`;
      html += `<p>${second.meta.desc}</p>`;
      html += `<small>Jika anak ragu di ${top.meta.label}, ${second.meta.label} bisa jadi opsi cadangan atau kombinasi (mis. ${top.meta.label} + ${second.meta.label}).</small>`;
      html += `</div>`;
    }

    // Jurusan recommendations
    html += `<div class="result-jurusan">`;
    html += `<h3><i data-feather="layout" aria-hidden="true"></i> Jurusan yang bisa dilihat dulu</h3>`;
    html += `<p class="result-jurusan-desc">Bukan harus pilih ini — tapi 3 ini paling nyambung dengan pola jawaban. Klik untuk filter katalog di beranda.</p>`;
    html += `<div class="result-jurusan-grid">`;
    top.meta.jurusan.forEach(j => {
      html += `<article class="result-jurusan-card"><span class="label">${top.meta.label}</span><h4>${j.name}</h4><small>${j.sub}</small><p>${j.p}</p></article>`;
    });
    html += `</div></div>`;

    // Coba 2 minggu
    html += `<div class="result-try">`;
    html += `<h3><i data-feather="clock" aria-hidden="true"></i> Langkah coba 2 minggu</h3>`;
    html += `<p>${top.meta.coba}</p>`;
    html += `<div class="try-questions"><strong>Tanya ke anak setelah coba:</strong><ul>${top.meta.tanya.map(t=>`<li>“${t}”</li>`).join('')}</ul></div>`;
    html += `</div>`;

    // Answers review
    html += `<div class="result-review">`;
    html += `<h3><i data-feather="list" aria-hidden="true"></i> Rincian jawaban (10 soal)</h3>`;
    html += `<div class="review-list">`;
    quizData.forEach((q, i) => {
      const ansKey = answers[i];
      const opt = q.options.find(o=>o.key===ansKey);
      const m = ansKey ? meta[ansKey] : null;
      html += `<div class="review-item"><span class="review-num">${i+1}</span><div><strong>${q.title}</strong><span>Jawab: ${opt ? opt.label : '-'} • ${m ? m.label : ''}</span></div><span class="review-badge" style="background:${m?m.color:'#e2e8f0'}">${m?m.label:'-'}</span></div>`;
    });
    html += `</div></div>`;

    // Actions
    html += `<div class="result-actions">`;
    html += `<a href="index.html#jurusan" class="btn btn-primary" id="resultToJurusan"><i data-feather="layout" aria-hidden="true"></i> Lihat Jurusan ${top.meta.label} di Beranda</a>`;
    html += `<button class="btn btn-outline" id="resultShareWa" type="button"><i data-feather="share-2" aria-hidden="true"></i> Bagikan Hasil ke WhatsApp</button>`;
    html += `<button class="btn btn-ghost" id="resultRetry" type="button"><i data-feather="refresh-cw" aria-hidden="true"></i> Ulangi Kuis</button>`;
    html += `</div>`;
    html += `<p class="quiz-disclaimer">Bukan tes psikologi formal. Skor = jumlah jawaban per rumpun dari 10 soal. Gunakan untuk membuka obrolan hidup—mis. “kok 4 jawaban ke Teknologi ya? Bagian mana yang bikin betah?”</p>`;

    resultEl.innerHTML = html;
    resultEl.hidden = false;
    if (headEl) headEl.style.display = 'none';
    if (navEl) navEl.style.display = 'none';
    bodyEl.style.display = 'none';
    bodyEl.innerHTML = '';

    // scroll
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    feather();

    // store last result for share
    try { localStorage.setItem(STORAGE_KEY + '-result', JSON.stringify({ top: top.key, scores, list })); } catch(e){}

    // bind actions
    const toJurusan = document.getElementById('resultToJurusan');
    if (toJurusan) toJurusan.addEventListener('click', () => {
      try { localStorage.setItem('panduan-jurusan-quiz-filter', top.meta.filter); } catch(e){}
    });
    const shareBtn = document.getElementById('resultShareWa');
    if (shareBtn) shareBtn.addEventListener('click', () => {
      const plain = `Hasil Kuis Minat 10 Soal — Panduan Jurusan\n\nSkor tertinggi: ${top.meta.title} (${top.score}/10, ${top.percent}%)\n${top.meta.desc}\n\nRincian skor:\n${list.map(x=>`- ${x.meta.label}: ${x.score}/10 (${x.percent}%)`).join('\n')}\n\nRekomendasi: ${top.meta.jurusan.map(j=>j.name).join(', ')}\n\nLihat kuis: ${location.href}\n\nYuk diskusikan bareng anak — tanya “bagian mana yang paling bikin betah?”`;
      window.open(`https://wa.me/?text=${encodeURIComponent(plain)}`, '_blank', 'noopener');
    });
    const retryBtn = document.getElementById('resultRetry');
    if (retryBtn) retryBtn.addEventListener('click', () => {
      answers = Array(quizData.length).fill(null);
      idx = 0;
      save();
      resultEl.hidden = true;
      resultEl.innerHTML = '';
      if (headEl) headEl.style.display = '';
      if (navEl) navEl.style.display = '';
      bodyEl.style.display = '';
      render();
    });
  }

  // init
  render();

  prevBtn.addEventListener('click', () => {
    if (resultEl && !resultEl.hidden) {
      // from result back to last question
      resultEl.hidden = true;
      resultEl.innerHTML = '';
      if (headEl) headEl.style.display = '';
      if (navEl) navEl.style.display = '';
      bodyEl.style.display = '';
      render();
      return;
    }
    if (idx > 0) { idx--; save(); render(); }
  });

  nextBtn.addEventListener('click', () => {
    if (resultEl && !resultEl.hidden) return;
    if (!answers[idx]) return;
    if (idx < quizData.length - 1) {
      idx++; save(); render();
    } else {
      showResult();
    }
  });

  // handle direct load with saved answers? If all answered, show button to view result directly? Keep manual.

  // Feather initial
  feather();
  window.addEventListener('load', feather);

})();
