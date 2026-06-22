// Reecap Motion — Figma plugin (sandbox side).
//
// Walks the selected frame and produces an editable layer tree for the Reecap
// Motion Design tool: text → text, rectangle/ellipse → shapes, frames/groups →
// groups, and anything else (vectors, icons, images, gradients, effects) is
// rasterized to a PNG image layer. A full-frame PNG is included as a fallback.
//
// The heavy export runs only when the user clicks "Copy to Reecap" (never on
// launch). The ENTIRE plugin is wrapped so nothing can throw uncaught — any
// failure is surfaced as a Figma toast and a message in the panel instead of
// the generic "An error occurred while running this plugin".

function reportError(where, e) {
  var msg = (e && e.message) ? e.message : String(e);
  try { figma.ui.postMessage({ type: 'error', message: where + ': ' + msg }); } catch (_) {}
  try { figma.notify('Reecap Motion — ' + where + ': ' + msg, { error: true }); } catch (_) {}
}

try {
  figma.showUI(__html__, { width: 320, height: 520, themeColors: true });

  var CONTAINER_TYPES = ['FRAME', 'GROUP', 'COMPONENT', 'INSTANCE', 'COMPONENT_SET', 'SECTION'];

  var hex = function (c) {
    var to = function (v) { return Math.round(v * 255).toString(16).padStart(2, '0'); };
    return '#' + to(c.r) + to(c.g) + to(c.b);
  };

  var solidFill = function (node) {
    try {
      var fills = node.fills;
      if (!Array.isArray(fills)) return null;
      for (var i = 0; i < fills.length; i++) {
        if (fills[i].visible !== false && fills[i].type === 'SOLID') return hex(fills[i].color);
      }
    } catch (e) {}
    return null;
  };

  var isComplex = function (node) {
    try {
      var fills = node.fills;
      if (fills === figma.mixed) return true;
      if (Array.isArray(fills)) {
        for (var i = 0; i < fills.length; i++) {
          if (fills[i].visible !== false && fills[i].type !== 'SOLID') return true;
        }
      }
      if (Array.isArray(node.effects)) {
        for (var j = 0; j < node.effects.length; j++) {
          if (node.effects[j].visible !== false) return true;
        }
      }
    } catch (e) { return true; }
    return false;
  };

  var weightFromStyle = function (fontName) {
    if (!fontName || fontName === figma.mixed) return 400;
    var s = (fontName.style || '').toLowerCase();
    if (s.indexOf('thin') !== -1) return 100;
    if (s.indexOf('extralight') !== -1 || s.indexOf('ultralight') !== -1) return 200;
    if (s.indexOf('semibold') !== -1 || s.indexOf('demibold') !== -1) return 600;
    if (s.indexOf('extrabold') !== -1 || s.indexOf('ultrabold') !== -1) return 800;
    if (s.indexOf('black') !== -1 || s.indexOf('heavy') !== -1) return 900;
    if (s.indexOf('light') !== -1) return 300;
    if (s.indexOf('medium') !== -1) return 500;
    if (s.indexOf('bold') !== -1) return 700;
    return 400;
  };

  var alignOf = function (node) {
    var a = (node.textAlignHorizontal || 'LEFT').toLowerCase();
    return (a === 'center' || a === 'right') ? a : 'left';
  };

  var rasterize = async function (node) {
    try {
      var bytes = await node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 2 } });
      return Array.prototype.slice.call(bytes);
    } catch (e) { return null; }
  };

  // Depth-first walk; pushes a flat list (parents before children) into `out`.
  var walk = async function (node, frameBox, parentId, out) {
    try {
      var box = node.absoluteBoundingBox;
      if (!box || node.visible === false) return;

      var base = {
        id: node.id,
        parentId: parentId,
        name: node.name || 'Layer',
        x: Math.round(box.x - frameBox.x),
        y: Math.round(box.y - frameBox.y),
        w: Math.round(box.width),
        h: Math.round(box.height),
        rotation: Math.round((node.rotation || 0) * -1),
        opacity: typeof node.opacity === 'number' ? node.opacity : 1
      };

      if (node.type === 'TEXT') {
        base.kind = 'text';
        base.text = typeof node.characters === 'string' ? node.characters : '';
        base.fontSize = typeof node.fontSize === 'number' ? node.fontSize : 24;
        base.fontWeight = weightFromStyle(node.fontName);
        base.color = solidFill(node) || '#FFFFFF';
        base.align = alignOf(node);
        out.push(base);
        return;
      }

      if ((node.type === 'RECTANGLE' || node.type === 'ELLIPSE') && !isComplex(node)) {
        base.kind = node.type === 'ELLIPSE' ? 'ellipse' : 'rectangle';
        base.fill = solidFill(node) || '#CCCCCC';
        base.cornerRadius = typeof node.cornerRadius === 'number' ? Math.round(node.cornerRadius) : 0;
        out.push(base);
        return;
      }

      if (CONTAINER_TYPES.indexOf(node.type) !== -1 && 'children' in node) {
        base.kind = 'group';
        base.fill = solidFill(node) || '';
        base.cornerRadius = typeof node.cornerRadius === 'number' ? Math.round(node.cornerRadius) : 0;
        out.push(base);
        for (var i = 0; i < node.children.length; i++) {
          await walk(node.children[i], frameBox, node.id, out);
        }
        return;
      }

      var bytes = await rasterize(node);
      if (bytes) { base.kind = 'image'; base.imageBytes = bytes; out.push(base); }
    } catch (e) { /* skip this node */ }
  };

  var reportSelection = function () {
    try {
      var sel = figma.currentPage.selection;
      if (sel.length === 1 && typeof sel[0].exportAsync === 'function' && sel[0].absoluteBoundingBox) {
        figma.ui.postMessage({
          type: 'selection', ready: true, name: sel[0].name,
          w: Math.round(sel[0].width), h: Math.round(sel[0].height)
        });
      } else {
        figma.ui.postMessage({
          type: 'selection', ready: false,
          message: sel.length > 1 ? 'Select just one frame.' : 'Select a frame to send to Reecap.'
        });
      }
    } catch (e) {
      reportError('Selection', e);
    }
  };

  var doExport = async function () {
    try {
      var node = figma.currentPage.selection[0];
      if (!node || typeof node.exportAsync !== 'function' || !node.absoluteBoundingBox) {
        figma.ui.postMessage({ type: 'error', message: 'Select a single frame, then try again.' });
        return;
      }
      var frameBox = node.absoluteBoundingBox;
      var layers = [];
      if ('children' in node && node.children.length) {
        for (var i = 0; i < node.children.length; i++) {
          await walk(node.children[i], frameBox, null, layers);
        }
      } else {
        await walk(node, frameBox, null, layers);
      }
      var frameBytes = await node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 2 } });
      figma.ui.postMessage({
        type: 'export',
        width: Math.round(node.width),
        height: Math.round(node.height),
        name: node.name,
        background: solidFill(node) || '',
        image: Array.prototype.slice.call(frameBytes),
        layers: layers
      });
    } catch (e) {
      reportError('Export', e);
    }
  };

  figma.ui.onmessage = function (msg) {
    try {
      if (!msg) return;
      if (msg.type === 'export') doExport();
      else if (msg.type === 'refresh') reportSelection();
      else if (msg.type === 'close') figma.closePlugin();
    } catch (e) {
      reportError('Message', e);
    }
  };

  reportSelection();
  figma.on('selectionchange', reportSelection);
} catch (e) {
  reportError('Load', e);
}
