import React, { useRef, useEffect } from 'react';
import { useReecapStore } from '../../store/reecapStore';
import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash } from 'phosphor-react';
import PlaybackBar from '../playback/PlaybackBar';

const SortableTimelineItem = ({ photo, index, isActive, onSelect, onDelete }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex-shrink-0 w-24 h-16 rounded-[var(--radius-sm)] border-2 cursor-pointer transition-all overflow-hidden group
        ${isActive ? 'border-[var(--color-interactive)] ring-2 ring-[var(--color-interactive)] ring-opacity-20' : 'border-transparent hover:border-[var(--color-border-strong)]'}`}
      onClick={() => onSelect(index)}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="w-full h-full bg-[var(--color-bg-panel)]"
      >
        <img 
          src={photo.thumbnailUrl || photo.objectUrl} 
          alt={`Slide ${index + 1}`}
          className="w-full h-full object-cover pointer-events-none"
        />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5 backdrop-blur-sm">
        <span className="text-[9px] font-bold text-white tabular-nums">
          {index + 1}
        </span>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(photo.id);
        }}
        className="absolute top-1 right-1 p-1 bg-black/40 hover:bg-red-600/80 text-white rounded-[2px] opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md"
      >
        <Trash size={10} weight="bold" />
      </button>
    </div>
  );
};

const Timeline: React.FC = () => {
  const { photos, activeIndex, setActiveIndex, reorderPhotos, removePhoto, playbackProgress } = useReecapStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = photos.findIndex((p) => p.id === active.id);
      const newIndex = photos.findIndex((p) => p.id === over.id);
      reorderPhotos(oldIndex, newIndex);
    }
  };

  // Sync scroll with active index
  useEffect(() => {
    if (scrollRef.current) {
      const activeEl = scrollRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeIndex]);

  // Calculate playhead visual offset
  // Each slide is 96px (w-24) + 8px (gap-2) = 104px
  const playheadX = (activeIndex * 104) + (playbackProgress * 104);

  return (
    <div className="flex flex-col border-t border-[var(--color-border-default)] bg-[var(--color-bg-page)] overflow-visible relative z-20">
      {/* Playback Controls Integrated */}
      <PlaybackBar />

      {/* Media Layer */}
      <div className="relative h-24 flex bg-[var(--color-bg-panel)]/30 overflow-hidden">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-x-auto overflow-y-hidden px-[50%] flex items-center gap-2 custom-scrollbar no-scrollbar scroll-smooth"
        >
          {/* Timeline Track Content */}
          <div className="relative flex items-center gap-2 py-4 h-full">
            {/* Playhead Indicator */}
            <div 
              className="absolute top-0 bottom-0 w-px bg-[var(--color-interactive)] z-20 pointer-events-none shadow-[0_0_12px_var(--color-interactive)] transition-transform duration-75 ease-linear"
              style={{ transform: `translateX(${playheadX}px)` }}
            >
              <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-[var(--color-interactive)] rounded-full border-2 border-white" />
            </div>

            {photos.length === 0 ? (
            <div className="flex flex-col items-center justify-center w-full min-w-[300px] h-full opacity-40">
              <span className="text-[11px] font-medium uppercase tracking-wider">Empty Timeline</span>
              <span className="text-[10px]">Add photos to start editing</span>
            </div>
          ) : (
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter} 
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={photos.map(p => p.id)} strategy={horizontalListSortingStrategy}>
                {photos.map((photo, index) => (
                  <SortableTimelineItem
                    key={photo.id}
                    photo={photo}
                    index={index}
                    isActive={activeIndex === index}
                    onSelect={setActiveIndex}
                    onDelete={removePhoto}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  </div>
);
};

export default Timeline;
