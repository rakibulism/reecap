import { Lock } from 'phosphor-react';

interface Option<T> {
  label: string;
  value: T;
}

interface SegmentedControlProps<T> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  /** Values shown with a small lock (still clickable — e.g. Pro-gated tools). */
  lockedValues?: T[];
}

const SegmentedControl = <T extends string | number>({
  options,
  value,
  onChange,
  className = '',
  lockedValues = [],
}: SegmentedControlProps<T>) => {
  return (
    <div className={`flex p-1 bg-[var(--color-bg-panel)] rounded-[var(--radius-sm)] flex-1 ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`flex-1 h-7 flex items-center justify-center gap-1 text-[12px] font-medium rounded-[3px] transition-all
            ${
              value === option.value
                ? 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-[var(--shadow-xs)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            }`}
        >
          {option.label}
          {lockedValues.includes(option.value) && <Lock size={11} weight="bold" className="opacity-70" />}
        </button>
      ))}
    </div>
  );
};

export default SegmentedControl;
