const CACHE_NAME = 'technics-player-v1';
const ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './js/script.js',
    './img/Technics_logo.png',
    './img/favicon_512.png',
    'https://cdnjs.cloudflare.com/ajax/libs/jsmediatags/3.9.5/jsmediatags.min.js',
    'https://fonts.cdnfonts.com/css/ds-digital'
];

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (event) => {
    event.waitUntil(caches.keys().then((keys) => {
        return Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
    }));
});

self.addEventListener('fetch', (event) => {
    event.respondWith(caches.match(event.request).then((response) => response || fetch(event.request)));
});