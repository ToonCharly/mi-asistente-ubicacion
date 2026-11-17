const C='asistente-v3';
const A=['./','index.html','style.css','app.js','manifest.json','lib/leaflet.js','lib/leaflet.css','lib/images/marker-icon.png','lib/images/marker-icon-2x.png','lib/images/marker-shadow.png','lib/images/layers.png','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))});
