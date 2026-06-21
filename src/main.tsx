import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import './lib/pwa' // capture the PWA install prompt as early as possible
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Remove the prerendered (crawler-facing) snapshot once the SPA has mounted.
document.getElementById('prerender')?.remove()

// We no longer register a service worker. A previously-installed worker on the
// production origin could leave returning visitors in a state where the page's
// CSS never applies (a fresh preview origin, with no worker, always renders
// correctly). Proactively unregister any leftover worker, clear its caches, and
// reload once into a clean, worker-free state. The session guard prevents a
// reload loop; we only reload when a worker is actually controlling the page.
if ('serviceWorker' in navigator && navigator.serviceWorker.controller && !sessionStorage.getItem('sw-cleaned')) {
  sessionStorage.setItem('sw-cleaned', '1')
  navigator.serviceWorker.getRegistrations()
    .then((regs) => Promise.all(regs.map((r) => r.unregister())))
    .then(() => ('caches' in window ? caches.keys().then((ks) => Promise.all(ks.map((k) => caches.delete(k)))) : null))
    .then(() => window.location.reload())
    .catch(() => {})
}
