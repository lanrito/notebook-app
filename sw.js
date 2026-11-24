// The Director’s Notebook offline cache. Version 20261124210205
const V='bb-20261124210205';
const SHELL=["./", "index.html", "manifest.webmanifest", "vendor/firebase-app-compat.js", "vendor/firebase-auth-compat.js", "vendor/firebase-firestore-compat.js", "vendor/jspdf.umd.min.js", "vendor/pdf.min.js", "vendor/pdf.worker.min.js", "icons/dn-192.png", "icons/dn-512.png", "icons/dn-touch.png"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('bb-')&&k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;
  if(u.pathname.includes('/guide/')){
    // The Guide: fresh when online, its own saved copy when not. Kept apart from the app, and across app updates.
    e.respondWith((async()=>{
      const c=await caches.open('bbguide-1');
      try{const res=await fetch(r,{cache:'no-cache'});if(res&&res.ok)c.put(r,res.clone());return res;}
      catch(err){const hit=await c.match(r,{ignoreSearch:true})||(r.mode==='navigate'?(await c.match(new URL('guide/',self.registration.scope).href)||await c.match(new URL('guide/index.html',self.registration.scope).href)):null);if(hit)return hit;throw err;}
    })());
    return;
  }
  if(r.mode==='navigate'){
    // Online: always the newest app. Offline or very slow: the saved copy.
    e.respondWith((async()=>{
      const c=await caches.open(V);
      const net=fetch(r,{cache:'no-store'}).then(res=>{if(res&&res.ok)c.put('./',res.clone());return res;});
      const timeout=new Promise(res=>setTimeout(res,4000));
      let res=null;try{res=await Promise.race([net,timeout]);if(res&&res.ok)return res;}catch(err){}
      // a server error or no answer: the saved copy, if there is one
      return (await c.match('./'))||res||net;
    })());
    return;
  }
  e.respondWith(caches.open(V).then(async c=>{
    const hit=await c.match(r,{ignoreSearch:true});
    if(hit)return hit;
    const res=await fetch(r,{cache:'no-cache'});if(res&&res.ok)c.put(r,res.clone());return res;
  }));
});
