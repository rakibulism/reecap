# Reecap Motion — Figma plugin

Copies a selected Figma frame into the **Reecap Motion Design** tool so you can animate it
layer by layer.

## Install (development)

1. Open the **Figma desktop app**.
2. Menu → **Plugins → Development → Import plugin from manifest…**
3. Select `figma-plugin/manifest.json` from this repo.

The plugin now appears under **Plugins → Development → Reecap Motion**.

## Use

1. In Figma, select a single **frame** (or component / group).
2. Run **Plugins → Development → Reecap Motion**. A 2× PNG preview appears and updates as you
   change the selection.
3. Click **Copy to Reecap**.
4. In Reecap, switch to the **Motion** tool (header toggle or sidebar) and press
   **⌘V / Ctrl+V** on the canvas — or click **Add Layer → Figma**. The frame drops in as an
   image layer sized to the composition.

`Download PNG` is a fallback: save the image and drag it onto the Reecap canvas.

## How it works

The plugin exports the selection with `node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 2 } })`
and writes a small JSON payload to the clipboard:

```json
{ "__reecap": "motion-frame", "version": 1, "width": 1440, "height": 1024, "name": "Home", "image": "data:image/png;base64,…" }
```

Reecap's paste handler (`src/components/motion/MotionDesigner.tsx`) recognizes the
`__reecap` marker and reconstructs the layer (`importPayload` in
`src/store/motionStore.ts`).

## Roadmap

Currently the frame is sent as a single flattened image. A future version can export each
top-level child as its own positioned layer for true layer-by-layer import. No build step
is required today — `code.js` and `ui.html` are plain JS/HTML.
