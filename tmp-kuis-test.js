'use strict';
const fs = require('fs');
const path = require('path');

const store = {};
global.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
};
global.location = { href: 'http://localhost/views/kuis.html' };
try { global.navigator = {}; } catch (e) {}
global.matchMedia = () => ({ matches: false });
global.addEventListener = () => {};
global.removeEventListener = () => {};
global.open = () => {};
global.confirm = () => true;
global.alert = () => {};
global.print = () => {};
global.window = global;

function mkBtn(key) {
  const handlers = {};
  return {
    getAttribute: (n) => (n === 'data-key' || n === 'data-i' || n === 'data-hdel' ? key : null),
    setAttribute: () => {},
    addEventListener: (ev, fn) => { handlers[ev] = fn; },
    click: () => { if (handlers.click) handlers.click(); },
  };
}
function mkEl(id) {
  const handlers = {};
  const added = [];
  const el = {
    id,
    innerHTML: '',
    textContent: id === 'quizFullNextLabel' ? 'Selanjutnya' : '',
    hidden: id === 'quizFullResult',
    disabled: id === 'quizFullPrev' || id === 'quizFullNext',
    style: {},
    dataset: {},
    value: '',
    classList: { add: (c) => added.push(c), remove: () => {}, contains: (c) => added.includes(c) },
    _added: added,
    getTotalLength: () => 100,
    getBoundingClientRect: () => ({}),
    addEventListener: (ev, fn) => { handlers[ev] = fn; },
    click: () => { if (handlers.click) handlers.click(); },
    getAttribute: () => null,
    setAttribute: () => {},
    querySelectorAll: () => [],
    querySelector: () => null,
    scrollIntoView: () => {},
    appendChild: () => {},
    removeChild: () => {},
    select: () => {},
  };
  return el;
}
const registry = {};
function byId(id) {
  if (!registry[id]) registry[id] = mkEl(id);
  return registry[id];
}
const optBtns = ['teknologi', 'kesehatan', 'soshum', 'bisnis', 'kreatif'].map(mkBtn);
byId('quizFullBody').querySelectorAll = (sel) => (sel === '.quiz-option' ? optBtns : []);
function mkDot(i) {
  const handlers = {};
  return {
    getAttribute: (n) => (n === 'data-i' ? String(i) : null),
    setAttribute: () => {},
    addEventListener: (ev, fn) => { handlers[ev] = fn; },
    click: () => { if (handlers.click) handlers.click(); },
  };
}
const dotBtns = [];
for (let i = 0; i < 10; i++) dotBtns.push(mkDot(i));
byId('quizDots').querySelectorAll = () => dotBtns;

global.document = {
  getElementById: (id) => byId(id),
  querySelector: () => null,
  createElement: (tag) => mkEl('created-' + tag),
  addEventListener: () => {},
  hidden: false,
  body: { appendChild: () => {}, removeChild: () => {} },
  execCommand: () => true,
};

