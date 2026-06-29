// Browser-side drafts for the Video editor and Motion designer.
//
// Everything is client-side, so a draft is just a snapshot of the relevant
// store kept in IndexedDB (which — unlike localStorage — can hold media and
// hundreds of MB):
//   • Video — photos keep their `File` objects (IndexedDB stores Files
//     natively); object URLs are session-only so we drop and re-mint them.
//   • Motion — the doc is plain JSON, but image layers may use a `blob:` src
//     that dies on reload, so we inline those as data URLs at save time.
//
// Each tool has one rolling "auto" draft (the autosave / last session) plus any
// number of "named" drafts the user saves explicitly.

import { useReecapStore } from '../store/reecapStore';
import { useMotionStore } from '../store/motionStore';
import type { Photo, ReecapSettings } from '../types';
import type { MotionDoc } from '../types/motion';

export type DraftTool = 'video' | 'motion';

export interface DraftMeta {
  id: string;
  tool: DraftTool;
  name: string;
  kind: 'auto' | 'named';
  updatedAt: number;
  thumbnail?: string; // small data URL for the list
}

type SerializedPhoto = Omit<Photo, 'objectUrl' | 'thumbnailUrl'>;

interface VideoState {
  photos: SerializedPhoto[];
  settings: ReecapSettings;
  projectName: string;
  playbackSpeed: number;
  audio: { url: string; name: string } | null;
}

interface DraftRecord extends DraftMeta {
  video?: VideoState;
  motion?: MotionDoc;
}

// ---- IndexedDB -------------------------------------------------------------
const DB_NAME = 'reecap-drafts';
const STORE = 'drafts';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(rec: DraftRecord): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(rec);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbGet(id: string): Promise<DraftRecord | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result as DraftRecord | undefined);
    req.onerror = () => reject(req.error);
  });
}

async function idbGetAll(): Promise<DraftRecord[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
    req.onsuccess = () => resolve((req.result as DraftRecord[]) || []);
    req.onerror = () => reject(req.error);
  });
}

async function idbDelete(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ---- media helpers ---------------------------------------------------------
function blobUrlToDataUrl(url: string): Promise<string> {
  return fetch(url)
    .then((r) => r.blob())
    .then(
      (blob) =>
        new Promise<string>((resolve, reject) => {
          const fr = new FileReader();
          fr.onload = () => resolve(fr.result as string);
          fr.onerror = () => reject(fr.error);
          fr.readAsDataURL(blob);
        }),
    );
}

// A small JPEG thumbnail from a File, for the drafts list.
function fileToThumb(file: File): Promise<string | undefined> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const w = 160;
      const h = Math.max(1, Math.round((img.height / img.width) * w));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      try { resolve(canvas.toDataURL('image/jpeg', 0.6)); } catch { resolve(undefined); }
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(undefined); };
    img.src = url;
  });
}

function colorSwatch(color: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 160;
  canvas.height = 90;
  const ctx = canvas.getContext('2d');
  if (ctx) { ctx.fillStyle = color || '#111111'; ctx.fillRect(0, 0, 160, 90); }
  try { return canvas.toDataURL('image/png'); } catch { return ''; }
}

// ---- capture current store state ------------------------------------------
async function captureVideo(): Promise<{ video: VideoState; thumbnail?: string }> {
  const s = useReecapStore.getState();
  const photos = s.photos.map(({ objectUrl, thumbnailUrl, ...rest }) => {
    void objectUrl; void thumbnailUrl; // session-only — re-minted on load
    return rest;
  });
  const first = s.photos[0]?.file;
  const thumbnail = first ? await fileToThumb(first) : undefined;
  return {
    video: {
      photos,
      settings: s.settings,
      projectName: s.projectName,
      playbackSpeed: s.playbackSpeed,
      audio: s.audio,
    },
    thumbnail,
  };
}

async function captureMotion(): Promise<{ motion: MotionDoc; thumbnail?: string }> {
  const doc = useMotionStore.getState().doc;
  const layers = await Promise.all(
    doc.layers.map(async (l) =>
      l.type === 'image' && l.src && l.src.startsWith('blob:')
        ? { ...l, src: await blobUrlToDataUrl(l.src) }
        : l,
    ),
  );
  return { motion: { ...doc, layers }, thumbnail: colorSwatch(doc.background) };
}

// ---- hydrate store from a draft -------------------------------------------
function hydrateVideo(v: VideoState) {
  const photos: Photo[] = v.photos.map((p) => ({
    ...p,
    objectUrl: p.file ? URL.createObjectURL(p.file) : p.url || '',
  }));
  useReecapStore.getState().loadVideoProject({
    photos,
    settings: v.settings,
    projectName: v.projectName,
    playbackSpeed: v.playbackSpeed,
    audio: v.audio,
  });
}

// ---- public API ------------------------------------------------------------
const autoId = (tool: DraftTool) => `auto:${tool}`;
const newId = () => `d_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;

const toMeta = (r: DraftRecord): DraftMeta => ({
  id: r.id, tool: r.tool, name: r.name, kind: r.kind, updatedAt: r.updatedAt, thumbnail: r.thumbnail,
});

export async function listDrafts(): Promise<DraftMeta[]> {
  const all = await idbGetAll();
  return all.map(toMeta).sort((a, b) => b.updatedAt - a.updatedAt);
}

async function buildRecord(tool: DraftTool, id: string, name: string, kind: 'auto' | 'named'): Promise<DraftRecord> {
  const base = { id, tool, name, kind, updatedAt: Date.now() };
  if (tool === 'video') {
    const { video, thumbnail } = await captureVideo();
    return { ...base, video, thumbnail };
  }
  const { motion, thumbnail } = await captureMotion();
  return { ...base, motion, thumbnail };
}

/** Save the current project as a new named draft. */
export async function saveNamedDraft(tool: DraftTool, name: string): Promise<DraftMeta> {
  const rec = await buildRecord(tool, newId(), name.trim() || 'Untitled draft', 'named');
  await idbPut(rec);
  return toMeta(rec);
}

/** Roll the current project into the tool's autosave slot. */
export async function updateAutosave(tool: DraftTool): Promise<void> {
  const rec = await buildRecord(tool, autoId(tool), 'Last session', 'auto');
  await idbPut(rec);
}

export async function getAutosave(tool: DraftTool): Promise<DraftMeta | null> {
  const rec = await idbGet(autoId(tool));
  return rec ? toMeta(rec) : null;
}

/** Load a draft into its tool's store. Returns the tool, or null if missing. */
export async function openDraft(id: string): Promise<DraftTool | null> {
  const rec = await idbGet(id);
  if (!rec) return null;
  if (rec.tool === 'video' && rec.video) hydrateVideo(rec.video);
  else if (rec.tool === 'motion' && rec.motion) useMotionStore.getState().loadDoc(rec.motion);
  else return null;
  return rec.tool;
}

export async function renameDraft(id: string, name: string): Promise<void> {
  const rec = await idbGet(id);
  if (!rec) return;
  rec.name = name.trim() || rec.name;
  await idbPut(rec);
}

export async function deleteDraft(id: string): Promise<void> {
  await idbDelete(id);
}
