// Reecap Recorder — content script (runs on every page).
//
// 1) While recording, report each click (normalised to the viewport) to the
//    background worker, which timestamps it into the click track.
// 2) On the Reecap web app, receive the finished recording and forward it to
//    the page via window.postMessage (Blobs survive postMessage but not
//    runtime messaging, so the background sends a data URL we rebuild here).

document.addEventListener(
  'click',
  (e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    try {
      chrome.runtime.sendMessage({ type: 'page-click', x, y });
    } catch {
      /* extension context invalidated — ignore */
    }
  },
  true,
);

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'reecap-import') {
    fetch(msg.dataUrl)
      .then((r) => r.blob())
      .then((blob) => {
        window.postMessage({ __reecap: 'screen-recording', clicks: msg.clicks || [], video: blob }, window.location.origin);
      })
      .catch(() => {});
  }
});
