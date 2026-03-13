import React from 'react';
import { useReecapStore } from '../../store/reecapStore';
import { Upload } from 'phosphor-react';
import Button from '../ui/Button';
import { processFiles } from '../../lib/utils';

const Canvas: React.FC = () => {
  const { photos, activeIndex, settings, addPhotos, playbackProgress, setAudio } = useReecapStore();
  
  const currentPhoto = photos[activeIndex];
  const nextIndex = (activeIndex + 1) % photos.length;
  const nextPhoto = photos[nextIndex];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).filter(f => 
      ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
    );
    const processed = await processFiles(files);
    addPhotos(processed);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('type');
    
    if (type === 'audio') {
      const url = e.dataTransfer.getData('itemUrl');
      const name = e.dataTransfer.getData('itemName');
      if (url && name) {
        setAudio({ url, name });
      }
      return;
    }

    if (e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter(f => 
        ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
      );
      if (files.length > 0) {
        const processed = await processFiles(files);
        addPhotos(processed);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  if (photos.length === 0) {
    return (
      <main 
        className="flex-1 flex items-center justify-center bg-[var(--color-bg-page)] p-12"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="w-full max-w-lg border-2 border-dashed border-[var(--color-border-default)] rounded-[var(--radius-md)] p-12 flex flex-col items-center text-center text-[var(--color-text-primary)]">
          <Upload size={32} className="mb-4 opacity-50" />
          <h2 className="text-lg font-medium mb-1">Drop photos here</h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">Supports JPG, PNG, WebP · 2–30 photos</p>
          <label className="cursor-pointer">
            <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { handleFileUpload(e); e.target.value = ''; }} />
            <Button variant="secondary" size="lg" as="span">Browse files</Button>
          </label>
        </div>
      </main>
    );
  }

  // we logic transitions between t=0.7 and t=1.0 for a smooth overlap
  const transitionStart = 0.8; // Transition starts at 80% of the duration
  const isInTransition = playbackProgress >= transitionStart;
  const p = isInTransition ? (playbackProgress - transitionStart) / (1 - transitionStart) : 0;

  const renderSlide = (photo: any, progress: number, isNext: boolean) => {
    if (!photo) return null;

    let style: React.CSSProperties = {
      position: 'absolute',
      inset: 0,
      zIndex: isNext ? 20 : 10,
      opacity: 1,
      transform: 'none',
      clipPath: 'none',
      backfaceVisibility: 'hidden',
    };

    const t = settings.transition;

    if (t === 'fade') {
      style.opacity = isNext ? progress : 1 - progress;
    } else if (t === 'slide') {
      style.transform = `translateX(${isNext ? (100 - progress * 100) : (-progress * 100)}%)`;
    } else if (t === 'slide-up') {
      style.transform = `translateY(${isNext ? (100 - progress * 100) : 0}%)`;
      style.zIndex = isNext ? 25 : 10;
    } else if (t === 'zoom') {
      style.transform = `scale(${isNext ? (0.8 + progress * 0.2) : (1 + progress * 0.2)})`;
      style.opacity = isNext ? progress : 1 - progress;
    } else if (t === 'wipe') {
      style.clipPath = isNext ? `inset(0 ${100 - progress * 100}% 0 0)` : 'none';
      style.zIndex = isNext ? 25 : 10;
    } else if (t === 'flip') {
      style.transform = `perspective(1000px) rotateY(${isNext ? (90 - progress * 90) : (-progress * 90)}deg)`;
      style.opacity = isNext ? (progress > 0.5 ? 1 : 0) : (progress > 0.5 ? 0 : 1);
    } else if (t === 'dissolve') {
      style.opacity = isNext ? progress : 1 - progress;
      if (progress > 0 && progress < 1) {
        style.filter = `blur(${progress * 5}px)`; // Add a slight blur during dissolve if desired, but user said 50% opacity
      }
    } else if (t === 'none') {
      // Direct switch at the end
      style.opacity = isNext ? (progress > 0.5 ? 1 : 0) : (progress > 0.5 ? 0 : 1);
    }

    return (
      <div 
        key={`${photo.id}-${isNext ? 'next' : 'curr'}`}
        className={`relative w-full h-full overflow-hidden flex items-center justify-center`}
        style={style}
      >
        <div className={`relative ${settings.imageFit === 'cover' ? 'w-full h-full' : 'w-auto h-full max-w-full flex items-center justify-center'}`}
          style={{
            borderRadius: `${settings.borderRadius}px`,
            boxShadow: (Number(settings.shadow) > 0 && Number(style.opacity) > 0) ? `0 ${Number(settings.shadow)/2}px ${Number(settings.shadow)}px rgba(0,0,0,0.2)` : 'none',
            overflow: 'hidden'
          }}
        >
          <img 
            src={photo.objectUrl} 
            className={`${settings.imageFit === 'cover' ? 'w-full h-full object-cover' : 'w-auto h-full max-w-full object-contain block'}`}
            draggable={false}
          />
        </div>
      </div>
    );
  };

  return (
    <main 
      className="flex-1 overflow-hidden relative flex items-center justify-center p-8 bg-[var(--color-bg-page)]"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div 
        className="w-full h-full relative shadow-[var(--shadow-md)] bg-white overflow-hidden transition-all duration-300 flex items-center justify-center"
        style={{ 
          maxWidth: '100%',
          maxHeight: '100%',
          aspectRatio: settings.aspectRatio.split(':').join(' / '),
          height: 'auto',
        }}
      >
        {/* Background Layer */}
        {settings.backgroundMode === 'slide' && currentPhoto && (
          <div className="absolute inset-0 z-0">
            <img 
              src={currentPhoto.objectUrl} 
              className="w-full h-full object-cover scale-110" 
              style={{ filter: `blur(${settings.backgroundBlur}px)`, opacity: 1 - p }}
            />
            {nextPhoto && p > 0 && (
              <img 
                src={nextPhoto.objectUrl} 
                className="absolute inset-0 w-full h-full object-cover scale-110" 
                style={{ filter: `blur(${settings.backgroundBlur}px)`, opacity: p }}
              />
            )}
            <div className="absolute inset-0 bg-black" style={{ opacity: settings.backgroundOverlay / 100 }} />
          </div>
        )}

        {settings.backgroundMode === 'color' && (
          <div className="absolute inset-0 z-0" style={{ background: settings.backgroundColor }} />
        )}

        {settings.backgroundMode === 'image' && (
          <div className="absolute inset-0 z-0">
            <img src={settings.backgroundColor} className="w-full h-full object-cover" alt="background" />
          </div>
        )}

        {/* Photo Container */}
        <div 
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          style={{ padding: `${settings.padding}px` }}
        >
          <div className="relative w-full h-full">
            {renderSlide(currentPhoto, p, false)}
            {p > 0 && renderSlide(nextPhoto, p, true)}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Canvas;
