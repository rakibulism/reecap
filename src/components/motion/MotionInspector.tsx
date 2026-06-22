import React from 'react';
import { useMotionStore } from '../../store/motionStore';
import Slider from '../ui/Slider';
import SegmentedControl from '../ui/SegmentedControl';
import { ANIMATION_PRESETS, EASING_PRESETS } from '../../lib/motionEngine';
import type { AnimationPreset, MotionLayer } from '../../types/motion';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="py-5 border-b border-[var(--color-border-default)] last:border-0 px-4">
    <h3 className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)] mb-4">
      {title}
    </h3>
    <div className="flex flex-col gap-4">{children}</div>
  </div>
);

const NumberField: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}> = ({ label, value, onChange, step = 1 }) => (
  <label className="flex items-center gap-2">
    <span className="text-[10px] font-bold uppercase text-[var(--color-text-muted)] w-5">{label}</span>
    <input
      type="number"
      value={Math.round(value)}
      step={step}
      onChange={(e) => onChange(Number(e.target.value))}
      className="flex-1 min-w-0 h-8 px-2 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-sm)] text-[12px] tabular-nums focus:outline-none focus:border-[var(--color-primary)]"
    />
  </label>
);

const ColorField: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({
  label,
  value,
  onChange,
}) => (
  <div className="flex items-center gap-2">
    <label
      className="w-8 h-8 rounded-[var(--radius-sm)] border border-[var(--color-border-default)] cursor-pointer shrink-0 overflow-hidden"
      style={{ background: value }}
    >
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="sr-only" />
    </label>
    <span className="text-[10px] font-bold uppercase text-[var(--color-text-muted)] flex-1">{label}</span>
    <span className="text-[11px] tabular-nums text-[var(--color-text-secondary)]">{value}</span>
  </div>
);

