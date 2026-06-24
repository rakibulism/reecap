// Reecap Recorder — setup / controller page.
//
// Opens a Document Picture-in-Picture window that floats above every tab and
// app, holding the webcam preview and the recording controls (delete · restart
// · pause · stop + timer) — like the Vimeo recorder. All media objects are
// created in the PiP window's context so they keep running smoothly while the
// setup tab sits in the background.
//
// HANDOFF: on Stop we (1) always download the .webm so the recording is never
// lost, and (2) open Reecap and post the Blob straight across the window link
// (structured clone — no size-limited messaging, which fails for long clips).

const REECAP_URL = 'https://reecap.vercel.app/app?recorder=1';
const REECAP_ORIGIN = 'https://reecap.vercel.app';

let originalTabId = null;
let hostWin = null; // the PiP window (or this window as a fallback)
let isPip = false;
let cameraStream = null, micStream = null, screenStream = null, audioCtx = null;
let recorder = null, chunks = [];
let mode = 'preview';
let start = 0, pausedTotal = 0, pauseStart = 0, paused = false;
let timer = 0;
let pendingAction = null; // 'stop' | 'discard' | 'restart'
let closing = false;
let refs = {};

// handoff state
let handoffWin = null, handoffData = null, handoffReady = false, handoffDone = false;

(async () => {
  const { setup } = await chrome.storage.session.get('setup');
  originalTabId = setup?.originalTabId ?? null;
})();

const want = (id) => document.getElementById(id).checked;

document.getElementById('open').onclick = openControls;

async function openControls() {
  const cam = want('cam');

  if ('documentPictureInPicture' in window) {
    try { hostWin = await window.documentPictureInPicture.requestWindow({ width: 340, height: cam ? 430 : 150 }); isPip = true; }
    catch { hostWin = null; }
  }
  if (!hostWin) { hostWin = window; isPip = false; }

  const doc = isPip ? hostWin.document : document;
  const container = isPip ? doc.body : document.getElementById('fallback');
  if (isPip) doc.body.style.cssText = 'margin:0;background:#0b0b0f;overflow:hidden;';
  buildUI(doc, container);

  refs.startBtn.onclick = startRec;
  refs.pauseBtn.onclick = togglePause;
  refs.restartBtn.onclick = () => { pendingAction = 'restart'; recorder && recorder.stop(); };
  refs.delBtn.onclick = () => { pendingAction = 'discard'; recorder ? recorder.stop() : cancelAll(); };
  refs.stopBtn.onclick = () => {
    pendingAction = 'stop';
    // Open Reecap now (while we have the click's user activation) so we can
    // post the recording straight to it.
    try { handoffWin = hostWin.open(REECAP_URL, '_blank'); } catch { handoffWin = null; }
    recorder && recorder.stop();
  };

  if (cam) {
    try { cameraStream = await hostWin.navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 480, height: 480 }, audio: false }); refs.video.srcObject = cameraStream; }
    catch { refs.video.style.display = 'none'; }
  }
  if (want('mic')) {
    try { micStream = await hostWin.navigator.mediaDevices.getUserMedia({ audio: true }); } catch { /* denied */ }
  }

  document.getElementById('stage1').style.display = 'none';
  document.getElementById('stage2').style.display = 'block';

  // The Reecap recorder view posts this once it's mounted → deliver the clip.
  hostWin.addEventListener('message', (e) => {
    if (e && e.data && e.data.__reecap === 'recorder-ready') { handoffReady = true; tryHandoff(); }
  });

  if (isPip) hostWin.addEventListener('pagehide', () => { if (closing) return; pendingAction = mode === 'recording' ? 'stop' : 'discard'; recorder ? recorder.stop() : cancelAll(); });
}

async function startRec() {
  let screen;
  try { screen = await hostWin.navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: want('sys') }); }
  catch { return; }
  screenStream = screen;

  const sysA = screen.getAudioTracks();
  const micA = micStream ? micStream.getAudioTracks() : [];
  const tracks = [screen.getVideoTracks()[0]];
  if (sysA.length || micA.length) {
    audioCtx = new hostWin.AudioContext();
    const dest = audioCtx.createMediaStreamDestination();
    if (sysA.length) audioCtx.createMediaStreamSource(new hostWin.MediaStream([sysA[0]])).connect(dest);
    if (micA.length) audioCtx.createMediaStreamSource(new hostWin.MediaStream([micA[0]])).connect(dest);
    tracks.push(dest.stream.getAudioTracks()[0]);
  }
  beginRecorder(new hostWin.MediaStream(tracks));
  screen.getVideoTracks()[0].addEventListener('ended', () => { if (recorder && recorder.state !== 'inactive') { pendingAction = 'stop'; recorder.stop(); } });

  mode = 'recording';
  refs.startBtn.style.display = 'none';
  refs.bottom.style.display = 'flex';
  start = Date.now(); pausedTotal = 0; pauseStart = 0; paused = false;
  timer = hostWin.setInterval(tick, 500);
  chrome.runtime.sendMessage({ type: 'recording-started', originalTabId });
}

function beginRecorder(stream) {
  const mime = hostWin.MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/webm';
  recorder = new hostWin.MediaRecorder(stream, { mimeType: mime });
  chunks = [];
  recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  recorder.onstop = onRecStop;
  recorder.start(1000); // timeslice so long recordings flush chunks steadily
}

