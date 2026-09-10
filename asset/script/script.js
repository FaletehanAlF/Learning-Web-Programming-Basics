(function () {
  'use strict';

  document.documentElement.classList.add('js');

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

  function testiStep() {
    if (!testiTrack) return 0;
    const card = testiTrack.querySelector('.testi-card');
    if (!card) return testiTrack.clientWidth * 0.8;
    const gap = parseFloat(getComputedStyle(testiTrack).columnGap) || 16;
    return card.offsetWidth + gap;
  }

  function updateTestiButtons() {
    if (!testiTrack || !testiPrev || !testiNext) return;
    const maxScroll = testiTrack.scrollWidth - testiTrack.clientWidth;
    testiPrev.disabled = testiTrack.scrollLeft <= 2;
    testiNext.disabled = testiTrack.scrollLeft >= maxScroll - 2;
  }

  if (testiTrack && testiPrev && testiNext) {
    const behavior = prefersReducedMotion ? 'auto' : 'smooth';

    testiPrev.addEventListener('click', () => {
      testiTrack.scrollBy({ left: -testiStep(), behavior });
    });
    testiNext.addEventListener('click', () => {
      testiTrack.scrollBy({ left: testiStep(), behavior });
    });

    testiTrack.addEventListener('scroll', () => {
      window.requestAnimationFrame(updateTestiButtons);
    }, { passive: true });
    window.addEventListener('resize', updateTestiButtons);

    updateTestiButtons();
  }
})();
