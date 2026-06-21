import React, { useRef } from 'react';

interface SliderProps {
  label?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  /** Optional custom formatter for the in-track value (overrides value+unit). */
  format?: (value: number) => string;
}

const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  format,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const decimals = (String(step).split('.')[1] || '').length;
  const clampSnap = (v: number) => {
    const snapped = Math.round((v - min) / step) * step + min;
    const clamped = Math.min(max, Math.max(min, snapped));
    return parseFloat(clamped.toFixed(decimals));
  };

  const ratio = max > min ? Math.min(1, Math.max(0, (value - min) / (max - min))) : 0;
  const pos = `${ratio * 100}%`;
  const display = format ? format(value) : `${value}${unit}`;

  const setFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const r = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const next = clampSnap(min + r * (max - min));
    if (next !== value) onChange(next);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    dragging.current = true;
    try { trackRef.current?.setPointerCapture(e.pointerId); } catch { /* synthetic events */ }
    setFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    setFromClientX(e.clientX);
  };
  const endDrag = (e: React.PointerEvent) => {
    dragging.current = false;
    try { trackRef.current?.releasePointerCapture(e.pointerId); } catch { /* noop */ }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    let next = value;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = clampSnap(value + step);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = clampSnap(value - step);
    else if (e.key === 'Home') next = clampSnap(min);
    else if (e.key === 'End') next = clampSnap(max);
    else return;
    e.preventDefault();
    if (next !== value) onChange(next);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
          {label}
        </label>
      )}

      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={label || undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        className="relative h-9 w-full rounded-[10px] bg-[var(--color-bg-hover)] border border-[var(--color-border-default)] overflow-hidden cursor-ew-resize select-none touch-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40"
      >
        {/* Filled (value) region */}
        <div
          className="absolute inset-y-0 left-0 bg-black/[0.05] dark:bg-white/[0.06] pointer-events-none"
          style={{ width: pos }}
        />

        {/* In-track value */}
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-semibold tabular-nums text-[var(--color-text-secondary)] pointer-events-none">
          {display}
        </span>

        {/* Grip handle */}
        <div
          className="absolute top-1/2 flex gap-[3px] pointer-events-none"
          style={{ left: pos, transform: 'translate(-50%, -50%)' }}
        >
          <span className="w-px h-3.5 bg-[var(--color-border-strong)] rounded-full" />
          <span className="w-px h-3.5 bg-[var(--color-border-strong)] rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default Slider;
