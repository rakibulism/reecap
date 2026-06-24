// Reecap Recorder — setup / controller page.
//
// Owns the screen + mic streams and the MediaRecorder. After Start it hides its
// UI and stays open in the background, recording, until Stop arrives from the
// floating bar (relayed via the worker). The webcam bubble itself lives on the
// page (content script), captured by the screen recording.

let originalTabId = null;
let recorder = null;
let chunks = [];
let streams = [];

(async () => {
  const { setup } = await chrome.storage.session.get('setup');
  originalTabId = setup?.originalTabId ?? null;
})();

document.getElementById('start').onclick = async () => {
  const wantCam = document.getElementById('cam').checked;
  const wantMic = document.getElementById('mic').checked;
  const wantSys = document.getElementById('sys').checked;

  // 1) Screen (+ optional system/tab audio). Shows Chrome's share picker.
  let screen;
  try {
    screen = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: wantSys });
  } catch {
    return; // user cancelled the picker
  }
  streams.push(screen);

  // 2) Microphone (optional).
  let micTrack = null;
  if (wantMic) {
    try {
      const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
      streams.push(mic);
      micTrack = mic.getAudioTracks()[0];
    } catch {
      /* mic denied — continue without it */
    }
  }

  // 3) Mix system + mic audio into one track.
  const sysAudio = screen.getAudioTracks();
  let audioTrack = null;
  if (sysAudio.length || micTrack) {
    const ac = new AudioContext();
    const dest = ac.createMediaStreamDestination();
    if (sysAudio.length) ac.createMediaStreamSource(new MediaStream([sysAudio[0]])).connect(dest);
    if (micTrack) ac.createMediaStreamSource(new MediaStream([micTrack])).connect(dest);
    audioTrack = dest.stream.getAudioTracks()[0];
  }

  const tracks = [screen.getVideoTracks()[0]];
  if (audioTrack) tracks.push(audioTrack);
  const combined = new MediaStream(tracks);

  const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/webm';
  recorder = new MediaRecorder(combined, { mimeType: mime });
  chunks = [];
  recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  recorder.onstop = async () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    const dataUrl = await new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(blob); });
    streams.forEach((s) => s.getTracks().forEach((t) => t.stop()));
    chrome.runtime.sendMessage({ type: 'recording-stopped', dataUrl });
    window.close();
  };

  // Stopping the share from Chrome's own banner ends the recording too.
  screen.getVideoTracks()[0].addEventListener('ended', () => { if (recorder && recorder.state !== 'inactive') recorder.stop(); });

  recorder.start();
  chrome.runtime.sendMessage({ type: 'recording-started', originalTabId, camera: wantCam });

  // Swap to the lightweight "recording" panel; we stay open in the background.
  document.getElementById('setup').style.display = 'none';
  document.getElementById('recording').style.display = 'block';
};

document.getElementById('cancel') && (document.getElementById('cancel').onclick = () => window.close());

// Controls relayed from the floating bar (via the worker).
chrome.runtime.onMessage.addListener((m) => {
  if (!recorder) return;
  if (m.type === 'ctrl-pause' && recorder.state === 'recording') recorder.pause();
  else if (m.type === 'ctrl-resume' && recorder.state === 'paused') recorder.resume();
  else if (m.type === 'ctrl-stop' && recorder.state !== 'inactive') recorder.stop();
});
