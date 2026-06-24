// Reecap Recorder — service worker (coordinator).
//
// Whole-screen recording: the setup page owns getDisplayMedia + the mic stream
// and runs MediaRecorder (it stays open in the background while you record).
// This worker tracks recording state, broadcasts it to every tab so the
// floating controls + webcam bubble appear wherever you go, relays
// pause/resume/stop to the controller, accumulates click marks, and hands the
// finished clip to the Reecap web app.

const REECAP_URL = 'https://reecap.vercel.app/app?recorder=1';

let rec = null; // { controllerTabId, originalTabId, start, pausedTotal, pauseStart, clicks, camera }
let pending = null; // { dataUrl, clicks } awaiting the Reecap page "ready"

chrome.action.onClicked.addListener(async () => {
  if (rec) { // already recording → focus the tab you started from
    if (rec.originalTabId) chrome.tabs.update(rec.originalTabId, { active: true }).catch(() => {});
    return;
  }
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await chrome.storage.session.set({ setup: { originalTabId: tab?.id ?? null, title: tab?.title || '', favIconUrl: tab?.favIconUrl || '' } });
  chrome.tabs.create({ url: chrome.runtime.getURL('setup.html') });
});

function elapsed() {
  if (!rec) return 0;
  const pausedNow = rec.pauseStart ? Date.now() - rec.pauseStart : 0;
  return Date.now() - rec.start - rec.pausedTotal - pausedNow;
}

function broadcast(msg) {
  chrome.tabs.query({}, (tabs) => tabs.forEach((t) => t.id && chrome.tabs.sendMessage(t.id, msg).catch(() => {})));
}

chrome.runtime.onMessage.addListener((m, sender, send) => {
  switch (m.type) {
    case 'recording-started':
      rec = { controllerTabId: sender.tab?.id ?? null, originalTabId: m.originalTabId, start: Date.now(), pausedTotal: 0, pauseStart: 0, clicks: [], camera: !!m.camera };
      chrome.action.setBadgeText({ text: 'REC' });
      chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
      broadcast({ type: 'rec-show', camera: rec.camera, paused: false });
      if (rec.originalTabId) chrome.tabs.update(rec.originalTabId, { active: true }).catch(() => {});
      send({ ok: true });
      break;
    case 'rec-status':
      send(rec ? { active: true, camera: rec.camera, paused: !!rec.pauseStart } : { active: false });
      break;
    case 'rec-pause':
      if (rec && !rec.pauseStart) {
        rec.pauseStart = Date.now();
        chrome.tabs.sendMessage(rec.controllerTabId, { type: 'ctrl-pause' }).catch(() => {});
        broadcast({ type: 'rec-paused', paused: true });
      }
      break;
    case 'rec-resume':
      if (rec && rec.pauseStart) {
        rec.pausedTotal += Date.now() - rec.pauseStart;
        rec.pauseStart = 0;
        chrome.tabs.sendMessage(rec.controllerTabId, { type: 'ctrl-resume' }).catch(() => {});
        broadcast({ type: 'rec-paused', paused: false });
      }
      break;
    case 'rec-stop':
      if (rec) chrome.tabs.sendMessage(rec.controllerTabId, { type: 'ctrl-stop' }).catch(() => {});
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
  broadcast({ type: 'rec-hide' });
  rec = null;
  chrome.tabs.create({ url: REECAP_URL });
}

function flush(tabId) {
  if (!pending || tabId == null) return;
  chrome.tabs.sendMessage(tabId, { type: 'reecap-import', dataUrl: pending.dataUrl, clicks: pending.clicks }).catch(() => {});
  pending = null;
}
