// Reecap Recorder — setup page.
//
// Shows the target tab (snapshot + title) for review, then starts the capture
// and closes itself so the user lands back on the page they're recording.

let targetTabId = null;

(async () => {
  const { setup } = await chrome.storage.session.get('setup');
  if (!setup) return;
  targetTabId = setup.targetTabId;

  document.getElementById('title').textContent = setup.title || 'This tab';
  if (setup.favIconUrl) {
    const fav = document.getElementById('fav');
    fav.src = setup.favIconUrl;
    fav.style.display = 'block';
    fav.onerror = () => (fav.style.display = 'none');
  }
  if (setup.thumb) {
    const img = document.getElementById('thumb');
    img.src = setup.thumb;
    img.style.display = 'block';
    document.getElementById('empty').style.display = 'none';
  }
})();

document.getElementById('cancel').onclick = () => window.close();

document.getElementById('start').onclick = () => {
  if (targetTabId == null) return;
  chrome.runtime.sendMessage({ type: 'start-recording', targetTabId });
  window.close(); // drop back to the tab being recorded
};
