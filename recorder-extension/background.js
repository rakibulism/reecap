// Reecap Recorder — service worker.
//
// Flow:
//   1. Click the toolbar icon → grab the active tab as the target, snapshot a
//      thumbnail, and open the setup page (a normal extension tab).
//   2. On the setup page the user reviews the target and presses Start.
//   3. We start capturing that tab (MediaRecorder lives in an offscreen doc),
//      focus the target tab, and show an on-page floating control bar.
//   4. Pause / resume / stop come from the floating bar. On stop we hand the
//      recording + click marks off to the Reecap web app.
//
// No microphone or camera is ever requested — capture is tab-only, audio off.

const REECAP_URL = 'https://reecap.vercel.app/app?recorder=1';

let session = null; // { targetTabId, start, clicks, pausedTotal, pauseStart }
let pendingHandoff = null; // { dataUrl, clicks } awaiting the Reecap page's "ready"

// ---- toolbar click → open the setup page -----------------------------------
chrome.action.onClicked.addListener(async () => {
  if (session) { // already recording → just focus the tab being recorded
    chrome.tabs.update(session.targetTabId, { active: true });
    return;
  }
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  let thumb = '';
  try {
    thumb = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'jpeg', quality: 50 });
  } catch {
    /* some pages (chrome://, store) can't be captured; the setup page handles an empty thumb */
  }
  await chrome.storage.session.set({
    setup: { targetTabId: tab.id, title: tab.title || tab.url || 'This tab', favIconUrl: tab.favIconUrl || '', url: tab.url || '', thumb },
  });
  chrome.tabs.create({ url: chrome.runtime.getURL('setup.html') });
});

async function ensureOffscreen() {
  if (await chrome.offscreen.hasDocument?.()) return;
  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['USER_MEDIA'],
    justification: 'Recording the selected tab to a video file.',
  });
}

async function startCapture(targetTabId) {
  const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId });
  await ensureOffscreen();
  session = { targetTabId, start: Date.now(), clicks: [], pausedTotal: 0, pauseStart: 0 };
  chrome.runtime.sendMessage({ target: 'offscreen', type: 'start', streamId });
  chrome.action.setBadgeText({ text: 'REC' });
  chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
  await chrome.tabs.update(targetTabId, { active: true });
  chrome.tabs.sendMessage(targetTabId, { type: 'rec-bar-show' }).catch(() => {});
}

// Elapsed recording time minus any paused spans (so click marks stay accurate).
function elapsed() {
  if (!session) return 0;
  const pausedNow = session.pauseStart ? Date.now() - session.pauseStart : 0;
  return Date.now() - session.start - session.pausedTotal - pausedNow;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.type) {
    case 'start-recording':
      startCapture(msg.targetTabId);
      sendResponse({ ok: true });
      break;
    case 'pause-recording':
      if (session && !session.pauseStart) {
        session.pauseStart = Date.now();
        chrome.runtime.sendMessage({ target: 'offscreen', type: 'pause' });
      }
      break;
    case 'resume-recording':
      if (session && session.pauseStart) {
        session.pausedTotal += Date.now() - session.pauseStart;
        session.pauseStart = 0;
        chrome.runtime.sendMessage({ target: 'offscreen', type: 'resume' });
      }
      break;
    case 'stop-recording':
      if (session) chrome.tabs.sendMessage(session.targetTabId, { type: 'rec-bar-hide' }).catch(() => {});
      chrome.runtime.sendMessage({ target: 'offscreen', type: 'stop' });
      chrome.action.setBadgeText({ text: '' });
      break;
    case 'page-click':
      if (session && !session.pauseStart && sender.tab?.id === session.targetTabId) {
        session.clicks.push({ t: elapsed() / 1000, x: msg.x, y: msg.y });
      }
      break;
    case 'offscreen-data':
      handoff(msg.dataUrl);
      break;
    case 'reecap-ready':
      flushHandoff(sender.tab?.id);
      break;
  }
  return true;
});

async function handoff(dataUrl) {
  pendingHandoff = { dataUrl, clicks: session ? session.clicks : [] };
  session = null;
  // Open Reecap; its content script posts "reecap-ready" once the recorder
  // view has mounted, and we deliver then (see flushHandoff).
  chrome.tabs.create({ url: REECAP_URL });
}

function flushHandoff(tabId) {
  if (!pendingHandoff || tabId == null) return;
  chrome.tabs.sendMessage(tabId, { type: 'reecap-import', dataUrl: pendingHandoff.dataUrl, clicks: pendingHandoff.clicks }).catch(() => {});
  pendingHandoff = null;
}
