// Where exported videos go on download.
//
// Three modes (see `VideoSaveMode`):
//   • 'download' — the browser's default Downloads folder, no prompt (default).
//   • 'ask'      — a File System Access "Save as" dialog every export.
//   • 'folder'   — straight into a folder the user picked once.
//
// The chosen folder is a live FileSystemDirectoryHandle, which can't live in
// localStorage — IndexedDB is the only store that keeps a handle across loads.
// The mode itself is a plain string kept in the Zustand store / localStorage.

export type VideoSaveMode = 'download' | 'ask' | 'folder';

export const SAVE_MODE_KEY = 'reecap-video-save-mode';

// File System Access API needs a Chromium-based browser; elsewhere we silently
// fall back to a plain download so an export is never lost.
export const fsAccessSupported =
  typeof window !== 'undefined' && 'showSaveFilePicker' in window;
export const dirPickerSupported =
  typeof window !== 'undefined' && 'showDirectoryPicker' in window;

// ---- IndexedDB key/value for the directory handle --------------------------
function idbOpen(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('reecap-save', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('handles');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet<T>(key: string): Promise<T | undefined> {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const req = db.transaction('handles', 'readonly').objectStore('handles').get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key: string, value: unknown): Promise<void> {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('handles', 'readwrite');
    tx.objectStore('handles').put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export const getSaveDir = () => idbGet<FileSystemDirectoryHandle>('videoDir');
export const setSaveDir = (handle: FileSystemDirectoryHandle) => idbSet('videoDir', handle);

// Verify (and, with a gesture, re-request) write permission on a stored handle.
async function ensureWritePermission(
  handle: FileSystemDirectoryHandle,
  withPrompt: boolean,
): Promise<boolean> {
  const h = handle as any;
  if (!h.queryPermission) return true; // older browsers: assume granted
  const opts = { mode: 'readwrite' as const };
  if ((await h.queryPermission(opts)) === 'granted') return true;
  if (withPrompt && (await h.requestPermission(opts)) === 'granted') return true;
  return false;
}

// Let the user pick (or change) the default save folder. Returns its name, or
// null if they cancelled. Must run inside a user gesture.
export async function chooseSaveFolder(): Promise<string | null> {
  try {
    const dir = await (window as any).showDirectoryPicker({ mode: 'readwrite', id: 'reecap-videos' });
    if (!(await ensureWritePermission(dir, true))) return null;
    await setSaveDir(dir);
    return dir.name;
  } catch {
    return null; // cancelled or blocked
  }
}

// Turn a user-typed name into a safe `<name>.mp4`, falling back to a dated name.
export function videoFilename(name?: string): string {
  const base = String(name || '')
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\.mp4$/i, '')
    .slice(0, 120);
  if (base) return `${base}.mp4`;
  return `reecap-export-${new Date().toISOString().slice(0, 10)}.mp4`;
}

export type SaveTarget =
  | { kind: 'file'; handle: FileSystemFileHandle }
  | { kind: 'dir'; handle: FileSystemDirectoryHandle }
  | { kind: 'download' };

export class SaveCancelled extends Error {}

// Decide where this export will go. Run inside the export click's user
// activation: "Save as" dialogs and folder-permission prompts require it, and
// encoding afterwards would otherwise expire the activation.
export async function prepareVideoSaveTarget(
  mode: VideoSaveMode,
  filename: string,
): Promise<SaveTarget> {
  if (mode === 'ask' && fsAccessSupported) {
    try {
      const handle: FileSystemFileHandle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [{ description: 'MP4 video', accept: { 'video/mp4': ['.mp4'] } }],
      });
      return { kind: 'file', handle };
    } catch (err: any) {
      // User dismissed the dialog → abort the whole export rather than render
      // a video they didn't choose to save.
      if (err && err.name === 'AbortError') throw new SaveCancelled();
      return { kind: 'download' };
    }
  }
  if (mode === 'folder') {
    const dir = await getSaveDir();
    if (dir && (await ensureWritePermission(dir, true))) return { kind: 'dir', handle: dir };
  }
  return { kind: 'download' };
}

// Write the finished blob to the prepared target, falling back to a plain
// download on any miss so the export is never lost.
export async function saveVideoBlob(
  blob: Blob,
  filename: string,
  target: SaveTarget,
): Promise<void> {
  try {
    if (target.kind === 'file' || target.kind === 'dir') {
      const fileHandle =
        target.kind === 'dir'
          ? await target.handle.getFileHandle(filename, { create: true })
          : target.handle;
      const writable = await (fileHandle as any).createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    }
  } catch {
    /* writing failed → download instead */
  }
  downloadBlob(blob, filename);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
