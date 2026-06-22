import React, { useEffect, useRef, useState } from 'react';
import { useDesignStore, makeNode } from '../../store/designStore';
import type { DesignNode } from '../../types/design';
import { normalisePoints } from '../../lib/designGeometry';
import DesignNodeView from './DesignNodeView';

const MIN = 4; // minimum node size in world units

interface HandleDef { id: string; nx: number; ny: number; cursor: string }
const HANDLES: HandleDef[] = [
  { id: 'nw', nx: 0, ny: 0, cursor: 'nwse-resize' },
  { id: 'n', nx: 0.5, ny: 0, cursor: 'ns-resize' },
  { id: 'ne', nx: 1, ny: 0, cursor: 'nesw-resize' },
  { id: 'e', nx: 1, ny: 0.5, cursor: 'ew-resize' },
  { id: 'se', nx: 1, ny: 1, cursor: 'nwse-resize' },
  { id: 's', nx: 0.5, ny: 1, cursor: 'ns-resize' },
  { id: 'sw', nx: 0, ny: 1, cursor: 'nesw-resize' },
  { id: 'w', nx: 0, ny: 0.5, cursor: 'ew-resize' },
];

const rot = (px: number, py: number, deg: number) => {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r), s = Math.sin(r);
  return { x: px * c - py * s, y: px * s + py * c };
};

