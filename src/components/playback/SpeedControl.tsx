import React, { useEffect, useRef, useState } from 'react';
import { Gauge, Check, CaretDown } from 'phosphor-react';
import Slider from '../ui/Slider';
import Tooltip from '../ui/Tooltip';

const PRESETS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const fmt = (n: number) => `${n}×`; // e.g. 1.5×

interface Props {
  speed: number;
  onChange: (v: number) => void;
}

/** Whole-video speed modifier: fine slider + quick presets. Applies to the
 *  live preview and the exported MP4. */
const SpeedControl: React.FC<Props> = ({ speed, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <div className="flex items-center gap-2 w-56 select-none">
      <Tooltip content="Speed — applies to the whole video & export">
        <Gauge size={16} className="text-[var(--color-text-muted)] shrink-0" />
      </Tooltip>

      <div className="flex-1 min-w-0">
        <Slider
          variant="thin"
          showValue={false}
          label=""
          min={0.5}
          max={2}
          step={0.05}
          value={speed}
          onChange={onChange}
          unit="x"
        />
      </div>

      <div className="relative shrink-0" ref={ref}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1 h-7 px-2 rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-panel)] text-[12px] font-bold tabular-nums text-[var(--color-text-primary)] hover:border-[var(--color-text-muted)] transition-colors"
        >
          {fmt(Number(speed.toFixed(2)))}
          <CaretDown size={10} weight="bold" className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute bottom-full right-0 mb-2 w-28 py-1 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-md)] z-50 animate-in fade-in zoom-in-95">
            {PRESETS.map((p) => {
              const active = Math.abs(p - speed) < 0.001;
              return (
                <button
                  key={p}
                  onClick={() => {
                    onChange(p);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 h-8 text-[12px] font-semibold tabular-nums transition-colors
                    ${active ? 'text-[var(--color-interactive)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'}`}
                >
                  <span>{fmt(p)}</span>
                  {active && <Check size={12} weight="bold" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeedControl;
