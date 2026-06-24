// Reecap Recorder — content script (runs on every page).
//
// The floating controls and the handoff now happen in the picture-in-picture
// window and over the opened-window link, so the content script's only job is
// to forward clicks for the auto-zoom. The worker keeps them only while a
// recording is active.

document.addEventListener(
  'click',
  (e) => {
    try {
      chrome.runtime.sendMessage({ type: 'page-click', x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    } catch {
      /* extension context invalidated */
    }
  },
  true,
);
