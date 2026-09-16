/* Panduan Jurusan — service worker (offline-first ringan) */
var CACHE = 'panduan-jurusan-v12';
var CORE = [
  './',
  'index.html',
  'manifest.webmanifest',
  'views/kuis.html',
  'views/dashboard.html',
  'views/kampus.html',
  'views/detail-kampus.html',
  'views/kontak.html',
  'views/asisten.html',
  'data/ptn.json',
  'data/pts.json',
  'data/ptln.json',
  'assets/css/style.css',
  'assets/css/dashboard.css',
  'assets/css/kampus.css',
  'assets/css/kontak.css',
  'assets/css/assistant.css',
  'assets/css/asisten-page.css',
  'assets/js/script.js',
  'assets/js/kuis.js',
  'assets/js/dashboard.js',
  'assets/js/kampus.js',
  'assets/js/detail-kampus.js',
  'assets/js/kontak.js',
  'assets/js/i18n-dict1.js',
  'assets/js/i18n-dict2.js',
  'assets/js/i18n-dict3.js',
  'assets/js/i18n-dict4.js',
  'assets/js/i18n-dict5.js',
  'assets/js/lang.js',
  'assets/js/theme.js',
  'assets/js/export-word.js',
  'assets/js/share.js',
  'assets/js/assistant.js',
  'assets/js/gemini.js',
  'assets/js/openai.js',
  'assets/js/gemini-settings.js',
  'assets/js/asisten-page.js',
  'assets/js/jurusan-data.js',
  'assets/js/favorit-compare.js',
  'assets/js/skenario.js',
  'assets/js/rencana-aksi.js',
  'assets/js/reminder.js',
  'assets/js/ringkasan.js',
  'assets/img/hero.png',
  'assets/img/avatar.png',
  'assets/img/icon.svg',
  'assets/img/icon-192.png',
  'assets/img/icon-512.png'
];

self.addEventListener('install', function (event) {
  try {
    event.waitUntil(
      caches.open(CACHE).then(function (cache) { return cache.addAll(CORE); })
        .then(function () { return self.skipWaiting(); })
        .catch(function () {})
    );
  } catch (e) {}
});

self.addEventListener('activate', function (event) {
  try {
    event.waitUntil(
      caches.keys().then(function (keys) {
        return Promise.all(keys.map(function (k) {
          if (k !== CACHE) return caches.delete(k);
          return null;
        }));
      }).then(function () { return self.clients.claim(); })
    );
  } catch (e) {}
});

self.addEventListener('fetch', function (event) {
  try {
    var req = event.request;
    if (!req || req.method !== 'GET') return;
    var url = new URL(req.url);
    if (url.origin !== location.origin) return; // CDN & font: biarkan browser

    if (req.mode === 'navigate') {
      event.respondWith(
        fetch(req).then(function (res) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); }).catch(function () {});
          return res;
        }).catch(function () {
          return caches.match(req).then(function (hit) {
            return hit || caches.match('index.html');
          });
        })
      );
      return;
    }

    event.respondWith(
      caches.match(req).then(function (hit) {
        var net = fetch(req).then(function (res) {
          if (res && (res.status === 200 || res.type === 'opaque')) {
            var copy = res.clone();
            caches.open(CACHE).then(function (c) { c.put(req, copy); }).catch(function () {});
          }
          return res;
        }).catch(function () { return hit; });
        return hit || net;
      })
    );
  } catch (e) {}
});