function togglePause() {
  if (!recorder) return;
  if (!paused) { recorder.pause(); paused = true; pauseStart = Date.now(); refs.pauseBtn.textContent = '▶'; chrome.runtime.sendMessage({ type: 'rec-pause' }); }
  else { recorder.resume(); paused = false; pausedTotal += Date.now() - pauseStart; refs.pauseBtn.textContent = '❚❚'; chrome.runtime.sendMessage({ type: 'rec-resume' }); }
}

function tick() {
  if (paused) return;
  const s = Math.floor((Date.now() - start - pausedTotal) / 1000);
  refs.time.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function onRecStop() {
  const action = pendingAction; pendingAction = null;
  if (action === 'restart') {
    chrome.runtime.sendMessage({ type: 'rec-restart' });
    start = Date.now(); pausedTotal = 0; pauseStart = 0; paused = false; refs.pauseBtn.textContent = '❚❚';
    beginRecorder(recorder.stream);
    return;
  }
  if (action === 'discard') { chrome.runtime.sendMessage({ type: 'rec-cancel' }); cancelAll(); return; }

  // stop → save + hand off
  const blob = new hostWin.Blob(chunks, { type: 'video/webm' });
  try {
    const a = hostWin.document.createElement('a');
    a.href = hostWin.URL.createObjectURL(blob);
    a.download = `reecap-recording-${Date.now()}.webm`;
    a.click();
  } catch { /* download blocked */ }

  chrome.runtime.sendMessage({ type: 'get-clicks' }, (clicks) => { handoffData = { blob, clicks: clicks || [] }; tryHandoff(); });
  if (!handoffWin) chrome.tabs.create({ url: REECAP_URL }); // e.g. share ended → import the saved file
  hostWin.setTimeout(cancelAll, 12000); // file is already saved; stop waiting after a while
}

function tryHandoff() {
  if (!handoffWin || !handoffData || !handoffReady || handoffDone) return;
  handoffDone = true;
  try { handoffWin.postMessage({ __reecap: 'screen-recording', video: handoffData.blob, clicks: handoffData.clicks }, REECAP_ORIGIN); } catch { /* posted to wrong origin */ }
  hostWin.setTimeout(cancelAll, 1500);
}

function cancelAll() {
  if (closing) return;
  closing = true;
  if (timer) hostWin.clearInterval(timer);
  [cameraStream, micStream, screenStream].forEach((s) => s && s.getTracks().forEach((t) => t.stop()));
  try { if (isPip && hostWin && !hostWin.closed) hostWin.close(); } catch { /* no-op */ }
  chrome.tabs.getCurrent((t) => t && chrome.tabs.remove(t.id));
}

// ---- UI ---------------------------------------------------------------------
function buildUI(doc, container) {
  const style = doc.createElement('style');
  style.textContent = `
    .rc{display:flex;flex-direction:column;height:100%;min-height:0;background:#0b0b0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;}
    .rc-cam{flex:1;min-height:0;width:100%;object-fit:cover;background:#18181b;transform:scaleX(-1);}
    .rc-start{margin:12px;height:48px;border:0;border-radius:999px;background:#ef4444;color:#fff;font-size:15px;font-weight:700;cursor:pointer;}
    .rc-start:hover{background:#dc2626;}
    .rc-bottom{display:flex;align-items:center;gap:8px;padding:12px;}
    .rc-grp{display:flex;align-items:center;gap:2px;background:#27272a;border-radius:999px;padding:4px;}
    .rc-ic{width:40px;height:40px;border:0;border-radius:999px;background:transparent;color:#fff;font-size:15px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;}
    .rc-ic:hover{background:#3f3f46;}
    .rc-stop{flex:1;height:48px;border:0;border-radius:999px;background:#ef4444;color:#fff;font-size:15px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;}
    .rc-stop:hover{background:#dc2626;}
    .rc-sq{width:15px;height:15px;border-radius:4px;background:#fff;}
    .rc-time{font-variant-numeric:tabular-nums;}
  `;
  (doc.head || container).appendChild(style);

  const wrap = doc.createElement('div'); wrap.className = 'rc';
  if (!isPip) wrap.style.cssText = 'width:340px;border:1px solid #27272a;border-radius:18px;overflow:hidden;height:430px;';

  const video = doc.createElement('video'); video.className = 'rc-cam'; video.autoplay = true; video.muted = true; video.playsInline = true;
  if (!want('cam')) video.style.display = 'none';
  wrap.appendChild(video);

  const startBtn = doc.createElement('button'); startBtn.className = 'rc-start'; startBtn.textContent = 'Start recording';
  wrap.appendChild(startBtn);

  const bottom = doc.createElement('div'); bottom.className = 'rc-bottom'; bottom.style.display = 'none';
  const grp = doc.createElement('div'); grp.className = 'rc-grp';
  const delBtn = ic(doc, '🗑', 'Discard');
  const restartBtn = ic(doc, '↻', 'Restart');
  const pauseBtn = ic(doc, '❚❚', 'Pause / resume');
  grp.append(delBtn, restartBtn, pauseBtn);
  const stopBtn = doc.createElement('button'); stopBtn.className = 'rc-stop'; stopBtn.title = 'Stop & edit in Reecap';
  const sq = doc.createElement('span'); sq.className = 'rc-sq';
  const time = doc.createElement('span'); time.className = 'rc-time'; time.textContent = '0:00';
  stopBtn.append(sq, time);
  bottom.append(grp, stopBtn);
  wrap.appendChild(bottom);

  container.appendChild(wrap);
  refs = { video, startBtn, bottom, delBtn, restartBtn, pauseBtn, stopBtn, time };
}

function ic(doc, txt, title) {
  const b = doc.createElement('button'); b.className = 'rc-ic'; b.textContent = txt; b.title = title; return b;
}
