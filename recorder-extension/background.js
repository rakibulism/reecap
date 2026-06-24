// Reecap Recorder — service worker (coordinator).
//
// The setup page owns the screen/mic/camera streams, the MediaRecorder, and the
// floating picture-in-picture control window — and it hands the finished clip
// straight to Reecap over the opened-window link. This worker just tracks the
// recording window in time so click marks line up (excluding paused spans) and
// returns the accumulated clicks on Stop.

let rec = null; // { originalTabId, start, pausedTotal, pauseStart, clicks }

chrome.action.onClicked.addListener(async () => {
  if (rec) { // already recording → focus the tab you started from
    if (rec.originalTabId) chrome.tabs.update(rec.originalTabId, { active: true }).catch(() => {});
    return;
  }
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await chrome.storage.session.set({ setup: { originalTabId: tab?.id ?? null, title: tab?.title || '' } });
  chrome.tabs.create({ url: chrome.runtime.getURL('setup.html') });
});

function elapsed() {
  if (!rec) return 0;
  const pausedNow = rec.pauseStart ? Date.now() - rec.pauseStart : 0;
  return Date.now() - rec.start - rec.pausedTotal - pausedNow;
}

chrome.runtime.onMessage.addListener((m, sender, send) => {
  switch (m.type) {
    case 'recording-started':
      rec = { originalTabId: m.originalTabId, start: Date.now(), pausedTotal: 0, pauseStart: 0, clicks: [] };
      chrome.action.setBadgeText({ text: 'REC' });
      chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
      if (rec.originalTabId) chrome.tabs.update(rec.originalTabId, { active: true }).catch(() => {});
      send({ ok: true });
      break;
    case 'rec-pause':
      if (rec && !rec.pauseStart) rec.pauseStart = Date.now();
      break;
    case 'rec-resume':
      if (rec && rec.pauseStart) { rec.pausedTotal += Date.now() - rec.pauseStart; rec.pauseStart = 0; }
      break;
    case 'rec-restart':
      if (rec) { rec.start = Date.now(); rec.pausedTotal = 0; rec.pauseStart = 0; rec.clicks = []; }
      break;
    case 'rec-cancel':
      rec = null;
      chrome.action.setBadgeText({ text: '' });
      break;
    case 'page-click':
      if (rec && !rec.pauseStart) rec.clicks.push({ t: elapsed() / 1000, x: m.x, y: m.y });
      break;
    case 'get-clicks': // controller asks for the click track on Stop
      send(rec ? rec.clicks : []);
      rec = null;
      chrome.action.setBadgeText({ text: '' });
      break;
  }
  return true;
});
