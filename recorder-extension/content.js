// Reecap Recorder — content script (runs on every page).
//
// With the controls now in a floating picture-in-picture window, the content
// script only needs to: (1) forward clicks for the auto-zoom (the worker keeps
// them only while recording), and (2) deliver the finished recording to the
// Reecap web app.

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

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'reecap-import') {
    fetch(msg.dataUrl)
      .then((r) => r.blob())
      .then((blob) => window.postMessage({ __reecap: 'screen-recording', clicks: msg.clicks || [], video: blob }, window.location.origin))
      .catch(() => {});
  }
});

// The Reecap recorder view announces it's mounted → ask the worker to deliver.
window.addEventListener('message', (e) => {
  if (e.source === window && e.data && e.data.__reecap === 'recorder-ready') {
    try { chrome.runtime.sendMessage({ type: 'reecap-ready' }); } catch { /* no-op */ }
  }
});
