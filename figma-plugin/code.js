// Reecap Motion — Figma plugin (sandbox side).
//
// Exports the selected frame as a 2x PNG and hands it to the plugin UI, which
// copies a small JSON payload to the clipboard. Pasting that payload into the
// Reecap Motion Design tool reconstructs the frame as an image layer.

figma.showUI(__html__, { width: 320, height: 460, themeColors: true });

async function exportSelection() {
  const sel = figma.currentPage.selection;

  if (sel.length === 0) {
    figma.ui.postMessage({ type: 'empty', message: 'Select a frame to send to Reecap.' });
    return;
  }
  if (sel.length > 1) {
    figma.ui.postMessage({ type: 'empty', message: 'Select just one frame.' });
    return;
  }

  const node = sel[0];
  if (typeof node.exportAsync !== 'function') {
    figma.ui.postMessage({
      type: 'empty',
      message: 'That layer can’t be exported. Pick a frame, component, or group.',
    });
    return;
  }

  try {
    const bytes = await node.exportAsync({
      format: 'PNG',
      constraint: { type: 'SCALE', value: 2 },
    });
    figma.ui.postMessage({
      type: 'export',
      bytes: Array.from(bytes),
      width: Math.round(node.width),
      height: Math.round(node.height),
      name: node.name,
    });
  } catch (err) {
    figma.ui.postMessage({ type: 'empty', message: 'Export failed: ' + err.message });
  }
}

figma.ui.onmessage = (msg) => {
  if (msg.type === 'refresh') exportSelection();
  if (msg.type === 'close') figma.closePlugin();
};

// Export immediately, then keep the preview in sync with the selection.
exportSelection();
figma.on('selectionchange', exportSelection);
