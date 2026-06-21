import React, { useEffect, useRef } from 'react';

interface SliderProps {
  label?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  /** Optional custom formatter for the value (overrides value+unit). */
  format?: (value: number) => string;
  /** 'default' = chunky track with in-track value; 'thin' = slim track + thumb + value to the right. */
  variant?: 'default' | 'thin';
  /** thin variant only: hide the trailing value label (when shown externally). */
  showValue?: boolean;
}

// Accumulated scroll distance (px) required to advance one step via Shift+wheel.
// Decouples step rate from the (very high) trackpad wheel-event frequency.
const WHEEL_STEP_PX = 48;

const snap = (v: number, min: number, max: number, step: number) => {
  const decimals = (String(step).split('.')[1] || '').length;
  const snapped = Math.round((v - min) / step) * step + min;
  const clamped = Math.min(max, Math.max(min, snapped));
  return parseFloat(clamped.toFixed(decimals));
};

const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  format,
  variant = 'default',
  showValue = true,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);

  // Keep latest props in a ref so listeners (attached once) read current values.
  const stateRef = useRef({ value, min, max, step, onChange });
  stateRef.current = { value, min, max, step, onChange };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let wheelAccum = 0;

    const setFromClientX = (clientX: number) => {
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0) return;
      const { min, max, step, value, onChange } = stateRef.current;
      const r = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const next = snap(min + r * (max - min), min, max, step);
      if (next !== value) onChange(next);
    };

    const stepBy = (dir: number) => {
      const { value, min, max, step, onChange } = stateRef.current;
      const next = snap(value + dir * step, min, max, step);
      if (next !== value) onChange(next);
    };

    // Drag: move/up live on window so the whole gesture is tracked even when
    // the cursor leaves the (short) track — the canonical robust slider drag.
    const onMove = (e: PointerEvent) => setFromClientX(e.clientX);
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      document.body.style.userSelect = '';
    };
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      el.focus();
      document.body.style.userSelect = 'none';
      setFromClientX(e.clientX);
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    };

    // Mac-friendly: hold Shift and scroll the trackpad up/down to nudge,
    // accumulating delta so it advances smoothly rather than racing.
    const onWheel = (e: WheelEvent) => {
      if (!e.shiftKey) return;
      const delta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
      if (!delta) return;
      e.preventDefault();
      wheelAccum += delta;
      while (Math.abs(wheelAccum) >= WHEEL_STEP_PX) {
        stepBy(wheelAccum < 0 ? 1 : -1);
        wheelAccum -= Math.sign(wheelAccum) * WHEEL_STEP_PX;
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') stepBy(1);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') stepBy(-1);
      else if (e.key === 'Home') stepBy(-Infinity);
      else if (e.key === 'End') stepBy(Infinity);
      else return;
      e.preventDefault();
    };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('keydown', onKeyDown);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      document.body.style.userSelect = '';
    };
  }, []);

  const ratio = max > min ? Math.min(1, Math.max(0, (value - min) / (max - min))) : 0;
  const pos = `${ratio * 100}%`;
  const display = format ? format(value) : `${value}${unit}`;

  const a11y = {
    role: 'slider' as const,
    tabIndex: 0,
    'aria-valuenow': value,
    'aria-valuemin': min,
    'aria-valuemax': max,
    'aria-label': label || undefined,
  };

  if (variant === 'thin') {
    return (
      <div className="flex items-center gap-3 w-full">
        <div
          ref={trackRef}
          {...a11y}
          className="relative flex-1 h-5 flex items-center cursor-ew-resize select-none touch-none outline-none"
        >
          <div className="relative w-full h-1.5 rounded-full bg-[var(--color-bg-hover)]">
            <div className="absolute inset-y-0 left-0 rounded-full bg-[var(--color-primary)] pointer-events-none" style={{ width: pos }} />
            <div
              className="absolute top-1/2 w-4 h-4 rounded-full bg-[var(--color-primary)] border-2 border-white shadow-[var(--shadow-sm)] pointer-events-none"
              style={{ left: pos, transform: 'translate(-50%, -50%)' }}
            />
          </div>
        </div>
        {showValue && (
          <span className="text-[12px] font-bold tabular-nums text-[var(--color-text-primary)] w-10 text-right shrink-0">
            {display}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
          {label}
        </label>
      )}

      <div
        ref={trackRef}
        {...a11y}
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
