/* Panduan Jurusan — daftar Rekomendasi Kampus (fetch dari data/kampus.json) */
(function () {
  'use strict';

  var API_URL = '../data/kampus.json';
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
    var jenisCls = (String(k.jenis || '').toUpperCase() === 'PTS') ? 'pts' : '';
    var akred = esc(k.akreditasi || '-');
    var desc = esc(k.deskripsi_singkat || '');
    var img = esc(k.gambar || FALLBACK_IMG);
    var cadangan = esc(k.gambar_cadangan || FALLBACK_IMG);
    var rating = Number(k.rating) || 0;
    var ratingTxt = rating ? rating.toFixed(1).replace('.', ',') : '-';
    var jurusan = Array.isArray(k.jurusan_favorit) ? k.jurusan_favorit.slice(0, 2) : [];

    var pills = jurusan.map(function (j) { return '<span class="kampus-pill">' + esc(j) + '</span>'; }).join('');

    return '<a class="kampus-card" href="detail-kampus.html?id=' + id + '" aria-label="Lihat detail ' + nama + '">'
      + '<span class="kampus-card-media">'
      + '<img src="' + img + '" alt="Foto kampus ' + nama + '" loading="lazy" decoding="async" '
      + 'onerror="this.onerror=null;this.src=\'' + cadangan + '\';" />'
      + '<span class="kampus-badge-jenis ' + jenisCls + '">' + jenis + '</span>'
      + '<span class="kampus-rating"><i data-feather="star"></i>' + ratingTxt + '</span>'
      + '</span>'
      + '<span class="kampus-card-body">'
      + '<span class="kampus-loc"><i data-feather="map-pin"></i>' + kota + (prov ? ' • ' + prov : '') + '</span>'
      + '<h3>' + nama + '</h3>'
      + '<p>' + desc + '</p>'
      + '<span class="kampus-meta-row">' + pills + '</span>'
      + '<span class="kampus-card-foot">'
      + '<span class="kampus-cta">Lihat detail <i data-feather="arrow-right"></i></span>'
      + '<span class="kampus-akred">Akreditasi ' + akred + '</span>'
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
    fetch(API_URL, { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status + ' — file data/kampus.json tidak ditemukan.');
        return res.json();
      })
      .then(function (payload) {
        allKampus = normalize(payload).filter(function (k) { return k && k.id && k.nama; });
        if (allKampus.length === 0) throw new Error('Isi data/kampus.json kosong.');
        applyFilter();
      })
      .catch(function (err) {
        var msg = (err && err.message) ? err.message : 'Tidak diketahui.';
        if (String(msg).indexOf('Failed to fetch') > -1 || String(msg).indexOf('Load failed') > -1) {
          msg = 'Fetch diblokir (kemungkinan dibuka via file://). Gunakan Live Server / localhost.';
        }
        showError(msg);
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

  load();
})();
