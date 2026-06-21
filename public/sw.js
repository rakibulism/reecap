// Kill-switch service worker.
//
// Reecap previously registered a service worker (only to enable the PWA install
// prompt). On the production origin that leftover worker is the prime suspect
// for returning visitors seeing the site render without CSS, while a freshly
// deployed preview origin — which has no worker — always looks correct.
//
// This worker exists only to UNREGISTER any previously-installed worker and wipe
// its caches, then get out of the way. The browser update-checks /sw.js on every
// navigation in scope, so existing clients pick this up and self-heal. We no
// longer register a worker from the app (see src/main.tsx). COEP/COOP — needed
// for SharedArrayBuffer / ffmpeg export — come from HTTP headers (vercel.json),
// not from the worker, so removing it does not affect export.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    } catch { /* ignore */ }
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach((c) => c.navigate(c.url));
  })());
});
