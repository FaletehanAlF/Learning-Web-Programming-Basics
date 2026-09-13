'use strict';
const fs = require('fs');
const path = require('path');

// ---------- mocks ----------
const store = {};
global.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
};
global.location = { href: 'http://localhost/views/kuis.html' };
try { global.navigator = {}; } catch (e) {}
global.matchMedia = () => ({ matches: false });
global.open = () => {};
global.confirm = () => true;
global.print = () => {};
global.window = global;

function mkBtn(key) {
  const handlers = {};
  return {
    _h: handlers,
    getAttribute: (n) => (n === 'data-key' || n === 'data-i' || n === 'data-hdel' ? key : null),
    setAttribute: () => {},
    addEventListener: (ev, fn) => { handlers[ev] = fn; },
    click: () => { if (handlers.click) handlers.click(); },
  };
}
function mkEl(id) {
  const handlers = {};
  const el = {
    id,
    innerHTML: '',
    textContent: id === 'quizFullNextLabel' ? 'Selanjutnya' : '',
    hidden: id === 'quizFullResult',
    disabled: id === 'quizFullPrev' || id === 'quizFullNext',
    style: {},
    dataset: {},
    value: '',
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
  el._h = handlers;
  return el;
}
const registry = {};
function byId(id) {
  if (!registry[id]) registry[id] = mkEl(id);
  return registry[id];
}
// quiz body returns 5 fake option buttons per query
const bodyEl = byId('quizFullBody');
bodyEl.querySelectorAll = () => ['teknologi', 'kesehatan', 'soshum', 'bisnis', 'kreatif'].map(mkBtn);

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

(async () => {
  const src = fs.readFileSync(path.join(__dirname, 'asset', 'script', 'kuis.js'), 'utf8');
  eval(src);

  const nextBtn = byId('quizFullNext');
  const prevBtn = byId('quizFullPrev');
  const resultEl = byId('quizFullResult');

  assert(nextBtn.disabled === true, 'next disabled sebelum jawab');
  assert(prevBtn.disabled === true, 'prev disabled di soal 1');

  // jawab 10 soal via klik opsi pertama, tunggu auto-advance
  for (let q = 0; q < 10; q++) {
    bodyEl.querySelectorAll()[0].click();
    await sleep(420);
  }
  const st = JSON.parse(store['panduan-jurusan-kuis-10']);
  assert(st.answers.every((a) => a === 'teknologi'), 'semua jawaban tersimpan (teknologi)');
  assert(nextBtn.disabled === false, 'next aktif di soal terakhir');
  assert(byId('quizFullNextLabel').textContent === 'Lihat Hasil Analisis', 'label tombol jadi Lihat Hasil Analisis');

  // lihat hasil
  nextBtn.click();
  assert(resultEl.hidden === false, 'hasil tampil');
  assert(resultEl.innerHTML.includes('result-head'), 'HTML hasil ter-render');
  assert(resultEl.innerHTML.includes('Salin Hasil'), 'tombol Salin ada');
  assert(resultEl.innerHTML.includes('Unduh TXT'), 'tombol Unduh ada');
  assert(resultEl.innerHTML.includes('quiz-dashboard') === false, 'hasil tidak nested dashboard');
  const hist = JSON.parse(store['panduan-jurusan-kuis-10-history']);
  assert(hist.length === 1 && hist[0].top === 'teknologi' && hist[0].score === 10, 'riwayat tercatat (teknologi 10/10)');
  assert(byId('dashStats').innerHTML.includes('1×'), 'dashboard statistik terisi');
  assert(byId('dashAvg').innerHTML.includes('Teknologi'), 'dashboard rata-rata terisi');
  assert(byId('dashHistory').innerHTML.includes('Teknologi'), 'dashboard riwayat terisi');
  assert(byId('quizFootnote').style.display === 'none', 'footnote disembunyikan saat hasil');

  // aksi salin & unduh & cetak & dashboard (tidak boleh throw)
  byId('resultCopy').click();
  byId('resultDownload').click();
  byId('resultPrint').click();
  byId('resultDash').click();
  byId('resultShareWa').click();
  assert(true, 'aksi hasil tanpa throw');

  // dots tidak bisa diklik saat hasil tampil (guard) — dotsEl kosong, lewati

  // ulangi kuis
  byId('resultRetry').click();
  assert(resultEl.hidden === true, 'hasil disembunyikan setelah ulangi');
  assert(byId('quizFootnote').style.display === '', 'footnote dikembalikan');
  const st2 = JSON.parse(store['panduan-jurusan-kuis-10']);
  assert(st2.answers.every((a) => a === null), 'jawaban di-reset');
  assert(byId('dashResume').innerHTML === '', 'resume hilang setelah reset');

  // jawab 3 soal lalu cek resume dashboard
  for (let q = 0; q < 3; q++) {
    bodyEl.querySelectorAll()[0].click();
    await sleep(420);
  }
  assert(byId('dashResume').innerHTML.includes('Lanjutkan'), 'banner lanjutkan muncul (3/10)');
  byId('dashResumeBtn').click();
  assert(resultEl.hidden === true, 'klik lanjutkan tidak merusak state');

  // hapus riwayat
  byId('dashClear').click();
  assert(JSON.parse(store['panduan-jurusan-kuis-10-history']).length === 0, 'hapus riwayat bekerja');
  assert(byId('dashStats').innerHTML.includes('>0<'), 'dashboard kosong kembali');

  // keyboard: tekan "2" untuk jawab soal berjalan
  const keyEv = { key: '2', target: { tagName: 'BUTTON' } };
  // handler keydown terdaftar di document mock? document.addEventListener noop — lewati, cukup pastikan tidak throw
  assert(true, 'selesai tanpa error');

  console.log(process.exitCode ? 'ADA KEGAGALAN' : 'SEMUA TES LOLOS');
  process.exit(process.exitCode || 0);
})().catch((e) => { console.error('THROW:', e); process.exit(1); });
