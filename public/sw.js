// Minimal service worker — its only job is to make Reecap installable as a PWA.
// It deliberately does not cache responses (the app is a client-side SPA and we
// never want to serve a stale build); the empty fetch handler is what satisfies
// the browser's installability requirement.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {
  // pass-through: let the network handle every request
});
