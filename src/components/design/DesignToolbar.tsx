import React, { useRef } from 'react';
import {
  Cursor, Hand, BoundingBox, Square, Circle, LineSegment, ArrowUpRight,
  Polygon, Star, PenNib, Pencil, TextT, WaveSine, Image as ImageIcon, FilmStrip,
} from 'phosphor-react';
import { useDesignStore, makeNode } from '../../store/designStore';
import type { DesignTool } from '../../types/design';
import Tooltip from '../ui/Tooltip';

interface ToolDef { tool: DesignTool; icon: React.ReactNode; label: string; key?: string }

const GROUPS: ToolDef[][] = [
  [
    { tool: 'select', icon: <Cursor size={18} />, label: 'Select', key: 'V' },
    { tool: 'hand', icon: <Hand size={18} />, label: 'Hand / pan', key: 'H' },
  ],
  [
    { tool: 'frame', icon: <BoundingBox size={18} />, label: 'Frame', key: 'F' },
    { tool: 'rectangle', icon: <Square size={18} />, label: 'Rectangle', key: 'R' },
    { tool: 'ellipse', icon: <Circle size={18} />, label: 'Ellipse', key: 'O' },
    { tool: 'line', icon: <LineSegment size={18} />, label: 'Line', key: 'L' },
    { tool: 'arrow', icon: <ArrowUpRight size={18} />, label: 'Arrow', key: 'A' },
    { tool: 'polygon', icon: <Polygon size={18} />, label: 'Polygon' },
    { tool: 'star', icon: <Star size={18} />, label: 'Star' },
  ],
  [
    { tool: 'pen', icon: <PenNib size={18} />, label: 'Pen', key: 'P' },
    { tool: 'pencil', icon: <Pencil size={18} />, label: 'Pencil' },
  ],
  [
    { tool: 'text', icon: <TextT size={18} />, label: 'Text', key: 'T' },
    { tool: 'text-path', icon: <WaveSine size={18} />, label: 'Text on path (arc)' },
  ],
];

const DesignToolbar: React.FC = () => {
  const { tool, setTool, addNode, viewport } = useDesignStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const kindRef = useRef<'image' | 'video'>('image');

  // Place media near the centre of the current view.
  const centreWorld = () => ({
    x: (window.innerWidth / 2 - viewport.tx) / viewport.zoom - 160,
    y: (window.innerHeight / 2 - viewport.ty) / viewport.zoom - 120,
  });

  const pickMedia = (kind: 'image' | 'video') => {
    kindRef.current = kind;
    if (fileRef.current) {
      fileRef.current.accept = kind === 'image' ? 'image/*' : 'video/*';
      fileRef.current.value = '';
      fileRef.current.click();
    }
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const c = centreWorld();
    if (kindRef.current === 'image') {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 360 / img.naturalWidth);
        addNode(makeNode('image', { src: url, x: c.x, y: c.y, width: img.naturalWidth * scale, height: img.naturalHeight * scale, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight }));
      };
      img.onerror = () => addNode(makeNode('image', { src: url, x: c.x, y: c.y, width: 320, height: 200 }));
      img.src = url;
    } else {
      addNode(makeNode('video', { src: url, x: c.x, y: c.y, width: 360, height: 203 }));
    }
    setTool('select');
  };

  const Btn = ({ t }: { t: ToolDef }) => (
    <Tooltip content={`${t.label}${t.key ? `  (${t.key})` : ''}`} position="right">
      <button
        onClick={() => setTool(t.tool)}
        className={`w-10 h-10 flex items-center justify-center rounded-[var(--radius-md)] transition-colors
          ${tool === t.tool ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]'}`}
      >
        {t.icon}
      </button>
    </Tooltip>
  );

  return (
    <div className="w-14 shrink-0 border-r border-[var(--color-border-default)] bg-[var(--color-bg-surface)] flex flex-col items-center py-3 gap-1 overflow-y-auto">
      {GROUPS.map((group, gi) => (
        <React.Fragment key={gi}>
          {gi > 0 && <div className="w-6 h-px bg-[var(--color-border-default)] my-1" />}
          {group.map((t) => <Btn key={t.tool} t={t} />)}
        </React.Fragment>
      ))}
      <div className="w-6 h-px bg-[var(--color-border-default)] my-1" />
      <Tooltip content="Place image" position="right">
        <button onClick={() => pickMedia('image')} className="w-10 h-10 flex items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors">
          <ImageIcon size={18} />
        </button>
      </Tooltip>
      <Tooltip content="Place video" position="right">
        <button onClick={() => pickMedia('video')} className="w-10 h-10 flex items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors">
          <FilmStrip size={18} />
        </button>
      </Tooltip>
      <input ref={fileRef} type="file" className="hidden" onChange={onFile} />
    </div>
  );
};

export default DesignToolbar;