const DesignCanvas: React.FC = () => {
  const {
    doc, tool, viewport, selectedIds, editingId,
    setTool, panBy, zoomAt, select, selectMany, clearSelection, setEditing,
    addNode, updateNode, setBackground,
  } = useDesignStore();

  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [spaceDown, setSpaceDown] = useState(false);
  const [marquee, setMarquee] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  // Pen tool in-progress anchor points (world space) + live cursor.
  const [pen, setPen] = useState<{ x: number; y: number }[]>([]);
  const [penCursor, setPenCursor] = useState<{ x: number; y: number } | null>(null);

  const gesture = useRef<any>(null);

  const toWorld = (clientX: number, clientY: number) => {
    const r = svgRef.current!.getBoundingClientRect();
    return {
      x: (clientX - r.left - viewport.tx) / viewport.zoom,
      y: (clientY - r.top - viewport.ty) / viewport.zoom,
    };
  };

  // ---- wheel: trackpad pan + ctrl/⌘ pinch-zoom -------------------------------
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = svgRef.current!.getBoundingClientRect();
      if (e.ctrlKey || e.metaKey) {
        zoomAt(Math.pow(1.0015, -e.deltaY), e.clientX - r.left, e.clientY - r.top);
      } else {
        panBy(-e.deltaX, -e.deltaY);
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomAt, panBy]);

  // ---- space-to-pan ----------------------------------------------------------
  useEffect(() => {
    const isField = (t: EventTarget | null) => {
      const n = t as HTMLElement | null;
      return !!n && (n.tagName === 'INPUT' || n.tagName === 'TEXTAREA' || n.isContentEditable);
    };
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isField(e.target)) { e.preventDefault(); setSpaceDown(true); }
      if ((e.key === 'Escape') && pen.length) { setPen([]); setPenCursor(null); }
      if (e.key === 'Enter' && pen.length >= 2) finishPen();
    };
    const up = (e: KeyboardEvent) => { if (e.code === 'Space') setSpaceDown(false); };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [pen]);

  // ---- pen finalisation ------------------------------------------------------
  const finishPen = () => {
    if (pen.length >= 2) {
      const norm = normalisePoints(pen);
      addNode(makeNode('path', { ...norm }));
    }
    setPen([]); setPenCursor(null); setTool('select');
  };

  // ---- pointer down ----------------------------------------------------------
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button === 1) return; // middle handled by browser/space
    const world = toWorld(e.clientX, e.clientY);
    const panning = spaceDown || tool === 'hand' || e.button === 2;

    if (panning) {
      gesture.current = { kind: 'pan', sx: e.clientX, sy: e.clientY };
      (e.target as Element).setPointerCapture?.(e.pointerId);
      return;
    }

    // Resize handle?
    const handleId = (e.target as HTMLElement).getAttribute?.('data-handle');
    if (handleId && tool === 'select' && selectedIds.length === 1) {
      const n = doc.nodes.find((x) => x.id === selectedIds[0]);
      if (n) {
        gesture.current = { kind: 'resize', handle: HANDLES.find((h) => h.id === handleId)!, orig: { ...n } };
        return;
      }
    }

    // Pen tool — add anchor.
    if (tool === 'pen') {
      if (pen.length >= 2) {
        const first = pen[0];
        const dx = world.x - first.x, dy = world.y - first.y;
        if (Math.hypot(dx, dy) * viewport.zoom < 10) { finishPen(); return; }
      }
      setPen((p) => [...p, world]);
      setPenCursor(world);
      return;
    }

    // Pencil — freehand capture.
    if (tool === 'pencil') {
      gesture.current = { kind: 'pencil', pts: [world] };
      (e.target as Element).setPointerCapture?.(e.pointerId);
      return;
    }

    // Text — place and edit.
    if (tool === 'text') {
      const node = makeNode('text', { x: world.x, y: world.y - 24, width: 240, height: 56 });
      addNode(node);
      setTool('select');
      setEditing(node.id);
      return;
    }

    // Other shape tools — start a drag-to-draw.
    if (tool !== 'select') {
      gesture.current = { kind: 'draw', tool, start: world, id: null };
      (e.target as Element).setPointerCapture?.(e.pointerId);
      return;
    }

    // Select tool — node hit or marquee.
    const hitId = (e.target as HTMLElement).closest?.('[data-node-id]')?.getAttribute('data-node-id');
    if (hitId) {
      const node = doc.nodes.find((n) => n.id === hitId);
      if (node?.locked) return;
      if (e.shiftKey) select(hitId, true);
      else if (!selectedIds.includes(hitId)) select(hitId);
      const ids = e.shiftKey ? Array.from(new Set([...selectedIds, hitId])) : selectedIds.includes(hitId) ? selectedIds : [hitId];
      gesture.current = { kind: 'move', sx: world.x, sy: world.y, orig: doc.nodes.filter((n) => ids.includes(n.id)).map((n) => ({ id: n.id, x: n.x, y: n.y })) };
      (e.target as Element).setPointerCapture?.(e.pointerId);
    } else {
      if (!e.shiftKey) clearSelection();
      gesture.current = { kind: 'marquee', sx: world.x, sy: world.y };
      setMarquee({ x: world.x, y: world.y, w: 0, h: 0 });
      (e.target as Element).setPointerCapture?.(e.pointerId);
    }
  };

  // ---- pointer move ----------------------------------------------------------
  const onPointerMove = (e: React.PointerEvent) => {
    if (tool === 'pen' && pen.length) { setPenCursor(toWorld(e.clientX, e.clientY)); return; }
    const g = gesture.current;
    if (!g) return;
    const world = toWorld(e.clientX, e.clientY);

    if (g.kind === 'pan') {
      panBy(e.clientX - g.sx, e.clientY - g.sy);
      g.sx = e.clientX; g.sy = e.clientY;
      return;
    }

    if (g.kind === 'pencil') {
      g.pts.push(world);
      setPenCursor({ ...world }); // force a re-render tick
      return;
    }

    if (g.kind === 'marquee') {
      const x = Math.min(g.sx, world.x), y = Math.min(g.sy, world.y);
      const w = Math.abs(world.x - g.sx), h = Math.abs(world.y - g.sy);
      setMarquee({ x, y, w, h });
      return;
    }

    if (g.kind === 'move') {
      const dx = world.x - g.sx, dy = world.y - g.sy;
      g.orig.forEach((o: any) => updateNode(o.id, { x: o.x + dx, y: o.y + dy }));
      return;
    }

    if (g.kind === 'draw') {
      const a = g.start, b = world;
      const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
      let w = Math.abs(b.x - a.x), h = Math.abs(b.y - a.y);
      const square = e.shiftKey;
      if (square) { const m = Math.max(w, h); w = m; h = m; }
      if (w < 1 && h < 1) return;
      let patch: Partial<DesignNode> = { x, y, width: Math.max(MIN, w), height: Math.max(MIN, h) };
      const t = g.tool as string;
      let nodeType = t;
      if (t === 'line' || t === 'arrow') {
        // Preserve drag direction via normalised endpoints inside the bbox.
        const p0 = { x: (a.x - x) / (w || 1), y: (a.y - y) / (h || 1) };
        const p1 = { x: (b.x - x) / (w || 1), y: (b.y - y) / (h || 1) };
        patch.points = [p0, p1];
      }
      if (g.id === null) {
        const node = makeNode(nodeType as any, patch);
        g.id = node.id;
        addNode(node);
      } else {
        updateNode(g.id, patch);
      }
      return;
    }

    if (g.kind === 'resize') {
      resize(g, world);
      return;
    }
  };

  const resize = (g: any, world: { x: number; y: number }) => {
    const o = g.orig as DesignNode;
    const h = g.handle as HandleDef;
    const cx = o.x + o.width / 2, cy = o.y + o.height / 2;
    // pointer in old local coords (0..w, 0..h)
    const rel = rot(world.x - cx, world.y - cy, -o.rotation);
    const lp = { x: rel.x + o.width / 2, y: rel.y + o.height / 2 };
    let wNew = o.width, hNew = o.height;
    if (h.nx === 1) wNew = Math.max(MIN, lp.x);
    else if (h.nx === 0) wNew = Math.max(MIN, o.width - lp.x);
    if (h.ny === 1) hNew = Math.max(MIN, lp.y);
    else if (h.ny === 0) hNew = Math.max(MIN, o.height - lp.y);
    // fixed anchor (opposite edge) world position, kept put
    const fxOld = h.nx === 0 ? o.width : h.nx === 1 ? 0 : o.width / 2;
    const fyOld = h.ny === 0 ? o.height : h.ny === 1 ? 0 : o.height / 2;
    const fWorldRel = rot(fxOld - o.width / 2, fyOld - o.height / 2, o.rotation);
    const fWorld = { x: cx + fWorldRel.x, y: cy + fWorldRel.y };
    const fxNew = h.nx === 0 ? wNew : h.nx === 1 ? 0 : wNew / 2;
    const fyNew = h.ny === 0 ? hNew : h.ny === 1 ? 0 : hNew / 2;
    const fNewRel = rot(fxNew - wNew / 2, fyNew - hNew / 2, o.rotation);
    const cNew = { x: fWorld.x - fNewRel.x, y: fWorld.y - fNewRel.y };
    updateNode(o.id, { x: cNew.x - wNew / 2, y: cNew.y - hNew / 2, width: wNew, height: hNew });
  };

  // ---- pointer up ------------------------------------------------------------
  const onPointerUp = () => {
    const g = gesture.current;
    if (g?.kind === 'pencil') {
      if (g.pts.length >= 2) addNode(makeNode('pencil', { ...normalisePoints(g.pts) }));
      setTool('select');
    }
    if (g?.kind === 'marquee' && marquee) {
      const { x, y, w, h } = marquee;
      const hit = doc.nodes.filter((n) => n.x < x + w && n.x + n.width > x && n.y < y + h && n.y + n.height > y && !n.locked).map((n) => n.id);
      if (hit.length) selectMany(hit);
    }
    if (g?.kind === 'draw' && g.id === null) {
      // a click with no drag → drop a default-sized node at the start point
      const t = g.tool as string;
      if (t !== 'select') {
        const node = makeNode(t as any, { x: g.start.x, y: g.start.y, width: 160, height: t === 'line' || t === 'arrow' ? 1 : 120 });
        addNode(node);
      }
    }
    if (g?.kind === 'draw') setTool('select');
    setMarquee(null);
    gesture.current = null;
  };

  // ---- selection overlay -----------------------------------------------------
  const sel = selectedIds.length === 1 ? doc.nodes.find((n) => n.id === selectedIds[0]) : null;
  const z = viewport.zoom;
  const hs = 4 / z; // handle half-size in world units (≈8px)

  // Editing overlay position (screen space).
  const editNode = editingId ? doc.nodes.find((n) => n.id === editingId) : null;

  const cursor = spaceDown || tool === 'hand' ? 'grab'
    : tool === 'select' ? 'default'
    : tool === 'text' ? 'text'
    : 'crosshair';

  return (
    <div ref={wrapRef} className="relative flex-1 overflow-hidden" style={{ background: doc.background, cursor }}>
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onContextMenu={(e) => e.preventDefault()}
        onDoubleClick={(e) => {
          const id = (e.target as HTMLElement).closest?.('[data-node-id]')?.getAttribute('data-node-id');
          const n = id && doc.nodes.find((x) => x.id === id);
          if (n && (n.type === 'text' || n.type === 'text-path')) setEditing(n.id);
        }}
      >
        <defs>
          <pattern id="dg" width={40} height={40} patternUnits="userSpaceOnUse" patternTransform={`translate(${viewport.tx} ${viewport.ty}) scale(${z})`}>
            <circle cx={1} cy={1} r={1 / z} fill="rgba(0,0,0,0.10)" />
          </pattern>
        </defs>
        {useDesignStore.getState().showGrid && <rect x={0} y={0} width="100%" height="100%" fill="url(#dg)" />}

        <g transform={`translate(${viewport.tx} ${viewport.ty}) scale(${z})`}>
          {doc.nodes.filter((n) => n.visible).map((n) => (
            <DesignNodeView key={n.id} node={n} editing={n.id === editingId} />
          ))}

          {/* multi-select outlines */}
          {selectedIds.length > 1 && selectedIds.map((id) => {
            const n = doc.nodes.find((x) => x.id === id);
            if (!n) return null;
            return <rect key={id} x={n.x} y={n.y} width={n.width} height={n.height} transform={`rotate(${n.rotation} ${n.x + n.width / 2} ${n.y + n.height / 2})`} fill="none" stroke="#3B82F6" strokeWidth={1.5 / z} pointerEvents="none" />;
          })}

          {/* single-select outline + handles */}
          {sel && tool === 'select' && !editingId && (
            <g transform={`rotate(${sel.rotation} ${sel.x + sel.width / 2} ${sel.y + sel.height / 2})`} pointerEvents="none">
              <rect x={sel.x} y={sel.y} width={sel.width} height={sel.height} fill="none" stroke="#3B82F6" strokeWidth={1.5 / z} />
              {HANDLES.map((hd) => {
                const hx = sel.x + hd.nx * sel.width, hy = sel.y + hd.ny * sel.height;
                return (
                  <rect
                    key={hd.id}
                    data-handle={hd.id}
                    x={hx - hs} y={hy - hs} width={hs * 2} height={hs * 2}
                    rx={1 / z} fill="#fff" stroke="#3B82F6" strokeWidth={1.25 / z}
                    style={{ cursor: hd.cursor }} pointerEvents="all"
                  />
                );
              })}
            </g>
          )}

          {/* marquee */}
          {marquee && (
            <rect x={marquee.x} y={marquee.y} width={marquee.w} height={marquee.h} fill="rgba(59,130,246,0.08)" stroke="#3B82F6" strokeWidth={1 / z} pointerEvents="none" />
          )}

          {/* pen / pencil preview */}
          {tool === 'pen' && pen.length > 0 && (
            <g pointerEvents="none">
              <path d={`M ${pen.map((p) => `${p.x} ${p.y}`).join(' L ')}${penCursor ? ` L ${penCursor.x} ${penCursor.y}` : ''}`} fill="none" stroke="#3B82F6" strokeWidth={1.5 / z} />
              {pen.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={3 / z} fill="#fff" stroke="#3B82F6" strokeWidth={1.25 / z} />)}
            </g>
          )}
          {gesture.current?.kind === 'pencil' && (
            <path d={`M ${gesture.current.pts.map((p: any) => `${p.x} ${p.y}`).join(' L ')}`} fill="none" stroke="#18181B" strokeWidth={3 / z} strokeLinecap="round" pointerEvents="none" />
          )}
        </g>
      </svg>

      {/* inline text editor */}
      {editNode && (editNode.type === 'text' || editNode.type === 'text-path') && (
        <textarea
          autoFocus
          value={editNode.text ?? ''}
          onChange={(e) => updateNode(editNode.id, { text: e.target.value })}
          onBlur={() => setEditing(null)}
          onKeyDown={(e) => { if (e.key === 'Escape') setEditing(null); e.stopPropagation(); }}
          spellCheck={false}
          style={{
            position: 'absolute',
            left: editNode.x * z + viewport.tx,
            top: editNode.y * z + viewport.ty,
            width: Math.max(60, editNode.width * z),
            minHeight: editNode.height * z,
            transform: `rotate(${editNode.rotation}deg)`,
            transformOrigin: 'top left',
            fontFamily: editNode.fontFamily,
            fontSize: (editNode.fontSize ?? 40) * z,
            fontWeight: editNode.fontWeight,
            color: editNode.color,
            textAlign: editNode.align,
            lineHeight: 1.2,
            background: 'transparent',
            border: '1px solid #3B82F6',
            outline: 'none',
            resize: 'none',
            padding: 0,
            overflow: 'hidden',
          }}
        />
      )}

      {/* background colour chip */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-sm)] px-2 py-1 shadow-[var(--shadow-xs)]">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Canvas</span>
        <input type="color" value={doc.background} onChange={(e) => setBackground(e.target.value)} className="w-5 h-5 rounded cursor-pointer bg-transparent border-0 p-0" />
      </div>
    </div>
  );
};

export default DesignCanvas;
