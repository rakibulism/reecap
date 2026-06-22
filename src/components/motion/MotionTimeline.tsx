import React, { useLayoutEffect, useRef, useState } from 'react';
import { useMotionStore } from '../../store/motionStore';
import { Play, Pause, SkipBack, Plus, Minus } from 'phosphor-react';

const GUTTER = 150; // px — left column showing layer names
const ROW_H = 28;

const MotionTimeline: React.FC = () => {
  const {
    doc,
    time,
    isPlaying,
    selectedId,
    setTime,
    setPlaying,
    setDuration,
    selectLayer,
  } = useMotionStore();

  const trackRef = useRef<HTMLDivElement>(null);
  const [trackW, setTrackW] = useState(0);

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setTrackW(el.clientWidth));
    ro.observe(el);
    setTrackW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const pxPerSec = trackW > 0 && doc.duration > 0 ? trackW / doc.duration : 80;

  // Top layer first (matches the layers panel).
  const ordered = [...doc.layers].reverse();

  const scrub = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const t = (clientX - rect.left) / pxPerSec;
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

  // Second tick marks across the ruler.
  const ticks: number[] = [];
  for (let s = 0; s <= Math.floor(doc.duration); s++) ticks.push(s);

  const playheadX = time * pxPerSec;

  return (
    <div className="border-t border-[var(--color-border-default)] bg-[var(--color-bg-page)] flex flex-col">
      {/* Transport */}
      <div className="h-11 flex items-center gap-3 px-3 border-b border-[var(--color-border-default)]">
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

        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
          Duration
        </span>
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
        </div>
      </div>

      {/* Tracks */}
      <div className="flex max-h-[210px] overflow-y-auto custom-scrollbar">
        {/* Name gutter */}
        <div className="shrink-0 border-r border-[var(--color-border-default)] bg-[var(--color-bg-panel)]" style={{ width: GUTTER }}>
          <div className="h-6 border-b border-[var(--color-border-default)]" />
          {ordered.map((layer) => (
            <div
              key={layer.id}
              onClick={() => selectLayer(layer.id)}
              className={`flex items-center px-3 cursor-pointer text-[11px] font-medium truncate border-b border-[var(--color-border-default)]/50
                ${layer.id === selectedId ? 'text-[var(--color-text-primary)] bg-[var(--color-bg-hover)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'}`}
              style={{ height: ROW_H }}
            >
              {layer.name}
            </div>
          ))}
        </div>

        {/* Track area */}
        <div className="flex-1 relative">
          {/* Ruler (also the scrub surface) */}
          <div
            ref={trackRef}
            onPointerDown={startScrub}
            className="h-6 relative border-b border-[var(--color-border-default)] cursor-ew-resize select-none"
          >
            {ticks.map((s) => (
              <div key={s} className="absolute top-0 bottom-0 flex items-end" style={{ left: s * pxPerSec }}>
                <span className="text-[9px] text-[var(--color-text-muted)] tabular-nums pl-0.5 pb-0.5 border-l border-[var(--color-border-default)] h-full flex items-end">
                  {s}s
                </span>
              </div>
            ))}
          </div>

          {/* Per-layer bars */}
          {ordered.map((layer) => {
            const a = layer.animation;
            const start = a.start;
            const inEnd = a.start + a.inDuration;
            const outStart = Math.max(inEnd, doc.duration - a.outDuration);
            return (
              <div
                key={layer.id}
                onClick={() => selectLayer(layer.id)}
                className="relative border-b border-[var(--color-border-default)]/50"
                style={{ height: ROW_H }}
              >
                {/* Full lifespan bar */}
                <div
                  className={`absolute top-1.5 bottom-1.5 rounded-[3px] ${layer.id === selectedId ? 'ring-1 ring-[var(--color-primary)]' : ''}`}
                  style={{
                    left: start * pxPerSec,
                    width: Math.max(2, (doc.duration - start) * pxPerSec),
                    background: 'color-mix(in srgb, var(--color-primary) 28%, transparent)',
                  }}
                />
                {/* In ramp */}
                {a.inPreset !== 'none' && a.inDuration > 0 && (
                  <div
                    className="absolute top-1.5 bottom-1.5 rounded-l-[3px]"
                    style={{
                      left: start * pxPerSec,
                      width: Math.max(2, (inEnd - start) * pxPerSec),
                      background: 'color-mix(in srgb, var(--color-primary) 70%, transparent)',
                    }}
                  />
                )}
                {/* Out ramp */}
                {a.outPreset !== 'none' && a.outDuration > 0 && (
                  <div
                    className="absolute top-1.5 bottom-1.5 rounded-r-[3px]"
                    style={{
                      left: outStart * pxPerSec,
                      width: Math.max(2, (doc.duration - outStart) * pxPerSec),
                      background: 'color-mix(in srgb, var(--color-primary) 70%, transparent)',
                    }}
                  />
                )}
              </div>
            );
          })}

          {/* Playhead spanning ruler + tracks */}
          <div
            className="absolute top-0 bottom-0 w-px bg-[var(--color-primary)] pointer-events-none z-10"
            style={{ transform: `translateX(${playheadX}px)` }}
          >
            <div className="absolute -top-0.5 -left-1.5 w-3 h-3 rounded-full bg-[var(--color-primary)] border-2 border-white shadow-sm" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotionTimeline;
