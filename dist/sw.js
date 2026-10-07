const CACHE='saia-app-v7';
const CORE=['./','./index.html','./styles.css','./app.js','./planner.mjs','./ai-worker.js','./forest.jpg','./about.html','./manifest.webmanifest','./icon.svg'].map(path=>new URL(path,self.location.href).href);
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('saia-app-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
 if(CORE.includes(url.href)){
  event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(event.request))??fetch(event.request)));
  return;
 }
 event.respondWith(fetch(event.request).then(async response=>{
  if(response.ok)try{const cache=await caches.open(CACHE);await cache.put(event.request,response.clone());}catch{}
  return response;
 }).catch(()=>caches.match(event.request)));
});
