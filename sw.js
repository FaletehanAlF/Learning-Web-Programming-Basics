/* Panduan Jurusan — service worker (offline-first ringan) */
var CACHE = 'panduan-jurusan-v1';
var CORE = [
  './',
  'index.html',
  'manifest.webmanifest',
  'views/kuis.html',
  'views/dashboard.html',
  'asset/style/style.css',
  'asset/style/dashboard.css',
  'asset/style/assistant.css',
  'asset/script/script.js',
  'asset/script/kuis.js',
  'asset/script/dashboard.js',
  'asset/script/export-word.js',
  'asset/script/share.js',
  'asset/script/assistant.js',
  'asset/script/jurusan-data.js',
  'asset/script/favorit-compare.js',
  'asset/script/skenario.js',
  'asset/image/hero.png',
  'asset/image/avatar.png',
  'asset/image/icon.svg'
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
