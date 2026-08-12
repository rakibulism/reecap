import { useState } from 'react';
import { useReecapStore } from '../store/reecapStore';
import { encodeVideo } from '../lib/webCodecsEncoder';
import { buildTimeline, renderTimelineFrame } from '../lib/videoRenderer';
import { prepareVideoSaveTarget, saveVideoBlob, buildVideoFilename, SaveCancelled, type SaveTarget } from '../lib/saveLocation';
import { TIER_LIMITS, consumeCredit, refundCredit } from '../lib/credits';

const FPS = 30;

// width/height per aspect ratio at each tier's max resolution.
const RESOLUTIONS: Record<string, Record<'720p' | '1080p' | '4k', { width: number; height: number }>> = {
  '16:9': { '720p': { width: 1280, height: 720 }, '1080p': { width: 1920, height: 1080 }, '4k': { width: 3840, height: 2160 } },
  '4:3': { '720p': { width: 960, height: 720 }, '1080p': { width: 1440, height: 1080 }, '4k': { width: 2880, height: 2160 } },
  '5:4': { '720p': { width: 900, height: 720 }, '1080p': { width: 1350, height: 1080 }, '4k': { width: 2700, height: 2160 } },
  '1:1': { '720p': { width: 720, height: 720 }, '1080p': { width: 1080, height: 1080 }, '4k': { width: 2160, height: 2160 } },
  '9:16': { '720p': { width: 720, height: 1280 }, '1080p': { width: 1080, height: 1920 }, '4k': { width: 2160, height: 3840 } },
};

export function useExport() {
  const {
    photos, settings, projectName, videoSaveMode, videoNameParts, audio, playbackSpeed,
    setExporting, setExportProgress, profile, openPremiumPrompt,
  } = useReecapStore();
  const [error, setError] = useState<string | null>(null);

  const startExport = async () => {
    if (photos.length < 2) {
      setError('Minimum 2 photos required');
      return;
    }

    const tier = profile?.tier ?? 'free';
    const limits = TIER_LIMITS[tier];

    // Duration cap is a hard block — checked before consuming a credit or
    // prompting for a save location.
    const speed = playbackSpeed || 1;
    const { clips, total } = buildTimeline(photos, settings, speed);
    if (total > limits.maxDuration) {
      setError(`Your ${limits.label} plan caps exports at ${limits.maxDuration}s. Trim the timeline or upgrade.`);
      openPremiumPrompt();
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

    const allowed = await consumeCredit();
    if (!allowed) {
      setError(`You've used all your renders for this month on the ${limits.label} plan. Upgrade for more.`);
      openPremiumPrompt();
      return;
    }

    setExporting(true);
    setExportProgress(0);
    setError(null);

    try {
      const dim = RESOLUTIONS[settings.aspectRatio][limits.maxResolution];

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

      // Render every frame (transitions + caption animations baked in)
      // straight into the encoder, using the timeline built above.
      const videoBlob = await encodeVideo({
        totalDuration: total,
        fps: FPS,
        dimensions: dim,
        onProgress: (p) => setExportProgress(p),
        renderFrame: (ctx, t) => renderTimelineFrame(ctx, t, clips, settings, dim, imageMap, limits.watermark),
        audioBlob: audio ? await fetch(audio.url).then((r) => r.blob()) : null,
      });

      // Save to the chosen target (folder / "Save as"), else a plain download.
      await saveVideoBlob(videoBlob, filename, target);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Export failed');
      await refundCredit();
    } finally {
      setExporting(false);
      setExportProgress(0);
    }
  };

  return { startExport, error };
}
