import { useState } from 'react';
import VizCardWrapper from './VizCardWrapper';
import type { VizComponentProps } from './types';

export default function EmbeddingSpaceViz({ viz }: VizComponentProps) {
  const [highlightItem, setHighlightItem] = useState<number | null>(null);

  const items = (viz.compute?.items as string[]) || [
    'reset password',
    'change login credentials',
    'weather forecast',
  ];

  // Illustrative 2D projections of embedding positions
  const coords = [
    { x: 120, y: 70, label: items[0] || 'reset password', group: 'auth' },
    { x: 160, y: 95, label: items[1] || 'change login credentials', group: 'auth' },
    { x: 340, y: 190, label: items[2] || 'weather forecast', group: 'weather' },
  ];

  return (
    <VizCardWrapper
      viz={viz}
      title="High-Dimensional Semantic Embedding Space"
      renderVisual={(params) => {
        const dimension = params.dimension ?? 4;

        return (
          <div className="space-y-4">
            {/* 2D Projection Canvas */}
            <div className="relative rounded-2xl bg-white/70 border border-white/90 p-4 overflow-hidden">
              <svg viewBox="0 0 460 260" className="w-full h-56 select-none">
                {/* Dotted Grid lines */}
                <defs>
                  <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1" fill="#89726b" fillOpacity="0.2" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Similarity connector between auth vectors */}
                <line
                  x1={coords[0].x}
                  y1={coords[0].y}
                  x2={coords[1].x}
                  y2={coords[1].y}
                  stroke="#9f4122"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  strokeOpacity="0.7"
                />
                <text
                  x={(coords[0].x + coords[1].x) / 2 + 10}
                  y={(coords[0].y + coords[1].y) / 2 - 8}
                  fill="#9f4122"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  cos_sim ≈ 0.89
                </text>

                {/* Vector Points */}
                {coords.map((pt, i) => {
                  const isHovered = highlightItem === i;
                  const isAuth = pt.group === 'auth';

                  return (
                    <g
                      key={i}
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHighlightItem(i)}
                      onMouseLeave={() => setHighlightItem(null)}
                    >
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 9 : 6}
                        fill={isAuth ? '#9f4122' : '#326578'}
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="transition-all duration-200"
                      />
                      <rect
                        x={pt.x - 70}
                        y={pt.y + 12}
                        width="140"
                        height="20"
                        rx="6"
                        fill="#ffffff"
                        fillOpacity="0.9"
                        stroke="#ddc0b8"
                        strokeWidth="1"
                      />
                      <text
                        x={pt.x}
                        y={pt.y + 26}
                        textAnchor="middle"
                        fill="#1d1c15"
                        fontSize="10"
                        fontWeight="600"
                      >
                        {pt.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Dimension Breakdown and Item Explorer */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {items.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setHighlightItem(idx === highlightItem ? null : idx)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    highlightItem === idx
                      ? 'border-[#9f4122] bg-[#ff8a65]/20 text-[#1d1c15] shadow-sm'
                      : 'border-white/80 bg-white/60 text-[#56423c] hover:bg-white'
                  }`}
                >
                  <div className="font-bold truncate text-[#1d1c15]">{item}</div>
                  <div className="text-[10px] font-mono text-[#89726b] pt-0.5">
                    R^{dimension} dense vector coordinates
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      }}
    />
  );
}
