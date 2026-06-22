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
   **⌘V / Ctrl+V** on the canvas — or click **Add Layer → Figma**. The frame's layers are
   reconstructed: text and shapes stay editable, groups stay grouped, and the composition
   is sized to the frame.

`Download PNG` is a fallback: save the image and drag it onto the Reecap canvas.

## How it works

The plugin walks the selected frame and emits an **editable layer tree** (payload v2),
copied to the clipboard as JSON:

```json
{
  "__reecap": "motion-frame", "version": 2,
  "width": 1440, "height": 1024, "name": "Home",
  "image": "data:image/png;base64,…",
  "layers": [ { "id": "…", "parentId": null, "kind": "text", "x": 40, "y": 64, "text": "Hello", … } ]
}
```

Each node is classified:

- **Text** → editable text layer (content, size, weight, color, alignment).
- **Rectangle / Ellipse** with a solid fill → editable shape (fill, corner radius).
- **Frame / Group / Component / Instance / Section** → a **group** (children nested under it).
- **Anything else** — vectors, icons, images, gradients, effects, mixed fills — is
  **rasterized** to a PNG image layer so it still looks right.

The full-frame PNG is also included as `image` (a fallback for older clients).

Reecap's paste handler (`src/components/motion/MotionDesigner.tsx`) recognizes the
`__reecap` marker and `importPayload` (`src/store/motionStore.ts`) rebuilds the tree.

### Fidelity limits

- **Fonts** fall back to a system font in Reecap — size, weight, color, alignment, and
  the text content are preserved, but the exact typeface is not embedded.
- **Vectors, effects, gradients, and image fills** are rasterized (not vector-editable).
- **Auto-layout** is flattened to absolute positions.

No build step is required — `code.js` and `ui.html` are plain JS/HTML.
