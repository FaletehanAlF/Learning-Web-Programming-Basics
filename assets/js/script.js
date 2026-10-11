'use strict';

/* ==========================================================
   1. DATA
   Konten artikel disimpan sebagai blok (h = heading, p = paragraf,
   code = kode). Blok dirender dengan textContent, bukan innerHTML,
   sehingga aman dari injeksi HTML.
   ========================================================== */
const CATEGORIES = ['Web Development', 'Frontend Development', 'Backend Development', 'Programming Fundamentals', 'Software Engineering', 'Database', 'Developer Tools', 'Web Accessibility', 'Security dan Performance'];
const AUTHOR = 'DevScope Editorial';
const PUBLISHED = '2026-10-11';

const ARTICLES = [
  { id: 'semantic-html', title: 'Semantic HTML: Lebih dari Sekadar Tag', category: 'Web Development',
    summary: 'Memilih elemen HTML berdasarkan makna isi, agar browser, mesin pencari, dan screen reader memahami halamanmu.',
    blocks: [
      ['p', 'Semantic HTML berarti memilih elemen berdasarkan makna isi, bukan tampilannya. Browser, mesin pencari, dan screen reader memakai makna itu untuk memahami halaman.'],
      ['h', 'Satu tujuan, satu elemen'],
      ['p', 'Navigasi memakai nav dan link, aksi memakai button, dan isi utama dibungkus main. Elemen div tetap berguna, tetapi hanya ketika tidak ada elemen yang lebih tepat.'],
      ['code', '<button type="button">Simpan</button>\n<!-- bukan: <div class="btn">Simpan</div> -->'],
      ['h', 'Manfaat yang langsung terasa'],
      ['p', 'Button otomatis bisa difokuskan dan ditekan dengan Enter atau Spasi. Pada div, perilaku itu harus dibuat sendiri dengan JavaScript dan atribut ARIA.']] },
  { id: 'dom-event-handling', title: 'Memahami DOM dan Event Handling', category: 'Frontend Development',
    summary: 'Cara JavaScript membaca halaman sebagai pohon objek dan bereaksi terhadap klik atau ketikan pengguna.',
    blocks: [
      ['p', 'DOM adalah representasi halaman sebagai pohon objek yang dapat dibaca dan diubah JavaScript. Event handling memungkinkan kode bereaksi terhadap tindakan pengguna seperti klik atau mengetik.'],
      ['h', 'Mendengarkan event'],
      ['code', "const tombol = document.querySelector('#simpan');\ntombol.addEventListener('click', () => {\n  console.log('Tombol diklik');\n});"],
      ['h', 'Event delegation'],
      ['p', 'Daripada memasang listener di setiap item daftar, pasang satu listener di induknya lalu periksa event.target. Cara ini hemat memori dan tetap bekerja untuk item yang ditambahkan kemudian.'],
      ['code', "daftar.addEventListener('click', (event) => {\n  const item = event.target.closest('li');\n  if (item) console.log(item.dataset.id);\n});"]] },
  { id: 'rest-api', title: 'Cara Kerja REST API', category: 'Backend Development',
    summary: 'Server menyediakan data lewat URL dan metode HTTP. Pelajari resource, metode, dan kode status.',
    blocks: [
      ['p', 'REST API adalah cara server menyediakan data lewat URL dan metode HTTP. Client mengirim request, server membalas dengan response berisi status dan data, umumnya berformat JSON.'],
      ['h', 'Resource dan metode'],
      ['p', 'URL menamai resource, misalnya /articles/12. Metode menyatakan tindakan: GET membaca, POST membuat, PUT atau PATCH mengubah, dan DELETE menghapus.'],
      ['code', 'GET /articles/12 HTTP/1.1\nHost: contoh.com\n\nHTTP/1.1 200 OK\nContent-Type: application/json'],
      ['h', 'Kode status'],
      ['p', '200 berarti berhasil, 404 berarti resource tidak ditemukan, dan 500 berarti server mengalami kesalahan. Status yang tepat membantu client menangani hasil dengan benar.']] },
  { id: 'clean-code', title: 'Prinsip Clean Code untuk Pemula', category: 'Programming Fundamentals',
    summary: 'Kebiasaan kecil agar kodemu mudah dibaca orang lain, termasuk dirimu sendiri di masa depan.',
    blocks: [
      ['p', 'Kode bersih adalah kode yang mudah dibaca orang lain, termasuk dirimu enam bulan lagi. Mulailah dari kebiasaan kecil.'],
      ['h', 'Beri nama yang menjelaskan'],
      ['code', '// Kurang jelas\nconst d = 7;\n// Lebih jelas\nconst masaBerlakuHari = 7;'],
      ['h', 'Satu fungsi, satu tugas'],
      ['p', 'Fungsi yang melakukan satu hal lebih mudah dites, dipakai ulang, dan diperbaiki. Jika sulit memberi nama fungsi tanpa kata "dan", mungkin fungsi itu sebaiknya dipecah.']] },
  { id: 'validasi-frontend-backend', title: 'Validasi Frontend vs Backend', category: 'Software Engineering',
    summary: 'Mengapa memeriksa input di browser saja tidak cukup, dan bagaimana membagi tugas keduanya.',
    blocks: [
      ['p', 'Validasi frontend membantu pengguna memperbaiki input dengan cepat. Validasi backend memastikan data yang masuk ke sistem benar-benar aman dan sesuai aturan.'],
      ['h', 'Mengapa keduanya diperlukan'],
      ['p', 'Kode di browser bisa diubah atau dilewati, misalnya dengan mengirim request langsung ke server. Karena itu, frontend tidak boleh menjadi satu-satunya penjaga. Frontend memberi kenyamanan, backend memberi kepastian.'],
      ['h', 'Contoh pembagian tugas'],
      ['code', '<input type="email" required>\n<!-- Browser memeriksa format. Server tetap harus memeriksa ulang. -->']] },
  { id: 'relational-database', title: 'Memahami Relational Database', category: 'Database',
    summary: 'Tabel, baris, kolom, dan kunci: dasar menyimpan data yang saling berhubungan.',
    blocks: [
      ['p', 'Relational database menyimpan data dalam tabel yang terdiri dari baris dan kolom. Tabel dihubungkan lewat kunci agar data tidak perlu diulang.'],
      ['h', 'Primary key dan foreign key'],
      ['p', 'Primary key mengidentifikasi satu baris secara unik. Foreign key menunjuk ke primary key tabel lain, sehingga satu penulis dapat memiliki banyak artikel.'],
      ['code', "SELECT a.judul, p.nama\nFROM artikel a\nJOIN penulis p ON p.id = a.penulis_id\nWHERE p.nama = 'Dina';"],
      ['p', 'JOIN menggabungkan baris dari dua tabel berdasarkan kolom yang saling berhubungan.']] },
  { id: 'git-branching', title: 'Dasar Git Branching untuk Developer', category: 'Developer Tools',
    summary: 'Bekerja di jalur terpisah agar eksperimen fitur tidak mengganggu kode utama.',
    blocks: [
      ['p', 'Branch adalah jalur kerja terpisah dalam repositori Git. Kamu dapat mencoba fitur baru tanpa mengganggu kode utama.'],
      ['h', 'Alur dasar'],
      ['code', 'git switch -c fitur-pencarian\ngit add .\ngit commit -m "Tambah fitur pencarian"\ngit switch main\ngit merge fitur-pencarian'],
      ['p', 'Perintah pertama membuat dan berpindah ke branch baru. Setelah fitur selesai dan diuji, branch digabungkan kembali ke main dengan merge.'],
      ['h', 'Kebiasaan yang membantu'],
      ['p', 'Gunakan nama branch yang menjelaskan tujuan, buat commit kecil dengan pesan jelas, dan perbarui branch dari main sebelum menggabungkan.']] },
  { id: 'dasar-accessibility', title: 'Dasar Web Accessibility', category: 'Web Accessibility',
    summary: 'Praktik dasar agar situs dapat dipakai pengguna keyboard dan screen reader.',
    blocks: [
      ['p', 'Web accessibility memastikan situs dapat digunakan oleh orang dengan beragam kemampuan, termasuk pengguna keyboard dan screen reader.'],
      ['h', 'Praktik dasar'],
      ['p', 'Gunakan heading yang berurutan, label pada setiap input, teks alternatif pada gambar yang bermakna, dan kontras warna yang cukup. Pastikan semua fitur dapat dioperasikan dengan keyboard dan fokusnya terlihat.'],
      ['code', '<label for="cari">Cari artikel</label>\n<input id="cari" type="search">'],
      ['p', 'Cobalah menavigasi situsmu hanya dengan tombol Tab. Jika ada bagian yang tidak terjangkau, itu hambatan nyata.']] },
  { id: 'authn-authz', title: 'Authentication vs Authorization', category: 'Security dan Performance',
    summary: 'Membedakan "siapa kamu" dan "apa yang boleh kamu lakukan" dalam aplikasi web.',
    blocks: [
      ['p', 'Authentication menjawab "siapa kamu?", sedangkan authorization menjawab "apa yang boleh kamu lakukan?". Keduanya berbeda dan harus dibangun terpisah.'],
      ['h', 'Contoh'],
      ['p', 'Login dengan email dan kata sandi adalah authentication. Aturan bahwa hanya admin yang boleh menghapus artikel adalah authorization.'],
      ['h', 'Kesalahan umum'],
      ['p', 'Menganggap pengguna yang sudah login otomatis boleh mengakses semuanya. Server harus memeriksa hak akses pada setiap request, bukan hanya menyembunyikan tombol di tampilan.']] }
];
const FEATURED_ID = 'semantic-html';

