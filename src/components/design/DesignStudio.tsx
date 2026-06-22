import React, { useEffect } from 'react';
import { MagnifyingGlassMinus, MagnifyingGlassPlus, GridFour, Code, ArrowsOut } from 'phosphor-react';
import { useDesignStore } from '../../store/designStore';
import type { DesignTool } from '../../types/design';
import DesignToolbar from './DesignToolbar';
import DesignCanvas from './DesignCanvas';
import DesignLayers from './DesignLayers';
import DesignInspector from './DesignInspector';
import DevPanel from './DevPanel';

const TOOL_KEYS: Record<string, DesignTool> = {
  v: 'select', h: 'hand', f: 'frame', r: 'rectangle', o: 'ellipse',
  l: 'line', a: 'arrow', p: 'pen', t: 'text',
};

const DesignStudio: React.FC = () => {
  const {
    viewport, devMode, showGrid, editingId,
    setTool, setZoom, resetView, toggleGrid, toggleDevMode,
    removeSelected, duplicateSelected, clearSelection,
    bringForward, sendBackward, bringToFront, sendToBack,
  } = useDesignStore();

  useEffect(() => {
    const isField = (t: EventTarget | null) => {
      const n = t as HTMLElement | null;
      return !!n && (n.tagName === 'INPUT' || n.tagName === 'TEXTAREA' || n.isContentEditable);
    };
    const onKey = (e: KeyboardEvent) => {
      if (isField(e.target) || editingId) return;
      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key.toLowerCase() === 'd') { e.preventDefault(); duplicateSelected(); return; }
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); removeSelected(); return; }
      if (e.key === 'Escape') { clearSelection(); setTool('select'); return; }
      if (e.key === ']') { e.preventDefault(); mod ? bringToFront() : bringForward(); return; }
      if (e.key === '[') { e.preventDefault(); mod ? sendToBack() : sendBackward(); return; }
      if (mod && (e.key === '0')) { e.preventDefault(); resetView(); return; }
      if (mod && (e.key === '=' || e.key === '+')) { e.preventDefault(); setZoom(viewport.zoom * 1.2); return; }
      if (mod && e.key === '-') { e.preventDefault(); setZoom(viewport.zoom / 1.2); return; }

      if (!mod && TOOL_KEYS[e.key.toLowerCase()]) { setTool(TOOL_KEYS[e.key.toLowerCase()]); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [viewport.zoom, editingId]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* zoom / view sub-bar */}
      <div className="h-9 shrink-0 border-b border-[var(--color-border-default)] bg-[var(--color-bg-surface)] flex items-center justify-end gap-1 px-3">
        <button onClick={toggleGrid} title="Toggle grid" className={`w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] ${showGrid ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'} hover:bg-[var(--color-bg-hover)]`}><GridFour size={16} /></button>
        <div className="w-px h-4 bg-[var(--color-border-default)] mx-1" />
        <button onClick={() => setZoom(viewport.zoom / 1.2)} className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"><MagnifyingGlassMinus size={16} /></button>
        <button onClick={() => setZoom(1)} className="text-[12px] font-semibold tabular-nums w-12 text-center hover:text-[var(--color-primary)]">{Math.round(viewport.zoom * 100)}%</button>
        <button onClick={() => setZoom(viewport.zoom * 1.2)} className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"><MagnifyingGlassPlus size={16} /></button>
        <button onClick={resetView} title="Reset view (⌘0)" className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"><ArrowsOut size={15} /></button>
        <div className="w-px h-4 bg-[var(--color-border-default)] mx-1" />
        <button
          onClick={toggleDevMode}
          className={`flex items-center gap-1.5 px-2.5 h-7 text-[11px] font-semibold rounded-[var(--radius-sm)] transition-colors ${devMode ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-secondary)] border border-[var(--color-border-default)] hover:bg-[var(--color-bg-hover)]'}`}
        >
          <Code size={14} /> Dev
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <DesignToolbar />
        <DesignLayers />
        <DesignCanvas />
        {devMode ? <DevPanel /> : <DesignInspector />}
      </div>
    </div>
  );
};

export default DesignStudio;
