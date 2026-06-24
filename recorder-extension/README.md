# Reecap Recorder — Chrome extension

Record **any** browser tab with automatic **click-to-zoom**, then edit and export in [Reecap](https://reecap.vercel.app/app).

While you record, the extension captures where you click. Back in Reecap's **Screen Recorder** tool, every click becomes a smooth zoom-in toward that point — Screen-Studio style — and you can export **MP4** or **WebM**.

> **No microphone, no camera.** Capture is tab-only with audio off. The extension never requests mic or camera access.

## Install (developer mode)

1. Open `chrome://extensions`.
2. Enable **Developer mode** (top-right).
3. **Load unpacked** → select this `recorder-extension/` folder.
4. Pin **Reecap Recorder** to your toolbar.

## Use

1. Open the page you want to record and click the **Reecap Recorder** icon.
2. A **setup page** opens — review the tab to be recorded, then press **Start recording**.
3. The setup page closes and you're back on your tab, now with a small **floating control bar** (timer · **Pause/Resume** · **Stop**).
4. Click around normally — each click is captured for the zoom.
5. Press **Stop** → Reecap opens with your recording loaded. Tune the zoom and **Export**.

## How it works

- **`background.js`** — on toolbar click, snapshots the active tab and opens the setup page; on Start, captures the tab via `chrome.tabCapture`, shows the floating bar, and (on stop) hands off to Reecap.
- **`offscreen.js`** — runs `MediaRecorder` on the tab stream (service workers can't), audio off, with pause/resume; returns a webm data URL.
- **`content.js`** — reports clicks, renders the floating control bar (isolated in a Shadow DOM), and on the Reecap app rebuilds the recording Blob and `postMessage`s it to the page.
- **`setup.html` / `setup.js`** — the review-and-start page.

### Reliable handoff

After Stop, the extension opens `https://reecap.vercel.app/app?recorder=1`. Reecap reads the query param to open the **Screen Recorder** view, which posts a `recorder-ready` message; the content script then delivers the recording — so the handoff never races the page load.

## Notes

- Pausing also pauses click capture, and paused time is excluded so zoom timings stay aligned with the trimmed video.
- Some pages can't be captured (`chrome://`, the Web Store) — the setup preview shows "unavailable" there.
- Without the extension, Reecap's in-app recorder (`getDisplayMedia`) still records your screen and captures clicks on the Reecap tab — the extension is what extends click-zoom to any site.
