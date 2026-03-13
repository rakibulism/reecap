import React from 'react';
import { useReecapStore } from '../../store/reecapStore';
import { Upload } from 'phosphor-react';
import Button from '../ui/Button';
import { processFiles } from '../../lib/utils';

const Canvas: React.FC = () => {
  const { photos, activeIndex, settings, addPhotos } = useReecapStore();
  
  const currentPhoto = photos[activeIndex];


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).filter(f => 
      ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
    );
    const processed = await processFiles(files);
    addPhotos(processed);
  };

  if (photos.length === 0) {
    return (
      <main className="flex-1 flex items-center justify-center bg-[var(--color-bg-page)] p-12">
        <div className="w-full max-w-lg border-2 border-dashed border-[var(--color-border-default)] rounded-[var(--radius-md)] p-12 flex flex-col items-center text-center">
          <div className="mb-4 text-[var(--color-text-muted)]">
            <Upload size={32} />
          </div>
          <h2 className="text-lg font-medium text-[var(--color-text-primary)] mb-1">
            Drop photos here
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">
            Supports JPG, PNG, WebP · 2–30 photos
          </p>
          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                handleFileUpload(e);
                e.target.value = '';
              }}
            />
            <Button variant="secondary" size="lg" as="span">
              Browse files
            </Button>
          </label>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-hidden relative flex items-center justify-center p-8 bg-[var(--color-bg-page)]">
      {/* Aspect Ratio Container */}
      <div 
        className="w-full h-full relative shadow-[var(--shadow-md)] bg-white overflow-hidden transition-all duration-300 flex items-center justify-center"
        style={{ 
          maxWidth: '100%',
          maxHeight: '100%',
          aspectRatio: settings.aspectRatio.split(':').join(' / '),
          height: 'auto', // Allow aspectRatio to determine one dimension
        }}
      >
        {/* Background Layer */}
        {settings.backgroundMode === 'slide' && currentPhoto && (
          <div className="absolute inset-0 z-0">
            <img 
              key={`bg-${currentPhoto.id}`}
              src={currentPhoto.objectUrl} 
              className="w-full h-full object-cover scale-110 animate-in fade-in duration-500" 
              style={{ filter: `blur(${settings.backgroundBlur}px)` }}
            />
            <div 
              className="absolute inset-0 bg-black" 
              style={{ opacity: settings.backgroundOverlay / 100 }}
            />
          </div>
        )}

        {settings.backgroundMode === 'color' && (
          <div className="absolute inset-0 z-0" style={{ backgroundColor: settings.backgroundColor }} />
        )}

        {/* Photo Frame */}
        <div 
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          style={{ padding: `${settings.padding}px` }}
        >
          {currentPhoto && (
            <div 
              key={`frame-${currentPhoto.id}`}
              className="relative w-full h-full overflow-hidden transition-all duration-300 animate-in zoom-in-95 fade-in duration-300"
              style={{ 
                borderRadius: `${settings.borderRadius}px`,
                boxShadow: settings.shadow > 0 ? `0 ${settings.shadow/2}px ${settings.shadow}px rgba(0,0,0,0.2)` : 'none'
              }}
            >
              <img 
                src={currentPhoto.objectUrl} 
                className={`w-full h-full ${settings.imageFit === 'cover' ? 'object-cover' : 'object-contain'}`}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Canvas;
