import * as mp4uxer from 'mp4-muxer';

export async function exportWithWebCodecs(
  frameBlobs: Blob[],
  durations: number | number[], // seconds per frame (single value applies to all)
  dimensions: { width: number; height: number },
  onProgress: (p: number) => void,
  audioBlob?: Blob | null,
  speed: number = 1 // playback speed; audio is time-stretched to match
): Promise<Blob> {
  const { width, height } = dimensions;
  const FPS = 30;

  // Normalize to a per-frame duration array.
  const perFrame = Array.isArray(durations)
    ? durations
    : frameBlobs.map(() => durations);
  const totalDuration = perFrame.reduce((sum, d) => sum + d, 0);

  // 1. Initialize Muxer
  const muxer = new mp4uxer.Muxer({
    target: new mp4uxer.ArrayBufferTarget(),
    video: {
      codec: 'avc',
      width,
      height,
    },
    audio: audioBlob ? {
      codec: 'aac',
      sampleRate: 44100,
      numberOfChannels: 2
    } : undefined,
    fastStart: 'fragmented',
  });

  // 2. Initialize Encoders
  const videoEncoder = new VideoEncoder({
    output: (chunk, metadata) => muxer.addVideoChunk(chunk, metadata),
    error: (e) => console.error('VideoEncoder error:', e),
  });

  videoEncoder.configure({
    codec: 'avc1.4d002a',
    width,
    height,
    bitrate: 5_000_000,
    framerate: 30,
    hardwareAcceleration: 'prefer-hardware',
  });

  let audioEncoder: AudioEncoder | null = null;
  if (audioBlob) {
    audioEncoder = new AudioEncoder({
      output: (chunk, metadata) => muxer.addAudioChunk(chunk, metadata),
      error: (e) => console.error('AudioEncoder error:', e),
    });
    audioEncoder.configure({
      codec: 'mp4a.40.2', // AAC-LC
      numberOfChannels: 2,
      sampleRate: 44100,
      bitrate: 128_000,
    });
  }

  // 3. Process Audio — render through an OfflineAudioContext so it is
  // time-stretched by `speed` and clamped to exactly the video duration.
  if (audioBlob && audioEncoder) {
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

    // Feed audio in chunks (always stereo from the render context).
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
        data: data.buffer
      });
      audioEncoder.encode(audioData);
      audioData.close();
    }
    await audioEncoder.flush();
  }

  // 4. Process Video Frames
  let frameCounter = 0;
  for (let i = 0; i < frameBlobs.length; i++) {
    const bitmap = await createImageBitmap(frameBlobs[i]);
    const framesToFeed = Math.max(1, Math.round(perFrame[i] * FPS));

    for (let j = 0; j < framesToFeed; j++) {
      const frameTimestamp = frameCounter * (1 / FPS) * 1_000_000;
      const frame = new VideoFrame(bitmap, { timestamp: frameTimestamp });
      videoEncoder.encode(frame, { keyFrame: j === 0 });
      frame.close();
      frameCounter++;
    }

    bitmap.close();
    onProgress(Math.round(((i + 1) / frameBlobs.length) * 100));
  }

  await videoEncoder.flush();
  muxer.finalize();

  const { buffer } = muxer.target as mp4uxer.ArrayBufferTarget;
  return new Blob([buffer], { type: 'video/mp4' });
}
