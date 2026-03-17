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
      ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(f.type)
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
      if (url && name) setAudio({ url, name });
      return;
    }

    if (type === 'image') {
      const url = e.dataTransfer.getData('itemUrl');
      if (url) {
        addPhotos([{
          id: Math.random().toString(36).substr(2, 9),
          file: new File([], 'community-image'),
          objectUrl: url,
          width: 1920,
          height: 1080,
        }]);
      }
      return;
    }

    if (e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter(f => 
        ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(f.type)
      );
      if (files.length > 0) {
        const processed = await processFiles(files);
        addPhotos(processed);
      }
    }
  };

  if (photos.length === 0) {
    return (
      <main className="flex-1 flex items-center justify-center bg-[var(--color-bg-page)] p-12" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
        <div className="w-full max-w-lg border-2 border-dashed border-[var(--color-border-default)] rounded-[var(--radius-md)] p-12 flex flex-col items-center text-center text-[var(--color-text-primary)]">
          <Upload size={32} className="mb-4 opacity-50" />
          <h2 className="text-lg font-medium mb-1">Drop photos here</h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">Supports JPG, PNG, WebP, GIF</p>
          <label className="cursor-pointer">
            <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => { handleFileUpload(e); e.target.value = ''; }} />
            <Button variant="secondary" size="lg" as="span">Browse files</Button>
          </label>
        </div>
      </main>
    );
  }

  const p = playbackProgress >= 0.8 ? (playbackProgress - 0.8) / 0.2 : 0;

  const renderSlide = (photo: any, progress: number, isNext: boolean) => {
    if (!photo) return null;
    const imageUrl = photo.objectUrl || photo.url;
    if (!imageUrl) return null;
    
    const t = photo.transition || settings.transition;

    const style: React.CSSProperties = {
      position: 'absolute',
      inset: 0,
      zIndex: isNext ? 20 : 10,
      opacity: 1,
      transform: 'none',
      clipPath: 'none',
      backfaceVisibility: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

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
        style.filter = `blur(${progress * 5}px)`;
      }
    } else if (t === 'none') {
      style.opacity = isNext ? (progress > 0.5 ? 1 : 0) : (progress > 0.5 ? 0 : 1);
    }

    return (
      <div key={`${photo.id}-${isNext ? 'next' : 'curr'}`} style={style}>
        <div 
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              position: 'relative',
              width: settings.imageFit === 'cover' ? '100%' : 'auto',
              height: settings.imageFit === 'cover' ? '100%' : 'auto',
              maxWidth: '100%',
              maxHeight: '100%',
              borderRadius: `${settings.borderRadius}px`,
              boxShadow: settings.shadow > 0 ? `0 ${settings.shadow/2}px ${settings.shadow}px rgba(0,0,0,0.2)` : 'none',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img 
              src={imageUrl} 
              style={{ 
                width: settings.imageFit === 'cover' ? '100%' : 'auto', 
                height: settings.imageFit === 'cover' ? '100%' : 'auto', 
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: settings.imageFit, 
                display: 'block' 
              }} 
              alt="" 
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="flex-1 relative flex items-center justify-center p-8 bg-[var(--color-bg-page)] overflow-hidden" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      <div 
        className="relative bg-white shadow-2xl overflow-hidden transition-all duration-100"
        style={{ 
          width: '100%',
          height: '100%',
          maxWidth: '100%',
          maxHeight: '100%',
          aspectRatio: settings.aspectRatio.replace(':', '/'),
        }}
      >
        {/* Background Layer */}
        {settings.backgroundMode === 'slide' && currentPhoto && (
          <div className="absolute inset-0 z-0">
            <img 
              src={currentPhoto.objectUrl || currentPhoto.url} 
              className="w-full h-full object-cover blur-2xl opacity-40 scale-110" 
              alt=""
            />
            {nextPhoto && p > 0 && (
              <img 
                src={nextPhoto.objectUrl || nextPhoto.url} 
                className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110" 
                style={{ opacity: p * 0.4 }}
                alt=""
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

        {/* Slides Content */}
        <div className="absolute inset-0 z-10" style={{ padding: `${settings.padding}px` }}>
          <div className="relative w-full h-full flex items-center justify-center">
            {renderSlide(currentPhoto, p, false)}
            {p > 0 && renderSlide(nextPhoto, p, true)}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Canvas;
