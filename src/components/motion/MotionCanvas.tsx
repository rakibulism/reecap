import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useMotionStore } from '../../store/motionStore';
import { computeLayerStyleWithAncestors, type ComputedStyle } from '../../lib/motionEngine';
import type { MotionLayer } from '../../types/motion';

// Corner handles used for resizing the selected layer.
const HANDLES = [
  { id: 'nw', x: 0, y: 0, cursor: 'nwse-resize' },
  { id: 'ne', x: 1, y: 0, cursor: 'nesw-resize' },
  { id: 'sw', x: 0, y: 1, cursor: 'nesw-resize' },
  { id: 'se', x: 1, y: 1, cursor: 'nwse-resize' },
] as const;

const MIN_SIZE = 16; // design units

const LayerView: React.FC<{ layer: MotionLayer; style: ComputedStyle }> = ({ layer, style }) => {
  // A group only paints when it has a background fill (a Figma frame); otherwise
  // it's a transparent container and its children paint themselves.
  if (layer.type === 'group') {
    if (!layer.fill) return null;
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          opacity: style.opacity,
          transform: style.transform || undefined,
          filter: style.filter !== 'none' ? style.filter : undefined,
          transformOrigin: 'center center',
          visibility: style.hidden ? 'hidden' : 'visible',
          background: layer.fill,
          borderRadius: layer.cornerRadius,
        }}
      />
    );
  }
  const inner: React.CSSProperties = {
    width: '100%',
    height: '100%',
    opacity: style.opacity,
    transform: style.transform || undefined,
    filter: style.filter !== 'none' ? style.filter : undefined,
    transformOrigin: 'center center',
    visibility: style.hidden ? 'hidden' : 'visible',
  };

  if (layer.type === 'text') {
    return (
      <div
        style={{
          ...inner,
          display: 'flex',
          alignItems: 'center',
          justifyContent:
            layer.align === 'left' ? 'flex-start' : layer.align === 'right' ? 'flex-end' : 'center',
          textAlign: layer.align,
          color: layer.color,
          fontFamily: layer.fontFamily,
          fontWeight: layer.fontWeight,
          fontSize: layer.fontSize,
          lineHeight: 1.1,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {layer.text}
      </div>
    );
  }

  if (layer.type === 'image') {
    return (
      <img
        src={layer.src}
        alt={layer.name}
        draggable={false}
        style={{ ...inner, objectFit: 'contain', borderRadius: layer.cornerRadius }}
      />
    );
  }

  // rectangle / ellipse
  return (
    <div
      style={{
        ...inner,
        background: layer.fill,
        borderRadius: layer.type === 'ellipse' ? '50%' : layer.cornerRadius,
      }}
    />
  );
};

const MotionCanvas: React.FC = () => {
  const { doc, time, selectedIds, selectLayer, updateLayer, setLayerPositions, isPlaying } =
    useMotionStore();
  const stageRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<{ w: number; h: number; scale: number } | null>(null);

  const layersById = useMemo(
    () => new Map(doc.layers.map((l) => [l.id, l])),
    [doc.layers],
  );

  // Fit the composition into the available stage (contain), mirroring Canvas.tsx.
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const compute = () => {
      const cs = getComputedStyle(el);
      const cw = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const ch = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      if (cw <= 0 || ch <= 0) return;
      const ar = doc.width / doc.height;
      let w = cw;
      let h = cw / ar;
      if (h > ch) {
        h = ch;
        w = ch * ar;
      }
      setFit({ w: Math.round(w), h: Math.round(h), scale: w / doc.width });
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [doc.width, doc.height]);

  const scale = fit?.scale ?? 1;

  // Drag the resting position of a layer (and, for groups / multi-selections,
  // every layer that should move with it). Visual animation lives on an inner
  // element, so moving here repositions the box regardless of playback.
  const startMove = (e: React.PointerEvent, layer: MotionLayer) => {
    if (layer.locked) return;
    e.stopPropagation();

    if (e.shiftKey) {
      selectLayer(layer.id, true);
      return;
    }
    if (!selectedIds.includes(layer.id)) selectLayer(layer.id);

    // Which ids move together: the whole multi-selection if this layer is part
    // of it, otherwise just this layer — each expanded to its descendants.
    const seedIds =
      selectedIds.includes(layer.id) && selectedIds.length > 1 ? selectedIds : [layer.id];
    const moveIds = new Set<string>();
    for (const seed of seedIds) {
      moveIds.add(seed);
      let added = true;
      while (added) {
        added = false;
        for (const l of doc.layers) {
          if (l.parentId && moveIds.has(l.parentId) && !moveIds.has(l.id)) {
            moveIds.add(l.id);
            added = true;
          }
        }
      }
    }
    const orig = doc.layers
      .filter((l) => moveIds.has(l.id))
      .map((l) => ({ id: l.id, x: l.x, y: l.y }));

    const startX = e.clientX;
    const startY = e.clientY;
    const move = (ev: PointerEvent) => {
      const dx = (ev.clientX - startX) / scale;
      const dy = (ev.clientY - startY) / scale;
      setLayerPositions(orig.map((o) => ({ id: o.id, x: Math.round(o.x + dx), y: Math.round(o.y + dy) })));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const startResize = (e: React.PointerEvent, layer: MotionLayer, handle: typeof HANDLES[number]) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const orig = { x: layer.x, y: layer.y, w: layer.width, h: layer.height };
    const move = (ev: PointerEvent) => {
      const dx = (ev.clientX - startX) / scale;
      const dy = (ev.clientY - startY) / scale;
      let { x, y, w, h } = orig;
      if (handle.x === 0) {
        w = orig.w - dx;
        x = orig.x + dx;
      } else {
        w = orig.w + dx;
      }
      if (handle.y === 0) {
        h = orig.h - dy;
        y = orig.y + dy;
      } else {
        h = orig.h + dy;
      }
      if (w < MIN_SIZE) {
        if (handle.x === 0) x = orig.x + orig.w - MIN_SIZE;
        w = MIN_SIZE;
      }
      if (h < MIN_SIZE) {
        if (handle.y === 0) y = orig.y + orig.h - MIN_SIZE;
        h = MIN_SIZE;
      }
      updateLayer(layer.id, {
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(w),
        height: Math.round(h),
      });
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const onlyOneSelected = selectedIds.length === 1;

  return (
    <main
      ref={stageRef}
      className="flex-1 overflow-hidden relative flex items-center justify-center p-6 sm:p-10 bg-[var(--color-bg-page)]"
      onPointerDown={() => selectLayer(null)}
    >
      <div
        className="relative shadow-[var(--shadow-md)] overflow-hidden"
        style={
          fit
            ? { width: `${fit.w}px`, height: `${fit.h}px`, background: doc.background }
            : { width: '60%', aspectRatio: `${doc.width} / ${doc.height}`, background: doc.background }
        }
      >
        {/* Scaled "world" in design units */}
        <div
          className="absolute top-0 left-0"
          style={{ width: doc.width, height: doc.height, transform: `scale(${scale})`, transformOrigin: 'top left' }}
        >
          {doc.layers.map((layer) => {
            if (!layer.visible) return null;
            const isGroup = layer.type === 'group';
            const isSelected = selectedIds.includes(layer.id) && !isPlaying;
            const style = computeLayerStyleWithAncestors(layer, layersById, time, doc.duration);

            return (
              <div
                key={layer.id}
                onPointerDown={(e) => startMove(e, layer)}
                style={{
                  position: 'absolute',
                  left: layer.x,
                  top: layer.y,
                  width: layer.width,
                  height: layer.height,
                  cursor: layer.locked ? 'default' : 'move',
                  // Unselected groups are click-through so children stay reachable.
                  pointerEvents: isGroup && !isSelected ? 'none' : 'auto',
                  outline: isSelected
                    ? `${(isGroup ? 1.5 : 2) / scale}px ${isGroup ? 'dashed' : 'solid'} var(--color-primary)`
                    : 'none',
                }}
              >
                <LayerView layer={layer} style={style} />

                {isSelected && onlyOneSelected && !isGroup &&
                  HANDLES.map((handle) => (
                    <div
                      key={handle.id}
                      onPointerDown={(e) => startResize(e, layer, handle)}
                      style={{
                        position: 'absolute',
                        left: `${handle.x * 100}%`,
                        top: `${handle.y * 100}%`,
                        width: 12 / scale,
                        height: 12 / scale,
                        transform: 'translate(-50%, -50%)',
                        background: 'var(--color-bg-surface)',
                        border: `${2 / scale}px solid var(--color-primary)`,
                        borderRadius: 2 / scale,
                        cursor: handle.cursor,
                      }}
                    />
                  ))}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default MotionCanvas;
