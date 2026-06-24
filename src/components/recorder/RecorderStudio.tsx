import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Record, Stop, Play, Pause, DownloadSimple, ArrowCounterClockwise, Cursor,
  Monitor, PuzzlePiece, Trash, Eye, EyeSlash, MagnifyingGlassPlus, Sparkle,
} from 'phosphor-react';
import { useRecorderStore } from '../../store/recorderStore';
import { zoomAt, drawZoomedFrame } from '../../lib/recorderZoom';

// Probe a video URL for its duration and pixel dimensions.
function probe(src: string): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve) => {
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.muted = true;
    const finish = () => resolve({ duration: isFinite(v.duration) ? v.duration : 0, width: v.videoWidth || 1280, height: v.videoHeight || 720 });
    v.onloadedmetadata = () => {
      // MediaRecorder webm blobs report duration: Infinity until forced.
      if (!isFinite(v.duration) || v.duration === 0) {
        v.ontimeupdate = () => { if (isFinite(v.duration) && v.duration > 0) { v.ontimeupdate = null; v.currentTime = 0; finish(); } };
        v.currentTime = 1e101;
      } else finish();
    };
    v.onerror = () => resolve({ duration: 0, width: 1280, height: 720 });
    v.src = src;
  });
}

const fmt = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

const RecorderStudio: React.FC = () => {
  const { clip, clicks, zoom, isRecording, setClip, setClicks, addClick, toggleClick, removeClick, setZoom, setRecording, reset } = useRecorderStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [exporting, setExporting] = useState<number | null>(null);

  // recording refs
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedRef = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);

  // ---- live preview render loop -------------------------------------------
  useEffect(() => {
    if (!clip) return;
    let raf = 0;
    const loop = () => {
      const v = videoRef.current;
      const c = canvasRef.current;
      if (v && c && v.readyState >= 2) {
        const ctx = c.getContext('2d');
        if (ctx) drawZoomedFrame(ctx, v, zoomAt(v.currentTime, clicks, zoom), c.width, c.height);
        setTime(v.currentTime);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [clip, clicks, zoom]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { if (v.currentTime >= (clip?.duration ?? 0) - 0.05) v.currentTime = 0; v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  };

  // ---- screen recording (in-app: captures the current tab + its clicks) ----
  const captureClick = useCallback((e: MouseEvent) => {
    addClick((performance.now() - startedRef.current) / 1000, e.clientX / window.innerWidth, e.clientY / window.innerHeight);
  }, [addClick]);

  const stopRecording = useCallback(() => {
    recorderRef.current?.state !== 'inactive' && recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    window.removeEventListener('click', captureClick, true);
  }, [captureClick]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: false });
      streamRef.current = stream;
      chunksRef.current = [];
      const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
      const rec = new MediaRecorder(stream, { mimeType: mime });
      recorderRef.current = rec;
      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      rec.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const meta = await probe(url);
        setClip({ src: url, duration: meta.duration, width: meta.width, height: meta.height });
        setRecording(false);
      };
      stream.getVideoTracks()[0].onended = stopRecording;
      setClicks([]);
      setClip(null);
      startedRef.current = performance.now();
      window.addEventListener('click', captureClick, true);
      rec.start();
      setRecording(true);
    } catch {
      /* user cancelled the picker */
    }
  };

  // ---- handoff from the Chrome extension -----------------------------------
  useEffect(() => {
    const onMsg = async (e: MessageEvent) => {
      const d = e.data;
      if (!d || d.__reecap !== 'screen-recording' || !(d.video instanceof Blob)) return;
      const url = URL.createObjectURL(d.video);
      const meta = await probe(url);
      setClicks((d.clicks || []).map((c: any, i: number) => ({ id: `x${i}`, t: c.t, x: c.x, y: c.y })));
      setClip({ src: url, duration: meta.duration, width: meta.width, height: meta.height });
      setRecording(false);
    };
    window.addEventListener('message', onMsg);
    // Tell the extension's content script we're mounted and listening, so it
    // delivers a just-finished recording (handshake avoids a load-timing race).
    window.postMessage({ __reecap: 'recorder-ready' }, window.location.origin);
    return () => window.removeEventListener('message', onMsg);
  }, [setClip, setClicks, setRecording]);

  const [buildingDemo, setBuildingDemo] = useState(false);
  const tryDemo = async () => {
    setBuildingDemo(true);
    try {
      const { buildDemoClip } = await import('../../lib/recorderDemo');
      const d = await buildDemoClip();
      setClicks(d.clicks.map((c, i) => ({ id: `d${i}`, t: c.t, x: c.x, y: c.y })));
      setClip({ src: d.url, width: d.width, height: d.height, duration: d.duration });
    } finally {
      setBuildingDemo(false);
    }
  };

  // ---- export: bake the zoom into a webm -----------------------------------
  const exportWebm = async () => {
    if (!clip) return;
    const v = document.createElement('video');
    v.src = clip.src; v.muted = true; v.playsInline = true;
    await new Promise((r) => { v.onloadedmetadata = () => r(null); });
    const c = document.createElement('canvas');
    c.width = clip.width; c.height = clip.height;
    const ctx = c.getContext('2d')!;
    let out: MediaStream;
    try { out = c.captureStream(30); } catch { alert('This clip can’t be exported (cross-origin demo). Record your own screen to export.'); return; }
    const rec = new MediaRecorder(out, { mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm' });
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    const done = new Promise<void>((res) => { rec.onstop = () => res(); });
    setExporting(0);
    let raf = 0;
    const loop = () => {
      drawZoomedFrame(ctx, v, zoomAt(v.currentTime, clicks, zoom), c.width, c.height);
      setExporting(Math.min(99, Math.round((v.currentTime / (clip.duration || 1)) * 100)));
      if (!v.ended) raf = requestAnimationFrame(loop);
    };
    v.onended = () => { cancelAnimationFrame(raf); rec.state !== 'inactive' && rec.stop(); };
    try {
      rec.start();
      await v.play();
      raf = requestAnimationFrame(loop);
      await done;
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'reecap-recording.webm'; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      alert('Export failed — try recording your own screen.');
    } finally {
      cancelAnimationFrame(raf);
      setExporting(null);
    }
  };

  // MP4 via WebCodecs (seek-based, deterministic).
  const exportMp4Handler = async () => {
    if (!clip) return;
    setExporting(0);
    try {
      const { exportMp4 } = await import('../../lib/recorderExport');
      await exportMp4(clip, clicks, zoom, setExporting);
    } catch (err) {
      console.error(err);
      alert('MP4 export isn’t supported in this browser — try WebM, or record your own screen.');
    } finally {
      setExporting(null);
    }
  };

  // ---- start screen --------------------------------------------------------
  if (!clip && !isRecording) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[var(--color-bg-page)] px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mb-6">
          <Record size={30} weight="fill" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Screen recorder with auto-zoom</h1>
        <p className="text-[15px] text-[var(--color-text-secondary)] max-w-md leading-relaxed mb-7">
          Record your screen — every click smoothly zooms into that spot in the final video, Screen-Studio style.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button onClick={startRecording} disabled={buildingDemo} className="h-12 px-6 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
            <Monitor size={18} weight="fill" /> Record screen
          </button>
          <button onClick={tryDemo} disabled={buildingDemo} className="h-12 px-6 rounded-[var(--radius-md)] border border-[var(--color-border-default)] font-semibold flex items-center gap-2 hover:bg-[var(--color-bg-hover)] transition-colors disabled:opacity-50">
            <Sparkle size={18} weight="fill" /> {buildingDemo ? 'Building demo…' : 'Try a demo'}
          </button>
        </div>
        <div className="mt-8 max-w-md flex items-start gap-2.5 text-[12px] text-[var(--color-text-muted)] leading-relaxed">
          <PuzzlePiece size={16} className="shrink-0 mt-0.5" />
          <span>In-app recording captures clicks on this tab. Install the <b>Reecap Recorder</b> Chrome extension to capture click-zoom on <i>any</i> website you visit.</span>
        </div>
      </div>
    );
  }

  // ---- recording overlay ---------------------------------------------------
  if (isRecording) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[var(--color-bg-page)] px-6 text-center">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[13px] font-bold uppercase tracking-wider text-red-500">Recording</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight mb-2">Capturing your screen & clicks…</h1>
        <p className="text-[14px] text-[var(--color-text-secondary)] max-w-sm leading-relaxed mb-7 flex items-center gap-1.5 justify-center">
          <Cursor size={15} /> Click around — each click becomes a zoom.
        </p>
        <button onClick={stopRecording} className="h-12 px-6 rounded-[var(--radius-md)] bg-red-500 text-white font-semibold flex items-center gap-2 hover:bg-red-600 transition-colors">
          <Stop size={18} weight="fill" /> Stop recording
        </button>
      </div>
    );
  }

  // ---- editor --------------------------------------------------------------
  const dur = clip!.duration || 1;
  const seek = (t: number) => { const v = videoRef.current; if (v) { v.currentTime = t; setTime(t); } };

  return (
    <div className="flex flex-1 overflow-hidden bg-[var(--color-bg-page)]">
      {/* preview + timeline */}
      <div className="flex-1 flex flex-col min-w-0 p-5 gap-4">
        <div className="flex-1 min-h-0 flex items-center justify-center bg-black rounded-[var(--radius-lg)] overflow-hidden border border-[var(--color-border-default)]">
          <canvas ref={canvasRef} width={clip!.width} height={clip!.height} className="max-w-full max-h-full object-contain" />
          <video ref={videoRef} src={clip!.src} muted playsInline className="hidden" onEnded={() => setPlaying(false)} />
        </div>

        {/* transport */}
        <div className="flex items-center gap-3">
          <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shrink-0 hover:opacity-90">
            {playing ? <Pause size={18} weight="fill" /> : <Play size={18} weight="fill" />}
          </button>
          <span className="text-[12px] tabular-nums text-[var(--color-text-muted)] w-10">{fmt(time)}</span>
          <div className="relative flex-1 h-8 flex items-center">
            <input type="range" min={0} max={dur} step={0.01} value={Math.min(time, dur)} onChange={(e) => seek(parseFloat(e.target.value))} className="w-full accent-[var(--color-primary)]" />
            {/* click markers */}
            {clicks.map((c) => (
              <span key={c.id} title={`Click @ ${c.t.toFixed(1)}s`} className={`absolute top-0 -translate-x-1/2 w-2 h-2 rounded-full ${c.disabled ? 'bg-[var(--color-text-muted)]' : 'bg-amber-500'}`} style={{ left: `${(c.t / dur) * 100}%` }} />
            ))}
          </div>
          <span className="text-[12px] tabular-nums text-[var(--color-text-muted)] w-10">{fmt(dur)}</span>
        </div>
      </div>

      {/* inspector */}
      <div className="w-72 shrink-0 border-l border-[var(--color-border-default)] bg-[var(--color-bg-surface)] overflow-y-auto custom-scrollbar">
        <div className="px-4 py-3 border-b border-[var(--color-border-default)] flex items-center justify-between">
          <span className="text-[13px] font-bold">Recording</span>
          <button onClick={reset} title="Record again" className="flex items-center gap-1 text-[12px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
            <ArrowCounterClockwise size={14} /> New
          </button>
        </div>

        <div className="px-4 py-3 border-b border-[var(--color-border-default)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[13px] font-semibold"><MagnifyingGlassPlus size={15} /> Click zoom</span>
            <button onClick={() => setZoom({ enabled: !zoom.enabled })} className={`w-9 h-5 rounded-full transition-colors relative ${zoom.enabled ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-bg-hover)]'}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${zoom.enabled ? 'left-4' : 'left-0.5'}`} />
            </button>
          </div>
          <Slider label="Zoom level" value={zoom.level} min={1.2} max={3} step={0.1} suffix="×" onChange={(v) => setZoom({ level: v })} />
          <Slider label="Zoom in" value={zoom.inDur} min={0.1} max={1.5} step={0.05} suffix="s" onChange={(v) => setZoom({ inDur: v })} />
          <Slider label="Hold" value={zoom.hold} min={0.2} max={3} step={0.1} suffix="s" onChange={(v) => setZoom({ hold: v })} />
          <Slider label="Zoom out" value={zoom.outDur} min={0.1} max={1.5} step={0.05} suffix="s" onChange={(v) => setZoom({ outDur: v })} />
        </div>

        <div className="px-4 py-3 border-b border-[var(--color-border-default)]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Clicks ({clicks.length})</p>
          {clicks.length === 0 && <p className="text-[12px] text-[var(--color-text-muted)]">No clicks captured.</p>}
          <div className="space-y-1 max-h-52 overflow-y-auto">
            {clicks.map((c, i) => (
              <div key={c.id} className="flex items-center gap-2 text-[12px] group">
                <button onClick={() => seek(c.t)} className="flex-1 flex items-center gap-2 text-left hover:text-[var(--color-primary)]">
                  <span className="w-5 h-5 rounded bg-amber-500/15 text-amber-600 flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</span>
                  <span className="tabular-nums">{c.t.toFixed(1)}s</span>
                  <span className="text-[var(--color-text-muted)]">· {Math.round(c.x * 100)},{Math.round(c.y * 100)}</span>
                </button>
                <button onClick={() => toggleClick(c.id)} title={c.disabled ? 'Enable zoom' : 'Disable zoom'} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                  {c.disabled ? <EyeSlash size={14} /> : <Eye size={14} />}
                </button>
                <button onClick={() => removeClick(c.id)} className="text-[var(--color-text-muted)] hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash size={13} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4">
          {exporting !== null ? (
            <button disabled className="w-full h-11 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white font-semibold flex items-center justify-center gap-2 opacity-70">
              <DownloadSimple size={18} weight="bold" /> Exporting {exporting}%
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={exportMp4Handler} className="flex-1 h-11 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                <DownloadSimple size={18} weight="bold" /> Export MP4
              </button>
              <button onClick={exportWebm} title="Export WebM" className="h-11 px-4 rounded-[var(--radius-md)] border border-[var(--color-border-default)] font-semibold text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors">
                WebM
              </button>
            </div>
          )}
          <p className="mt-2 text-[11px] text-[var(--color-text-muted)] text-center">MP4 (H.264) · WebM · zoom baked in</p>
        </div>
      </div>
    </div>
  );
};

const Slider: React.FC<{ label: string; value: number; min: number; max: number; step: number; suffix: string; onChange: (v: number) => void }> = ({ label, value, min, max, step, suffix, onChange }) => (
  <label className="block">
    <div className="flex items-center justify-between text-[12px] mb-1">
      <span className="text-[var(--color-text-secondary)]">{label}</span>
      <span className="tabular-nums font-semibold">{value.toFixed(step < 0.1 ? 2 : 1)}{suffix}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full accent-[var(--color-primary)]" />
  </label>
);

export default RecorderStudio;
