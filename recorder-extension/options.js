// Reecap Recorder — settings page logic.
// Reads/writes settings via storage.js and lets the user pick a default save
// folder (persisted as a FileSystemDirectoryHandle in IndexedDB).

const fsSupported = 'showDirectoryPicker' in window;

const nameInput = document.getElementById('defaultName');
const radios = [...document.querySelectorAll('input[name="saveMode"]')];
const folderRow = document.getElementById('folderRow');
const folderName = document.getElementById('folderName');
const pickBtn = document.getElementById('pickFolder');
const savedTip = document.getElementById('saved');

let savedTimer = 0;
function flashSaved() {
  savedTip.classList.add('show');
  clearTimeout(savedTimer);
  savedTimer = setTimeout(() => savedTip.classList.remove('show'), 1400);
}

function syncSelectedStyles() {
  const mode = radios.find((r) => r.checked)?.value;
  document.getElementById('opt-download').classList.toggle('sel', mode === 'download');
  document.getElementById('opt-ask').classList.toggle('sel', mode === 'ask');
  document.getElementById('opt-folder').classList.toggle('sel', mode === 'folder');
  folderRow.hidden = mode !== 'folder';
}

async function showCurrentFolder() {
  const dir = await getSaveDir();
  folderName.textContent = dir ? `Saving to: ${dir.name}` : 'No folder chosen yet';
}

(async function init() {
  const s = await getSettings();
  nameInput.value = s.defaultName || 'reecap-recording';
  for (const r of radios) r.checked = r.value === s.saveMode;
  if (!radios.some((r) => r.checked)) radios.find((r) => r.value === 'download').checked = true;

  if (!fsSupported) {
    document.getElementById('opt-ask').querySelector('input').disabled = true;
    document.getElementById('opt-folder').querySelector('input').disabled = true;
    document.getElementById('fsNote').hidden = false;
  }
  syncSelectedStyles();
  await showCurrentFolder();
})();

nameInput.addEventListener('change', async () => {
  await setSettings({ defaultName: nameInput.value.trim() || 'reecap-recording' });
  flashSaved();
});

for (const r of radios) {
  r.addEventListener('change', async () => {
    syncSelectedStyles();
    // Choosing "folder" with none picked yet → prompt for one right away.
    if (r.value === 'folder' && r.checked && !(await getSaveDir())) {
      const ok = await chooseFolder();
      if (!ok) { // user cancelled — fall back to a safe mode
        radios.find((x) => x.value === 'download').checked = true;
        syncSelectedStyles();
        return;
      }
    }
    await setSettings({ saveMode: r.value });
    flashSaved();
  });
}

pickBtn.addEventListener('click', chooseFolder);

async function chooseFolder() {
  try {
    const dir = await window.showDirectoryPicker({ mode: 'readwrite', id: 'reecap-recordings' });
    if ((await dir.requestPermission({ mode: 'readwrite' })) !== 'granted') return false;
    await setSaveDir(dir);
    await showCurrentFolder();
    flashSaved();
    return true;
  } catch {
    return false; // cancelled or blocked
  }
}
