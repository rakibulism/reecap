import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}

const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
}) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <div className="flex justify-between items-center">
          <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
            {label}
          </label>
        </div>
      )}
      <div className="flex items-center gap-3 h-6 group">
        <div className="relative flex-1 flex items-center h-full">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            style={{
              background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${((value - min) / (max - min)) * 100}%, var(--color-bg-hover) ${((value - min) / (max - min)) * 100}%, var(--color-bg-hover) 100%)`
            }}
            className="reecap-slider"
          />
        </div>
        <span className="text-[12px] tabular-nums font-bold text-[var(--color-text-primary)] w-10 text-right shrink-0">
          {value}{unit}
        </span>
      </div>
    </div>
  );
};

export default Slider;
