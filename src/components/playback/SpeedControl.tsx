import React from 'react';
import { Gauge } from 'phosphor-react';
import Slider from '../ui/Slider';

interface Props {
  speed: number;
  onChange: (v: number) => void;
}

/** Whole-video speed modifier — uses the standard slider. Applies to the live
 *  preview and the exported MP4. */
const SpeedControl: React.FC<Props> = ({ speed, onChange }) => (
  <div className="flex items-center gap-2 w-60 select-none">
    <Gauge size={16} className="text-[var(--color-text-muted)] shrink-0" aria-label="Speed" />
    <div className="flex-1 min-w-0">
      <Slider
        label=""
        min={0.5}
        max={10}
        step={0.1}
        value={speed}
        onChange={onChange}
        unit="x"
      />
    </div>
  </div>
);

export default SpeedControl;
