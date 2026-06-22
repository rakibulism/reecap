import React from 'react';
import type { DesignNode } from '../../types/design';
import { pointsToPath, smoothPath, arcPath } from '../../lib/designGeometry';

// Renders a single design node inside the world-space <g>. Pure presentation —
// pointer handling lives in DesignCanvas via event delegation (data-node-id).
const DesignNodeView: React.FC<{ node: DesignNode; editing: boolean }> = ({ node, editing }) => {
  const { x, y, width: w, height: h, rotation, opacity, fill, stroke, strokeWidth } = node;
  const transform = `translate(${x} ${y}) rotate(${rotation} ${w / 2} ${h / 2})`;
  const common = { fill: fill || 'none', stroke: stroke || 'none', strokeWidth, opacity };

  let shape: React.ReactNode = null;
  switch (node.type) {
    case 'frame':
    case 'rectangle':
      shape = <rect width={w} height={h} rx={node.cornerRadius} {...common} />;
      break;
    case 'ellipse':
      shape = <ellipse cx={w / 2} cy={h / 2} rx={w / 2} ry={h / 2} {...common} />;
      break;
    case 'line':
      shape = <path d={pointsToPath(node.points ?? [], w, h, false)} fill="none" stroke={stroke || '#18181B'} strokeWidth={strokeWidth} strokeLinecap="round" opacity={opacity} />;
      break;
    case 'arrow':
      shape = (
        <path
          d={pointsToPath(node.points ?? [], w, h, false)}
          fill="none"
          stroke={stroke || '#18181B'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          markerEnd={`url(#arrowhead-${node.id})`}
          opacity={opacity}
        />
      );
      break;
    case 'polygon':
    case 'star':
    case 'path':
      shape = <path d={pointsToPath(node.points ?? [], w, h, node.type === 'path' ? !!node.closed : true)} {...common} strokeLinejoin="round" />;
      break;
    case 'pencil':
      shape = <path d={smoothPath(node.points ?? [], w, h)} fill="none" stroke={stroke || '#18181B'} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" opacity={opacity} />;
      break;
    case 'image':
      shape = node.src ? <image href={node.src} width={w} height={h} preserveAspectRatio="xMidYMid slice" opacity={opacity} /> : <rect width={w} height={h} fill="#E4E4E7" />;
      break;
    case 'video':
      shape = (
        <foreignObject width={w} height={h} opacity={opacity}>
          {node.src ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video src={node.src} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: '#E4E4E7' }} />
          )}
        </foreignObject>
      );
      break;
    case 'text': {
      const size = node.fontSize ?? 40;
      const lines = (node.text ?? '').split('\n');
      const anchor = node.align === 'center' ? 'middle' : node.align === 'right' ? 'end' : 'start';
      const tx = node.align === 'center' ? w / 2 : node.align === 'right' ? w : 0;
      shape = editing ? null : (
        <text
          fontFamily={node.fontFamily}
          fontSize={size}
          fontWeight={node.fontWeight}
          fill={node.color}
          opacity={opacity}
          textAnchor={anchor}
          style={{ letterSpacing: `${node.letterSpacing ?? 0}px`, whiteSpace: 'pre' }}
        >
          {lines.map((ln, i) => (
            <tspan key={i} x={tx} y={size * 0.92 + i * size * 1.2}>
              {ln || ' '}
            </tspan>
          ))}
        </text>
      );
      break;
    }
    case 'text-path': {
      const pathId = `tp-${node.id}`;
      const anchor = node.align === 'center' ? 'middle' : node.align === 'right' ? 'end' : 'start';
      const startOffset = node.align === 'center' ? '50%' : node.align === 'right' ? '100%' : '0%';
      shape = (
        <>
          <defs>
            <path id={pathId} d={arcPath(w, h, node.arc ?? 0)} />
          </defs>
          <text fontFamily={node.fontFamily} fontSize={node.fontSize} fontWeight={node.fontWeight} fill={node.color} opacity={opacity} textAnchor={anchor}>
            <textPath href={`#${pathId}`} startOffset={startOffset}>
              {node.text}
            </textPath>
          </text>
        </>
      );
      break;
    }
  }

  return (
    <g transform={transform} data-node-id={node.id} style={{ cursor: node.locked ? 'default' : 'move' }}>
      {/* Transparent hit area so thin shapes / empty fills are still clickable. */}
      <rect width={Math.max(w, 1)} height={Math.max(h, 1)} fill="transparent" pointerEvents={node.locked ? 'none' : 'all'} />
      {node.type === 'arrow' && (
        <defs>
          <marker id={`arrowhead-${node.id}`} markerWidth="6" markerHeight="6" refX="4.5" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L6,3 L0,6 Z" fill={stroke || '#18181B'} />
          </marker>
        </defs>
      )}
      <g pointerEvents="none">{shape}</g>
    </g>
  );
};

export default React.memo(DesignNodeView);
