/* Panduan Jurusan — daftar Rekomendasi Kampus (fetch gabungan data/ptn.json + data/pts.json) */
(function () {
  'use strict';

  var API_URLS = ['../data/ptn.json', '../data/pts.json', '../data/ptln.json'];
  var FALLBACK_IMG = 'https://picsum.photos/seed/kampus/800/600';

  var grid = document.getElementById('kampusGrid');
  var searchInput = document.getElementById('kampusSearch');
  var countEl = document.getElementById('kampusCount');
  var emptyEl = document.getElementById('kampusEmpty');
  var chips = Array.prototype.slice.call(document.querySelectorAll('#kampusChips .chip'));

  var allKampus = [];
  var activeFilter = 'semua';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function showSkeleton() {
    if (!grid) return;
    var html = '';
    for (var i = 0; i < 6; i++) {
      html += '<div class="kampus-skeleton" aria-hidden="true">'
        + '<div class="sk-img"></div>'
        + '<div class="sk-body"><div class="sk-line" style="width:60%"></div>'
        + '<div class="sk-line" style="width:90%"></div>'
        + '<div class="sk-line" style="width:40%"></div></div></div>';
    }
    grid.innerHTML = html;
  }

  function showError(msg) {
    if (!grid) return;
    grid.innerHTML = '';
    if (emptyEl) {
      emptyEl.hidden = false;
      emptyEl.innerHTML = '<strong>Gagal memuat data kampus.</strong><br>' + esc(msg)
        + '<br><small>Jalankan lewat local server (mis. Live Server VS Code), bukan double-click file. Lalu refresh.</small>';
    }
    if (countEl) countEl.textContent = 'Menampilkan 0 dari 0 kampus';
    renderFeather();
  }

  function cardHTML(k) {
    var id = esc(k.id || '');
    var nama = esc(k.nama || 'Kampus');
    var kota = esc(k.kota || '');
    var prov = esc(k.provinsi || '');
    var jenis = esc(k.jenis || 'PTN');
    var jenisCls = (function () {
      var j = String(k.jenis || '').toUpperCase();
      if (j === 'PTS') return 'pts';
      if (j === 'PTLN') return 'ptln';
      return '';
    })();
    var akredLabel = String(k.jenis || '').toUpperCase() === 'PTLN' ? 'Peringkat' : 'Akreditasi';
    var akred = esc(k.akreditasi || '-');
    var desc = esc(k.deskripsi_singkat || '');
    var img = esc(k.gambar || FALLBACK_IMG);
    var cadangan = esc(k.gambar_cadangan || FALLBACK_IMG);
    var rating = Number(k.rating) || 0;
    var dec = (window.__LANG === 'en') ? '.' : ',';
    var ratingTxt = rating ? rating.toFixed(1).replace('.', dec) : '-';
    var jurusan = Array.isArray(k.jurusan_favorit) ? k.jurusan_favorit.slice(0, 2) : [];

    var pills = jurusan.map(function (j) { return '<span class="kampus-pill">' + esc(j) + '</span>'; }).join('');
    // Logo kustom per kampus (ganti via field "logo" di data/*.json) — tampil kanan-bawah foto
    var logo = esc(k.logo || '');
    var logoCad = esc(k.logo_cadangan || FALLBACK_IMG);
    var singkatan = esc(k.singkatan || k.nama || 'K');
    var inisial = esc(String(k.singkatan || k.nama || 'K').trim().slice(0, 3).toUpperCase());
    var logoHTML = logo
      ? '<img class="kampus-logo" src="' + logo + '" alt="Logo ' + nama + '" loading="lazy" decoding="async" '
        + 'onerror="this.onerror=null;this.src=\'' + logoCad + '\';this.onerror=function(){this.outerHTML=\'<span class=&quot;kampus-logo kampus-logo-fallback&quot; aria-hidden=&quot;true&quot;>' + inisial + '</span>\';};" />'
      : '<span class="kampus-logo kampus-logo-fallback" aria-hidden="true">' + inisial + '</span>';

    return '<a class="kampus-card" href="detail-kampus.html?id=' + id + '" aria-label="Lihat detail ' + nama + '">'
      + '<span class="kampus-card-media">'
      + '<img src="' + img + '" alt="Foto kampus ' + nama + '" loading="lazy" decoding="async" '
      + 'onerror="this.onerror=null;this.src=\'' + cadangan + '\';" />'
      + '<span class="kampus-badge-jenis ' + jenisCls + '">' + jenis + '</span>'
      + '<span class="kampus-rating"><i data-feather="star"></i>' + ratingTxt + '</span>'
      + logoHTML
      + '</span>'
      + '<span class="kampus-card-body">'
      + '<span class="kampus-loc"><i data-feather="map-pin"></i>' + kota + (prov ? ' • ' + prov : '') + '</span>'
      + '<h3>' + nama + '</h3>'
      + '<p>' + desc + '</p>'
      + '<span class="kampus-meta-row">' + pills + '</span>'
      + '<span class="kampus-card-foot">'
      + '<span class="kampus-cta">Lihat detail <i data-feather="arrow-right"></i></span>'
      + '<span class="kampus-akred">' + akredLabel + ' ' + akred + '</span>'
      + '</span>'
      + '</span>'
      + '</a>';
  }

  function applyFilter() {
    if (!grid) return;
    var q = searchInput && searchInput.value ? searchInput.value.trim().toLowerCase() : '';
    var shown = 0;
    var html = '';

    allKampus.forEach(function (k) {
      var jenis = String(k.jenis || '').toLowerCase();
      var hay = [k.nama, k.singkatan, k.kota, k.provinsi, k.jenis]
        .concat(Array.isArray(k.jurusan_favorit) ? k.jurusan_favorit : [])
        .join(' ').toLowerCase();
      var matchJenis = activeFilter === 'semua' || jenis === activeFilter;
      var matchQ = !q || hay.indexOf(q) > -1;
      if (matchJenis && matchQ) {
        html += cardHTML(k);
        shown += 1;
      }
    });

    grid.innerHTML = html;
    if (emptyEl) emptyEl.hidden = shown !== 0;
    if (countEl) countEl.textContent = 'Menampilkan ' + shown + ' dari ' + allKampus.length + ' kampus';
    renderFeather();
  }

  function renderFeather() {
    try {
      if (window.feather && typeof window.feather.replace === 'function') window.feather.replace();
    } catch (e) {}
  }

  function normalize(payload) {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.data)) return payload.data;
    return [];
  }

  function load() {
    if (!grid) return;
    showSkeleton();
    Promise.all(API_URLS.map(function (url) {
      return fetch(url, { cache: 'no-store' })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status + ' — ' + url);
          return res.json();
        })
        .then(normalize)
        .catch(function () { return []; });
    })).then(function (parts) {
      allKampus = parts
        .reduce(function (acc, arr) { return acc.concat(arr); }, [])
        .filter(function (k) { return k && k.id && k.nama; });
      if (allKampus.length === 0) {
        showError('Ketiga file API (data/ptn.json, data/pts.json & data/ptln.json) tidak terbaca atau kosong.');
        return;
      }
      applyFilter();
    }).catch(function () {
      showError('Gagal terhubung ke file API. Gunakan Live Server / localhost, bukan double-click file.');
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('is-active'); });
      chip.classList.add('is-active');
      activeFilter = String(chip.getAttribute('data-filter') || 'semua').toLowerCase();
      applyFilter();
    });
  });
  if (searchInput) searchInput.addEventListener('input', applyFilter);

  try {
    window.addEventListener('pj:lang', function () { applyFilter(); });
  } catch (e) {}

  load();
})();
