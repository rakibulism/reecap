import * as mp4uxer from 'mp4-muxer';

interface EncodeOptions {
  totalDuration: number; // seconds
  fps: number;
  dimensions: { width: number; height: number };
  onProgress: (p: number) => void;
  /** Paints the full frame for absolute time `t` (seconds) onto the context. */
  renderFrame: (ctx: CanvasRenderingContext2D, t: number) => void;
  audioBlob?: Blob | null;
  speed?: number; // audio is time-stretched to match
}

/**
 * Encodes a video by rendering every frame at `fps` via the `renderFrame`
 * callback (so transitions and animations are baked in), muxing to MP4 with
 * hardware-accelerated WebCodecs, plus optional speed-matched audio.
 */
export async function encodeVideo({
  totalDuration,
  fps,
  dimensions,
  onProgress,
  renderFrame,
  audioBlob,
  speed = 1,
}: EncodeOptions): Promise<Blob> {
  const { width, height } = dimensions;

  const muxer = new mp4uxer.Muxer({
    target: new mp4uxer.ArrayBufferTarget(),
    video: { codec: 'avc', width, height },
    audio: audioBlob ? { codec: 'aac', sampleRate: 44100, numberOfChannels: 2 } : undefined,
    fastStart: 'fragmented',
  });

  const videoEncoder = new VideoEncoder({
    output: (chunk, metadata) => muxer.addVideoChunk(chunk, metadata),
    error: (e) => console.error('VideoEncoder error:', e),
  });
  videoEncoder.configure({
    codec: 'avc1.4d002a',
    width,
    height,
    bitrate: 5_000_000,
    framerate: fps,
    hardwareAcceleration: 'prefer-hardware',
  });

  let audioEncoder: AudioEncoder | null = null;
  if (audioBlob) {
    audioEncoder = new AudioEncoder({
      output: (chunk, metadata) => muxer.addAudioChunk(chunk, metadata),
      error: (e) => console.error('AudioEncoder error:', e),
    });
    audioEncoder.configure({
      codec: 'mp4a.40.2',
      numberOfChannels: 2,
      sampleRate: 44100,
      bitrate: 128_000,
    });
    await processAudio(audioEncoder, audioBlob, totalDuration, speed);
  }

  // Render + encode every frame.
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const totalFrames = Math.max(1, Math.ceil(totalDuration * fps));
  const frameDuration = (1 / fps) * 1_000_000;

  for (let f = 0; f < totalFrames; f++) {
    const t = f / fps;
    renderFrame(ctx, t);
    const frame = new VideoFrame(canvas, { timestamp: f * frameDuration, duration: frameDuration });
    videoEncoder.encode(frame, { keyFrame: f % fps === 0 });
    frame.close();
    onProgress(Math.round(((f + 1) / totalFrames) * 100));
    // Yield occasionally so the encoder queue drains and the UI can update.
    if (f % fps === 0) await new Promise((r) => setTimeout(r, 0));
  }

  await videoEncoder.flush();
  muxer.finalize();

  const { buffer } = muxer.target as mp4uxer.ArrayBufferTarget;
  return new Blob([buffer], { type: 'video/mp4' });
}

/** Decodes, time-stretches by `speed`, and clamps audio to the video length. */
async function processAudio(
  audioEncoder: AudioEncoder,
  audioBlob: Blob,
  totalDuration: number,
  speed: number
) {
  const renderLength = Math.max(1, Math.ceil(44100 * totalDuration));
  const decodeCtx = new OfflineAudioContext(2, 44100, 44100);
  const decoded = await decodeCtx.decodeAudioData(await audioBlob.arrayBuffer());

  const renderCtx = new OfflineAudioContext(2, renderLength, 44100);
  const source = renderCtx.createBufferSource();
  source.buffer = decoded;
  source.playbackRate.value = speed; // >1 speeds up (and raises pitch)
  source.connect(renderCtx.destination);
  source.start(0);
  const audioBuffer = await renderCtx.startRendering();

  const totalSamples = audioBuffer.length;
  const ch0 = audioBuffer.getChannelData(0);
  const ch1 = audioBuffer.numberOfChannels > 1 ? audioBuffer.getChannelData(1) : ch0;
  const samplesPerChunk = 1024;
  for (let offset = 0; offset < totalSamples; offset += samplesPerChunk) {
    const length = Math.min(samplesPerChunk, totalSamples - offset);
    const data = new Float32Array(length * 2);
    data.set(ch0.subarray(offset, offset + length), 0);
    data.set(ch1.subarray(offset, offset + length), length);

    const audioData = new AudioData({
      format: 'f32-planar',
      sampleRate: 44100,
      numberOfFrames: length,
      numberOfChannels: 2,
      timestamp: (offset / 44100) * 1_000_000,
      data: data.buffer,
    });
    audioEncoder.encode(audioData);
    audioData.close();
  }
  await audioEncoder.flush();
}
