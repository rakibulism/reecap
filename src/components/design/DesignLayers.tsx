import React from 'react';
import {
  Square, Circle, LineSegment, ArrowUpRight, Polygon, Star, PenNib, Pencil,
  TextT, WaveSine, Image as ImageIcon, FilmStrip, BoundingBox, Eye, EyeSlash, Lock, LockOpen,
} from 'phosphor-react';
import { useDesignStore } from '../../store/designStore';
import type { DesignNodeType } from '../../types/design';

const ICONS: Record<DesignNodeType, React.ReactNode> = {
  frame: <BoundingBox size={14} />,
  rectangle: <Square size={14} />,
  ellipse: <Circle size={14} />,
  line: <LineSegment size={14} />,
  arrow: <ArrowUpRight size={14} />,
  polygon: <Polygon size={14} />,
  star: <Star size={14} />,
  path: <PenNib size={14} />,
  pencil: <Pencil size={14} />,
  text: <TextT size={14} />,
  'text-path': <WaveSine size={14} />,
  image: <ImageIcon size={14} />,
  video: <FilmStrip size={14} />,
};

const DesignLayers: React.FC = () => {
  const { doc, selectedIds, select, updateNode } = useDesignStore();
  // Top-most node first (last in array renders on top).
  const ordered = [...doc.nodes].reverse();

  return (
    <div className="w-60 shrink-0 border-r border-[var(--color-border-default)] bg-[var(--color-bg-surface)] flex flex-col">
      <div className="h-10 flex items-center px-3 border-b border-[var(--color-border-default)]">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Layers</span>
        <span className="ml-2 text-[11px] text-[var(--color-text-muted)]">{doc.nodes.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar py-1">
        {ordered.length === 0 && (
          <p className="px-3 py-4 text-[12px] text-[var(--color-text-muted)] leading-relaxed">
            Nothing here yet. Pick a tool and draw on the canvas.
          </p>
        )}
        {ordered.map((n) => {
          const active = selectedIds.includes(n.id);
          return (
            <div
              key={n.id}
              onPointerDown={(e) => select(n.id, e.shiftKey)}
              className={`group flex items-center gap-2 px-3 h-8 cursor-default text-[12px]
                ${active ? 'bg-[var(--color-primary)]/12 text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'}`}
            >
              <span className="text-[var(--color-text-muted)] shrink-0">{ICONS[n.type]}</span>
              <span className="flex-1 truncate" style={{ opacity: n.visible ? 1 : 0.45 }}>{n.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); updateNode(n.id, { locked: !n.locked }); }}
                className={`shrink-0 ${n.locked ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'} hover:!opacity-100`}
              >
                {n.locked ? <Lock size={13} /> : <LockOpen size={13} />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); updateNode(n.id, { visible: !n.visible }); }}
                className={`shrink-0 ${!n.visible ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'} hover:!opacity-100`}
              >
                {n.visible ? <Eye size={13} /> : <EyeSlash size={13} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DesignLayers;
