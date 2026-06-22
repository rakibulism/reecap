import React from 'react';
import { ArrowLineUp, ArrowLineDown, ArrowUp, ArrowDown, Copy, Trash } from 'phosphor-react';
import { useDesignStore } from '../../store/designStore';
import { polygonPoints, starPoints } from '../../lib/designGeometry';
import type { DesignNode } from '../../types/design';

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="flex items-center gap-2">
    <span className="w-5 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase">{label}</span>
    {children}
  </label>
);

const Num: React.FC<{ value: number; onChange: (v: number) => void; step?: number }> = ({ value, onChange, step = 1 }) => (
  <input
    type="number"
    value={Math.round((value ?? 0) * 100) / 100}
    step={step}
    onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
    className="w-full h-7 px-2 rounded-[var(--radius-sm)] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-[12px] tabular-nums focus:border-[var(--color-primary)] outline-none"
  />
);

const Color: React.FC<{ value: string; onChange: (v: string) => void; allowNone?: boolean }> = ({ value, onChange, allowNone }) => (
  <div className="flex items-center gap-1.5 flex-1">
    <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)} className="w-7 h-7 shrink-0 rounded cursor-pointer bg-transparent border border-[var(--color-border-default)] p-0.5" />
    <input
      value={value || ''}
      placeholder={allowNone ? 'none' : ''}
      onChange={(e) => onChange(e.target.value)}
      className="flex-1 min-w-0 h-7 px-2 rounded-[var(--radius-sm)] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-[12px] uppercase focus:border-[var(--color-primary)] outline-none"
    />
    {allowNone && value && (
      <button onClick={() => onChange('')} className="text-[10px] px-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">✕</button>
    )}
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="px-3 py-3 border-b border-[var(--color-border-default)] space-y-2">
    <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">{title}</h4>
    {children}
  </div>
);

