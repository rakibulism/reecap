// Screen Recorder — data model.
//
// A recording is a captured video clip plus a list of click marks. During
// playback and export, each click drives a smooth auto-zoom toward that point,
// Screen-Studio style. Clicks carry a timestamp (seconds into the clip) and a
// normalised position (0–1) within the captured frame.

export interface ClickMark {
  id: string;
  t: number; // seconds into the clip
  x: number; // 0–1 across the frame
  y: number; // 0–1 down the frame
  disabled?: boolean; // user toggled this zoom off
}

export interface ZoomSettings {
  enabled: boolean;
  level: number; // peak magnification, e.g. 1.8×
  inDur: number; // seconds to zoom in
  hold: number; // seconds held at full zoom
  outDur: number; // seconds to zoom back out
}

export interface RecorderClip {
  src: string; // object URL (webm) or remote sample
  duration: number; // seconds
  width: number;
  height: number;
  demo?: boolean; // sample clip (may be cross-origin → export disabled)
}

// Handoff payload posted by the Chrome extension to the web app.
export interface RecorderPayload {
  __reecap: 'screen-recording';
  clicks: { t: number; x: number; y: number }[];
  // the recording itself is transferred as a Blob alongside this message
}
