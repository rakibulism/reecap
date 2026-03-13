export interface Photo {
  id: string;
  file: File;
  objectUrl: string;
  thumbnailUrl?: string;
  width: number;
  height: number;
  transition?: 'fade' | 'slide' | 'zoom' | 'none' | 'slide-up' | 'wipe' | 'flip' | 'dissolve';
}

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
