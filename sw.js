// HC CORTEX · çevrimdışı kabuk: her zaman önce ağ, ağ yoksa son kayıtlı sürüm · v4.21: telefon bildirimleri (web push — kapı · sinyal · terminal)
const K='cortex-v4';
self.addEventListener('install',e=>{e.waitUntil(caches.open(K).then(c=>c.addAll(['./','manifest.webmanifest','ikon-192.png'])).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(L=>Promise.all(L.filter(x=>x!==K).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin) return;
  const anahtar=u.pathname.endsWith('.json')?new Request(u.origin+u.pathname):e.request;   // veri.json · rapor.json: ?t= ile çoğalmasın
  e.respondWith(fetch(e.request).then(r=>{ if(r.ok){const k=r.clone(); caches.open(K).then(c=>c.put(anahtar,k));} return r; })
    .catch(()=>caches.match(anahtar).then(r=>r||caches.match('./'))));
});
self.addEventListener('push',e=>{ let d={}; try{ d=e.data?e.data.json():{}; }catch(_){ d={b:e.data?e.data.text():''}; }
  e.waitUntil(self.registration.showNotification(d.t||'HC CORTEX',{body:d.b||'',icon:'ikon-192.png',badge:'ikon-192.png',tag:d.tag||'cortex',renotify:true,data:{u:d.u||'./'},timestamp:Date.now()}));
});
self.addEventListener('notificationclick',e=>{ e.notification.close(); const u=new URL((e.notification.data&&e.notification.data.u)||'./',self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(L=>{ for(const c of L){ if(c.url.startsWith(self.registration.scope)&&'focus' in c){ c.postMessage({cortex:'git',u}); return c.focus(); } } return self.clients.openWindow(u); }));
});
self.addEventListener('pushsubscriptionchange',e=>{ e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(L=>L.forEach(c=>c.postMessage({cortex:'abone-yenile'})))); });
