// Reecap Recorder — content script (runs on every page).
//
// While a recording is active (whole screen), every page shows the floating
// control bar + webcam bubble, so you can pause/stop and stay on camera no
// matter which tab or site you move to. Also reports clicks for the auto-zoom,
// and on the Reecap app delivers the finished recording to the page.

let recording = false;
let paused = false;
let cameraOn = false;
let barHost = null;
let camHost = null;
let timerId = 0;
let startTs = 0;
let pausedMs = 0;
let pauseTs = 0;

// ---- click capture ---------------------------------------------------------
document.addEventListener(
  'click',
  (e) => {
    if (!recording || paused) return;
    try { chrome.runtime.sendMessage({ type: 'page-click', x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }); } catch { /* context gone */ }
  },
  true,
);

// On load, ask whether a recording is already in progress (so overlays appear
// on pages you navigate to mid-recording).
try {
  chrome.runtime.sendMessage({ type: 'rec-status' }, (s) => {
    if (s && s.active) { startTs = Date.now(); showOverlays(s.camera); paused = s.paused; syncBar(); }
  });
} catch { /* no-op */ }

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'rec-show') { startTs = Date.now(); pausedMs = 0; showOverlays(msg.camera); }
  else if (msg.type === 'rec-hide') hideOverlays();
  else if (msg.type === 'rec-paused') { paused = msg.paused; if (paused) pauseTs = Date.now(); else pausedMs += Date.now() - pauseTs; syncBar(); }
  else if (msg.type === 'reecap-import') {
    fetch(msg.dataUrl).then((r) => r.blob()).then((blob) => window.postMessage({ __reecap: 'screen-recording', clicks: msg.clicks || [], video: blob }, window.location.origin)).catch(() => {});
  }
});

// Reecap recorder view announces it's mounted → deliver the recording.
window.addEventListener('message', (e) => {
  if (e.source === window && e.data && e.data.__reecap === 'recorder-ready') {
    try { chrome.runtime.sendMessage({ type: 'reecap-ready' }); } catch { /* no-op */ }
  }
});

// Release / re-acquire the webcam as the tab is hidden / shown, so only the
// visible page holds the camera.
document.addEventListener('visibilitychange', () => {
  if (!recording || !cameraOn) return;
  if (document.hidden) removeCam();
  else addCam();
});

// ---- overlays --------------------------------------------------------------
function fmt(ms) { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }

function showOverlays(camera) {
  recording = true; cameraOn = !!camera;
  showBar();
  if (cameraOn && !document.hidden) addCam();
}

function hideOverlays() {
  recording = false; paused = false;
  if (timerId) { clearInterval(timerId); timerId = 0; }
  if (barHost) { barHost.remove(); barHost = null; }
  removeCam();
}

function showBar() {
  if (barHost) return;
  barHost = document.createElement('div');
  barHost.style.cssText = 'position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:2147483647;';
  const root = barHost.attachShadow({ mode: 'open' });
  root.innerHTML = `
    <style>
      .bar{display:flex;align-items:center;gap:10px;padding:8px 10px 8px 14px;border-radius:999px;
        background:#0b0b0fE6;backdrop-filter:blur(8px);box-shadow:0 8px 30px rgba(0,0,0,.4);
        font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#fff;}
      .dot{width:10px;height:10px;border-radius:50%;background:#ef4444;}
      .dot.live{animation:p 1.2s infinite;} @keyframes p{0%,100%{opacity:1}50%{opacity:.3}}
      .t{font-variant-numeric:tabular-nums;font-size:13px;font-weight:600;min-width:42px;}
      button{border:0;cursor:pointer;border-radius:999px;font-size:13px;font-weight:600;height:32px;padding:0 14px;color:#fff;}
      .ghost{background:#ffffff1a;} .ghost:hover{background:#ffffff2e;}
      .stop{background:#ef4444;padding:0 16px;} .stop:hover{background:#dc2626;}
    </style>
    <div class="bar">
      <span class="dot live" id="dot"></span>
      <span class="t" id="time">0:00</span>
      <button class="ghost" id="pause">Pause</button>
      <button class="stop" id="stop">Stop</button>
    </div>`;
  (document.documentElement || document.body).appendChild(barHost);
  const $ = (id) => root.getElementById(id);
  $('pause').onclick = () => chrome.runtime.sendMessage({ type: paused ? 'rec-resume' : 'rec-pause' });
  $('stop').onclick = () => chrome.runtime.sendMessage({ type: 'rec-stop' });
  timerId = window.setInterval(() => { if (!paused) $('time').textContent = fmt(Date.now() - startTs - pausedMs); }, 500);
}

function syncBar() {
  if (!barHost) return;
  const root = barHost.shadowRoot;
  root.getElementById('pause').textContent = paused ? 'Resume' : 'Pause';
  root.getElementById('dot').classList.toggle('live', !paused);
}

function addCam() {
  if (camHost) return;
  camHost = document.createElement('div');
  camHost.style.cssText = 'position:fixed;right:22px;bottom:22px;width:140px;height:140px;border-radius:50%;overflow:hidden;z-index:2147483646;box-shadow:0 8px 30px rgba(0,0,0,.45);border:3px solid #fff;';
  const iframe = document.createElement('iframe');
  iframe.src = chrome.runtime.getURL('camera.html');
  iframe.allow = 'camera';
  iframe.style.cssText = 'width:100%;height:100%;border:0;background:transparent;';
  camHost.appendChild(iframe);
  (document.documentElement || document.body).appendChild(camHost);
}

function removeCam() {
  if (camHost) { camHost.remove(); camHost = null; }
}
