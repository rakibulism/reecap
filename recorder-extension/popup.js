// Reecap Recorder — popup. Reflects recording state and toggles it.

const btn = document.getElementById('btn');

function render(recording) {
  btn.textContent = recording ? 'Stop recording' : 'Start recording';
  btn.className = recording ? 'stop' : 'start';
}

chrome.runtime.sendMessage({ type: 'popup-status' }, (r) => render(!!(r && r.recording)));

btn.onclick = () => {
  chrome.runtime.sendMessage({ type: 'popup-status' }, (r) => {
    chrome.runtime.sendMessage({ type: r && r.recording ? 'popup-stop' : 'popup-start' });
    window.close();
  });
};
