# Reecap Recorder — Chrome extension

Record your **whole screen** with **webcam**, **voice**, **system audio**, and automatic **click-to-zoom** — controlled from a **floating picture-in-picture window** that hovers above every tab and app (like the Vimeo recorder). Edit and export in [Reecap](https://reecap.vercel.app/app).

## Install (developer mode)

1. Open `chrome://extensions`.
2. Enable **Developer mode** (top-right).
3. **Load unpacked** → select this `recorder-extension/` folder.
4. Pin **Reecap Recorder** to your toolbar. (If you had an older version loaded, click its **Reload** ⟳ first.)

## Use

1. Click the **Reecap Recorder** icon → a setup tab opens. Give the recording a **name** (saved as `<name>.webm`), toggle **Webcam**, **Microphone**, **Tab/system audio**, then **Open floating controls**.
2. A **picture-in-picture window** pops out with your webcam preview and a **Start recording** button. It floats on top of everything.
3. Click **Start recording** → pick what to share (choose **Entire Screen**). Approve camera/mic the first time.
4. Record. The floating window stays on top wherever you go — pause/resume, restart, discard, or **Stop** from any tab or app. The timer shows your length.
5. **Stop** → Reecap opens with your recording, click-zooms applied. Tune and **Export** (MP4 or WebM).

The floating window's buttons mirror the Vimeo controls: **🗑 discard · ↻ restart · ❚❚ pause/resume**, and a red **■ Stop** with the timer.

## Settings

Open the **Settings** page from the extension's options (right-click the toolbar icon → **Options**, or the **Save settings** link on the setup tab):

- **Recording name** — the default file name used for new recordings (overridable per-recording on the setup tab).
- **Where to save** — pick one:
  - **Browser Downloads folder** — saved automatically, no prompt (default).
  - **Ask me each time** — shows a “Save as” dialog so you confirm the location and name.
  - **A folder I choose** — saved straight into one folder every time, no dialog.

"Ask me each time" and "A folder I choose" use the File System Access API and need a Chromium-based browser; elsewhere the recorder falls back to the Downloads folder so a recording is never lost.

## How it works

- **`setup.html` / `setup.js`** — the controller. On "Open floating controls" it requests a **Document Picture-in-Picture** window and starts the webcam/mic there; on "Start recording" it calls `getDisplayMedia` (screen + system audio), mixes the audio, and runs `MediaRecorder` — all in the PiP window's context, so it keeps running smoothly while the setup tab sits in the background.
- **`content.js`** — forwards page clicks for the auto-zoom and, on the Reecap app, delivers the finished recording to the page.
- **`background.js`** — timestamps clicks (excluding paused spans), and hands the clip off to Reecap.

### Reliable handoff

After Stop, the extension opens `https://reecap.vercel.app/app?recorder=1`. Reecap reads the param to open the **Screen Recorder** view, which posts `recorder-ready`; the content script delivers the recording then — so it never races the page load.

## Notes & limits

- **Picture-in-Picture requires Chrome 116+.** If unavailable, the controls render in the setup tab as a fallback (keep that tab visible).
- **Keep the setup tab open** while recording — it (and its PiP child window) own the streams.
- The PiP window is on-screen, so a whole-screen recording captures your webcam through it — that's how the bubble ends up in the video.
- **System audio**: Chrome captures tab audio everywhere and full-screen audio on Windows/ChromeOS; macOS can't capture system audio for "Entire Screen" (mic still works).
- Everything is local; nothing is uploaded.
