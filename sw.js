const CACHE = 'ts-store-v9.9';
const STATIC = [
  './index.html',
  './games.js',
  './auth.js',
  './site.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png'
];

self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(STATIC))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>
      Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e=>{
  const url = new URL(e.request.url);

  if(url.hostname === 'docs.google.com'){
    e.respondWith(
      fetch(e.request).then(res=>{
        if(res.ok){
          const resClone=res.clone();
          caches.open(CACHE).then(c=>c.put(e.request,resClone));
        }
        return res;
      }).catch(()=>
        caches.open(CACHE).then(cache=>cache.match(e.request))
      )
    );
    return;
  }

  if(url.hostname === 'www.nintendo.com'){
    e.respondWith(
      caches.open(CACHE).then(cache=>
        cache.match(e.request).then(cached=>{
          if(cached) return cached;
          return fetch(e.request).then(res=>{
            const resClone = res.clone();
            cache.put(e.request, resClone);
            return res;
          });
        })
      )
    );
    return;
  }

  // Network-first for HTML, auth.js, games.js, sw.js itself — so updates always reach users
  const path = url.pathname;
  const isCritical = path.endsWith('/auth.js') || path.endsWith('/games.js')
    || path.endsWith('/index.html') || path.endsWith('/sw.js')
    || path === '/' || path.endsWith('/Switch-Cat-log/') || path.endsWith('/Switch-Cat-log');

  if(isCritical){
    e.respondWith(
      fetch(e.request).then(res=>{
        if(res.ok){
          const resClone = res.clone();
          caches.open(CACHE).then(c=>c.put(e.request, resClone));
        }
        return res;
      }).catch(()=>caches.match(e.request))
    );
    return;
  }

  // Cache-first for everything else (images, manifest, icons)
  e.respondWith(
    caches.match(e.request).then(cached=>
      cached || fetch(e.request).then(res=>{
        if(res.ok){
          const resClone = res.clone();
          caches.open(CACHE).then(c=>c.put(e.request, resClone));
        }
        return res;
      })
    )
);
});

self.addEventListener('message', e=>{
  if(e.data==='skipWaiting') self.skipWaiting();
});
