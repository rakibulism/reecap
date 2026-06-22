import React, { useMemo, useRef, useState } from 'react';
import { useMotionStore } from '../../store/motionStore';
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  TextT,
  Square,
  Circle,
  Image as ImageIcon,
  FigmaLogo,
  FolderSimple,
  Eye,
  EyeSlash,
  Lock,
  LockOpen,
  Trash,
  DotsSixVertical,
  Stack,
  CaretRight,
  CaretDown,
  ArrowLineUp,
  ArrowLineDown,
  ArrowUp,
  ArrowDown,
  Copy,
  FrameCorners,
} from 'phosphor-react';
import type { LayerType, MotionLayer, ReecapMotionPayload } from '../../types/motion';

const TYPE_ICON: Record<LayerType, React.ReactNode> = {
  text: <TextT size={14} />,
  rectangle: <Square size={14} />,
  ellipse: <Circle size={14} />,
  image: <ImageIcon size={14} />,
  group: <FolderSimple size={14} weight="fill" />,
};

async function imageLayerFromUrl(
  url: string,
  addImageLayer: (src: string, w: number, h: number, name?: string) => void,
  name?: string,
) {
  const img = new Image();
  img.onload = () => addImageLayer(url, img.naturalWidth, img.naturalHeight, name);
  img.onerror = () => addImageLayer(url, 0, 0, name);
  img.src = url;
}

interface RowMeta {
  layer: MotionLayer;
  depth: number;
}

const LayerRow: React.FC<{
  layer: MotionLayer;
  depth: number;
  hasChildren: boolean;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
}> = ({ layer, depth, hasChildren, onContextMenu }) => {
  const { selectedIds, selectLayer, updateLayer, removeLayer } = useMotionStore();
  const [renaming, setRenaming] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: layer.id,
  });
  const isSelected = selectedIds.includes(layer.id);
  const isGroup = layer.type === 'group';

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    paddingLeft: 4 + depth * 14,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(e) => selectLayer(layer.id, e.shiftKey || e.metaKey || e.ctrlKey)}
      onContextMenu={(e) => onContextMenu(e, layer.id)}
      className={`group flex items-center gap-1.5 pr-2 h-9 rounded-[var(--radius-sm)] cursor-pointer transition-colors border
        ${isSelected
          ? 'bg-[var(--color-bg-hover)] border-[var(--color-primary)]/40'
          : 'border-transparent hover:bg-[var(--color-bg-hover)]'}`}
    >
      {isGroup ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            updateLayer(layer.id, { collapsed: !layer.collapsed });
          }}
          className="text-[var(--color-text-muted)] shrink-0"
        >
          {layer.collapsed ? <CaretRight size={12} weight="bold" /> : <CaretDown size={12} weight="bold" />}
        </button>
      ) : (
        <button
          {...attributes}
          {...listeners}
          className="text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <DotsSixVertical size={14} />
        </button>
      )}

      <span className={`shrink-0 ${isGroup ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
        {TYPE_ICON[layer.type]}
      </span>

      {renaming ? (
        <input
          autoFocus
          defaultValue={layer.name}
          onBlur={(e) => {
            updateLayer(layer.id, { name: e.target.value || layer.name });
            setRenaming(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          }}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 min-w-0 bg-transparent border-b border-[var(--color-primary)] text-[12px] outline-none text-[var(--color-text-primary)]"
        />
      ) : (
        <span
          onDoubleClick={(e) => {
            e.stopPropagation();
            setRenaming(true);
          }}
          className={`flex-1 min-w-0 truncate text-[12px] ${isGroup ? 'font-semibold' : 'font-medium'} text-[var(--color-text-primary)]`}
        >
          {layer.name}
        </span>
      )}
      {isGroup && !hasChildren && (
        <span className="text-[9px] text-[var(--color-text-muted)] italic shrink-0">empty</span>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          updateLayer(layer.id, { visible: !layer.visible });
        }}
        className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] shrink-0"
        title={layer.visible ? 'Hide' : 'Show'}
      >
        {layer.visible ? <Eye size={13} /> : <EyeSlash size={13} />}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          updateLayer(layer.id, { locked: !layer.locked });
        }}
        className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] shrink-0"
        title={layer.locked ? 'Unlock' : 'Lock'}
      >
        {layer.locked ? <Lock size={13} /> : <LockOpen size={13} />}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          removeLayer(layer.id);
        }}
        className="p-1 text-[var(--color-text-muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 shrink-0"
        title="Delete"
      >
        <Trash size={13} />
      </button>
    </div>
  );
};

const AddButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void }> = ({
  icon,
  label,
  onClick,
}) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-1 h-14 rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

const MenuItem: React.FC<{
  icon?: React.ReactNode;
  label: string;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  onClick: () => void;
}> = ({ icon, label, shortcut, disabled, danger, onClick }) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[var(--radius-sm)] text-[12px] text-left transition-colors
      ${disabled
        ? 'opacity-40 cursor-not-allowed'
        : danger
          ? 'text-red-500 hover:bg-red-500/10'
          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]'}`}
  >
    <span className="w-4 flex justify-center shrink-0">{icon}</span>
    <span className="flex-1">{label}</span>
    {shortcut && <span className="text-[10px] text-[var(--color-text-muted)] tabular-nums">{shortcut}</span>}
  </button>
);

