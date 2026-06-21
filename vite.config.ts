import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Note: no COOP/COEP headers. The export pipeline is WebCodecs (VideoEncoder +
// mp4-muxer), which does NOT need SharedArrayBuffer / crossOriginIsolated. COEP
// `require-corp` actively broke the `crossorigin` stylesheet under strict-COEP
// browsers (e.g. Edge), rendering the whole site unstyled. Keep it off.
export default defineConfig({
  plugins: [react()],
})
