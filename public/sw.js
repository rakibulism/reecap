// Minimal service worker — its only job is to make Reecap installable as a PWA.
//
// IMPORTANT: this worker intentionally has NO `fetch` handler.
//
// The app sets COOP/COEP (`require-corp`) so it can use SharedArrayBuffer for
// WebCodecs/ffmpeg export. A service worker with a no-op `fetch` listener (one
// that never calls `respondWith`) sits in the request path and drops the
// cross-origin embedder context on `crossorigin` subresources, causing the
// browser to block the page's CSS/JS under COEP — the whole site renders
// unstyled. With no fetch handler the SW never touches subresource requests, so
// the browser loads them directly with the correct COEP context.
//
// Modern Chromium no longer requires a fetch handler for installability, so the
// PWA install prompt still works.
//
// sw-version: 2 — bump this when the worker changes so clients pick up updates.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
