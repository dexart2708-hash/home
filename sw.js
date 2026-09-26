// ============ SERVICE WORKER ДЛЯ ОФЛАЙН-РЕЖИМА ============
// Важно: при обновлении сайта меняйте версию ниже, чтобы пользователи получили новый контент
const CACHE_VERSION = 'valeeryyy-v1';
const CACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];

// Установка — кэшируем основные файлы
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(CACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Активация — удаляем старые версии кэша
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Перехват запросов: сначала кэш, если нет — сеть
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Пропускаем внешние запросы (шрифты, Firebase и т.д.)
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_VERSION).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});