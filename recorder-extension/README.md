# Reecap Recorder — Chrome extension

Record **any** browser tab with automatic **click-to-zoom**, then edit and export in [Reecap](https://reecap.vercel.app/app).

While you record, the extension captures where you click on the page. Back in Reecap's **Screen Recorder** tool, every click becomes a smooth zoom-in toward that point in the final video — Screen-Studio style.

## Install (developer mode)

1. Open `chrome://extensions`.
2. Enable **Developer mode** (top-right).
3. Click **Load unpacked** and select this `recorder-extension/` folder.
4. Pin the **Reecap Recorder** icon to your toolbar.

## Use

1. Go to the website you want to record.
2. Click the extension → **Start recording** (a `REC` badge appears).
3. Click around the page normally — each click is timestamped.
4. Click the extension → **Stop recording**.
5. Reecap opens with your recording loaded; tweak the zoom and **Export video**.

## How it works

- `background.js` — orchestrates capture via `chrome.tabCapture`, collects click marks, and hands off to Reecap.
- `offscreen.js` — runs `MediaRecorder` on the tab stream (service workers can't) and returns a webm data URL.
- `content.js` — reports clicks on every page, and on the Reecap app rebuilds the recording Blob and `postMessage`s it to the page.
- `popup.html/js` — the Start/Stop toggle.

The Reecap web app listens for a `window.postMessage` of shape
`{ __reecap: 'screen-recording', clicks: [{t,x,y}], video: Blob }` and loads it into the Screen Recorder editor.

## Notes

- Without the extension, Reecap's in-app recorder (`getDisplayMedia`) still records your screen and captures clicks **on the Reecap tab itself** — the extension is what extends click-zoom to any site.
- All processing is local; nothing is uploaded.
