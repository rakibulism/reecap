import React, { useRef, useState } from 'react';
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
  Eye,
  EyeSlash,
  Lock,
  LockOpen,
  Trash,
  DotsSixVertical,
  Stack,
} from 'phosphor-react';
import type { LayerType, MotionLayer, ReecapMotionPayload } from '../../types/motion';

const TYPE_ICON: Record<LayerType, React.ReactNode> = {
  text: <TextT size={14} />,
  rectangle: <Square size={14} />,
  ellipse: <Circle size={14} />,
  image: <ImageIcon size={14} />,
};

// Load a File/blob URL into an image layer at its natural size.
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

const SortableLayer: React.FC<{ layer: MotionLayer }> = ({ layer }) => {
  const { selectedId, selectLayer, updateLayer, removeLayer } = useMotionStore();
  const [renaming, setRenaming] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: layer.id,
  });
  const isSelected = layer.id === selectedId;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => selectLayer(layer.id)}
      className={`group flex items-center gap-1.5 pl-1 pr-2 h-9 rounded-[var(--radius-sm)] cursor-pointer transition-colors border
        ${isSelected
          ? 'bg-[var(--color-bg-hover)] border-[var(--color-primary)]/40'
          : 'border-transparent hover:bg-[var(--color-bg-hover)]'}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <DotsSixVertical size={14} />
      </button>

      <span className="text-[var(--color-text-secondary)] shrink-0">{TYPE_ICON[layer.type]}</span>

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
          className="flex-1 min-w-0 truncate text-[12px] font-medium text-[var(--color-text-primary)]"
        >
          {layer.name}
        </span>
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

const LayersPanel: React.FC = () => {
  const { doc, addLayer, addImageLayer, importPayload, reorderLayer } = useMotionStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor),
  );

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

  // Layers list is rendered top = topmost; doc.layers is bottom→top, so reverse.
  const ordered = [...doc.layers].reverse();

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

      <div className="flex items-center gap-2 px-3 py-2 text-[var(--color-text-muted)]">
        <Stack size={14} />
        <h3 className="text-[11px] font-medium uppercase tracking-[0.08em]">
          Layers ({doc.layers.length})
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3 custom-scrollbar">
        {doc.layers.length === 0 ? (
          <p className="text-[11px] text-[var(--color-text-muted)] italic px-2 py-4 leading-relaxed">
            No layers yet. Add a shape or text above, or paste a Figma frame to start animating.
          </p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={ordered.map((l) => l.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-0.5">
                {ordered.map((layer) => (
                  <SortableLayer key={layer.id} layer={layer} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </aside>
  );
};

export default LayersPanel;
