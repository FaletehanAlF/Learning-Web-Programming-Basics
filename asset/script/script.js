(function () {
  'use strict';

  document.documentElement.classList.add('js');

  function renderFeather() {
    try {
      if (window.feather && typeof window.feather.replace === 'function') {
        window.feather.replace();
      }
    } catch (err) {}
  }
  renderFeather();
  window.addEventListener('load', renderFeather);

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      document.body.classList.add('is-loaded');
    });
  });

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const header = document.getElementById('siteHeader');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const backToTop = document.getElementById('backToTop');
  const scrollProgress = document.getElementById('scrollProgress');
  const navLinks = Array.from(navMenu ? navMenu.querySelectorAll('a[href^="#"]') : []);
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  const faqItems = Array.from(document.querySelectorAll('.faq-item'));

  function setMenuOpen(open) {
    if (!navMenu || !navToggle) return;
    navMenu.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Tutup menu navigasi' : 'Buka menu navigasi');
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      setMenuOpen(!navMenu.classList.contains('is-open'));
    });
    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenuOpen(false));
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && navMenu.classList.contains('is-open')) {
        setMenuOpen(false);
        navToggle.focus();
      }
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900 && navMenu.classList.contains('is-open')) {
        setMenuOpen(false);
      }
    });
  }

  let ticking = false;
  function onScroll() {
    const y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('is-scrolled', y > 8);
    if (backToTop) backToTop.classList.toggle('is-visible', y > 600);
    if (scrollProgress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(Math.max(y / max, 0), 1) : 0;
      scrollProgress.style.transform = `scaleX(${p})`;
    }
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  const sectionIds = ['kuis-minat', 'jurusan', 'kalkulator-biaya', 'tips', 'testimoni', 'faq', 'kenapa', 'cta-akhir'];
  const linkById = new Map();
  navLinks.forEach((link) => {
    const href = link.getAttribute('href') || '';
    if (!href.startsWith('#')) return;
    const id = href.slice(1);
    if (sectionIds.includes(id)) linkById.set(id, link);
  });
  function setActive(id) {
    linkById.forEach((link, key) => {
      const active = key === id;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }
  if ('IntersectionObserver' in window && linkById.size > 0) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-38% 0px -55% 0px', threshold: 0 });
    sectionIds.forEach((id) => {
      const section = document.getElementById(id);
      if (section) sectionObserver.observe(section);
    });
  }

  if (revealEls.length > 0) {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    } else {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      revealEls.forEach((el) => revealObserver.observe(el));
    }
  }

  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      faqItems.forEach((other) => {
        if (other !== item && other.open) other.open = false;
      });
    });
  });

  const testiTrack = document.getElementById('testiTrack');
  const testiPrev = document.getElementById('testiPrev');
  const testiNext = document.getElementById('testiNext');
  const testiDots = document.getElementById('testiDots');
  const testiCount = document.getElementById('testiCount');
  const testiCards = testiTrack ? Array.from(testiTrack.querySelectorAll('.testi-card')) : [];
  function testiStep() {
    if (!testiTrack) return 0;
    const card = testiTrack.querySelector('.testi-card');
    if (!card) return testiTrack.clientWidth * 0.8;
    const styles = getComputedStyle(testiTrack);
    const gap = parseFloat(styles.columnGap || styles.gap) || 20;
    return card.offsetWidth + gap;
  }
  function testiIndex() {
    if (!testiTrack || testiCards.length === 0) return 0;
    const step = testiStep() || 1;
    return Math.min(testiCards.length - 1, Math.max(0, Math.round(testiTrack.scrollLeft / step)));
  }
  function updateTestiButtons() {
    if (!testiTrack || !testiPrev || !testiNext) return;
    const maxScroll = testiTrack.scrollWidth - testiTrack.clientWidth;
    testiPrev.disabled = testiTrack.scrollLeft <= 2;
    testiNext.disabled = testiTrack.scrollLeft >= maxScroll - 2;
    const idx = testiIndex();
    if (testiDots) {
      Array.from(testiDots.children).forEach((dot, i) => {
        dot.classList.toggle('is-active', i === idx);
        dot.setAttribute('aria-selected', String(i === idx));
      });
    }
    if (testiCount) testiCount.textContent = `${idx + 1} / ${testiCards.length}`;
  }
  if (testiTrack && testiPrev && testiNext) {
    const behavior = prefersReducedMotion ? 'auto' : 'smooth';
    if (testiDots && testiCards.length > 0) {
      testiCards.forEach((card, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'testi-dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-selected', String(i === 0));
        dot.setAttribute('aria-label', `Ke testimoni ${i + 1}`);
        dot.addEventListener('click', () => {
          testiTrack.scrollTo({ left: i * testiStep(), behavior });
        });
        testiDots.appendChild(dot);
      });
    }
    testiPrev.addEventListener('click', () => { testiTrack.scrollBy({ left: -testiStep(), behavior }); });
    testiNext.addEventListener('click', () => { testiTrack.scrollBy({ left: testiStep(), behavior }); });
    testiTrack.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); testiTrack.scrollBy({ left: testiStep(), behavior }); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); testiTrack.scrollBy({ left: -testiStep(), behavior }); }
    });
    let isDown = false; let startX = 0; let startScroll = 0;
    testiTrack.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      isDown = true; startX = e.clientX; startScroll = testiTrack.scrollLeft;
      testiTrack.classList.add('is-dragging');
    });
    window.addEventListener('pointermove', (e) => { if (!isDown) return; testiTrack.scrollLeft = startScroll - (e.clientX - startX); });
    window.addEventListener('pointerup', () => { if (!isDown) return; isDown = false; testiTrack.classList.remove('is-dragging'); updateTestiButtons(); });
    testiTrack.addEventListener('pointercancel', () => { isDown = false; testiTrack.classList.remove('is-dragging'); });
    testiTrack.addEventListener('scroll', () => { window.requestAnimationFrame(updateTestiButtons); }, { passive: true });
    window.addEventListener('resize', updateTestiButtons);
    updateTestiButtons();
  }

  /* --- Filter + search jurusan --- */
  const chips = Array.from(document.querySelectorAll('.filter-chips .chip'));
  const jurusanSearch = document.getElementById('jurusanSearch');
  const jurusanCards = Array.from(document.querySelectorAll('.jurusan-card'));
  const jurusanCount = document.getElementById('jurusanCount');
  const jurusanEmpty = document.getElementById('jurusanEmpty');
  let activeFilter = 'semua';
  function applyJurusanFilter() {
    const q = (jurusanSearch && jurusanSearch.value ? jurusanSearch.value : '').trim().toLowerCase();
    let shown = 0;
    jurusanCards.forEach((card) => {
      const kat = (card.getAttribute('data-kategori') || '').toLowerCase();
      const nama = (card.getAttribute('data-nama') || card.textContent || '').toLowerCase();
      const matchKat = activeFilter === 'semua' || kat === activeFilter;
      const matchQ = !q || nama.includes(q);
      const visible = matchKat && matchQ;
      card.classList.toggle('is-hidden', !visible);
      if (visible) shown += 1;
    });
    if (jurusanCount) jurusanCount.textContent = `Menampilkan ${shown} dari ${jurusanCards.length} jurusan`;
    if (jurusanEmpty) jurusanEmpty.hidden = shown !== 0;
  }
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      activeFilter = chip.getAttribute('data-filter') || 'semua';
      applyJurusanFilter();
    });
  });
  if (jurusanSearch) jurusanSearch.addEventListener('input', applyJurusanFilter);
  // expose for quiz
  window._applyJurusanFilter = applyJurusanFilter;
  window._setJurusanFilter = function (kat) {
    activeFilter = kat;
    chips.forEach((c) => c.classList.toggle('is-active', (c.getAttribute('data-filter')||'').toLowerCase() === kat));
    applyJurusanFilter();
  };
  // Jika datang dari kuis 10 soal (kuis.html) -> terapkan filter otomatis
  try {
    const savedFilter = localStorage.getItem('panduan-jurusan-quiz-filter');
    if (savedFilter) {
      const valid = Array.from(chips).some((c) => (c.getAttribute('data-filter')||'').toLowerCase() === savedFilter.toLowerCase());
      if (valid) window._setJurusanFilter(savedFilter.toLowerCase());
    }
    // tampilkan ringkasan skor 10 soal di dekat katalog jika ada
    const raw10 = localStorage.getItem('panduan-jurusan-kuis-10-result');
    if (raw10 && jurusanCount) {
      try {
        const r = JSON.parse(raw10);
        if (r && r.top) {
          const labelMap = { teknologi:'Teknologi', kesehatan:'Kesehatan', soshum:'Soshum', bisnis:'Bisnis', kreatif:'Kreatif' };
          const label = labelMap[r.top] || r.top;
          const existing = jurusanCount.textContent;
          jurusanCount.textContent = existing + ` • Hasil kuis 10 soal: dominan ${label}`;
        }
      } catch(e){}
    }
  } catch(e){}

  /* --- Checklist tips + progress --- */
  const tipsChecks = Array.from(document.querySelectorAll('[data-tips-check]'));
  const tipsProgressText = document.getElementById('tipsProgressText');
  const tipsProgressBar = document.getElementById('tipsProgressBar');
  const TIPS_KEY = 'panduan-jurusan-tips';
  function loadTips() {
    try { const raw = localStorage.getItem(TIPS_KEY); if (!raw) return []; const parsed = JSON.parse(raw); return Array.isArray(parsed) ? parsed : []; } catch (err) { return []; }
  }
  function saveTips(done) {
    try { localStorage.setItem(TIPS_KEY, JSON.stringify(done)); } catch (err) {}
  }
  function updateTipsProgress() {
    const done = tipsChecks.filter((c) => c.checked).map((c) => c.getAttribute('data-tips-check'));
    const total = tipsChecks.length;
    if (tipsProgressText) tipsProgressText.textContent = `${done.length} dari ${total} langkah dibahas`;
    if (tipsProgressBar) tipsProgressBar.style.width = total > 0 ? `${(done.length / total) * 100}%` : '0%';
    tipsChecks.forEach((c) => { const item = c.closest('.tips-item'); if (item) item.classList.toggle('is-done', c.checked); });
    saveTips(done);
  }
  if (tipsChecks.length > 0) {
    const saved = loadTips();
    tipsChecks.forEach((c) => {
      c.checked = saved.includes(c.getAttribute('data-tips-check'));
      c.addEventListener('change', updateTipsProgress);
    });
    updateTipsProgress();
  }

  /* --- Count-up --- */
  const counters = Array.from(document.querySelectorAll('[data-count]'));
  if (counters.length > 0) {
    const animateCount = (el) => {
      const target = parseInt(el.getAttribute('data-count'), 10);
      if (Number.isNaN(target)) return;
      if (prefersReducedMotion) { el.textContent = String(target); return; }
      const dur = 900; const start = performance.now(); const from = 0;
      function frame(now) {
        const t = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = String(Math.round(from + (target - from) * eased));
        if (t < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    };
    if ('IntersectionObserver' in window) {
      const cObs = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { animateCount(e.target); cObs.unobserve(e.target); } });
      }, { threshold: 0.6 });
      counters.forEach((c) => cObs.observe(c));
    } else { counters.forEach(animateCount); }
  }

  if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
    const heroVisual = document.querySelector('.hero-visual');
    const heroFigure = document.querySelector('.hero-figure');
    if (heroVisual && heroFigure) {
      let rafId = null;
      heroVisual.addEventListener('pointermove', (e) => {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
          const r = heroVisual.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          heroFigure.style.transform = `perspective(900px) rotateY(${px * 5}deg) rotateX(${py * -5}deg) translateY(-3px)`;
          rafId = null;
        });
      });
      heroVisual.addEventListener('pointerleave', () => { heroFigure.style.transform = ''; });
    }
  }

  /* =========================================================
     FITUR BARU: KUIS MINAT 2 MENIT (Target: orang tua awam)
     ========================================================= */
  const quizData = [
    {
      title: 'Kalau ada waktu luang, anak paling betah ngapain?',
      hint: 'Pilih yang paling sering — bukan yang paling keren.',
      options: [
        { key: 'teknologi', label: 'Ngoprek HP/laptop, bikin sesuatu', sub: 'Suka coba-coba sampai jadi' },
        { key: 'kesehatan', label: 'Merawat orang/hewan/tanaman', sub: 'Senang kalau bisa bantu orang' },
        { key: 'soshum', label: 'Ngobrol, baca, nulis, diskusi', sub: 'Betah dengar cerita orang lain' },
        { key: 'bisnis', label: 'Jualan kecil, atur uang jajan', sub: 'Teliti hitung untung-rugi' },
        { key: 'kreatif', label: 'Gambar, edit foto/video, desain', sub: 'Suka bikin yang enak dilihat' },
      ]
    },
    {
      title: 'Pelajaran yang paling enak tanpa dipaksa?',
      hint: 'Yang nilainya stabil walau tanpa les tambahan.',
      options: [
        { key: 'teknologi', label: 'Matematika / Fisika / Informatika', sub: 'Senang logika & angka' },
        { key: 'kesehatan', label: 'Biologi / Kimia', sub: 'Penasaran tubuh & alam' },
        { key: 'soshum', label: 'Bahasa / Sosiologi / Sejarah', sub: 'Suka memahami orang' },
        { key: 'bisnis', label: 'Ekonomi / Akuntansi / KWU', sub: 'Tertarik uang & usaha' },
        { key: 'kreatif', label: 'Seni / Prakarya / Desain', sub: 'Nilai bagus saat bikin karya' },
      ]
    },
    {
      title: 'Cara belajar yang paling cocok?',
      hint: 'Bayangkan anak mengerjakan tugas kelompok.',
      options: [
        { key: 'teknologi', label: 'Coba langsung, pecahkan masalah', sub: 'Langsung praktik' },
        { key: 'kesehatan', label: 'Hafalan rapi + praktik teliti', sub: 'Harus urut & tepat' },
        { key: 'soshum', label: 'Diskusi & dengarkan orang', sub: 'Belajar dari cerita' },
        { key: 'bisnis', label: 'Rapi, terstruktur, hitung detail', sub: 'Suka checklist & tabel' },
        { key: 'kreatif', label: 'Bebas, coba gaya baru', sub: 'Tidak suka dikekang' },
      ]
    },
    {
      title: 'Bayangan kerja yang bikin semangat?',
      hint: 'Tidak harus realistis dulu — yang bikin mata berbinar.',
      options: [
        { key: 'teknologi', label: 'Di depan komputer, bikin aplikasi', sub: 'Bikin sistem/jaringan' },
        { key: 'kesehatan', label: 'Rumah sakit / lab, bantu orang sehat', sub: 'Seragam putih, tanggung jawab' },
        { key: 'soshum', label: 'Sekolah / kantor / lembaga sosial', sub: 'Ketemu banyak orang' },
        { key: 'bisnis', label: 'Kantor / perusahaan, kelola keuangan', sub: 'Atur bisnis & strategi' },
        { key: 'kreatif', label: 'Studio / agensi, karya visual', sub: 'Portofolio & pameran' },
      ]
    }
  ];

  const resultMeta = {
    teknologi: {
      title: 'Cenderung ke Rumpun Teknologi',
      desc: 'Suka logika, ngoprek, dan memecahkan masalah langkah demi langkah. Cocok untuk jurusan yang banyak praktik di depan komputer.',
      reco: [
        { cat: 'Teknologi', name: 'Teknik Informatika', p: 'Bikin aplikasi/website. Butuh logika kuat & tahan ngulik.' },
        { cat: 'Teknologi', name: 'Sistem Informasi', p: 'Gabungan teknologi + bisnis. Cocok kalau suka atur sistem.' }
      ],
      filter: 'teknologi'
    },
    kesehatan: {
      title: 'Cenderung ke Rumpun Kesehatan',
      desc: 'Peduli orang lain, teliti, dan tahan belajar lama. Jurusan kesehatan butuh komitmen & empati tinggi.',
      reco: [
        { cat: 'Kesehatan', name: 'Kedokteran', p: 'Belajar tubuh & penyakit. Lama, tapi dampaknya besar.' },
        { cat: 'Kesehatan', name: 'Psikologi', p: 'Alternatif jika suka bantu lewat pikiran & perilaku.' }
      ],
      filter: 'kesehatan'
    },
    soshum: {
      title: 'Cenderung ke Rumpun Sosial Humaniora',
      desc: 'Senang memahami orang, membaca, dan berdiskusi. Kuat di komunikasi & analisis sosial.',
      reco: [
        { cat: 'Soshum', name: 'Psikologi', p: 'Pahami pikiran & perilaku manusia.' },
        { cat: 'Soshum', name: 'Hukum', p: 'Suka argumen runtut & keadilan.' }
      ],
      filter: 'soshum'
    },
    bisnis: {
      title: 'Cenderung ke Rumpun Bisnis',
      desc: 'Teliti, rapi, dan senang hitungan. Cocok untuk jurusan yang mengelola uang & strategi.',
      reco: [
        { cat: 'Bisnis', name: 'Akuntansi', p: 'Catat & kelola keuangan. Dicari di semua perusahaan.' },
        { cat: 'Bisnis', name: 'Manajemen', p: 'Atur tim & bisnis agar jalan.' }
      ],
      filter: 'bisnis'
    },
    kreatif: {
      title: 'Cenderung ke Rumpun Kreatif',
      desc: 'Imajinatif, peka visual, dan suka bereksperimen. Butuh portofolio & jam terbang.',
      reco: [
        { cat: 'Kreatif', name: 'Desain Komunikasi Visual', p: 'Sampaikan pesan lewat gambar & warna.' },
        { cat: 'Kreatif', name: 'Teknik Informatika (UI/UX)', p: 'Irisan kreatif-teknologi: desain aplikasi.' }
      ],
      filter: 'kreatif'
    }
  };

  const quizBody = document.getElementById('quizBody');
  const quizPrev = document.getElementById('quizPrev');
  const quizNext = document.getElementById('quizNext');
  const quizStepEl = document.getElementById('quizStep');
  const quizBar = document.getElementById('quizProgressBar');
  const quizResultEl = document.getElementById('quizResult');
  const quizResultTitle = document.getElementById('quizResultTitle');
  const quizResultDesc = document.getElementById('quizResultDesc');
  const quizReco = document.getElementById('quizReco');
  const quizToJurusan = document.getElementById('quizToJurusan');
  let quizIdx = 0;
  let answers = Array(quizData.length).fill(null);
  let lastResultKey = null;
  const QUIZ_KEY = 'panduan-jurusan-quiz';

  function saveQuiz() {
    try { localStorage.setItem(QUIZ_KEY, JSON.stringify({ answers, lastResultKey })); } catch(e){}
  }
  function loadQuiz() {
    try {
      const raw = localStorage.getItem(QUIZ_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (Array.isArray(data.answers) && data.answers.length === quizData.length) {
        answers = data.answers;
        lastResultKey = data.lastResultKey || null;
      }
    } catch(e){}
  }
  loadQuiz();

  function renderQuiz() {
    if (!quizBody) return;
    const q = quizData[quizIdx];
    const selected = answers[quizIdx];
    let html = `<p class="quiz-q-title">${quizIdx + 1}. ${q.title}</p>`;
    html += `<p class="quiz-q-hint">${q.hint}</p>`;
    html += `<div class="quiz-options" role="radiogroup" aria-label="${q.title}">`;
    q.options.forEach((opt, i) => {
      const letter = String.fromCharCode(65 + i);
      const isSel = selected === opt.key;
      html += `<button type="button" class="quiz-option ${isSel ? 'is-selected' : ''}" data-key="${opt.key}" role="radio" aria-checked="${isSel ? 'true' : 'false'}">
        <input type="radio" name="q${quizIdx}" value="${opt.key}" ${isSel ? 'checked' : ''} tabindex="-1" aria-hidden="true">
        <span class="quiz-option-letter">${letter}</span>
        <span class="quiz-option-text"><strong>${opt.label}</strong><span>${opt.sub}</span></span>
      </button>`;
    });
    html += `</div>`;
    quizBody.innerHTML = html;
    quizBody.querySelectorAll('.quiz-option').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-key');
        answers[quizIdx] = key;
        saveQuiz();
        renderQuiz();
        updateQuizNav();
        // auto-next slight delay for UX but not too fast for parents
        if (quizIdx < quizData.length - 1) {
          setTimeout(() => { if (answers[quizIdx]) { quizIdx++; renderQuiz(); updateQuizNav(); } }, 250);
        } else {
          updateQuizNav();
        }
      });
    });
    if (quizStepEl) quizStepEl.textContent = `${quizIdx + 1} dari ${quizData.length}`;
    if (quizBar) quizBar.style.width = `${((quizIdx + 1) / quizData.length) * 100}%`;
    renderFeather();
  }

  function updateQuizNav() {
    if (!quizPrev || !quizNext) return;
    quizPrev.disabled = quizIdx === 0;
    if (quizIdx === quizData.length - 1) {
      quizNext.textContent = 'Lihat Hasil';
      // set icon via feather after? keep text; icon will be replaced if we re-render feather?
      // we keep simple
    } else {
      quizNext.textContent = 'Selanjutnya';
    }
    const hasAnswer = answers[quizIdx] !== null;
    quizNext.disabled = !hasAnswer;
    // if all answered and on last, enable
    if (quizIdx === quizData.length - 1 && hasAnswer) quizNext.disabled = false;
  }

  function computeResult() {
    const counts = { teknologi:0, kesehatan:0, soshum:0, bisnis:0, kreatif:0 };
    answers.forEach((k) => { if (k && counts.hasOwnProperty(k)) counts[k]++; });
    let best = 'teknologi';
    let max = -1;
    Object.entries(counts).forEach(([k,v]) => { if (v > max) { max=v; best=k; } });
    return best;
  }

  function showResult() {
    const key = computeResult();
    lastResultKey = key;
    saveQuiz();
    const meta = resultMeta[key] || resultMeta.teknologi;
    if (quizResultTitle) quizResultTitle.textContent = meta.title;
    if (quizResultDesc) quizResultDesc.textContent = meta.desc;
    if (quizReco) {
      quizReco.innerHTML = meta.reco.map((r) => `
        <div class="quiz-reco-card">
          <span>${r.cat}</span>
          <strong>${r.name}</strong>
          <p>${r.p}</p>
        </div>
      `).join('');
    }
    if (quizToJurusan) {
      quizToJurusan.setAttribute('href', '#jurusan');
      quizToJurusan.dataset.filter = meta.filter;
    }
    if (quizResultEl) {
      quizResultEl.hidden = false;
      quizResultEl.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'nearest' });
    }
    if (quizBody) quizBody.style.display = 'none';
    if (quizPrev) quizPrev.style.display = 'none';
    if (quizNext) quizNext.style.display = 'none';
    renderFeather();
  }

  function resetQuizView() {
    if (quizBody) quizBody.style.display = '';
    if (quizPrev) quizPrev.style.display = '';
    if (quizNext) quizNext.style.display = '';
    if (quizResultEl) quizResultEl.hidden = true;
  }

  if (quizBody && quizPrev && quizNext) {
    renderQuiz();
    updateQuizNav();

    quizPrev.addEventListener('click', () => {
      if (quizIdx > 0) {
        // if result shown, go back to questions
        if (quizResultEl && !quizResultEl.hidden) {
          resetQuizView();
        } else {
          quizIdx--;
          renderQuiz();
          updateQuizNav();
        }
      }
    });
    quizNext.addEventListener('click', () => {
      if (quizIdx < quizData.length - 1) {
        if (!answers[quizIdx]) return;
        quizIdx++;
        renderQuiz();
        updateQuizNav();
      } else {
        if (!answers[quizIdx]) return;
        showResult();
      }
    });

    const quizRetry = document.getElementById('quizRetry');
    if (quizRetry) quizRetry.addEventListener('click', () => {
      answers = Array(quizData.length).fill(null);
      quizIdx = 0;
      lastResultKey = null;
      saveQuiz();
      resetQuizView();
      renderQuiz();
      updateQuizNav();
      document.getElementById('kuis-minat')?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });

    const quizShareWa = document.getElementById('quizShareWa');
    if (quizShareWa) quizShareWa.addEventListener('click', () => {
      const key = lastResultKey || computeResult();
      const meta = resultMeta[key];
      const text = `Hasil Kuis Minat Panduan Jurusan%0A%0AAnak cenderung ke: *${encodeURIComponent(meta.title)}*%0A${encodeURIComponent(meta.desc)}%0A%0ARekomendasi:%0A- ${encodeURIComponent(meta.reco[0].name)}%0A- ${encodeURIComponent(meta.reco[1].name)}%0A%0ADicoba bareng di: ${encodeURIComponent(location.href)}%0A%0AYuk diskusikan bareng anak malam ini.`;
      // Actually we need to decode? Use plain
      const plain = `Hasil Kuis Minat Panduan Jurusan\n\nAnak cenderung ke: ${meta.title}\n${meta.desc}\n\nRekomendasi:\n- ${meta.reco[0].name}\n- ${meta.reco[1].name}\n\nDicoba di: ${location.href}\n\nYuk diskusikan bareng anak malam ini.`;
      const url = `https://wa.me/?text=${encodeURIComponent(plain)}`;
      window.open(url, '_blank', 'noopener');
    });

    if (quizToJurusan) quizToJurusan.addEventListener('click', (e) => {
      const filter = quizToJurusan.dataset.filter || 'semua';
      if (window._setJurusanFilter) window._setJurusanFilter(filter);
      // allow scroll
    });

    // if previously completed, show result immediately? keep quiz interactive but restore idx
    // If answers fully filled and lastResultKey exists, jump to result preview? Don't auto-show to avoid confusion.
  }

  /* =========================================================
     KALKULATOR BIAYA
     ========================================================= */
  const calcUkt = document.getElementById('calcUkt');
  const calcUktRange = document.getElementById('calcUktRange');
  const calcHidup = document.getElementById('calcHidup');
  const calcSemester = document.getElementById('calcSemester');
  const calcBeasiswa = document.getElementById('calcBeasiswa');
  const calcTotal = document.getElementById('calcTotal');
  const calcTotalSub = document.getElementById('calcTotalSub');
  const calcUktTotal = document.getElementById('calcUktTotal');
  const calcHidupTotalEl = document.getElementById('calcHidupTotal');
  const calcPerTahun = document.getElementById('calcPerTahun');
  const calcTip = document.getElementById('calcTip');
  const presets = Array.from(document.querySelectorAll('.preset'));

  function formatRp(n) {
    try {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
    } catch(e) {
      return 'Rp ' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
  }
  function formatShort(n) {
    if (n >= 1_000_000_000) return (n/1_000_000_000).toFixed(n%1_000_000_000===0?0:1) + ' M';
    if (n >= 1_000_000) return (n/1_000_000).toFixed(n%1_000_000===0?0:1) + ' jt';
    if (n >= 1000) return (n/1000).toFixed(0) + ' rb';
    return String(n);
  }

  function updateCalc() {
    if (!calcUkt || !calcHidup || !calcSemester) return;
    let ukt = parseInt(calcUkt.value, 10);
    if (Number.isNaN(ukt) || ukt < 0) ukt = 0;
    let hidup = parseInt(calcHidup.value, 10);
    if (Number.isNaN(hidup) || hidup < 0) hidup = 0;
    const smt = parseInt(calcSemester.value, 10) || 8;
    const beasiswa = calcBeasiswa ? calcBeasiswa.checked : false;
    const uktEff = beasiswa ? Math.round(ukt * 0.5) : ukt;
    const totalUkt = uktEff * smt;
    const totalHidup = hidup * smt * 6; // 6 bulan per semester
    const total = totalUkt + totalHidup;
    const perTahun = smt > 0 ? Math.round(total / (smt/2)) : 0;

    if (calcUktRange && parseInt(calcUktRange.value,10) !== ukt) calcUktRange.value = String(ukt);

    if (calcTotal) calcTotal.textContent = formatRp(total);
    if (calcTotalSub) calcTotalSub.textContent = `Untuk ${smt} semester • ${beasiswa ? 'sudah potong beasiswa 50% UKT' : 'tanpa beasiswa'} • sudah termasuk biaya hidup`;
    if (calcUktTotal) calcUktTotal.textContent = formatRp(totalUkt) + (beasiswa ? ' (50%)' : '');
    if (calcHidupTotalEl) calcHidupTotalEl.textContent = formatRp(totalHidup);
    if (calcPerTahun) calcPerTahun.textContent = formatRp(perTahun);

    if (calcTip) {
      let tip = '';
      if (total > 200_000_000) tip = 'Di atas 200 jt sampai lulus — wajar jika terasa berat. Cek opsi PTN UKT berjenjang, KIP Kuliah, atau kampus dekat rumah untuk tekan biaya hidup.';
      else if (total > 120_000_000) tip = 'Kisaran menengah. Coba bandingkan 2 kampus: satu PTN hemat, satu PTS — lalu lihat selisih per tahunnya.';
      else tip = 'Relatif terjangkau. Sisipkan dana cadangan 10% untuk buku, praktikum, dan skripsi.';
      calcTip.querySelector('p').textContent = 'Tip jujur: ' + tip;
    }
    // save
    try { localStorage.setItem('panduan-jurusan-calc', JSON.stringify({ ukt, hidup, smt, beasiswa })); } catch(e){}
  }

  function loadCalc() {
    try {
      const raw = localStorage.getItem('panduan-jurusan-calc');
      if (!raw) return;
      const d = JSON.parse(raw);
      if (calcUkt && typeof d.ukt === 'number') calcUkt.value = String(d.ukt);
      if (calcUktRange && typeof d.ukt === 'number') calcUktRange.value = String(d.ukt);
      if (calcHidup && typeof d.hidup === 'number') calcHidup.value = String(d.hidup);
      if (calcSemester && d.smt) calcSemester.value = String(d.smt);
      if (calcBeasiswa && typeof d.beasiswa === 'boolean') calcBeasiswa.checked = d.beasiswa;
    } catch(e){}
  }
  loadCalc();
  updateCalc();

  if (calcUkt) calcUkt.addEventListener('input', updateCalc);
  if (calcUktRange) calcUktRange.addEventListener('input', () => { if (calcUkt) calcUkt.value = calcUktRange.value; updateCalc(); });
  if (calcHidup) calcHidup.addEventListener('input', updateCalc);
  if (calcSemester) calcSemester.addEventListener('change', updateCalc);
  if (calcBeasiswa) calcBeasiswa.addEventListener('change', updateCalc);

  presets.forEach((btn) => {
    btn.addEventListener('click', () => {
      presets.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const preset = btn.getAttribute('data-preset');
      let val = 5000000;
      if (preset === 'pts') val = 10000000;
      else if (preset === 'kedokteran') val = 15000000;
      if (calcUkt) calcUkt.value = String(val);
      if (calcUktRange) calcUktRange.value = String(val);
      updateCalc();
    });
  });

  const calcShareWa = document.getElementById('calcShareWa');
  if (calcShareWa) calcShareWa.addEventListener('click', () => {
    const ukt = calcUkt ? formatRp(parseInt(calcUkt.value,10)||0) : '';
    const hidup = calcHidup ? formatRp(parseInt(calcHidup.value,10)||0) : '';
    const smt = calcSemester ? calcSemester.value : '8';
    const total = calcTotal ? calcTotal.textContent : '';
    const beasiswa = calcBeasiswa && calcBeasiswa.checked ? ' (dengan beasiswa 50% UKT)' : '';
    const plain = `Estimasi Biaya Kuliah Panduan Jurusan\n\nUKT: ${ukt} / semester\nBiaya hidup: ${hidup} / bulan\nLama: ${smt} semester${beasiswa}\n\nTotal sampai lulus: ${total}\n\nHitung bareng di: ${location.href}#kalkulator-biaya\n\nBiar obrolan biaya di rumah lebih jelas.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(plain)}`, '_blank', 'noopener');
  });

  /* CTA Akhir share + print */
  const ctaShareWa = document.getElementById('ctaShareWa');
  const ctaPrint = document.getElementById('ctaPrint');
  function buildSummaryText() {
    let parts = ['Ringkasan Panduan Jurusan\n'];
    // quiz (cek kuis 10 soal dulu, fallback ke kuis 4 soal lama)
    try {
      const raw10Res = localStorage.getItem('panduan-jurusan-kuis-10-result');
      if (raw10Res) {
        const d10 = JSON.parse(raw10Res);
        if (d10 && d10.top) {
          const labelMap = { teknologi:'Teknologi', kesehatan:'Kesehatan', soshum:'Soshum', bisnis:'Bisnis', kreatif:'Kreatif' };
          const label = labelMap[d10.top] || d10.top;
          const topScore = d10.list ? (d10.list.find(x=>x.key===d10.top)?.score || '') : '';
          parts.push(`Kuis 10 soal: dominan ${label} ${topScore?`(${topScore}/10)`:''}`);
          if (d10.list) parts.push(`Skor: ${d10.list.map(x=>`${labelMap[x.key]||x.key} ${x.score}/10`).join(', ')}`);
        }
      } else {
        const raw = localStorage.getItem(QUIZ_KEY);
        if (raw) {
          const d = JSON.parse(raw);
          if (d.lastResultKey && resultMeta[d.lastResultKey]) {
            parts.push(`Kuis minat: ${resultMeta[d.lastResultKey].title} — ${resultMeta[d.lastResultKey].desc}`);
            parts.push(`Rekomendasi: ${resultMeta[d.lastResultKey].reco.map(r=>r.name).join(', ')}`);
          }
        }
      }
    } catch(e){}
    // calc
    if (calcTotal) parts.push(`Estimasi biaya sampai lulus: ${calcTotal.textContent} (${calcTotalSub ? calcTotalSub.textContent : ''})`);
    // tips
    const done = tipsChecks.filter(c=>c.checked).length;
    const total = tipsChecks.length;
    parts.push(`Progress tips: ${done}/${total} langkah sudah dibahas`);
    parts.push(`\nLihat panduan lengkap: ${location.href}`);
    parts.push(`\nYuk lanjutkan obrolan 15 menit malam ini.`);
    return parts.join('\n');
  }
  if (ctaShareWa) ctaShareWa.addEventListener('click', () => {
    const plain = buildSummaryText();
    window.open(`https://wa.me/?text=${encodeURIComponent(plain)}`, '_blank', 'noopener');
  });
  if (ctaPrint) ctaPrint.addEventListener('click', () => {
    window.print();
  });

})();
