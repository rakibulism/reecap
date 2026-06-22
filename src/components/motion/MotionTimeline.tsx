import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useMotionStore } from '../../store/motionStore';
import {
  Play,
  Pause,
  SkipBack,
  Plus,
  Minus,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  ArrowsOutLineHorizontal,
  DotsSixVertical,
  MagicWand,
} from 'phosphor-react';
import type { MotionLayer } from '../../types/motion';

const GUTTER = 150; // px — left column showing layer names
const ROW_H = 28;
const RULER_H = 24;
const EDGE = 7; // px — clip resize handle width

interface RowMeta {
  layer: MotionLayer;
  depth: number;
}

const MotionTimeline: React.FC = () => {
  const {
    doc,
    time,
    isPlaying,
    selectedIds,
    timelineHeight,
    timelineZoom,
    setTime,
    setPlaying,
    setDuration,
    autoFitDuration,
    selectLayer,
    selectMany,
    setLayerSpan,
    setTimelineHeight,
    setTimelineZoom,
  } = useMotionStore();
  const anchorRef = useRef(0);

  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewW, setViewW] = useState(0);

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setViewW(el.clientWidth));
    ro.observe(el);
    setViewW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const fitPxPerSec = viewW > 0 && doc.duration > 0 ? viewW / doc.duration : 80;
  const pxPerSec = timelineZoom ?? fitPxPerSec;
  const contentW = doc.duration * pxPerSec;

  // Live scale for in-flight drags: in fit mode pxPerSec shrinks as the comp
  // grows, so the handlers read this ref instead of the value captured at
  // drag start — keeps the dragged edge under the cursor.
  const pxPerSecRef = useRef(pxPerSec);
  pxPerSecRef.current = pxPerSec;

  // Same visible tree order as the layers panel (roots reversed, nested groups).
  const rows: RowMeta[] = useMemo(() => {
    const childrenOf = new Map<string | null, MotionLayer[]>();
    for (const l of doc.layers) {
      const key = l.parentId ?? null;
      if (!childrenOf.has(key)) childrenOf.set(key, []);
      childrenOf.get(key)!.push(l);
    }
    const out: RowMeta[] = [];
    const walk = (parentId: string | null, depth: number) => {
      const kids = [...(childrenOf.get(parentId) ?? [])].reverse();
      for (const layer of kids) {
        out.push({ layer, depth });
        if (layer.type === 'group' && !layer.collapsed) walk(layer.id, depth + 1);
      }
    };
    walk(null, 0);
    return out;
  }, [doc.layers]);

  // Descendant span (for group rows) — min child start → max child end.
  const descendantsOf = (id: string): MotionLayer[] => {
    const ids = new Set([id]);
    let added = true;
    while (added) {
      added = false;
      for (const l of doc.layers) {
        if (l.parentId && ids.has(l.parentId) && !ids.has(l.id)) {
          ids.add(l.id);
          added = true;
        }
      }
    }
    return doc.layers.filter((l) => ids.has(l.id) && l.type !== 'group');
  };

  const spanOf = (layer: MotionLayer): { start: number; end: number } => {
    if (layer.type !== 'group') return { start: layer.animation.start, end: layer.animation.end };
    const kids = descendantsOf(layer.id);
    if (kids.length === 0) return { start: 0, end: doc.duration };
    return {
      start: Math.min(...kids.map((k) => k.animation.start)),
      end: Math.max(...kids.map((k) => k.animation.end)),
    };
  };

  // Row selection: plain = single (sets the range anchor), ⌘/Ctrl = toggle add,
  // Shift = select every row between the anchor and this one.
  const selectRow = (e: { metaKey: boolean; ctrlKey: boolean; shiftKey: boolean }, index: number, id: string) => {
    if (e.metaKey || e.ctrlKey) {
      selectLayer(id, true);
      anchorRef.current = index;
    } else if (e.shiftKey) {
      const a = Math.min(anchorRef.current, index);
      const b = Math.max(anchorRef.current, index);
      selectMany(rows.slice(a, b + 1).map((r) => r.layer.id));
    } else {
      selectLayer(id);
      anchorRef.current = index;
    }
  };

  const scrub = (clientX: number) => {
    const el = viewportRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const t = (clientX - rect.left + el.scrollLeft) / pxPerSec;
    setTime(Math.max(0, Math.min(doc.duration, t)));
  };

  const startScrub = (e: React.PointerEvent) => {
    e.preventDefault();
    setPlaying(false);
    scrub(e.clientX);
    const move = (ev: PointerEvent) => scrub(ev.clientX);
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  // Drag a clip: 'move' shifts the whole span, 'l'/'r' resize an edge. Group
  // rows move every descendant clip together.
  const startClipDrag = (
    e: React.PointerEvent,
    layer: MotionLayer,
    mode: 'move' | 'l' | 'r',
  ) => {
    e.preventDefault();
    e.stopPropagation();
    // Modifier-click selects (toggle / range) without starting a drag.
    if (e.shiftKey || e.metaKey || e.ctrlKey) {
      selectRow(e, rows.findIndex((r) => r.layer.id === layer.id), layer.id);
      return;
    }
    if (!selectedIds.includes(layer.id)) selectLayer(layer.id);
    setPlaying(false);
    const startX = e.clientX;

    if (layer.type === 'group') {
      const kids = descendantsOf(layer.id);
      const orig = kids.map((k) => ({ id: k.id, start: k.animation.start, end: k.animation.end }));
      if (orig.length === 0) return;
      const minStart = Math.min(...orig.map((o) => o.start));
      const move = (ev: PointerEvent) => {
        let d = (ev.clientX - startX) / pxPerSecRef.current;
        d = Math.max(-minStart, d); // can't go below 0; dragging right grows the comp
        orig.forEach((o) => setLayerSpan(o.id, o.start + d, o.end + d));
      };
      const up = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      return;
    }

    const o = { start: layer.animation.start, end: layer.animation.end };
    const move = (ev: PointerEvent) => {
      const d = (ev.clientX - startX) / pxPerSecRef.current;
      if (mode === 'move') {
        const cd = Math.max(-o.start, d); // dragging right grows the comp
        setLayerSpan(layer.id, o.start + cd, o.end + cd);
      } else if (mode === 'l') {
        setLayerSpan(layer.id, o.start + d, o.end);
      } else {
        setLayerSpan(layer.id, o.start, o.end + d);
      }
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  // Vertical resize of the whole panel (drag the top edge).
  const startPanelResize = (e: React.PointerEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const origH = timelineHeight;
    const move = (ev: PointerEvent) => setTimelineHeight(origH + (startY - ev.clientY));
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const zoomBy = (factor: number) => setTimelineZoom(Math.round((timelineZoom ?? fitPxPerSec) * factor));

  const ticks: number[] = [];
  const tickStep = pxPerSec < 40 ? 2 : pxPerSec > 200 ? 0.5 : 1;
  for (let s = 0; s <= doc.duration + 0.001; s += tickStep) ticks.push(Number(s.toFixed(2)));

  const playheadX = time * pxPerSec;
  const bodyHeight = RULER_H + rows.length * ROW_H;

  return (
    <div
      className="border-t border-[var(--color-border-default)] bg-[var(--color-bg-page)] flex flex-col shrink-0"
      style={{ height: timelineHeight }}
    >
      {/* Vertical resize handle */}
      <div
        onPointerDown={startPanelResize}
        className="h-1.5 -mt-1.5 cursor-ns-resize flex items-center justify-center group"
        title="Drag to resize timeline"
      >
        <div className="w-8 h-1 rounded-full bg-[var(--color-border-strong)] opacity-40 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Transport */}
      <div className="h-11 flex items-center gap-3 px-3 border-b border-[var(--color-border-default)] shrink-0">
        <button
          onClick={() => {
            if (!isPlaying && time >= doc.duration - 0.001) setTime(0);
            setPlaying(!isPlaying);
          }}
          className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center hover:opacity-90 transition-opacity shrink-0"
          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        >
          {isPlaying ? <Pause size={16} weight="fill" /> : <Play size={16} weight="fill" />}
        </button>
        <button
          onClick={() => {
            setPlaying(false);
            setTime(0);
          }}
          className="w-7 h-7 rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] flex items-center justify-center shrink-0"
          title="Restart"
        >
          <SkipBack size={14} weight="fill" />
        </button>

        <span className="text-[12px] font-semibold tabular-nums text-[var(--color-text-primary)] w-24">
          {time.toFixed(2)}s
          <span className="text-[var(--color-text-muted)]"> / {doc.duration.toFixed(1)}s</span>
        </span>

        <div className="flex-1" />

        {/* Zoom / Fit */}
        <div className="flex items-center gap-0.5">
          <button onClick={() => zoomBy(0.7)} title="Zoom out" className="w-7 h-7 rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] flex items-center justify-center">
            <MagnifyingGlassMinus size={15} />
          </button>
          <button onClick={() => setTimelineZoom(null)} title="Fit to view" className={`w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center ${timelineZoom === null ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'}`}>
            <ArrowsOutLineHorizontal size={15} />
          </button>
          <button onClick={() => zoomBy(1.4)} title="Zoom in" className="w-7 h-7 rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] flex items-center justify-center">
            <MagnifyingGlassPlus size={15} />
          </button>
        </div>

        <div className="h-5 w-px bg-[var(--color-border-default)]" />

        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Duration</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDuration(Math.max(0.5, doc.duration - 0.5))}
            className="w-6 h-6 rounded-[var(--radius-sm)] border border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] flex items-center justify-center"
          >
            <Minus size={12} />
          </button>
          <span className="text-[12px] font-semibold tabular-nums w-10 text-center">{doc.duration.toFixed(1)}s</span>
          <button
            onClick={() => setDuration(doc.duration + 0.5)}
            className="w-6 h-6 rounded-[var(--radius-sm)] border border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] flex items-center justify-center"
          >
            <Plus size={12} />
          </button>
          <button
            onClick={autoFitDuration}
            disabled={doc.layers.every((l) => l.type === 'group')}
            title="Auto: fit duration to the longest layer"
            className="ml-1 h-6 px-2 rounded-[var(--radius-sm)] border border-[var(--color-border-default)] text-[11px] font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <MagicWand size={12} weight="fill" /> Auto
          </button>
        </div>
      </div>

      {/* Body: name gutter + scrollable track area, both scroll vertically */}
      <div className="flex flex-1 overflow-y-auto custom-scrollbar min-h-0">
        {/* Name gutter */}
        <div className="shrink-0 border-r border-[var(--color-border-default)] bg-[var(--color-bg-panel)]" style={{ width: GUTTER }}>
          <div className="border-b border-[var(--color-border-default)]" style={{ height: RULER_H }} />
          {rows.map(({ layer, depth }, i) => (
            <div
              key={layer.id}
              onClick={(e) => selectRow(e, i, layer.id)}
              className={`flex items-center gap-1.5 pr-2 cursor-pointer text-[11px] font-medium truncate border-b border-[var(--color-border-default)]/50
                ${selectedIds.includes(layer.id) ? 'text-[var(--color-text-primary)] bg-[var(--color-bg-hover)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'}`}
              style={{ height: ROW_H, paddingLeft: 10 + depth * 12 }}
            >
              <span className="truncate">{layer.name}</span>
            </div>
          ))}
        </div>

        {/* Track viewport (horizontal scroll) */}
        <div ref={viewportRef} className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar">
          <div className="relative" style={{ width: Math.max(contentW, viewW), height: bodyHeight }}>
            {/* Ruler / scrub surface */}
            <div
              onPointerDown={startScrub}
              className="absolute top-0 left-0 right-0 border-b border-[var(--color-border-default)] cursor-ew-resize select-none"
              style={{ height: RULER_H }}
            >
              {ticks.map((s) => (
                <div key={s} className="absolute top-0 bottom-0 flex items-end" style={{ left: s * pxPerSec }}>
                  <span className="text-[9px] text-[var(--color-text-muted)] tabular-nums pl-0.5 pb-0.5 border-l border-[var(--color-border-default)] h-full flex items-end">
                    {s}s
                  </span>
                </div>
              ))}
            </div>

            {/* Per-row clips */}
            {rows.map(({ layer }, i) => {
              const { start, end } = spanOf(layer);
              const a = layer.animation;
              const inEnd = start + a.inDuration;
              const outStart = Math.max(inEnd, end - a.outDuration);
              const isGroup = layer.type === 'group';
              const selected = selectedIds.includes(layer.id);
              return (
                <div
                  key={layer.id}
                  className="absolute left-0 right-0 border-b border-[var(--color-border-default)]/40"
                  style={{ top: RULER_H + i * ROW_H, height: ROW_H }}
                  onPointerDown={(e) => selectRow(e, i, layer.id)}
                >
                  <div
                    onPointerDown={(e) => startClipDrag(e, layer, 'move')}
                    className={`absolute top-1.5 bottom-1.5 rounded-[4px] cursor-grab active:cursor-grabbing flex items-center
                      ${selected ? 'ring-1 ring-[var(--color-primary)]' : ''}`}
                    style={{
                      left: start * pxPerSec,
                      width: Math.max(6, (end - start) * pxPerSec),
                      background: isGroup
                        ? 'color-mix(in srgb, var(--color-primary) 16%, transparent)'
                        : 'color-mix(in srgb, var(--color-primary) 30%, transparent)',
                      border: isGroup ? '1px dashed color-mix(in srgb, var(--color-primary) 60%, transparent)' : 'none',
                    }}
                  >
                    {/* In/out ramps (visual layers only) */}
                    {!isGroup && a.inPreset !== 'none' && a.inDuration > 0 && (
                      <div className="absolute top-0 bottom-0 left-0 rounded-l-[4px] pointer-events-none" style={{ width: (inEnd - start) * pxPerSec, background: 'color-mix(in srgb, var(--color-primary) 55%, transparent)' }} />
                    )}
                    {!isGroup && a.outPreset !== 'none' && a.outDuration > 0 && (
                      <div className="absolute top-0 bottom-0 rounded-r-[4px] pointer-events-none" style={{ left: (outStart - start) * pxPerSec, width: (end - outStart) * pxPerSec, background: 'color-mix(in srgb, var(--color-primary) 55%, transparent)' }} />
                    )}
                    {isGroup && (
                      <DotsSixVertical size={11} className="text-[var(--color-primary)] opacity-60 ml-0.5 pointer-events-none" />
                    )}

                    {/* Edge resize handles (visual layers only) */}
                    {!isGroup && (
                      <>
                        <div
                          onPointerDown={(e) => startClipDrag(e, layer, 'l')}
                          className="absolute left-0 top-0 bottom-0 cursor-ew-resize"
                          style={{ width: EDGE }}
                        />
                        <div
                          onPointerDown={(e) => startClipDrag(e, layer, 'r')}
                          className="absolute right-0 top-0 bottom-0 cursor-ew-resize"
                          style={{ width: EDGE }}
                        />
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Playhead spanning ruler + rows */}
            <div
              className="absolute top-0 w-px bg-[var(--color-primary)] pointer-events-none z-10"
              style={{ left: 0, height: bodyHeight, transform: `translateX(${playheadX}px)` }}
            >
              <div className="absolute -top-0.5 -left-1.5 w-3 h-3 rounded-full bg-[var(--color-primary)] border-2 border-white shadow-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotionTimeline;
