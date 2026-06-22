import React, { useState } from 'react';
import { Code, Copy, Check, Ruler } from 'phosphor-react';
import { useDesignStore } from '../../store/designStore';
import { nodeToCss, cssName, pointsToPath, smoothPath, polygonPoints, starPoints } from '../../lib/designGeometry';
import type { DesignNode } from '../../types/design';

// Build a standalone SVG snippet for a node (origin-normalised to 0,0).
function nodeToSvg(n: DesignNode): string {
  const w = Math.round(n.width), h = Math.round(n.height);
  const fill = n.fill || 'none';
  const stroke = n.stroke ? ` stroke="${n.stroke}" stroke-width="${n.strokeWidth}"` : '';
  let body = '';
  switch (n.type) {
    case 'frame':
    case 'rectangle':
      body = `  <rect width="${w}" height="${h}" rx="${n.cornerRadius}" fill="${fill}"${stroke} />`;
      break;
    case 'ellipse':
      body = `  <ellipse cx="${w / 2}" cy="${h / 2}" rx="${w / 2}" ry="${h / 2}" fill="${fill}"${stroke} />`;
      break;
    case 'line':
    case 'arrow':
      body = `  <path d="${pointsToPath(n.points ?? [], w, h, false)}" fill="none" stroke="${n.stroke || '#000'}" stroke-width="${n.strokeWidth}" stroke-linecap="round" />`;
      break;
    case 'polygon':
      body = `  <path d="${pointsToPath(n.points ?? polygonPoints(n.sides ?? 6), w, h, true)}" fill="${fill}"${stroke} />`;
      break;
    case 'star':
      body = `  <path d="${pointsToPath(n.points ?? starPoints(n.sides ?? 5, n.innerRatio ?? 0.45), w, h, true)}" fill="${fill}"${stroke} />`;
      break;
    case 'path':
      body = `  <path d="${pointsToPath(n.points ?? [], w, h, !!n.closed)}" fill="${fill}"${stroke} />`;
      break;
    case 'pencil':
      body = `  <path d="${smoothPath(n.points ?? [], w, h)}" fill="none" stroke="${n.stroke || '#000'}" stroke-width="${n.strokeWidth}" stroke-linecap="round" />`;
      break;
    case 'text':
    case 'text-path':
      body = `  <text font-family="${n.fontFamily}" font-size="${n.fontSize}" font-weight="${n.fontWeight}" fill="${n.color}">${(n.text ?? '').replace(/[<>&]/g, '')}</text>`;
      break;
    case 'image':
    case 'video':
      body = `  <image href="${n.src ?? ''}" width="${w}" height="${h}" />`;
      break;
  }
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">\n${body}\n</svg>`;
}

const Stat: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] font-semibold uppercase text-[var(--color-text-muted)]">{label}</span>
    <span className="text-[13px] tabular-nums font-medium">{value}</span>
  </div>
);

const DevPanel: React.FC = () => {
  const { doc, selectedIds } = useDesignStore();
  const n = selectedIds.length === 1 ? doc.nodes.find((x) => x.id === selectedIds[0]) : undefined;
  const [tab, setTab] = useState<'css' | 'svg'>('css');
  const [copied, setCopied] = useState(false);

  if (!n) {
    return (
      <div className="w-72 shrink-0 border-l border-[var(--color-border-default)] bg-[var(--color-bg-surface)] flex flex-col items-center justify-center text-center px-6 gap-2">
        <Code size={26} className="text-[var(--color-text-muted)]" />
        <p className="text-[13px] font-semibold">Dev mode</p>
        <p className="text-[12px] text-[var(--color-text-muted)] leading-relaxed">Select any layer to inspect its measurements and copy ready-to-use CSS or SVG.</p>
      </div>
    );
  }

  const code = tab === 'css' ? nodeToCss(n) : nodeToSvg(n);
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); } catch { /* clipboard blocked */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="w-72 shrink-0 border-l border-[var(--color-border-default)] bg-[var(--color-bg-surface)] flex flex-col overflow-hidden">
      <div className="h-10 flex items-center gap-2 px-3 border-b border-[var(--color-border-default)]">
        <Code size={16} className="text-[var(--color-primary)]" />
        <span className="text-[12px] font-bold">{n.name}</span>
        <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--color-bg-panel)] text-[var(--color-text-muted)]">.{cssName(n)}</span>
      </div>

      <div className="px-3 py-3 border-b border-[var(--color-border-default)]">
        <div className="flex items-center gap-1.5 mb-2 text-[var(--color-text-muted)]"><Ruler size={13} /><span className="text-[10px] font-bold uppercase tracking-wider">Measurements</span></div>
        <div className="grid grid-cols-3 gap-y-3 gap-x-2">
          <Stat label="X" value={Math.round(n.x)} />
          <Stat label="Y" value={Math.round(n.y)} />
          <Stat label="∠" value={`${Math.round(n.rotation)}°`} />
          <Stat label="W" value={Math.round(n.width)} />
          <Stat label="H" value={Math.round(n.height)} />
          <Stat label="Opacity" value={`${Math.round(n.opacity * 100)}%`} />
        </div>
        {n.fill && (
          <div className="flex items-center gap-2 mt-3">
            <span className="w-4 h-4 rounded border border-[var(--color-border-default)]" style={{ background: n.fill }} />
            <span className="text-[12px] font-mono uppercase">{n.fill}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 px-3 pt-3">
        {(['css', 'svg'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 h-7 text-[11px] font-semibold uppercase rounded-[var(--radius-sm)] ${tab === t ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]'}`}>{t}</button>
        ))}
        <button onClick={copy} className="ml-auto flex items-center gap-1 px-2.5 h-7 text-[11px] font-semibold rounded-[var(--radius-sm)] border border-[var(--color-border-default)] hover:bg-[var(--color-bg-hover)]">
          {copied ? <><Check size={13} weight="bold" /> Copied</> : <><Copy size={13} /> Copy</>}
        </button>
      </div>
      <pre className="flex-1 overflow-auto custom-scrollbar m-3 mt-2 p-3 rounded-[var(--radius-md)] bg-[var(--color-bg-panel)] text-[11px] leading-relaxed font-mono text-[var(--color-text-secondary)] whitespace-pre">{code}</pre>
    </div>
  );
};

export default DevPanel;
