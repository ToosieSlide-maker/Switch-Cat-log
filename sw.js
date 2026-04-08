const CACHE = 'ts-store-v8.9.0';
const STATIC = [
  './index.html',
  './games.js'
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
