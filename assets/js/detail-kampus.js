/* Panduan Jurusan — detail kampus (pindah halaman via ?id=, data gabungan data/ptn.json + data/pts.json) */
(function () {
  'use strict';

  var API_URLS = ['../data/ptn.json', '../data/pts.json', '../data/ptln.json'];

  var wrap = document.getElementById('detailWrap');
  var prevBtn = document.getElementById('detailPrev');
  var nextBtn = document.getElementById('detailNext');

  var list = [];
  var currentId = '';

  function getId() {
    try {
      var p = new URLSearchParams(window.location.search);
      return (p.get('id') || '').trim().toLowerCase();
    } catch (e) {
      var m = /[?&]id=([^&]+)/.exec(window.location.search || '');
      return m ? decodeURIComponent(m[1]).trim().toLowerCase() : '';
    }
  }

  function normalize(payload) {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.data)) return payload.data;
    return [];
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function li(icon, text) {
    return '<li><i data-feather="' + icon + '"></i><span>' + esc(text) + '</span></li>';
  }

  function renderFeather() {
    try {
      if (window.feather && typeof window.feather.replace === 'function') window.feather.replace();
    } catch (e) {}
  }

  function showLoading() {
    if (!wrap) return;
    wrap.innerHTML = '<div class="kampus-skeleton" aria-hidden="true"><div class="sk-img"></div>'
      + '<div class="sk-body"><div class="sk-line" style="width:50%"></div>'
      + '<div class="sk-line" style="width:90%"></div><div class="sk-line" style="width:70%"></div></div></div>'
      + '<p class="kampus-count">Memuat detail kampus…</p>';
  }

  function showError(title, desc) {
    if (!wrap) return;
    wrap.innerHTML = '<div class="detail-error">'
      + '<h1 style="font-size:24px;margin:0 0 8px">' + esc(title) + '</h1>'
      + '<p>' + esc(desc) + '</p>'
      + '<p style="margin-top:16px"><a class="btn btn-primary" href="kampus.html">'
      + 'Kembali ke daftar kampus</a></p></div>';
    if (prevBtn) prevBtn.hidden = true;
    if (nextBtn) nextBtn.hidden = true;
    renderFeather();
  }

  function setTitle(k) {
    try {
      document.title = k.nama + ' — Detail Kampus | Panduan Jurusan';
      var meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', k.nama + ' di ' + k.kota + ': ' + (k.deskripsi_singkat || k.tagline || ''));
    } catch (e) {}
  }

  function render(k) {
    setTitle(k);
    var jenisUp = String(k.jenis || '').toUpperCase();
    var jenisCls = jenisUp === 'PTS' ? 'pts' : (jenisUp === 'PTLN' ? 'ptln' : '');
    var akredLabel = jenisUp === 'PTLN' ? 'Peringkat' : 'Akreditasi';
    var biayaLabel = jenisUp === 'PTLN' ? 'Biaya kuliah' : 'UKT / semester';
    var ratingTxt = Number(k.rating) ? Number(k.rating).toFixed(1).replace('.', ',') : '-';
    var img = esc(k.gambar || 'https://picsum.photos/seed/' + esc(k.id) + '/1200/600');
    var cadangan = esc(k.gambar_cadangan || ('https://picsum.photos/seed/' + k.id + '/1200/600'));

    var unggulan = Array.isArray(k.unggulan) ? k.unggulan.map(function (x) { return li('check-circle', x); }).join('') : '';
    var jurusan = Array.isArray(k.jurusan_favorit)
      ? k.jurusan_favorit.map(function (x) { return '<span class="kampus-pill">' + esc(x) + '</span>'; }).join('') : '';
    var jalur = Array.isArray(k.jalur_masuk)
      ? k.jalur_masuk.map(function (x) { return '<span class="kampus-pill">' + esc(x) + '</span>'; }).join('') : '';
    var beasiswa = Array.isArray(k.beasiswa) ? k.beasiswa.map(function (x) { return li('award', x); }).join('') : '';
    var prestasi = Array.isArray(k.prestasi_snbp) ? k.prestasi_snbp.map(function (x) { return li('award', x); }).join('') : '';
    var tentang1 = k.tentang_kampus || k.deskripsi_panjang || k.deskripsi_singkat || '';
    var tentang2 = (k.tentang_kampus && k.deskripsi_panjang) ? k.deskripsi_panjang : '';
    var isPTS = jenisUp === 'PTS';
    var isPTLN = jenisUp === 'PTLN';
    var skorJudul = isPTLN ? 'Syarat masuk & prestasi global' : (isPTS ? 'Jalur masuk & beasiswa prestasi' : 'Skor UTBK & syarat SNBP');
    var skorIkon = isPTLN ? 'globe' : (isPTS ? 'log-in' : 'target');
    var skorLabel = isPTLN ? 'Skor masuk minimal (estimasi aman)' : 'Skor UTBK minimal (estimasi aman)';
    var skorNote = isPTLN
      ? 'Tiap kampus punya portal admissions sendiri (link website resmi di bawah) — skor di atas estimasi aman dari profil mahasiswa diterima tahun sebelumnya, bukan syarat resmi. Cek deadline, dokumen & biaya terbaru di website resmi karena berubah tiap tahun.'
      : (isPTS
      ? 'PTS tidak memakai UTBK sebagai syarat wajib — seleksi lewat rapor/tes mandiri kampus. Prestasi di bawah ini berguna untuk merebut beasiswa masuk.'
      : 'Skor di atas adalah ESTIMASI aman dari pola tahun sebelumnya — SNPMB tidak pernah merilis passing grade resmi. Syarat SNBP: nilai rapor 5 semester + maks. 3 sertifikat prestasi terbaik. Selalu verifikasi syarat terbaru di website resmi kampus & portal SNPMB.');
    var fasilitas = Array.isArray(k.fasilitas) ? k.fasilitas.map(function (x) { return li('check', x); }).join('') : '';
    var mapsUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent((k.nama || '') + ' ' + (k.kota || ''));
    var shareText = 'Info kampus ' + (k.nama || '') + ' (' + (k.kota || '') + ') — ' + (k.deskripsi_singkat || '')
      + ' | UKT: ' + (k.ukt_per_semester || '-') + ' | Lihat detail: ' + window.location.href;

    wrap.innerHTML =
      '<nav class="crumbs" aria-label="Breadcrumb">'
      + '<a href="../index.html">Beranda</a><span aria-hidden="true">/</span>'
      + '<a href="kampus.html">Rekomendasi Kampus</a><span aria-hidden="true">/</span>'
      + '<span aria-current="page">' + esc(k.singkatan || k.nama) + '</span></nav>'

      + '<div class="detail-hero-media"><img src="' + img + '" alt="Foto kampus ' + esc(k.nama) + '" fetchpriority="high" decoding="async" '
      + 'onerror="this.onerror=null;this.src=\'' + cadangan + '\';" /></div>'

      + '<div class="detail-title-wrap"><h1>' + esc(k.nama) + '</h1></div>'
      + '<p class="detail-tagline">' + esc(k.tagline || k.deskripsi_singkat || '') + '</p>'
      + '<div class="detail-badges">'
      + '<span class="kampus-badge-jenis ' + jenisCls + '" style="position:static">' + esc(k.jenis || 'PTN') + '</span>'
      + '<span class="kampus-pill">' + akredLabel + ' ' + esc(k.akreditasi || '-') + '</span>'
      + '<span class="kampus-pill">★ ' + esc(ratingTxt) + ' / 5</span>'
      + '<span class="kampus-pill">' + esc(k.jumlah_mahasiswa || '') + ' mahasiswa</span>'
      + '</div>'

      + '<div class="detail-stats">'
      + '<div class="detail-stat"><small><i data-feather="map-pin"></i>Lokasi</small><strong>' + esc(k.kota || '-') + ', ' + esc(k.provinsi || '') + '</strong></div>'
      + '<div class="detail-stat"><small><i data-feather="dollar-sign"></i>' + biayaLabel + '</small><strong>' + esc(k.ukt_per_semester || '-') + '</strong></div>'
      + '<div class="detail-stat"><small><i data-feather="home"></i>Biaya hidup</small><strong>' + esc(k.biaya_hidup_per_bulan || '-') + '</strong></div>'
      + '<div class="detail-stat"><small><i data-feather="clipboard"></i>Jalur masuk</small><strong>' + esc((k.jalur_masuk || []).join(' • ') || '-') + '</strong></div>'
      + '</div>'

      + '<div class="detail-layout"><div class="detail-side" style="gap:18px">'
      + '<article class="detail-panel"><h2><i data-feather="info"></i>Tentang ' + esc(k.singkatan || k.nama) + '</h2>'
      + '<p>' + esc(tentang1) + '</p>'
      + (tentang2 ? '<p>' + esc(tentang2) + '</p>' : '') + '</article>'
      + '<article class="detail-panel"><h2><i data-feather="' + skorIkon + '"></i>' + esc(skorJudul) + '</h2>'
      + '<div class="detail-skor"><span class="detail-skor-label">' + esc(skorLabel) + '</span><strong>' + esc(k.skor_utbk_minimal || '-') + '</strong></div>'
      + '<ul class="detail-list">' + prestasi + '</ul>'
      + '<p class="detail-note"><i data-feather="info"></i><span>' + esc(skorNote) + '</span></p></article>'
      + '<article class="detail-panel"><h2><i data-feather="star"></i>Keunggulan</h2><ul class="detail-list">' + unggulan + '</ul></article>'
      + '<article class="detail-panel"><h2><i data-feather="briefcase"></i>Prospek karier lulusan</h2><p>' + esc(k.prospek_karier || '-') + '</p></article>'
      + '</div>'

      + '<aside class="detail-side">'
      + '<div class="detail-panel"><h2><i data-feather="layout"></i>Jurusan favorit</h2><div class="detail-chips">' + jurusan + '</div>'
      + '<h2 style="margin-top:16px"><i data-feather="log-in"></i>Jalur masuk</h2><div class="detail-chips">' + jalur + '</div></div>'
      + '<div class="detail-panel"><h2><i data-feather="award"></i>Beasiswa</h2><ul class="detail-list">' + beasiswa + '</ul></div>'
      + '<div class="detail-panel"><h2><i data-feather="home"></i>Fasilitas</h2><ul class="detail-list">' + fasilitas + '</ul></div>'
      + '<div class="detail-panel"><h2><i data-feather="phone"></i>Kontak & lokasi</h2><div class="detail-contact">'
      + '<span><strong>Alamat:</strong> ' + esc(k.alamat || '-') + '</span>'
      + '<span><strong>Telepon:</strong> ' + esc(k.telepon || '-') + '</span>'
      + '<span><strong>Website:</strong> <a href="' + esc(k.website || '#') + '" target="_blank" rel="noopener noreferrer">' + esc(k.website || '-') + '</a></span>'
      + '</div>'
      + '<div class="detail-cta" style="margin-top:14px">'
      + '<a class="btn btn-primary" href="' + esc(k.website || '#') + '" target="_blank" rel="noopener noreferrer"><i data-feather="external-link"></i> Buka website resmi</a>'
      + '<a class="btn btn-outline" href="' + mapsUrl + '" target="_blank" rel="noopener noreferrer"><i data-feather="map-pin"></i> Lihat di Google Maps</a>'
      + '<button class="btn btn-outline" id="detailShare" type="button"><i data-feather="share-2"></i> Bagikan ke WhatsApp</button>'
      + '</div></div>'
      + '</aside></div>'

      + '<div class="detail-nav">'
      + '<a class="btn btn-outline" href="kampus.html"><i data-feather="arrow-left"></i> Semua kampus</a>'
      + '<a class="btn btn-outline" href="../index.html#kalkulator-biaya"><i data-feather="dollar-sign"></i> Hitung biaya kuliah</a>'
      + '</div>';

    renderFeather();

    var shareBtn = document.getElementById('detailShare');
    if (shareBtn) {
      shareBtn.addEventListener('click', function () {
        window.open('https://wa.me/?text=' + encodeURIComponent(shareText), '_blank', 'noopener');
      });
    }
  }

  function renderPrevNext() {
    if (!list.length || !currentId) return;
    var idx = -1;
    for (var i = 0; i < list.length; i++) {
      if (String(list[i].id).toLowerCase() === currentId) { idx = i; break; }
    }
    if (idx < 0) return;
    var prev = list[(idx - 1 + list.length) % list.length];
    var next = list[(idx + 1) % list.length];
    if (prevBtn && prev) {
      prevBtn.hidden = false;
      prevBtn.href = 'detail-kampus.html?id=' + encodeURIComponent(prev.id);
      prevBtn.querySelector('span').textContent = prev.singkatan || prev.nama;
    }
    if (nextBtn && next) {
      nextBtn.hidden = false;
      nextBtn.href = 'detail-kampus.html?id=' + encodeURIComponent(next.id);
      nextBtn.querySelector('span').textContent = next.singkatan || next.nama;
    }
    renderFeather();
  }

  function load() {
    if (!wrap) return;
    currentId = getId();
    if (!currentId) {
      showError('ID kampus tidak ada', 'Link tidak menyertakan ?id=. Silakan pilih kampus dari daftar.');
      return;
    }
    showLoading();
    Promise.all(API_URLS.map(function (url) {
      return fetch(url, { cache: 'no-store' })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .then(normalize)
        .catch(function () { return []; });
    })).then(function (parts) {
        list = parts.reduce(function (acc, arr) { return acc.concat(arr); }, []);
        var found = null;
        for (var i = 0; i < list.length; i++) {
          if (list[i] && String(list[i].id).toLowerCase() === currentId) { found = list[i]; break; }
        }
        if (!found) {
          showError('Kampus tidak ditemukan', 'ID "' + currentId + '" tidak ada di data/ptn.json, data/pts.json & data/ptln.json. Periksa kembali id-nya.');
          return;
        }
        render(found);
        renderPrevNext();
      })
      .catch(function () {
        showError('Gagal memuat data', 'File data/ptn.json, data/pts.json & data/ptln.json tidak bisa dibaca. Jalankan lewat local server (Live Server), bukan double-click file.');
      });
  }

  load();
})();
