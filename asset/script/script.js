(function () {
  'use strict';

  document.documentElement.classList.add('js');

  // Feather icons: render <i data-feather> jadi SVG. Aman jika CDN gagal.
  function renderFeather() {
    try {
      if (window.feather && typeof window.feather.replace === 'function') {
        window.feather.replace();
      }
    } catch (err) {
      // abaikan — ikon bawaan tetap tampil sebagai fallback
    }
  }
  renderFeather();
  // Coba lagi setelah load penuh (untuk CDN defer yang lambat)
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

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  const sectionIds = ['kenapa', 'jurusan', 'tips', 'testimoni', 'faq'];
  const linkById = new Map();
  navLinks.forEach((link) => {
    const id = link.getAttribute('href').slice(1);
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
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-38% 0px -55% 0px', threshold: 0 }
    );
    sectionIds.forEach((id) => {
      const section = document.getElementById(id);
      if (section) sectionObserver.observe(section);
    });
  }

  if (revealEls.length > 0) {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    } else {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
      );
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
    return Math.min(
      testiCards.length - 1,
      Math.max(0, Math.round(testiTrack.scrollLeft / step))
    );
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

    // Dots: satu titik per kartu, solid tanpa gradient
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

    testiPrev.addEventListener('click', () => {
      testiTrack.scrollBy({ left: -testiStep(), behavior });
    });
    testiNext.addEventListener('click', () => {
      testiTrack.scrollBy({ left: testiStep(), behavior });
    });

    // Keyboard: panah kiri/kanan saat fokus di track
    testiTrack.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        testiTrack.scrollBy({ left: testiStep(), behavior });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        testiTrack.scrollBy({ left: -testiStep(), behavior });
      }
    });

    // Drag / seret untuk slide (mouse + touch)
    let isDown = false;
    let startX = 0;
    let startScroll = 0;
    testiTrack.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      isDown = true;
      startX = e.clientX;
      startScroll = testiTrack.scrollLeft;
      testiTrack.classList.add('is-dragging');
    });
    window.addEventListener('pointermove', (e) => {
      if (!isDown) return;
      testiTrack.scrollLeft = startScroll - (e.clientX - startX);
    });
    window.addEventListener('pointerup', () => {
      if (!isDown) return;
      isDown = false;
      testiTrack.classList.remove('is-dragging');
      updateTestiButtons();
    });
    testiTrack.addEventListener('pointercancel', () => {
      isDown = false;
      testiTrack.classList.remove('is-dragging');
    });

    testiTrack.addEventListener('scroll', () => {
      window.requestAnimationFrame(updateTestiButtons);
    }, { passive: true });
    window.addEventListener('resize', updateTestiButtons);

    updateTestiButtons();
  }

  /* --- Fitur: filter kategori + pencarian jurusan --- */
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

  if (jurusanSearch) {
    jurusanSearch.addEventListener('input', applyJurusanFilter);
  }

  /* --- Fitur: checklist tips + progress tersimpan --- */
  const tipsChecks = Array.from(document.querySelectorAll('[data-tips-check]'));
  const tipsProgressText = document.getElementById('tipsProgressText');
  const tipsProgressBar = document.getElementById('tipsProgressBar');
  const TIPS_KEY = 'panduan-jurusan-tips';

  function loadTips() {
    try {
      const raw = localStorage.getItem(TIPS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function saveTips(done) {
    try {
      localStorage.setItem(TIPS_KEY, JSON.stringify(done));
    } catch (err) {
      // abaikan jika storage tidak tersedia
    }
  }

  function updateTipsProgress() {
    const done = tipsChecks.filter((c) => c.checked).map((c) => c.getAttribute('data-tips-check'));
    const total = tipsChecks.length;
    if (tipsProgressText) tipsProgressText.textContent = `${done.length} dari ${total} langkah dibahas`;
    if (tipsProgressBar) tipsProgressBar.style.width = total > 0 ? `${(done.length / total) * 100}%` : '0%';
    tipsChecks.forEach((c) => {
      const item = c.closest('.tips-item');
      if (item) item.classList.toggle('is-done', c.checked);
    });
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

  /* --- Micro-interactions: count-up, spotlight, tilt tipis --- */

  // Count-up halus untuk angka hero-stats
  const counters = Array.from(document.querySelectorAll('[data-count]'));
  if (counters.length > 0) {
    const animateCount = (el) => {
      const target = parseInt(el.getAttribute('data-count'), 10);
      if (Number.isNaN(target)) return;
      if (prefersReducedMotion) {
        el.textContent = String(target);
        return;
      }
      const dur = 900;
      const start = performance.now();
      const from = 0;
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
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animateCount(e.target);
            cObs.unobserve(e.target);
          }
        });
      }, { threshold: 0.6 });
      counters.forEach((c) => cObs.observe(c));
    } else {
      counters.forEach(animateCount);
    }
  }

  // Tilt tipis hero figure (sangat subtle, solid-friendly)
  if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
    // Tilt tipis hero figure (max ~4deg, sangat subtle)
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
          heroFigure.style.transform =
            `perspective(900px) rotateY(${px * 5}deg) rotateX(${py * -5}deg) translateY(-3px)`;
          rafId = null;
        });
      });
      heroVisual.addEventListener('pointerleave', () => {
        heroFigure.style.transform = '';
      });
    }
  }
})();
