import React, { useEffect } from 'react';
import { useMotionStore } from '../../store/motionStore';
import LayersPanel from './LayersPanel';
import MotionCanvas from './MotionCanvas';
import MotionInspector from './MotionInspector';
import MotionTimeline from './MotionTimeline';
import type { ReecapMotionPayload } from '../../types/motion';

// True when the user is typing into a field — keyboard shortcuts must yield.
function isEditingTarget(el: EventTarget | null): boolean {
  const node = el as HTMLElement | null;
  if (!node) return false;
  const tag = node.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || node.isContentEditable;
}

const MotionDesigner: React.FC = () => {
  const { doc, isPlaying, setTime, addImageLayer, importPayload } = useMotionStore();

  // Playback loop — advance the playhead and loop at the composition duration.
  useEffect(() => {
    if (!isPlaying) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const delta = (now - last) / 1000;
      last = now;
      const { time, doc: d } = useMotionStore.getState();
      let next = time + delta;
      if (next >= d.duration) next = next % d.duration; // loop
      setTime(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, setTime]);

  // Keyboard: playback, duplicate (⌘D), deletion (Del/⌫), z-order ([ ] ⌘[ ⌘])
  // and grouping (⌘G / ⌘⇧G).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isEditingTarget(e.target)) return;
      const s = useMotionStore.getState();
      const mod = e.metaKey || e.ctrlKey;

      if (e.code === 'Space') {
        e.preventDefault();
        if (!s.isPlaying && s.time >= s.doc.duration - 0.001) s.setTime(0);
        s.setPlaying(!s.isPlaying);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (s.selectedIds.length) {
          e.preventDefault();
          s.selectedIds.forEach((id) => s.removeLayer(id));
        }
      } else if (e.key === 'd' && mod) {
        if (s.selectedIds.length) {
          e.preventDefault();
          s.selectedIds.forEach((id) => s.duplicateLayer(id));
        }
      } else if (e.key === 'g' && mod) {
        e.preventDefault();
        if (e.shiftKey) {
          if (s.selectedId) s.ungroup(s.selectedId);
        } else {
          s.groupSelection();
        }
      } else if (e.key === ']') {
        if (!s.selectedId) return;
        e.preventDefault();
        mod ? s.bringToFront(s.selectedId) : s.bringForward(s.selectedId);
      } else if (e.key === '[') {
        if (!s.selectedId) return;
        e.preventDefault();
        mod ? s.sendToBack(s.selectedId) : s.sendBackward(s.selectedId);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Paste: Reecap/Figma payload (text) → import; image → image layer;
  // SVG markup (text) → image layer.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (isEditingTarget(e.target)) return;
      const data = e.clipboardData;
      if (!data) return;

      // 1) Image item on the clipboard.
      for (const item of Array.from(data.items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => addImageLayer(url, img.naturalWidth, img.naturalHeight, 'Pasted image');
            img.onerror = () => addImageLayer(url, 0, 0, 'Pasted image');
            img.src = url;
            return;
          }
        }
      }

      // 2) Text — Reecap payload or raw SVG.
      const text = data.getData('text/plain');
      if (!text) return;
      try {
        const payload = JSON.parse(text) as ReecapMotionPayload;
        if (payload?.__reecap === 'motion-frame' && (payload.image || payload.layers?.length)) {
          e.preventDefault();
          importPayload(payload);
          return;
        }
      } catch {
        /* not JSON */
      }
      if (text.trimStart().startsWith('<svg')) {
        e.preventDefault();
        const url = `data:image/svg+xml;utf8,${encodeURIComponent(text)}`;
        const img = new Image();
        img.onload = () => addImageLayer(url, img.naturalWidth || 600, img.naturalHeight || 400, 'Pasted SVG');
        img.onerror = () => addImageLayer(url, 600, 400, 'Pasted SVG');
        img.src = url;
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [addImageLayer, importPayload]);

  // Drag-and-drop image files onto the workspace.
  const onDrop = async (e: React.DragEvent) => {
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;
    e.preventDefault();
    for (const file of files) {
      const url = URL.createObjectURL(file);
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          addImageLayer(url, img.naturalWidth, img.naturalHeight, file.name);
          resolve();
        };
        img.onerror = () => {
          addImageLayer(url, 0, 0, file.name);
          resolve();
        };
        img.src = url;
      });
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden" onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>
      <div className="flex flex-1 overflow-hidden">
        <LayersPanel />
        <MotionCanvas key={`${doc.width}x${doc.height}`} />
        <MotionInspector />
      </div>
      <MotionTimeline />
    </div>
  );
};

export default MotionDesigner;
