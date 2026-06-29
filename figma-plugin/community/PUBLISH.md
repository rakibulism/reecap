# Reecap Motion — Figma Community submission

Copy‑paste fields for the Figma plugin publish form. Character counts are noted where a limit applies.

---

## name*
> Max 100 characters (incl. spaces). SEO‑tuned for the Figma Community search and Google.

```
Reecap Motion — Animate Figma Frames into Video & Motion Design
```

*(62 characters.) Leads with the brand, then the two highest‑intent search phrases — “animate Figma frames” and “video / motion design”.*

---

## tagline*
> Max 100 characters (incl. spaces).

```
Send a Figma frame to Reecap and animate it layer by layer — editable text & shapes, export MP4.
```

*(96 characters.)*

---

## description*
> What can people find or learn from this plugin? Be specific.

```
Reecap Motion turns a static Figma frame into a real, layer‑by‑layer animation — without leaving your browser and without After Effects.

Select any frame, component, or group and click “Copy to Reecap.” The plugin reads your selection and rebuilds it as an editable layer tree in the free Reecap Motion Design tool:

• Text stays editable — content, size, weight, color and alignment are preserved.
• Rectangles & ellipses come in as editable shapes (fill + corner radius).
• Frames, groups, components and sections stay grouped and nested.
• Vectors, icons, images, gradients and effects are rasterized so they still look right.
• The composition is sized to your frame, ready to animate.

In Reecap you then give each layer an in/out animation preset with easing, scrub a real timeline, and export a clean MP4 — perfect for product launches, UI showcases, social posts and case studies.

What makes it nice to use:
• 2× PNG preview that updates live as you change your selection.
• One click to copy; paste into Reecap with ⌘V / Ctrl+V (or Add Layer → Figma).
• “Download PNG” fallback if you’d rather drag the image in.
• Privacy‑friendly: the plugin makes no network requests, has no backend, no sign‑in, and stores nothing — your selection is copied to your clipboard, nothing else.

Website: https://reecap.vercel.app  (open the Motion tool at https://reecap.vercel.app/app/motion)
Docs / how to use: https://reecap.vercel.app/docs

—
Made by rakibulism. If this saved you time, follow along for more: https://x.com/rakibulism
```

---

## Category & Subcategory
> One category, one subcategory.

- **Category:** `design tools`
- **Subcategory:** `Prototyping & animation`

*Why: the plugin performs an action (it doesn’t ship a template), and its core value is turning a frame into an animation/prototype. “Prototyping & animation” is the closest single match; “Import & export” is the runner‑up since it also moves a frame out of Figma.*

---

## Custom tags*
> Up to 5, comma‑separated. Chosen for Figma Community + Google search intent against the category.

```
animation, motion design, figma to video, mp4 export, prototyping
```

---

## Data handling

**1. Do you host a backend service for your plugin/widget?** *(radio)*
- ✅ **(a)** No, I do not host a backend service for my plugin/widget.

*Rationale: `manifest.json` sets `networkAccess.allowedDomains: ["none"]`; there is no server.*

**2. Does your plugin/widget make any network requests with services you do not host?** *(checkbox — select all that apply)*
- ✅ **(a)** My plugin/widget does not make any network requests.

*Rationale: the plugin only reads the selection, writes JSON to the system clipboard, and (optionally) opens reecap.vercel.app in a new browser tab on user click — it issues no fetch/XHR requests itself.*

**3. Does your plugin/widget use any user authentication?** *(radio)*
- ✅ **(a)** No, my plugin/widget does not require or use any user authentication.

**4. Do you store any data read/derived from Figma's plugin API?** *(checkbox — select all that apply)*
- ✅ **(a)** No, my plugin/widget does not store any data read/derived from Figma's plugin API.

*Rationale: no `localStorage`, `figma.clientStorage`, or `setPluginData`. The exported JSON is placed on the user‑initiated clipboard for pasting into Reecap — it is not persisted by the plugin.*

---

## Assets in this folder
- `cover.png` — 1920 × 1080 plugin cover/thumbnail
- `carousel-1…N.png` — 1920 × 1080 carousel images
- `icon.png` — 128 × 128 plugin icon (square, no corner radius)
- `demo.mp4` — 1920 × 1080 product demo (≤ 30s, with UI motion sound)
- `index.html` — SEO‑optimized, PWA‑installable “how to use” resource page
