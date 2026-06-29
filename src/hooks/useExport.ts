import { useState } from 'react';
import { useReecapStore } from '../store/reecapStore';
import { encodeVideo } from '../lib/webCodecsEncoder';
import { buildTimeline, renderTimelineFrame } from '../lib/videoRenderer';
import { prepareVideoSaveTarget, saveVideoBlob, buildVideoFilename, SaveCancelled, type SaveTarget } from '../lib/saveLocation';

const FPS = 30;

export function useExport() {
  const { photos, settings, projectName, videoSaveMode, videoNameParts, audio, playbackSpeed, setExporting, setExportProgress } =
    useReecapStore();
  const [error, setError] = useState<string | null>(null);

  const startExport = async () => {
    if (photos.length < 2) {
      setError('Minimum 2 photos required');
      return;
    }

    // Pick where the file goes now, while we still have the click's user
    // activation ("Save as" dialogs / folder permission need it; the long
    // encode below would otherwise expire it). Bail out if the user cancels.
    const filename = buildVideoFilename(projectName, settings.aspectRatio, videoNameParts);
    let target: SaveTarget = { kind: 'download' };
    try {
      target = await prepareVideoSaveTarget(videoSaveMode, filename);
    } catch (err) {
      if (err instanceof SaveCancelled) return;
      throw err;
    }

    setExporting(true);
    setExportProgress(0);
    setError(null);

    try {
      // Resolution mapping
      const resolutions: Record<string, { width: number; height: number }> = {
        '16:9': settings.exportQuality === '1x' ? { width: 1280, height: 720 } : { width: 1920, height: 1080 },
        '4:3': settings.exportQuality === '1x' ? { width: 960, height: 720 } : { width: 1440, height: 1080 },
        '5:4': settings.exportQuality === '1x' ? { width: 900, height: 720 } : { width: 1350, height: 1080 },
        '1:1': settings.exportQuality === '1x' ? { width: 720, height: 720 } : { width: 1080, height: 1080 },
        '9:16': settings.exportQuality === '1x' ? { width: 720, height: 1280 } : { width: 1080, height: 1920 },
      };
      const dim = resolutions[settings.aspectRatio];

      // Pre-load all images.
      const imageMap = new Map<string, HTMLImageElement>();
      await Promise.all(
        photos.map(
          (photo) =>
            new Promise<void>((resolve, reject) => {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => {
                imageMap.set(photo.id, img);
                resolve();
              };
              img.onerror = () => reject(new Error('Failed to load an image for export'));
              img.src = photo.objectUrl || photo.url || '';
            })
        )
      );

      // Build the speed-scaled timeline and render every frame (transitions +
      // caption animations baked in) straight into the encoder.
      const speed = playbackSpeed || 1;
      const { clips, total } = buildTimeline(photos, settings, speed);

      const videoBlob = await encodeVideo({
        totalDuration: total,
        fps: FPS,
        dimensions: dim,
        onProgress: (p) => setExportProgress(p),
        renderFrame: (ctx, t) => renderTimelineFrame(ctx, t, clips, settings, dim, imageMap),
        audioBlob: audio ? await fetch(audio.url).then((r) => r.blob()) : null,
      });

      // Save to the chosen target (folder / "Save as"), else a plain download.
      await saveVideoBlob(videoBlob, filename, target);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Export failed');
    } finally {
      setExporting(false);
      setExportProgress(0);
    }
  };

  return { startExport, error };
}
