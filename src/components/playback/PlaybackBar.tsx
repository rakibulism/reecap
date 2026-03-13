import React from 'react';
import { useReecapStore } from '../../store/reecapStore';
import { Play, Pause, CaretLeft, CaretRight, Gauge } from 'phosphor-react';
import Button from '../ui/Button';
import Tooltip from '../ui/Tooltip';
import Slider from '../ui/Slider';

const PlaybackBar: React.FC = () => {
  const { 
    photos, activeIndex, setActiveIndex, isPlaying, setPlaying,
    playbackSpeed, setPlaybackSpeed
  } = useReecapStore();

  if (photos.length === 0) return null;

  return (
    <div className="h-11 border-t border-[var(--color-border-default)] flex items-center justify-between bg-[var(--color-bg-page)] px-4 select-none">
      <div className="flex items-center gap-4 w-48">
        <div className="flex items-center gap-2 w-full">
          <Tooltip content="Speed Modifier">
            <Gauge size={16} className="text-[var(--color-text-muted)]" />
          </Tooltip>
          <Tooltip content={`${playbackSpeed}x Speed`} position="top">
            <div className="flex-1">
              <Slider
                label=""
                min={0.5}
                max={2}
                step={0.1}
                value={playbackSpeed}
                onChange={setPlaybackSpeed}
                unit="x"
              />
            </div>
          </Tooltip>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Tooltip content="Previous (←)">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setActiveIndex((activeIndex - 1 + photos.length) % photos.length)} 
            icon={<CaretLeft size={20} />} 
          />
        </Tooltip>
        
        <Tooltip content={isPlaying ? "Pause (Space)" : "Play (Space)"}>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setPlaying(!isPlaying)}
            icon={isPlaying ? <Pause size={20} weight="fill" /> : <Play size={20} weight="fill" />}
          />
        </Tooltip>
        
        <Tooltip content="Next (→)">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setActiveIndex((activeIndex + 1) % photos.length)} 
            icon={<CaretRight size={20} />} 
          />
        </Tooltip>
      </div>
      
      <div className="w-48 text-right">
        <span className="text-[11px] font-medium tabular-nums text-[var(--color-text-muted)] uppercase tracking-[0.08em]">
          {activeIndex + 1} / {photos.length}
        </span>
      </div>
    </div>
  );
};

export default PlaybackBar;
