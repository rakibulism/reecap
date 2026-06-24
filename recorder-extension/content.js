// Reecap Recorder — content script (runs on every page).
//
// While recording: report clicks to the worker and render an on-page floating
// control bar (pause / resume / stop + timer). On the Reecap web app: receive
// the finished recording and hand it to the page via window.postMessage.

let recording = false;
let paused = false;
let host = null;
let timerId = 0;
let startTs = 0;
let pausedMs = 0;
let pauseTs = 0;

// ---- click capture ---------------------------------------------------------
document.addEventListener(
  'click',
  (e) => {
    if (!recording || paused) return;
    try {
      chrome.runtime.sendMessage({ type: 'page-click', x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    } catch {
      /* extension context invalidated */
    }
  },
  true,
);

// ---- messages from the worker ----------------------------------------------
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'rec-bar-show') showBar();
  else if (msg.type === 'rec-bar-hide') hideBar();
  else if (msg.type === 'reecap-import') {
    fetch(msg.dataUrl)
      .then((r) => r.blob())
      .then((blob) => window.postMessage({ __reecap: 'screen-recording', clicks: msg.clicks || [], video: blob }, window.location.origin))
      .catch(() => {});
  }
});

// ---- handshake: the Reecap recorder view announces it's mounted ------------
window.addEventListener('message', (e) => {
  if (e.source === window && e.data && e.data.__reecap === 'recorder-ready') {
    try { chrome.runtime.sendMessage({ type: 'reecap-ready' }); } catch { /* no-op */ }
  }
});

// ---- floating control bar (Shadow DOM, isolated styles) --------------------
function fmt(ms) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function showBar() {
  if (host) return;
  recording = true; paused = false; startTs = Date.now(); pausedMs = 0; pauseTs = 0;

  host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:2147483647;';
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = `
    <style>
      .bar{display:flex;align-items:center;gap:10px;padding:8px 10px 8px 14px;border-radius:999px;
        background:#0b0b0fE6;backdrop-filter:blur(8px);box-shadow:0 8px 30px rgba(0,0,0,.4);
        font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#fff;}
      .dot{width:10px;height:10px;border-radius:50%;background:#ef4444;}
      .dot.live{animation:p 1.2s infinite;} @keyframes p{0%,100%{opacity:1}50%{opacity:.3}}
      .t{font-variant-numeric:tabular-nums;font-size:13px;font-weight:600;min-width:42px;}
      button{border:0;cursor:pointer;border-radius:999px;font-size:13px;font-weight:600;
        height:32px;display:inline-flex;align-items:center;gap:6px;padding:0 14px;color:#fff;}
      .ghost{background:#ffffff1a;} .ghost:hover{background:#ffffff2e;}
      .stop{background:#ef4444;padding:0 16px;} .stop:hover{background:#dc2626;}
      .icn{width:12px;height:12px;display:inline-block;}
    </style>
    <div class="bar">
      <span class="dot live" id="dot"></span>
      <span class="t" id="time">0:00</span>
      <button class="ghost" id="pause">Pause</button>
      <button class="stop" id="stop">Stop</button>
    </div>`;
  (document.documentElement || document.body).appendChild(host);

  const $ = (id) => root.getElementById(id);
  $('pause').onclick = () => {
    paused = !paused;
    if (paused) { pauseTs = Date.now(); $('pause').textContent = 'Resume'; $('dot').classList.remove('live'); chrome.runtime.sendMessage({ type: 'pause-recording' }); }
    else { pausedMs += Date.now() - pauseTs; $('pause').textContent = 'Pause'; $('dot').classList.add('live'); chrome.runtime.sendMessage({ type: 'resume-recording' }); }
  };
  $('stop').onclick = () => { chrome.runtime.sendMessage({ type: 'stop-recording' }); hideBar(); };

  timerId = window.setInterval(() => {
    if (paused) return;
    $('time').textContent = fmt(Date.now() - startTs - pausedMs);
  }, 500);
}

function hideBar() {
  recording = false; paused = false;
  if (timerId) { clearInterval(timerId); timerId = 0; }
  if (host) { host.remove(); host = null; }
}
