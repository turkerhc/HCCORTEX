// HC CORTEX · çevrimdışı kabuk: her zaman önce ağ, ağ yoksa son kayıtlı sürüm
const K='cortex-v3';
self.addEventListener('install',e=>{e.waitUntil(caches.open(K).then(c=>c.addAll(['./','manifest.webmanifest','ikon-192.png'])).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(L=>Promise.all(L.filter(x=>x!==K).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin) return;
  const anahtar=u.pathname.endsWith('.json')?new Request(u.origin+u.pathname):e.request;   // veri.json · rapor.json: ?t= ile çoğalmasın
  e.respondWith(fetch(e.request).then(r=>{ if(r.ok){const k=r.clone(); caches.open(K).then(c=>c.put(anahtar,k));} return r; })
    .catch(()=>caches.match(anahtar).then(r=>r||caches.match('./'))));
});