const PresetGrid: React.FC<{
  value: AnimationPreset;
  onChange: (v: AnimationPreset) => void;
}> = ({ value, onChange }) => (
  <div className="grid grid-cols-3 gap-1.5">
    {ANIMATION_PRESETS.map((opt) => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className={`h-8 rounded-[var(--radius-sm)] text-[10px] font-medium transition-all border
          ${value === opt.value
            ? 'bg-[var(--color-interactive)] border-[var(--color-interactive)] text-[var(--color-text-inverse)]'
            : 'bg-[var(--color-bg-surface)] border-[var(--color-border-default)] text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)]'}`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)] block mb-2">
      {label}
    </label>
    {children}
  </div>
);

const MotionInspector: React.FC = () => {
  const { doc, selectedId, updateLayer } = useMotionStore();
  const layer = doc.layers.find((l) => l.id === selectedId);

  if (!layer) {
    return (
      <aside className="w-[280px] shrink-0 border-l border-[var(--color-border-default)] bg-[var(--color-bg-panel)] flex items-center justify-center">
        <p className="text-[11px] text-[var(--color-text-muted)] italic px-6 text-center leading-relaxed">
          Select a layer to edit its properties and animation.
        </p>
      </aside>
    );
  }

  const set = (patch: Partial<MotionLayer>) => updateLayer(layer.id, patch);
  const setAnim = (patch: Partial<MotionLayer['animation']>) =>
    updateLayer(layer.id, { animation: { ...layer.animation, ...patch } });

  return (
    <aside className="w-[280px] shrink-0 border-l border-[var(--color-border-default)] bg-[var(--color-bg-panel)] overflow-y-auto custom-scrollbar">
      <Section title="Transform">
        <div className="grid grid-cols-2 gap-2">
          <NumberField label="X" value={layer.x} onChange={(v) => set({ x: v })} />
          <NumberField label="Y" value={layer.y} onChange={(v) => set({ y: v })} />
          <NumberField label="W" value={layer.width} onChange={(v) => set({ width: Math.max(8, v) })} />
          <NumberField label="H" value={layer.height} onChange={(v) => set({ height: Math.max(8, v) })} />
        </div>
        <Field label="Rotation">
          <Slider value={layer.rotation} min={-180} max={180} step={1} unit="°" onChange={(v) => set({ rotation: v })} />
        </Field>
        <Field label="Opacity">
          <Slider
            value={Math.round(layer.opacity * 100)}
            min={0}
            max={100}
            step={1}
            unit="%"
            onChange={(v) => set({ opacity: v / 100 })}
          />
        </Field>
      </Section>

      <Section title="Appearance">
        {layer.type === 'text' ? (
          <>
            <Field label="Text">
              <textarea
                value={layer.text || ''}
                onChange={(e) => set({ text: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-sm)] text-[12px] resize-none focus:outline-none focus:border-[var(--color-primary)]"
              />
            </Field>
            <Field label="Font Size">
              <Slider value={layer.fontSize || 72} min={8} max={300} step={1} unit="px" onChange={(v) => set({ fontSize: v })} />
            </Field>
            <Field label="Weight">
              <SegmentedControl
                options={[
                  { label: 'Light', value: 300 },
                  { label: 'Regular', value: 400 },
                  { label: 'Bold', value: 700 },
                  { label: 'Black', value: 900 },
                ]}
                value={layer.fontWeight || 700}
                onChange={(v) => set({ fontWeight: v as number })}
              />
            </Field>
            <Field label="Align">
              <SegmentedControl
                options={[
                  { label: 'Left', value: 'left' },
                  { label: 'Center', value: 'center' },
                  { label: 'Right', value: 'right' },
                ]}
                value={layer.align || 'center'}
                onChange={(v) => set({ align: v as MotionLayer['align'] })}
              />
            </Field>
            <ColorField label="Color" value={layer.color || '#FFFFFF'} onChange={(v) => set({ color: v })} />
          </>
        ) : layer.type === 'image' ? (
          <Field label="Corner Radius">
            <Slider value={layer.cornerRadius} min={0} max={120} step={2} unit="px" onChange={(v) => set({ cornerRadius: v })} />
          </Field>
        ) : (
          <>
            <ColorField label="Fill" value={layer.fill} onChange={(v) => set({ fill: v })} />
            {layer.type === 'rectangle' && (
              <Field label="Corner Radius">
                <Slider value={layer.cornerRadius} min={0} max={200} step={2} unit="px" onChange={(v) => set({ cornerRadius: v })} />
              </Field>
            )}
          </>
        )}
      </Section>

      <Section title="Animate In">
        <PresetGrid value={layer.animation.inPreset} onChange={(v) => setAnim({ inPreset: v })} />
        <Field label="Start">
          <Slider value={layer.animation.start} min={0} max={Math.max(0, doc.duration)} step={0.05} unit="s" onChange={(v) => setAnim({ start: v })} />
        </Field>
        <Field label="Duration">
          <Slider value={layer.animation.inDuration} min={0} max={3} step={0.05} unit="s" onChange={(v) => setAnim({ inDuration: v })} />
        </Field>
      </Section>

      <Section title="Animate Out">
        <PresetGrid value={layer.animation.outPreset} onChange={(v) => setAnim({ outPreset: v })} />
        <Field label="Duration">
          <Slider value={layer.animation.outDuration} min={0} max={3} step={0.05} unit="s" onChange={(v) => setAnim({ outDuration: v })} />
        </Field>
      </Section>

      <Section title="Easing & Intensity">
        <Field label="Easing">
          <div className="grid grid-cols-4 gap-1.5">
            {EASING_PRESETS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAnim({ easing: opt.value })}
                className={`h-8 rounded-[var(--radius-sm)] text-[10px] font-medium transition-all border
                  ${layer.animation.easing === opt.value
                    ? 'bg-[var(--color-interactive)] border-[var(--color-interactive)] text-[var(--color-text-inverse)]'
                    : 'bg-[var(--color-bg-surface)] border-[var(--color-border-default)] text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)]'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Intensity">
          <Slider
            value={Math.round(layer.animation.intensity * 100)}
            min={0}
            max={100}
            step={5}
            unit="%"
            onChange={(v) => setAnim({ intensity: v / 100 })}
          />
        </Field>
      </Section>
    </aside>
  );
};

export default MotionInspector;
