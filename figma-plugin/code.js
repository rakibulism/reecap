// Reecap Motion — Figma plugin (sandbox side).
//
// Walks the selected frame and produces an editable layer tree for the Reecap
// Motion Design tool: text → text, rectangle/ellipse → shapes, frames/groups →
// groups, and anything else (vectors, icons, images, gradients, effects) is
// rasterized to a PNG image layer. A full-frame PNG is included as a fallback.

figma.showUI(__html__, { width: 320, height: 480, themeColors: true });

const CONTAINER_TYPES = ['FRAME', 'GROUP', 'COMPONENT', 'INSTANCE', 'COMPONENT_SET', 'SECTION'];

function hex(c) {
  const to = (v) => Math.round(v * 255).toString(16).padStart(2, '0');
  return '#' + to(c.r) + to(c.g) + to(c.b);
}

// First visible solid fill as a hex color, or null when there isn't one.
function solidFill(node) {
  const fills = node.fills;
  if (!Array.isArray(fills)) return null;
  const solid = fills.find((f) => f.visible !== false && f.type === 'SOLID');
  return solid ? hex(solid.color) : null;
}

// True when a node can't be represented as a flat solid fill (gradient/image
// fills, mixed fills, or visible effects) — those get rasterized.
function isComplex(node) {
  const fills = node.fills;
  if (fills === figma.mixed) return true;
  if (Array.isArray(fills) && fills.some((f) => f.visible !== false && f.type !== 'SOLID')) return true;
  if (Array.isArray(node.effects) && node.effects.some((e) => e.visible !== false)) return true;
  return false;
}

function weightFromStyle(fontName) {
  if (!fontName || fontName === figma.mixed) return 400;
  const s = (fontName.style || '').toLowerCase();
  if (s.includes('thin')) return 100;
  if (s.includes('extralight') || s.includes('ultralight')) return 200;
  if (s.includes('semibold') || s.includes('demibold')) return 600;
  if (s.includes('extrabold') || s.includes('ultrabold')) return 800;
  if (s.includes('black') || s.includes('heavy')) return 900;
  if (s.includes('light')) return 300;
  if (s.includes('medium')) return 500;
  if (s.includes('bold')) return 700;
  return 400;
}

function alignOf(node) {
  const a = (node.textAlignHorizontal || 'LEFT').toLowerCase();
  return a === 'center' || a === 'right' ? a : 'left';
}

async function rasterize(node) {
  try {
    const bytes = await node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 2 } });
    return Array.from(bytes);
  } catch (e) {
    return null;
  }
}

// Depth-first walk; pushes a flat list (parents before children) into `out`.
async function walk(node, frameBox, parentId, out) {
  const box = node.absoluteBoundingBox;
  if (!box || node.visible === false) return;

  const base = {
    id: node.id,
    parentId,
    name: node.name,
    x: Math.round(box.x - frameBox.x),
    y: Math.round(box.y - frameBox.y),
    w: Math.round(box.width),
    h: Math.round(box.height),
    rotation: Math.round((node.rotation || 0) * -1), // Figma rotation is CCW
    opacity: typeof node.opacity === 'number' ? node.opacity : 1,
  };

  if (node.type === 'TEXT') {
    out.push({
      ...base,
      kind: 'text',
      text: node.characters,
      fontSize: typeof node.fontSize === 'number' ? node.fontSize : 24,
      fontWeight: weightFromStyle(node.fontName),
      color: solidFill(node) || '#FFFFFF',
      align: alignOf(node),
    });
    return;
  }

  if ((node.type === 'RECTANGLE' || node.type === 'ELLIPSE') && !isComplex(node)) {
    out.push({
      ...base,
      kind: node.type === 'ELLIPSE' ? 'ellipse' : 'rectangle',
      fill: solidFill(node) || '#CCCCCC',
      cornerRadius: typeof node.cornerRadius === 'number' ? Math.round(node.cornerRadius) : 0,
    });
    return;
  }

  if (CONTAINER_TYPES.indexOf(node.type) !== -1 && 'children' in node) {
    out.push({ ...base, kind: 'group' });
    for (const child of node.children) await walk(child, frameBox, node.id, out);
    return;
  }

  // Fallback: rasterize anything we can't represent natively.
  const bytes = await rasterize(node);
  if (bytes) out.push({ ...base, kind: 'image', imageBytes: bytes });
}

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
  if (typeof node.exportAsync !== 'function' || !node.absoluteBoundingBox) {
    figma.ui.postMessage({ type: 'empty', message: 'That layer can’t be exported. Pick a frame, component, or group.' });
    return;
  }

  try {
    const frameBox = node.absoluteBoundingBox;
    const layers = [];
    if ('children' in node && node.children.length) {
      for (const child of node.children) await walk(child, frameBox, null, layers);
    } else {
      await walk(node, frameBox, null, layers);
    }
    const frameBytes = await node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 2 } });
    figma.ui.postMessage({
      type: 'export',
      width: Math.round(node.width),
      height: Math.round(node.height),
      name: node.name,
      image: Array.from(frameBytes),
      layers,
    });
  } catch (err) {
    figma.ui.postMessage({ type: 'empty', message: 'Export failed: ' + err.message });
  }
}

figma.ui.onmessage = (msg) => {
  if (msg.type === 'refresh') exportSelection();
  if (msg.type === 'close') figma.closePlugin();
};

exportSelection();
figma.on('selectionchange', exportSelection);
