// Reecap Recorder — offscreen document.
//
// Service workers can't use MediaRecorder, so the actual tab capture happens
// here. We turn the tabCapture stream into a webm Blob and return it to the
// background worker as a data URL (Blobs don't survive runtime messaging).

let recorder = null;
let chunks = [];

chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.target !== 'offscreen') return;

  if (msg.type === 'start') {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { mandatory: { chromeMediaSource: 'tab', chromeMediaSourceId: msg.streamId } },
    });
    chunks = [];
    const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
    recorder = new MediaRecorder(stream, { mimeType: mime });
    recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    recorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunks, { type: 'video/webm' });
      const dataUrl = await new Promise((res) => {
        const fr = new FileReader();
        fr.onload = () => res(fr.result);
        fr.readAsDataURL(blob);
      });
      chrome.runtime.sendMessage({ type: 'offscreen-data', dataUrl });
    };
    recorder.start();
  } else if (msg.type === 'stop') {
    if (recorder && recorder.state !== 'inactive') recorder.stop();
  }
});
