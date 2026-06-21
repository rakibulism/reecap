import React from 'react';

interface SliderProps {
  label?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  /** Optional custom formatter for the value box (overrides value+unit). */
  format?: (value: number) => string;
}

const HANDLE = 20; // px — keeps the handle fully inside the track at the extremes

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
  const ratio = max > min ? Math.min(1, Math.max(0, (value - min) / (max - min))) : 0;
  // Position the handle center within the padded track so it never overflows.
  const pos = `calc(${ratio} * (100% - ${HANDLE}px) + ${HANDLE / 2}px)`;
  const display = format ? format(value) : `${value}${unit}`;

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
          {label}
        </label>
      )}

      <div className="flex items-center gap-2">
        {/* Track */}
        <div className="reecap-track relative flex-1 h-9 rounded-[10px] bg-[var(--color-bg-hover)] border border-[var(--color-border-default)] overflow-hidden group">
          {/* Filled progress */}
          <div
            className="absolute inset-y-0 left-0 bg-[var(--color-primary)]/20 transition-[width] duration-75"
            style={{ width: pos }}
          />

          {/* Grip handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-7 rounded-[6px] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-[var(--shadow-xs)] flex items-center justify-center gap-[3px] pointer-events-none transition-transform group-active:scale-105"
            style={{ left: pos }}
          >
            <span className="w-px h-2.5 bg-[var(--color-border-strong)] rounded-full" />
            <span className="w-px h-2.5 bg-[var(--color-border-strong)] rounded-full" />
          </div>

          {/* Invisible native range for drag + keyboard accessibility */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            aria-label={label || undefined}
            className="absolute inset-0 w-full h-full m-0 opacity-0 cursor-pointer appearance-none"
          />
        </div>

        {/* Value box */}
        <div className="w-[60px] h-9 shrink-0 rounded-[8px] bg-[var(--color-bg-hover)] border border-[var(--color-border-default)] flex items-center justify-center text-[12px] font-semibold tabular-nums text-[var(--color-text-primary)]">
          {display}
        </div>
      </div>
    </div>
  );
};

export default Slider;
