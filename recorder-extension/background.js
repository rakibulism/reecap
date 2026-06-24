// Reecap Recorder — service worker (coordinator).
//
// The setup page owns the screen/mic/camera streams, the MediaRecorder, and the
// floating picture-in-picture control window. This worker just: tracks the
// recording window in time so click marks line up (excluding paused spans),
// keeps the clicks reported by content scripts, and hands the finished clip to
// the Reecap web app.

const REECAP_URL = 'https://reecap.vercel.app/app?recorder=1';

let rec = null; // { originalTabId, start, pausedTotal, pauseStart, clicks }
let pending = null; // { dataUrl, clicks } awaiting the Reecap page "ready"

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
    case 'recording-stopped':
      finish(m.dataUrl);
      break;
    case 'reecap-ready':
      flush(sender.tab?.id);
      break;
  }
  return true;
});

function finish(dataUrl) {
  pending = { dataUrl, clicks: rec ? rec.clicks : [] };
  chrome.action.setBadgeText({ text: '' });
  rec = null;
  chrome.tabs.create({ url: REECAP_URL });
}

function flush(tabId) {
  if (!pending || tabId == null) return;
  chrome.tabs.sendMessage(tabId, { type: 'reecap-import', dataUrl: pending.dataUrl, clicks: pending.clicks }).catch(() => {});
  pending = null;
}
