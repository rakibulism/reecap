export interface Photo {
  id: string;
  file: File;
  objectUrl: string;
  url?: string; // For community assets or fallback
  thumbnailUrl?: string;
  width: number;
  height: number;
  transition?: 'fade' | 'slide' | 'zoom' | 'none' | 'slide-up' | 'wipe' | 'flip' | 'dissolve';
  duration?: number;       // per-slide seconds; falls back to settings.duration
  caption?: string;        // optional text overlay
  captionPosition?: 'top' | 'center' | 'bottom'; // preset; used as fallback when x/y unset
  captionX?: number;       // custom center X as fraction of frame (0–1)
  captionY?: number;       // custom center Y as fraction of frame (0–1)
  captionColor?: string;   // text color (hex); defaults to white
  captionBg?: string;      // pill background behind text (hex); undefined = none
  captionAnimation?: CaptionAnimation; // intro animation (preview)
}

export type CaptionAnimation =
  | 'none'
  | 'fade'
  | 'slide-up'
  | 'slide-down'
  | 'pop'
  | 'typewriter';

export interface ReecapSettings {
  duration: number;        // seconds per slide (0.2–5.0)
  transition: 'fade' | 'slide' | 'zoom' | 'none' | 'slide-up' | 'wipe' | 'flip' | 'dissolve';
  aspectRatio: '16:9' | '4:3' | '5:4' | '1:1' | '9:16';
  padding: number;         // px (0–80)
  borderRadius: number;    // px (0–48)
  shadow: number;          // 0–40
  backgroundMode: 'color' | 'image' | 'slide';
  backgroundColor: string; // hex
  backgroundBlur: number;  // 0–30
  backgroundOverlay: number; // 0–100 (%)
  imageFit: 'cover' | 'contain';
  exportQuality: '1x' | '2x';
}

export type Theme = 'light' | 'dark';
