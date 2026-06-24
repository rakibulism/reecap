// Reecap Recorder — service worker.
//
// Orchestrates tab recording (via an offscreen document, since service workers
// can't use MediaRecorder), accumulates click marks reported by the content
// script, and hands the finished recording off to the Reecap web app.

const REECAP_URL = 'https://reecap.vercel.app/app?recorder=1';

let session = null; // { tabId, start, clicks: [] }

async function ensureOffscreen() {
  if (await chrome.offscreen.hasDocument?.()) return;
  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['USER_MEDIA'],
    justification: 'Recording the active tab to a video file.',
  });
}

async function start() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id });
  await ensureOffscreen();
  session = { tabId: tab.id, start: Date.now(), clicks: [] };
  chrome.runtime.sendMessage({ target: 'offscreen', type: 'start', streamId });
  chrome.action.setBadgeText({ text: 'REC' });
  chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
}

function stop() {
  chrome.runtime.sendMessage({ target: 'offscreen', type: 'stop' });
  chrome.action.setBadgeText({ text: '' });
}

async function handoff(dataUrl) {
  const clicks = session ? session.clicks : [];
  session = null;
  const tab = await chrome.tabs.create({ url: REECAP_URL });
  chrome.tabs.onUpdated.addListener(function listener(id, info) {
    if (id === tab.id && info.status === 'complete') {
      chrome.tabs.onUpdated.removeListener(listener);
      // Give the SPA a moment to mount its message listener.
      setTimeout(() => chrome.tabs.sendMessage(tab.id, { type: 'reecap-import', dataUrl, clicks }).catch(() => {}), 1000);
    }
  });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.type) {
    case 'popup-start': start(); sendResponse({ ok: true }); break;
    case 'popup-stop': stop(); sendResponse({ ok: true }); break;
    case 'popup-status': sendResponse({ recording: !!session }); break;
    case 'page-click':
      if (session && sender.tab?.id === session.tabId) {
        session.clicks.push({ t: (Date.now() - session.start) / 1000, x: msg.x, y: msg.y });
      }
      break;
    case 'offscreen-data': handoff(msg.dataUrl); break;
  }
  return true; // keep the message channel open for async sendResponse
});