const assert = (cond, msg) => {
  if (!cond) { console.error('FAIL: ' + msg); process.exitCode = 1; }
  else { console.log('PASS: ' + msg); }
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const read = (f) => fs.readFileSync(path.join(__dirname, f), 'utf8');

(async () => {
  // export-word module
  eval(read('asset/script/export-word.js'));
  assert(typeof window.PanduanJurusanExport.buildWordDoc === 'function', 'export-word: buildWordDoc ada');
  const docHtml = window.PanduanJurusanExport.buildWordDoc({
    dateStr: '13 September 2026', topLabel: 'Teknologi', topTitle: 'Rumpun Teknologi',
    topDesc: 'Suka ngoprek', topScore: 6, topPercent: 60, consLabel: 'Cukup bulat',
    consValue: 60, consDesc: 'Konsisten', rows: [{ label: 'Teknologi', score: 6, percent: 60 }],
    whys: ['Suka coba-coba'], pros: ['Kerja luas'], consList: ['Butuh portofolio'],
    jurusan: [{ name: 'Teknik Informatika', sub: 'Aplikasi', p: 'Cocok.' }],
    coba: 'Kelas gratis', tanya: ['Betah?'], review: [{ q: 'Suka apa?', answer: 'Ngoprek', label: 'Teknologi' }],
  });
  assert(docHtml.includes('Teknik Informatika'), 'word: memuat rekomendasi jurusan');
  assert(docHtml.includes('Kenapa Teknologi Cocok'), 'word: memuat analisis kenapa cocok');
  assert(docHtml.includes('<table'), 'word: memuat tabel skor');
  assert(docHtml.includes('Langkah 2 Minggu'), 'word: memuat langkah coba');
  const dlRes = window.PanduanJurusanExport.downloadWord('x.doc', docHtml);
  assert(dlRes === false || dlRes === true, 'word: download tanpa throw');

  // kuis flow
  eval(read('asset/script/kuis.js'));
  const nextBtn = byId('quizFullNext');
  const prevBtn = byId('quizFullPrev');
  const resultEl = byId('quizFullResult');
  assert(nextBtn.disabled === true, 'next disabled sebelum jawab');
  for (let q = 0; q < 10; q++) { optBtns[q % 2].click(); await sleep(420); }
  const st = JSON.parse(store['panduan-jurusan-kuis-10']);
  assert(st.answers.filter(Boolean).length === 10, '10 jawaban tersimpan');
  assert(byId('quizFullNextLabel').textContent === 'Lihat Hasil Analisis', 'label tombol hasil');
  nextBtn.click();
  assert(resultEl.hidden === false, 'hasil tampil');
  assert(resultEl.innerHTML.includes('Unduh Word'), 'tombol Unduh Word ada');
  assert(resultEl.innerHTML.includes('dashboard.html'), 'link Dashboard ke halaman terpisah');
  assert(!resultEl.innerHTML.includes('Unduh TXT'), 'tombol TXT lama hilang');
  assert(!resultEl.innerHTML.includes('Lihat Jurusan Teknologi di Beranda'), 'label jurusan dipadatkan');
  const hist = JSON.parse(store['panduan-jurusan-kuis-10-history']);
  assert(hist.length === 1 && hist[0].detail && hist[0].detail.jurusan.length === 3, 'riwayat + detail jurusan tersimpan');
  assert(hist[0].detail.review.length === 10, 'riwayat + rincian 10 jawaban tersimpan');
  byId('resultCopy').click();
  byId('resultWord').click();
  byId('resultShareWa').click();
  assert(true, 'aksi hasil tanpa throw');
  byId('resultRetry').click();
  assert(resultEl.hidden === true, 'ulangi menyembunyikan hasil');
  assert(byId('quizFootnote').style.display === '', 'footnote dikembalikan');

  // dashboard page (seed 3 entries)
  const seed = [0, 1, 2].map((k) => ({
    ts: Date.now() - k * 86400000, top: ['teknologi', 'teknologi', 'bisnis'][k],
    score: [6, 7, 5][k], percent: [60, 70, 50][k], consistency: [60, 70, 50][k],
    consistencyLabel: 'Cukup bulat', scores: { teknologi: [6, 7, 2][k], kesehatan: 0, soshum: [1, 1, 1][k], bisnis: [2, 1, 5][k], kreatif: [1, 1, 2][k] },
    detail: null,
  }));
  store['panduan-jurusan-kuis-10-history'] = JSON.stringify(seed);
  // reset dashboard element html
  ['dashStats', 'dashTrend', 'dashAvg', 'dashHistory'].forEach((id) => { byId(id).innerHTML = ''; });
  eval(read('asset/script/dashboard.js'));
  assert(byId('dashStats').innerHTML.includes('3×'), 'dashboard: 3 percobaan');
  assert(byId('dashStats').innerHTML.includes('Teknologi'), 'dashboard: dominan tersering');
  assert(byId('dashTrend').innerHTML.includes('<svg'), 'dashboard: diagram garis SVG');
  assert(byId('dashTrend').innerHTML.includes('trend-line'), 'dashboard: path garis tren');
  assert(byId('dashAvg').innerHTML.includes('Bisnis'), 'dashboard: rata-rata rumpun');
  assert(byId('dashHistory').innerHTML.includes('dash-hist-row'), 'dashboard: riwayat tampil');
  await sleep(1700);
  assert(byId('trendLine')._added.length >= 0, 'animasi garis berjalan tanpa throw');
  byId('dashWord').click();
  assert(true, 'dashboard: unduh word tanpa throw');
  byId('dashClear').click();
  assert(JSON.parse(store['panduan-jurusan-kuis-10-history']).length === 0, 'dashboard: hapus riwayat');
  assert(byId('dashTrend').innerHTML.includes('Mulai Kuis'), 'dashboard: empty state + CTA');

  console.log(process.exitCode ? 'ADA KEGAGALAN' : 'SEMUA TES LOLOS');
  process.exit(process.exitCode || 0);
})().catch((e) => { console.error('THROW:', e); process.exit(1); });