const LayersPanel: React.FC = () => {
  const store = useMotionStore();
  const { doc, selectedIds, addLayer, addImageLayer, importPayload, reorderLayer } = store;
  const fileRef = useRef<HTMLInputElement>(null);
  const [menu, setMenu] = useState<{ x: number; y: number; id: string } | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor),
  );

  // Build the visible tree rows: roots (no parent) top→bottom in reverse paint
  // order, each group's children nested beneath it (unless collapsed).
  const rows: RowMeta[] = useMemo(() => {
    const childrenOf = new Map<string | null, MotionLayer[]>();
    for (const l of doc.layers) {
      const key = l.parentId ?? null;
      if (!childrenOf.has(key)) childrenOf.set(key, []);
      childrenOf.get(key)!.push(l);
    }
    const out: RowMeta[] = [];
    const walk = (parentId: string | null, depth: number) => {
      const kids = [...(childrenOf.get(parentId) ?? [])].reverse(); // top paint first
      for (const layer of kids) {
        out.push({ layer, depth });
        if (layer.type === 'group' && !layer.collapsed) walk(layer.id, depth + 1);
      }
    };
    walk(null, 0);
    return out;
  }, [doc.layers]);

  const childCount = useMemo(() => {
    const m = new Map<string, number>();
    for (const l of doc.layers) if (l.parentId) m.set(l.parentId, (m.get(l.parentId) ?? 0) + 1);
    return m;
  }, [doc.layers]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const from = doc.layers.findIndex((l) => l.id === active.id);
      const to = doc.layers.findIndex((l) => l.id === over.id);
      reorderLayer(from, to);
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/') && file.type !== 'image/svg+xml') continue;
      const url = URL.createObjectURL(file);
      await imageLayerFromUrl(url, addImageLayer, file.name);
    }
  };

  const pasteFromFigma = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const payload = JSON.parse(text) as ReecapMotionPayload;
      if (payload?.__reecap === 'motion-frame' && payload.image) {
        importPayload(payload);
        return;
      }
    } catch {
      /* fall through */
    }
    alert(
      'No Reecap frame found on the clipboard.\n\nIn Figma, run the "Reecap Motion" plugin, select a frame, and click "Copy to Reecap" — then try again (or just paste with ⌘V on the canvas).',
    );
  };

  const openMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (!selectedIds.includes(id)) store.selectLayer(id);
    setMenu({ x: e.clientX, y: e.clientY, id });
  };

  const menuLayer = menu ? doc.layers.find((l) => l.id === menu.id) : null;
  const canGroup = selectedIds.length >= 2;

  const run = (fn: () => void) => {
    fn();
    setMenu(null);
  };

  return (
    <aside className="w-[240px] shrink-0 border-r border-[var(--color-border-default)] bg-[var(--color-bg-panel)] flex flex-col overflow-hidden">
      <div className="p-3 border-b border-[var(--color-border-default)]">
        <h3 className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)] mb-3">
          Add Layer
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <AddButton icon={<TextT size={16} />} label="Text" onClick={() => addLayer('text')} />
          <AddButton icon={<Square size={16} />} label="Rect" onClick={() => addLayer('rectangle')} />
          <AddButton icon={<Circle size={16} />} label="Ellipse" onClick={() => addLayer('ellipse')} />
          <AddButton icon={<ImageIcon size={16} />} label="Image" onClick={() => fileRef.current?.click()} />
          <AddButton icon={<FigmaLogo size={16} />} label="Figma" onClick={pasteFromFigma} />
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,.svg"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
          <Stack size={14} />
          <h3 className="text-[11px] font-medium uppercase tracking-[0.08em]">Layers ({doc.layers.length})</h3>
        </div>
        <button
          onClick={() => store.groupSelection()}
          disabled={!canGroup}
          title="Group selection (⌘G)"
          className="flex items-center gap-1 text-[11px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <FrameCorners size={14} /> Group
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3 custom-scrollbar">
        {doc.layers.length === 0 ? (
          <p className="text-[11px] text-[var(--color-text-muted)] italic px-2 py-4 leading-relaxed">
            No layers yet. Add a shape or text above, or paste a Figma frame to start animating.
          </p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={rows.map((r) => r.layer.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-0.5">
                {rows.map(({ layer, depth }) => (
                  <LayerRow
                    key={layer.id}
                    layer={layer}
                    depth={depth}
                    hasChildren={(childCount.get(layer.id) ?? 0) > 0}
                    onContextMenu={openMenu}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Right-click context menu */}
      {menu && menuLayer && (
        <>
          <div className="fixed inset-0 z-[2999]" onClick={() => setMenu(null)} onContextMenu={(e) => { e.preventDefault(); setMenu(null); }} />
          <div
            className="fixed z-[3000] w-52 p-1 rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-[var(--shadow-md)]"
            style={{ left: Math.min(menu.x, window.innerWidth - 220), top: Math.min(menu.y, window.innerHeight - 320) }}
          >
            <MenuItem icon={<ArrowLineUp size={14} />} label="Bring to Front" shortcut="⌘]" onClick={() => run(() => store.bringToFront(menu.id))} />
            <MenuItem icon={<ArrowUp size={14} />} label="Bring Forward" shortcut="]" onClick={() => run(() => store.bringForward(menu.id))} />
            <MenuItem icon={<ArrowDown size={14} />} label="Send Backward" shortcut="[" onClick={() => run(() => store.sendBackward(menu.id))} />
            <MenuItem icon={<ArrowLineDown size={14} />} label="Send to Back" shortcut="⌘[" onClick={() => run(() => store.sendToBack(menu.id))} />
            <div className="h-px bg-[var(--color-border-default)] my-1" />
            <MenuItem icon={<FrameCorners size={14} />} label="Group Selection" shortcut="⌘G" disabled={!canGroup} onClick={() => run(() => store.groupSelection())} />
            <MenuItem icon={<FolderSimple size={14} />} label="Ungroup" shortcut="⌘⇧G" disabled={menuLayer.type !== 'group'} onClick={() => run(() => store.ungroup(menu.id))} />
            <div className="h-px bg-[var(--color-border-default)] my-1" />
            <MenuItem icon={<Copy size={14} />} label="Duplicate" onClick={() => run(() => store.duplicateLayer(menu.id))} />
            <MenuItem icon={<Trash size={14} />} label="Delete" danger onClick={() => run(() => store.removeLayer(menu.id))} />
          </div>
        </>
      )}
    </aside>
  );
};

export default LayersPanel;
