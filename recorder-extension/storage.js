// Reecap Recorder — shared settings + save-folder persistence.
//
// Small helpers used by both the options page and the recording controller so
// they agree on where settings live and how the "default folder" handle is kept.
//
//   • Plain settings  → chrome.storage.local (key "settings").
//   • The chosen save folder → an IndexedDB-stored FileSystemDirectoryHandle
//     (these can't go in chrome.storage; IndexedDB is the only place that keeps
//     a live handle across page loads, and it's shared across extension pages).

const SETTINGS_KEY = 'settings';

// saveMode:
//   'download' — browser's default Downloads folder, no prompt (legacy default)
//   'ask'      — show a "Save as" dialog every time
//   'folder'   — write straight into a folder the user picked once
const DEFAULT_SETTINGS = { saveMode: 'download', defaultName: 'reecap-recording' };

async function getSettings() {
  const stored = await chrome.storage.local.get(SETTINGS_KEY);
  return { ...DEFAULT_SETTINGS, ...(stored[SETTINGS_KEY] || {}) };
}

async function setSettings(patch) {
  const next = { ...(await getSettings()), ...patch };
  await chrome.storage.local.set({ [SETTINGS_KEY]: next });
  return next;
}

// ---- IndexedDB key/value for the directory handle --------------------------
function idbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('reecap-recorder', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('handles');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('handles', 'readonly');
    const req = tx.objectStore('handles').get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key, value) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('handles', 'readwrite');
    tx.objectStore('handles').put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

const getSaveDir = () => idbGet('saveDir');
const setSaveDir = (handle) => idbSet('saveDir', handle);

// Verify (and, if allowed, re-request) write permission on a stored handle.
async function ensureWritePermission(handle, withPrompt) {
  if (!handle || !handle.queryPermission) return true; // older browsers: assume ok
  const opts = { mode: 'readwrite' };
  if ((await handle.queryPermission(opts)) === 'granted') return true;
  if (withPrompt && (await handle.requestPermission(opts)) === 'granted') return true;
  return false;
}

// Strip characters that aren't safe in a file name; guarantee a .webm suffix.
function toWebmFilename(name) {
  let base = String(name || '').trim().replace(/[\\/:*?"<>|]+/g, '-').replace(/\.webm$/i, '');
  if (!base) base = 'reecap-recording';
  return `${base}.webm`;
}
