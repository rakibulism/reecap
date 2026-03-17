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
  // Use local state for the "visual" value so the slider thumb is buttery smooth
  const [localValue, setLocalValue] = React.useState(value);

  // Sync with prop when it changes externally (e.g. from store)
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const val = parseFloat(e.currentTarget.value);
    setLocalValue(val);
    onChange(val);
  };

  return (
    <div className="flex flex-col gap-1 w-full relative">
      <div className="flex justify-between items-center px-1">
        {label && (
          <label className="text-[10px] font-bold uppercase tracking-[0.05em] text-[var(--color-text-muted)]">
            {label}
          </label>
        )}
        <span className="text-[10px] tabular-nums font-bold text-[var(--color-text-primary)]">
          {localValue}{unit}
        </span>
      </div>
      <div className="flex items-center h-10 group relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onInput={handleInput}
          style={{
            background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${((localValue - min) / (max - min)) * 100}%, var(--color-bg-hover) ${((localValue - min) / (max - min)) * 100}%, var(--color-bg-hover) 100%)`
          }}
          className="reecap-slider"
        />
      </div>
    </div>
  );
};

export default Slider;
