import React from 'react';
import { useReecapStore } from '../../store/reecapStore';
import { ASPECT_LABELS, buildVideoFilename, type NameParts } from '../../lib/saveLocation';

/** A small iOS-style on/off switch. */
const Switch: React.FC<{ checked: boolean; onChange: () => void; label: string }> = ({ checked, onChange, label }) => (
  <button
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={onChange}
    className={`relative w-10 h-6 rounded-full transition-colors shrink-0
      ${checked ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border-strong,var(--color-bg-hover))]'}`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform
        ${checked ? 'translate-x-4' : ''}`}
    />
  </button>
);

/**
 * Choose what gets appended to the typed video name on export — aspect-ratio
 * label, date, and/or time — with a live preview of the resulting file name.
 */
const VideoNameOptions: React.FC = () => {
  const { projectName, settings, videoNameParts, setVideoNameParts } = useReecapStore();

  const sampleName = projectName.trim() || 'Videoname';
  // Fixed sample time so the preview reads cleanly (real export stamps "now").
  const sampleStamp = new Date(2026, 5, 29, 14, 30, 5);
  const preview = buildVideoFilename(sampleName, settings.aspectRatio, videoNameParts, sampleStamp);

  const rows: { key: keyof NameParts; label: string; hint: string }[] = [
    { key: 'ratio', label: 'Aspect ratio', hint: `Adds “${ASPECT_LABELS[settings.aspectRatio] ?? 'Widescreen'}” for the current ratio` },
    { key: 'date', label: 'Date', hint: 'Adds the export date, e.g. 2026-06-29' },
    { key: 'time', label: 'Time', hint: 'Adds the export time, e.g. 14-30-05' },
  ];

  return (
    <div>
      <div className="space-y-1">
        {rows.map((row) => (
          <label
            key={row.key}
            className="flex items-center justify-between gap-4 py-2.5 cursor-pointer"
          >
            <span className="min-w-0">
              <span className="block text-[14px] font-semibold">{row.label}</span>
              <span className="block text-[12px] text-[var(--color-text-muted)]">{row.hint}</span>
            </span>
            <Switch
              checked={videoNameParts[row.key]}
              onChange={() => setVideoNameParts({ [row.key]: !videoNameParts[row.key] })}
              label={`Append ${row.label.toLowerCase()}`}
            />
          </label>
        ))}
      </div>

      <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-4 py-3">
        <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-muted)] mb-1.5">
          Preview
        </div>
        <code className="text-[13px] font-medium text-[var(--color-text-primary)] break-all">{preview}</code>
      </div>
    </div>
  );
};

export default VideoNameOptions;
