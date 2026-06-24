# Reecap Recorder — Chrome extension

Record your **whole screen** with **webcam**, **voice**, **system audio**, and automatic **click-to-zoom** — then edit and export in [Reecap](https://reecap.vercel.app/app).

Because it records the whole screen, the recording keeps going as you move between tabs, windows, and apps. The **floating controls** and your **webcam bubble** appear on every web page you're on, so you can pause/stop and stay on camera from anywhere.

## Install (developer mode)

1. Open `chrome://extensions`.
2. Enable **Developer mode** (top-right).
3. **Load unpacked** → select this `recorder-extension/` folder.
4. Pin **Reecap Recorder** to your toolbar.

## Use

1. Click the **Reecap Recorder** icon → a **setup page** opens.
2. Toggle **Webcam**, **Microphone**, **Tab/system audio**, then **Choose screen & start**.
3. Pick what to share in Chrome's prompt (choose **Entire Screen** to capture everything). Approve camera/mic the first time.
4. You drop back onto your tab. A **floating bar** (timer · **Pause/Resume** · **Stop**) and your **webcam bubble** float on the page — and follow you to any other page.
5. Click around; each click is captured for the zoom.
6. Press **Stop** → Reecap opens with your recording loaded. Tune the zoom and **Export** (MP4 or WebM).

## How it works

- **`setup.html` / `setup.js`** — the controller. On Start it calls `getDisplayMedia` (screen + system audio) and `getUserMedia` (mic), mixes the audio, and runs `MediaRecorder`. It hides its UI and **stays open in the background** while you record (keep the tab open).
- **`content.js`** — on every page, shows the floating control bar and embeds the webcam bubble, reports clicks, and (on the Reecap app) delivers the finished recording to the page. It asks the worker for recording state on load, so overlays appear on pages you open mid-recording.
- **`camera.html` / `camera.js`** — the webcam bubble, loaded as an **extension-origin iframe** so the camera permission is asked **once** (not per website). It's on screen, so the screen recording captures it.
- **`background.js`** — tracks recording state, broadcasts it to all tabs, relays pause/resume/stop to the controller, timestamps clicks (excluding paused time), and hands the clip off to Reecap.

### Reliable handoff

After Stop, the extension opens `https://reecap.vercel.app/app?recorder=1`. Reecap reads the param to open the **Screen Recorder** view, which posts `recorder-ready`; the content script then delivers the recording — so it never races the page load.

## Notes & limits

- **Keep the setup tab open** while recording — it owns the screen/mic streams. It can sit in the background.
- The floating bar and webcam bubble are on-screen, so they appear in a whole-screen recording (that's how the webcam ends up in your video).
- **System audio**: Chrome can capture tab audio everywhere and full-screen audio on Windows/ChromeOS; macOS can't capture system audio for "Entire Screen" (mic still works).
- Only the **visible** tab holds the webcam, so switching tabs hands the camera over cleanly.
- Everything is processed locally; nothing is uploaded.
