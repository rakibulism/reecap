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

// Register the service worker so Reecap is installable as a PWA.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
