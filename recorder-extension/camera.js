// Reecap Recorder — webcam bubble (runs in an extension-origin iframe).
//
// Because this is the extension's origin, the camera permission is requested
// once and remembered, instead of prompting on every website you visit.

navigator.mediaDevices
  .getUserMedia({ video: { facingMode: 'user', width: 480, height: 480 }, audio: false })
  .then((stream) => {
    document.getElementById('v').srcObject = stream;
    window.addEventListener('pagehide', () => stream.getTracks().forEach((t) => t.stop()));
  })
  .catch(() => {
    document.body.innerHTML = '<div class="err">Camera unavailable</div>';
  });
