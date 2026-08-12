// Screen Recorder — MP4 export.
//
// Renders the recording frame-by-frame (seeking the source video, applying the
// click-zoom) and encodes to H.264/MP4 with WebCodecs + mp4-muxer. Seek-based
// (not real-time) so it's deterministic and runs even in a background tab.

import * as mp4muxer from 'mp4-muxer';
import type { ClickMark, RecorderClip, ZoomSettings } from '../types/recorder';
import { zoomAt, drawZoomedFrame } from './recorderZoom';
import { drawWatermark } from './videoRenderer';
import type { TIER_LIMITS } from './credits';

const MAX_LONG_EDGE: Record<(typeof TIER_LIMITS)['free']['maxResolution'], number> = {
  '720p': 1280,
  '1080p': 1920,
  '4k': 3840,
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function seekTo(v: HTMLVideoElement, t: number): Promise<void> {
  return new Promise((resolve) => {
    const onSeeked = () => { v.removeEventListener('seeked', onSeeked); resolve(); };
    v.addEventListener('seeked', onSeeked);
    v.currentTime = t;
  });
}

// MediaRecorder webm blobs often report duration: Infinity until forced.
function ensureDuration(v: HTMLVideoElement): Promise<number> {
  return new Promise((resolve) => {
    if (isFinite(v.duration) && v.duration > 0) return resolve(v.duration);
    const onUpdate = () => {
      if (isFinite(v.duration) && v.duration > 0) {
        v.removeEventListener('timeupdate', onUpdate);
        v.currentTime = 0;
        resolve(v.duration);
      }
    };
    v.addEventListener('timeupdate', onUpdate);
    v.currentTime = 1e101; // jump past the end to make the browser compute duration
  });
}

export async function exportMp4(
  clip: RecorderClip,
  clicks: ClickMark[],
  zoom: ZoomSettings,
  onProgress: (p: number) => void,
  limits?: { maxResolution: keyof typeof MAX_LONG_EDGE; watermark: boolean },
): Promise<void> {
  const v = document.createElement('video');
  v.src = clip.src;
  v.muted = true;
  v.playsInline = true;
  await new Promise((r) => { v.onloadedmetadata = () => r(null); });
  const duration = clip.duration && isFinite(clip.duration) ? clip.duration : await ensureDuration(v);

  // H.264 requires even dimensions.
  let W = (v.videoWidth || clip.width) & ~1;
  let H = (v.videoHeight || clip.height) & ~1;

  // Downscale to the caller's tier resolution cap, preserving aspect ratio.
  if (limits) {
    const maxEdge = MAX_LONG_EDGE[limits.maxResolution];
    const longEdge = Math.max(W, H);
    if (longEdge > maxEdge) {
      const scale = maxEdge / longEdge;
      W = Math.round(W * scale) & ~1;
      H = Math.round(H * scale) & ~1;
    }
  }

  const fps = 30;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const muxer = new mp4muxer.Muxer({
    target: new mp4muxer.ArrayBufferTarget(),
    video: { codec: 'avc', width: W, height: H },
    fastStart: 'fragmented',
  });
  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => console.error('VideoEncoder error:', e),
  });
  encoder.configure({
    codec: 'avc1.4d002a',
    width: W,
    height: H,
    bitrate: 6_000_000,
    framerate: fps,
    hardwareAcceleration: 'prefer-hardware',
  });

  const total = Math.max(1, Math.ceil(duration * fps));
  const frameDur = 1_000_000 / fps;
  for (let f = 0; f < total; f++) {
    const t = f / fps;
    await seekTo(v, Math.min(t, Math.max(0, duration - 0.001)));
    drawZoomedFrame(ctx, v, zoomAt(t, clicks, zoom), W, H);
    if (limits?.watermark) drawWatermark(ctx, W, H);
    const frame = new VideoFrame(canvas, { timestamp: Math.round(f * frameDur), duration: frameDur });
    encoder.encode(frame, { keyFrame: f % fps === 0 });
    frame.close();
    onProgress(Math.round(((f + 1) / total) * 100));
    if (f % 10 === 0) await new Promise((r) => setTimeout(r, 0)); // let the encoder drain
  }

  await encoder.flush();
  muxer.finalize();
  const { buffer } = muxer.target as mp4muxer.ArrayBufferTarget;
  downloadBlob(new Blob([buffer], { type: 'video/mp4' }), 'reecap-recording.mp4');
}
