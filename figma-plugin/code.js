// Reecap Motion — Figma plugin (sandbox side).
//
// Walks the selected frame and produces an editable layer tree for the Reecap
// Motion Design tool: text → text, rectangle/ellipse → shapes, frames/groups →
// groups, and anything else (vectors, icons, images, gradients, effects) is
// rasterized to a PNG image layer. A full-frame PNG is included as a fallback.
//
// The heavy export runs only when the user clicks "Copy to Reecap" (never on
// launch), and every entry point is wrapped so a single odd node can't crash
// the whole plugin — it surfaces a friendly message instead.

figma.showUI(__html__, { width: 320, height: 520, themeColors: true });

const CONTAINER_TYPES = ['FRAME', 'GROUP', 'COMPONENT', 'INSTANCE', 'COMPONENT_SET', 'SECTION'];

function hex(c) {
  const to = (v) => Math.round(v * 255).toString(16).padStart(2, '0');
  return '#' + to(c.r) + to(c.g) + to(c.b);
}

function solidFill(node) {
  try {
    const fills = node.fills;
    if (!Array.isArray(fills)) return null;
    const solid = fills.find((f) => f.visible !== false && f.type === 'SOLID');
    return solid ? hex(solid.color) : null;
  } catch (e) {
    return null;
  }
}

function isComplex(node) {
  try {
    const fills = node.fills;
    if (fills === figma.mixed) return true;
    if (Array.isArray(fills) && fills.some((f) => f.visible !== false && f.type !== 'SOLID')) return true;
    if (Array.isArray(node.effects) && node.effects.some((e) => e.visible !== false)) return true;
  } catch (e) {
    return true; // when in doubt, rasterize
  }
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
// Any failure on a single node is swallowed so the rest still imports.
async function walk(node, frameBox, parentId, out) {
  try {
    const box = node.absoluteBoundingBox;
    if (!box || node.visible === false) return;

    const base = {
      id: node.id,
      parentId,
      name: node.name || 'Layer',
      x: Math.round(box.x - frameBox.x),
      y: Math.round(box.y - frameBox.y),
      w: Math.round(box.width),
      h: Math.round(box.height),
      rotation: Math.round((node.rotation || 0) * -1),
      opacity: typeof node.opacity === 'number' ? node.opacity : 1,
    };

    if (node.type === 'TEXT') {
      out.push({
        ...base,
        kind: 'text',
        text: typeof node.characters === 'string' ? node.characters : '',
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

    const bytes = await rasterize(node);
    if (bytes) out.push({ ...base, kind: 'image', imageBytes: bytes });
  } catch (e) {
    // Skip this node; keep going.
  }
}

// Lightweight selection check (no traversal/export) — runs on launch and on
// every selection change to keep the panel's status in sync.
function reportSelection() {
  try {
    const sel = figma.currentPage.selection;
    if (sel.length === 1 && typeof sel[0].exportAsync === 'function' && sel[0].absoluteBoundingBox) {
      figma.ui.postMessage({
        type: 'selection',
        ready: true,
        name: sel[0].name,
        w: Math.round(sel[0].width),
        h: Math.round(sel[0].height),
      });
    } else {
      figma.ui.postMessage({
        type: 'selection',
        ready: false,
        message: sel.length > 1 ? 'Select just one frame.' : 'Select a frame to send to Reecap.',
      });
    }
  } catch (e) {
    figma.ui.postMessage({ type: 'selection', ready: false, message: 'Select a frame to send to Reecap.' });
  }
}

// Heavy export — only on demand, fully guarded.
async function doExport() {
  try {
    const sel = figma.currentPage.selection;
    const node = sel[0];
    if (!node || typeof node.exportAsync !== 'function' || !node.absoluteBoundingBox) {
      figma.ui.postMessage({ type: 'error', message: 'Select a single frame, then try again.' });
      return;
    }
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
    figma.ui.postMessage({ type: 'error', message: (err && err.message) ? err.message : String(err) });
  }
}

figma.ui.onmessage = (msg) => {
  try {
    if (!msg) return;
    if (msg.type === 'export') doExport();
    else if (msg.type === 'refresh') reportSelection();
    else if (msg.type === 'close') figma.closePlugin();
  } catch (e) {
    figma.ui.postMessage({ type: 'error', message: (e && e.message) ? e.message : String(e) });
  }
};

reportSelection();
figma.on('selectionchange', reportSelection);