const DesignInspector: React.FC = () => {
  const { doc, selectedIds, updateNode, setBackground, duplicateSelected, removeSelected, bringForward, sendBackward, bringToFront, sendToBack } = useDesignStore();
  const n: DesignNode | undefined = selectedIds.length === 1 ? doc.nodes.find((x) => x.id === selectedIds[0]) : undefined;
  const set = (patch: Partial<DesignNode>) => n && updateNode(n.id, patch);

  if (!n) {
    return (
      <div className="w-64 shrink-0 border-l border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
        <Section title="Canvas">
          <Field label="BG"><Color value={doc.background} onChange={setBackground} /></Field>
        </Section>
        <p className="px-3 py-4 text-[12px] text-[var(--color-text-muted)] leading-relaxed">
          {selectedIds.length > 1 ? `${selectedIds.length} layers selected.` : 'Select a layer to edit its properties.'}
        </p>
      </div>
    );
  }

  const isText = n.type === 'text' || n.type === 'text-path';
  return (
    <div className="w-64 shrink-0 border-l border-[var(--color-border-default)] bg-[var(--color-bg-surface)] overflow-y-auto custom-scrollbar">
      <div className="px-3 py-2.5 border-b border-[var(--color-border-default)] flex items-center gap-1">
        <input
          value={n.name}
          onChange={(e) => set({ name: e.target.value })}
          className="flex-1 min-w-0 h-7 px-2 rounded-[var(--radius-sm)] bg-transparent border border-transparent hover:border-[var(--color-border-default)] focus:border-[var(--color-primary)] text-[13px] font-semibold outline-none"
        />
        <button onClick={duplicateSelected} title="Duplicate (⌘D)" className="p-1.5 rounded text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"><Copy size={15} /></button>
        <button onClick={removeSelected} title="Delete (⌫)" className="p-1.5 rounded text-[var(--color-text-muted)] hover:bg-red-500/10 hover:text-red-500"><Trash size={15} /></button>
      </div>

      <Section title="Arrange">
        <div className="grid grid-cols-4 gap-1">
          {[
            { icon: <ArrowLineUp size={15} />, fn: bringToFront, t: 'To front (⌘])' },
            { icon: <ArrowUp size={15} />, fn: bringForward, t: 'Forward (])' },
            { icon: <ArrowDown size={15} />, fn: sendBackward, t: 'Backward ([)' },
            { icon: <ArrowLineDown size={15} />, fn: sendToBack, t: 'To back (⌘[)' },
          ].map((b, i) => (
            <button key={i} onClick={b.fn} title={b.t} className="h-7 flex items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]">{b.icon}</button>
          ))}
        </div>
      </Section>

      <Section title="Position & size">
        <div className="grid grid-cols-2 gap-2">
          <Field label="X"><Num value={n.x} onChange={(v) => set({ x: v })} /></Field>
          <Field label="Y"><Num value={n.y} onChange={(v) => set({ y: v })} /></Field>
          <Field label="W"><Num value={n.width} onChange={(v) => set({ width: Math.max(1, v) })} /></Field>
          <Field label="H"><Num value={n.height} onChange={(v) => set({ height: Math.max(1, v) })} /></Field>
          <Field label="∠"><Num value={n.rotation} onChange={(v) => set({ rotation: v })} /></Field>
          <Field label="○"><Num value={Math.round(n.opacity * 100)} onChange={(v) => set({ opacity: Math.max(0, Math.min(1, v / 100)) })} /></Field>
        </div>
      </Section>

      {(n.type === 'rectangle' || n.type === 'frame') && (
        <Section title="Corner radius"><Num value={n.cornerRadius} onChange={(v) => set({ cornerRadius: Math.max(0, v) })} /></Section>
      )}

      {n.type === 'polygon' && (
        <Section title="Polygon">
          <Field label="N"><Num value={n.sides ?? 6} onChange={(v) => { const s = Math.max(3, Math.round(v)); set({ sides: s, points: polygonPoints(s) }); }} /></Field>
        </Section>
      )}
      {n.type === 'star' && (
        <Section title="Star">
          <Field label="N"><Num value={n.sides ?? 5} onChange={(v) => { const s = Math.max(3, Math.round(v)); set({ sides: s, points: starPoints(s, n.innerRatio ?? 0.45) }); }} /></Field>
          <Field label="IR"><Num step={0.05} value={n.innerRatio ?? 0.45} onChange={(v) => { const ir = Math.max(0.1, Math.min(0.9, v)); set({ innerRatio: ir, points: starPoints(n.sides ?? 5, ir) }); }} /></Field>
        </Section>
      )}

      {isText && (
        <Section title="Text">
          <textarea
            value={n.text ?? ''}
            onChange={(e) => set({ text: e.target.value })}
            rows={2}
            className="w-full px-2 py-1.5 rounded-[var(--radius-sm)] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-[12px] resize-none focus:border-[var(--color-primary)] outline-none"
          />
          <div className="grid grid-cols-2 gap-2">
            <Field label="Sz"><Num value={n.fontSize ?? 40} onChange={(v) => set({ fontSize: Math.max(1, v) })} /></Field>
            <Field label="Wt"><Num step={100} value={n.fontWeight ?? 600} onChange={(v) => set({ fontWeight: v })} /></Field>
          </div>
          <div className="flex gap-1">
            {(['left', 'center', 'right'] as const).map((a) => (
              <button key={a} onClick={() => set({ align: a })} className={`flex-1 h-7 text-[11px] capitalize rounded-[var(--radius-sm)] border ${n.align === a ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-[var(--color-border-default)] text-[var(--color-text-secondary)]'}`}>{a}</button>
            ))}
          </div>
          {n.type === 'text-path' && (
            <Field label="Arc">
              <input type="range" min={-1} max={1} step={0.05} value={n.arc ?? 0} onChange={(e) => set({ arc: parseFloat(e.target.value) })} className="flex-1 accent-[var(--color-primary)]" />
            </Field>
          )}
          <Field label="Col"><Color value={n.color ?? '#000000'} onChange={(v) => set({ color: v })} /></Field>
        </Section>
      )}

      {!isText && (
        <Section title="Fill"><Color value={n.fill} onChange={(v) => set({ fill: v })} allowNone /></Section>
      )}
      <Section title="Stroke">
        <Color value={n.stroke} onChange={(v) => set({ stroke: v })} allowNone />
        {n.stroke && <Field label="W"><Num step={0.5} value={n.strokeWidth} onChange={(v) => set({ strokeWidth: Math.max(0, v) })} /></Field>}
      </Section>
    </div>
  );
};

export default DesignInspector;
