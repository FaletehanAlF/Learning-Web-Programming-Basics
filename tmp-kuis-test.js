'use strict';
const fs = require('fs');
const path = require('path');

const store = {};
global.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
};
global.location = { href: 'http://localhost/views/kuis.html', hash: '', pathname: '/views/kuis.html', protocol: 'http:', search: '' };
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
  return {
    id, handlers, _added: added,
    innerHTML: '', textContent: id === 'quizFullNextLabel' ? 'Selanjutnya' : '',
    hidden: id === 'quizFullResult', disabled: id === 'quizFullPrev' || id === 'quizFullNext',
    style: {}, dataset: {}, value: '', checked: false, type: '',
    classList: { add: (c) => added.push(c), remove: () => {}, contains: (c) => added.includes(c) },
    getTotalLength: () => 100, getBoundingClientRect: () => ({}),
    addEventListener: (ev, fn) => { handlers[ev] = fn; },
    click: () => { if (handlers.click) handlers.click(); },
    getAttribute: () => null, setAttribute: () => {},
    querySelectorAll: () => [], querySelector: () => null,
    scrollIntoView: () => {}, appendChild: () => {}, removeChild: () => {},
    select: () => {}, focus: () => {}, dispatchEvent: () => true,
  };
}
const registry = {};
function byId(id) {
  if (!registry[id]) registry[id] = mkEl(id);
  return registry[id];
}
const optBtns = ['teknologi', 'kesehatan', 'soshum', 'bisnis', 'kreatif'].map(mkBtn);
byId('quizFullBody').querySelectorAll = (sel) => (sel === '.quiz-option' ? optBtns : []);

global.document = {
  getElementById: (id) => byId(id),
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: (tag) => mkEl('created-' + tag),
  addEventListener: () => {},
  hidden: false, readyState: 'complete',
  body: { appendChild: () => {}, removeChild: () => {}, style: {} },
  execCommand: () => true,
};

const assert = (cond, msg) => {
  if (!cond) { console.error('FAIL: ' + msg); process.exitCode = 1; }
  else { console.log('PASS: ' + msg); }
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const read = (f) => fs.readFileSync(path.join(__dirname, f), 'utf8');

(async () => {
  // 0. struktur folder baru
  ['assets/css/style.css', 'assets/css/dashboard.css', 'assets/css/assistant.css',
   'assets/js/script.js', 'assets/js/kuis.js', 'assets/js/dashboard.js', 'assets/js/export-word.js',
   'assets/js/share.js', 'assets/js/assistant.js', 'assets/js/jurusan-data.js',
   'assets/js/favorit-compare.js', 'assets/js/skenario.js',
   'assets/img/hero.png', 'assets/img/avatar.png', 'assets/img/icon.svg',
   'views/kuis.html', 'views/dashboard.html', 'index.html', 'manifest.webmanifest', 'sw.js'
  ].forEach((f) => assert(fs.existsSync(path.join(__dirname, f)), 'ada: ' + f));
  assert(!fs.existsSync(path.join(__dirname, 'asset')), 'folder asset/ lama hilang');
  ['index.html', 'views/kuis.html', 'views/dashboard.html', 'manifest.webmanifest', 'sw.js'].forEach((f) => {
    const c = read(f);
    assert(!/(?<![A-Za-z])asset\//.test(c), 'tanpa ref asset/ lama: ' + f);
  });

  // 0b. alur: breadcrumb + stepper + next-step ada di HTML
  assert(read('views/kuis.html').includes('aria-label="Breadcrumb"'), 'kuis: breadcrumb');
  assert(read('views/dashboard.html').includes('aria-label="Breadcrumb"'), 'dashboard: breadcrumb');
  assert(read('views/kuis.html').includes('dashboard.html'), 'kuis: nav dashboard');
  const idx = read('index.html');
  assert(idx.includes('flow-steps') && idx.includes('views/kuis.html') && idx.includes('views/dashboard.html'), 'index: stepper 4 langkah');
  assert(idx.includes('calcSaveScenario') && idx.includes('calcScenarioList'), 'index: panel skenario');
  assert(read('views/dashboard.html').includes('dash-next-actions'), 'dashboard: panel langkah selanjutnya');
  const css = read('assets/css/style.css');
  assert(css.includes('.crumbs') && css.includes('.flow-steps') && css.includes('.compare-modal') && css.includes('.calc-scenarios'), 'css: kelas alur+favorit+skenario ada');

  // 1-7. modul (sama seperti sebelumnya, path baru)
  eval(read('assets/js/jurusan-data.js'));
  assert(window.JURUSAN_DATA.length === 6, 'data: 6 jurusan');
  eval(read('assets/js/share.js'));
  const S = window.PanduanJurusanShare;
  const code = S.encodeResult({ t: 'bisnis', s: { bisnis: 5 }, c: '' });
  assert(S.decodeResult(code).t === 'bisnis' && S.decodeResult('!!!') === null, 'share: codec');
  eval(read('assets/js/assistant.js'));
  const A = window.PanduanJurusanAssistant;
  assert(A.ask('biaya kuliah?').link !== null && A.ask('halo').text.includes('Halo'), 'asisten: jawab');
  eval(read('assets/js/favorit-compare.js'));
  window.PanduanJurusanFav.toggle('Hukum');
  assert(window.PanduanJurusanFav.list().includes('Hukum'), 'favorit: simpan');
  global.window._calcLast = { ukt: 5000000, hidup: 1500000, smt: 8, beasiswa: false, total: 112000000, perTahun: 28000000 };
  eval(read('assets/js/skenario.js'));
  byId('calcSaveScenario').click();
  assert(JSON.parse(store['panduan-jurusan-calc-scenarios']).length === 1, 'skenario: simpan');

  eval(read('assets/js/export-word.js'));
  eval(read('assets/js/kuis.js'));
  const nextBtn = byId('quizFullNext');
  const resultEl = byId('quizFullResult');
  for (let q = 0; q < 10; q++) { optBtns[q % 5].click(); await sleep(420); }
  nextBtn.click();
  assert(resultEl.hidden === false && resultEl.innerHTML.includes('resultWord'), 'kuis: hasil + word');
  assert(resultEl.innerHTML.includes('dashboard.html'), 'kuis: link dashboard terpisah');
  byId('resultWord').click();
  byId('resultImage').click();
  await sleep(50);
  assert(true, 'kuis: aksi tanpa throw');

  store['panduan-jurusan-kuis-10-history'] = JSON.stringify([0, 1].map((k) => ({
    ts: Date.now() - k * 86400000, top: ['teknologi', 'bisnis'][k], score: [6, 5][k],
    percent: [60, 50][k], consistency: [60, 50][k], consistencyLabel: 'Cukup bulat',
    scores: { teknologi: [6, 2][k], kesehatan: 0, soshum: 1, bisnis: [2, 5][k], kreatif: 1 }, detail: null,
  })));
  ['dashStats', 'dashTrend', 'dashAvg', 'dashHistory', 'dashFav', 'dashLink'].forEach((id) => { byId(id).innerHTML = ''; });
  eval(read('assets/js/dashboard.js'));
  assert(byId('dashTrend').innerHTML.includes('trend-line'), 'dashboard: garis tren');
  assert(byId('dashStats').innerHTML.includes('2×'), 'dashboard: statistik');

  console.log(process.exitCode ? 'ADA KEGAGALAN' : 'SEMUA TES LOLOS');
  process.exit(process.exitCode || 0);
})().catch((e) => { console.error('THROW:', e); process.exit(1); });