/* ==========================================================
   2. STATE & UTILITAS
   ========================================================== */
const state = { query: '', category: 'Semua' };
const $ = (id) => document.getElementById(id);
const WORDS_PER_MINUTE = 200;

function createEl(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function articleText(a) {
  return a.blocks.map((b) => b[1]).join(' ');
}
function readingMinutes(a) {
  return Math.max(1, Math.ceil(articleText(a).split(/\s+/).length / WORDS_PER_MINUTE));
}
function formatDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}
function findArticle(id) {
  return ARTICLES.find((a) => a.id === id);
}
function articleUrl(id) {
  return '?article=' + encodeURIComponent(id);
}
let toastTimer;
function announce(message) {
  const toast = $('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
}

/* ==========================================================
   3. PENYIMPANAN (tema & bookmark) dengan penanganan error
   ========================================================== */
function readStorage(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function writeStorage(key, value) {
  try { localStorage.setItem(key, value); } catch { /* penyimpanan tidak tersedia */ }
}
function loadBookmarks() {
  try {
    const data = JSON.parse(readStorage('devscope-bookmarks'));
    return Array.isArray(data) ? data.filter((id) => findArticle(id)) : [];
  } catch { return []; }
}
let bookmarks = loadBookmarks();

function toggleBookmark(id) {
  const saved = bookmarks.includes(id);
  bookmarks = saved ? bookmarks.filter((b) => b !== id) : [...bookmarks, id];
  writeStorage('devscope-bookmarks', JSON.stringify(bookmarks));
  syncBookmarkButtons();
  renderBookmarks();
  announce(saved ? 'Dihapus dari tersimpan' : 'Disimpan');
}
/* Perbarui semua tombol di tempat agar fokus keyboard tidak hilang. */
function syncBookmarkButtons() {
  document.querySelectorAll('[data-bookmark]').forEach((btn) => {
    const saved = bookmarks.includes(btn.dataset.bookmark);
    btn.setAttribute('aria-pressed', String(saved));
    btn.textContent = saved ? 'Tersimpan' : 'Simpan';
  });
}

/* ==========================================================
   4. TEMA
   ========================================================== */
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $('theme-btn').textContent = theme === 'dark' ? 'Mode terang' : 'Mode gelap';
  $('theme-btn').setAttribute('aria-label', theme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap');
}
function initTheme() {
  const saved = readStorage('devscope-theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved || (systemDark ? 'dark' : 'light'));
}

/* ==========================================================
   5. RENDER
   ========================================================== */
function metaLine(a) {
  const meta = createEl('p', 'meta');
  meta.append(createEl('span', 'cat', a.category));
  const time = createEl('time', '', formatDate(PUBLISHED));
  time.dateTime = PUBLISHED;
  meta.append(time, createEl('span', '', readingMinutes(a) + ' menit baca'));
  return meta;
}
function bookmarkButton(id) {
  const btn = createEl('button', 'btn bm-btn');
  btn.type = 'button';
  btn.dataset.bookmark = id;
  return btn;
}
function titleLink(tag, a) {
  const heading = createEl(tag);
  const link = createEl('a', '', a.title);
  link.href = articleUrl(a.id);
  heading.append(link);
  return heading;
}
function renderFeatured() {
  const a = findArticle(FEATURED_ID);
  const box = $('featured');
  box.replaceChildren(metaLine(a), titleLink('h3', a), createEl('p', 'summary', a.summary));
  const actions = createEl('div', 'row-actions');
  const open = createEl('a', 'btn btn-primary', 'Baca artikel');
  open.href = articleUrl(a.id);
  actions.append(open, bookmarkButton(a.id));
  box.append(actions);
}
function articleItem(a) {
  const li = createEl('li');
  const text = createEl('div');
  text.append(titleLink('h3', a), createEl('p', '', a.summary), metaLine(a));
  li.append(text, bookmarkButton(a.id));
  return li;
}
function matchesQuery(a, query) {
  if (!query) return true;
  return [a.title, a.summary, a.category, articleText(a)].join(' ').toLowerCase().includes(query);
}
function getFilteredArticles() {
  const query = state.query.trim().toLowerCase();
  return ARTICLES.filter((a) => (state.category === 'Semua' || a.category === state.category) && matchesQuery(a, query));
}
function renderList() {
  const results = getFilteredArticles();
  const list = $('list');
  list.replaceChildren(...results.map(articleItem));
  $('status').textContent = results.length
    ? results.length + ' artikel ditemukan.'
    : 'Tidak ada artikel yang cocok. Ubah kata kunci atau pilih kategori "Semua".';
  syncBookmarkButtons();
}
function renderCategories() {
  const box = $('categories');
  const names = ['Semua', ...CATEGORIES];
  box.replaceChildren(...names.map((name) => {
    const count = name === 'Semua' ? ARTICLES.length : ARTICLES.filter((a) => a.category === name).length;
    const btn = createEl('button', 'cat-btn');
    btn.type = 'button';
    btn.dataset.category = name;
    btn.setAttribute('aria-pressed', String(state.category === name));
    btn.append(createEl('span', '', name), createEl('span', '', String(count)));
    return btn;
  }));
}
function renderBookmarks() {
  const list = $('bookmarks');
  const saved = bookmarks.map(findArticle).filter(Boolean);
  if (!saved.length) {
    const li = createEl('li', 'empty', 'Belum ada artikel tersimpan. Tekan "Simpan" pada artikel untuk menambahkannya di sini.');
    list.replaceChildren(li);
    return;
  }
  list.replaceChildren(...saved.map(articleItem));
  syncBookmarkButtons();
}

/* ---------- Halaman artikel ---------- */
function renderBlock(block) {
  const [type, text] = block;
  if (type === 'h') return createEl('h2', '', text);
  if (type === 'p') return createEl('p', '', text);
  const wrap = createEl('div', 'code-block');
  const pre = createEl('pre');
  pre.tabIndex = 0;
  pre.append(createEl('code', '', text));
  const copy = createEl('button', 'copy-btn', 'Salin kode');
  copy.type = 'button';
  copy.dataset.copy = text;
  wrap.append(copy, pre);
  return wrap;
}
function renderToc(headings) {
  const nav = createEl('nav', 'toc');
  nav.setAttribute('aria-label', 'Daftar isi');
  nav.append(createEl('strong', '', 'Daftar isi'));
  const ul = createEl('ul');
  headings.forEach((h) => {
    const a = createEl('a', '', h.textContent);
    a.href = '#' + h.id;
    ul.append(createEl('li')).appendChild(a);
  });
  nav.append(ul);
  return nav;
}
function renderArticleView(a) {
  const view = $('view-article');
  const back = createEl('a', 'btn', 'Kembali ke daftar artikel');
  back.href = './#artikel';
  const article = createEl('article');
  const head = createEl('header', 'article-head');
  const h1 = createEl('h1', '', a.title);
  h1.tabIndex = -1;
  h1.id = 'article-title';
  head.append(metaLine(a), h1, createEl('p', 'meta', 'Oleh ' + AUTHOR));
  const actions = createEl('div', 'row-actions');
  actions.append(bookmarkButton(a.id));
  head.append(actions);
  const body = createEl('div', 'article-body');
  body.append(...a.blocks.map(renderBlock));
  const headings = [...body.querySelectorAll('h2')];
  headings.forEach((h, i) => { h.id = 'bagian-' + (i + 1); });
  article.append(head, renderToc(headings), body);

  const related = ARTICLES.filter((r) => r.id !== a.id).slice(0, 3);
  const aside = createEl('aside', 'related');
  aside.setAttribute('aria-labelledby', 'related-title');
  const rh = createEl('h2', '', 'Baca selanjutnya');
  rh.id = 'related-title';
  const ul = createEl('ul', 'article-list');
  ul.append(...related.map(articleItem));
  aside.append(rh, ul);
  view.replaceChildren(back, article, aside);
  syncBookmarkButtons();
  return h1;
}
function renderNotFound(id) {
  const view = $('view-article');
  const h1 = createEl('h1', '', 'Artikel tidak ditemukan');
  h1.tabIndex = -1;
  const back = createEl('a', 'btn btn-primary', 'Lihat semua artikel');
  back.href = './#artikel';
  view.replaceChildren(h1, createEl('p', '', 'Tidak ada artikel dengan ID "' + id + '". Tautan mungkin salah atau artikel sudah dipindahkan.'), back);
  return h1;
}

/* ==========================================================
   6. ROUTING (?article=id pada satu file HTML)
   ========================================================== */
function route() {
  const id = new URLSearchParams(location.search).get('article');
  const home = $('view-home');
  const view = $('view-article');
  if (id === null) {
    home.hidden = false;
    view.hidden = true;
    document.title = 'DevScope: Jelajahi Teknologi. Pahami Cara Kerjanya.';
    return;
  }
  const article = findArticle(id);
  home.hidden = true;
  view.hidden = false;
  const heading = article ? renderArticleView(article) : renderNotFound(id);
  document.title = (article ? article.title : 'Artikel tidak ditemukan') + ' | DevScope';
  window.scrollTo(0, 0);
  heading.focus({ preventScroll: true });
}
function navigateTo(url) {
  history.pushState(null, '', url);
  route();
}

/* ==========================================================
   7. EVENT HANDLING (delegasi bila memungkinkan)
   ========================================================== */
function copyCode(button) {
  const done = (ok) => {
    button.textContent = ok ? 'Tersalin' : 'Gagal menyalin';
    announce(ok ? 'Kode tersalin' : 'Kode tidak bisa disalin');
    setTimeout(() => { button.textContent = 'Salin kode'; }, 1800);
  };
  if (!navigator.clipboard) return done(false);
  navigator.clipboard.writeText(button.dataset.copy).then(() => done(true), () => done(false));
}
function handleClick(event) {
  const target = event.target;
  const bm = target.closest('[data-bookmark]');
  if (bm) return toggleBookmark(bm.dataset.bookmark);
  const copy = target.closest('[data-copy]');
  if (copy) return copyCode(copy);
  const cat = target.closest('[data-category]');
  if (cat) {
    state.category = cat.dataset.category;
    renderCategories();
    renderList();
    return $('categories').querySelector('[aria-pressed="true"]').focus();
  }
  const link = target.closest('a[href^="?article="]');
  if (link && !event.metaKey && !event.ctrlKey) {
    event.preventDefault();
    navigateTo(link.getAttribute('href'));
  }
}
function handleSearchInput(event) {
  state.query = event.target.value;
  $('search-clear').hidden = !state.query;
  renderList();
}
function clearSearch() {
  state.query = '';
  $('search-input').value = '';
  $('search-clear').hidden = true;
  renderList();
  $('search-input').focus();
}
function setMenu(open) {
  $('site-nav').classList.toggle('open', open);
  $('menu-btn').setAttribute('aria-expanded', String(open));
}
function bindEvents() {
  document.addEventListener('click', handleClick);
  window.addEventListener('popstate', route);
  $('search-input').addEventListener('input', handleSearchInput);
  $('search-form').addEventListener('submit', (e) => { e.preventDefault(); location.hash = 'artikel'; });
  $('search-clear').addEventListener('click', clearSearch);
  $('theme-btn').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    writeStorage('devscope-theme', next);
    applyTheme(next);
  });
  $('menu-btn').addEventListener('click', () => setMenu($('menu-btn').getAttribute('aria-expanded') !== 'true'));
  $('site-nav').addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && $('menu-btn').getAttribute('aria-expanded') === 'true') { setMenu(false); $('menu-btn').focus(); }
  });
}

/* ==========================================================
   8. INISIALISASI
   ========================================================== */
function init() {
  initTheme();
  renderFeatured();
  renderCategories();
  renderList();
  renderBookmarks();
  bindEvents();
  route();
}
init();