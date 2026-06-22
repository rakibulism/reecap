import React from 'react';
import { FilmStrip } from 'phosphor-react';

interface BrandMarkProps {
  /** Box size in px. The film icon scales with it. */
  size?: number;
  /** Tailwind rounding class for the tile. */
  rounded?: string;
  className?: string;
}

/**
 * The single Reecap logo mark — a brand-colored (#FF3D03) rounded tile with a
 * white film strip, matching the favicon / app icon. Used everywhere (site nav,
 * footer, editor topbar, mobile topbar, gate) so the logo is identical across
 * website, mobile, and editor.
 */
const BrandMark: React.FC<BrandMarkProps> = ({ size = 36, rounded = 'rounded-xl', className = '' }) => (
  <div
    className={`bg-gradient-to-br from-[#FF3D03] to-[#E63100] flex items-center justify-center shadow-sm ${rounded} ${className}`}
    style={{ width: size, height: size }}
  >
    <FilmStrip size={Math.round(size * 0.56)} weight="fill" className="text-white" />
  </div>
);

export default BrandMark;
