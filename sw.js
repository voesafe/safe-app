const CACHE = 'safe-app-v4';

// Instala sem pré-cachear nada — deixa o network-first cuidar
self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // Apaga caches antigos
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    // Tenta a rede primeiro
    fetch(e.request)
      .then(res => {
        // Salva a versão nova no cache
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => {
        // Só usa cache se estiver offline
        return caches.match(e.request);
      })
  );
});
