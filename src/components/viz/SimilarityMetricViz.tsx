import VizCardWrapper from './VizCardWrapper';
import type { VizComponentProps } from './types';

export default function SimilarityMetricViz({ viz }: VizComponentProps) {
  return (
    <VizCardWrapper
      viz={viz}
      title="Vector Similarity & Geometric Distance"
      renderVisual={(params, setParams) => {
        const angleDeg = params.angle ?? 45;
        const angleRad = (angleDeg * Math.PI) / 180;

        // Unit vectors A = [1, 0] and B = [cos(θ), sin(θ)]
        const cosSim = Math.cos(angleRad);
        const dotProduct = cosSim; // for unit vectors
        const euclideanDist = Math.sqrt(2 * (1 - cosSim));

        // SVG Vector Coordinates (Origin at (120, 140), scale = 90)
        const ox = 130;
        const oy = 130;
        const len = 85;

        const ax = ox + len;
        const ay = oy;

        const bx = ox + len * Math.cos(angleRad);
        const by = oy - len * Math.sin(angleRad); // SVG y is downward

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              {/* Geometric Angle Visualizer */}
              <div className="rounded-2xl bg-white/70 border border-white/90 p-3 flex flex-col items-center justify-center">
                <svg viewBox="0 0 260 170" className="w-full h-44 select-none">
                  {/* Arc indicating angle */}
                  <path
                    d={`M ${ox + 30} ${oy} A 30 30 0 0 0 ${ox + 30 * Math.cos(angleRad)} ${oy - 30 * Math.sin(angleRad)}`}
                    fill="none"
                    stroke="#ff8a65"
                    strokeWidth="2"
                  />
                  <text
                    x={ox + 42}
                    y={oy - 12}
                    fill="#9f4122"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    θ = {angleDeg}°
                  </text>

                  {/* Vector A (Reference along X axis) */}
                  <line
                    x1={ox}
                    y1={oy}
                    x2={ax}
                    y2={ay}
                    stroke="#326578"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <text x={ax + 6} y={ay + 4} fill="#326578" fontSize="11" fontWeight="bold">
                    Vector A
                  </text>

                  {/* Vector B (Rotatable) */}
                  <line
                    x1={ox}
                    y1={oy}
                    x2={bx}
                    y2={by}
                    stroke="#9f4122"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <text x={bx + 6} y={by - 4} fill="#9f4122" fontSize="11" fontWeight="bold">
                    Vector B
                  </text>

                  {/* Euclidean distance line between tips */}
                  <line
                    x1={ax}
                    y1={ay}
                    x2={bx}
                    y2={by}
                    stroke="#89726b"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />

                  {/* Origin */}
                  <circle cx={ox} cy={oy} r="4" fill="#1d1c15" />
                </svg>

                <div className="text-[11px] text-[#89726b] font-mono">
                  Drag slider above or click presets below to rotate vector angle
                </div>
              </div>

              {/* Metrics Readout Panel */}
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-white/80 border border-white flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#1d1c15]">Cosine Similarity</div>
                    <div className="text-[10px] text-[#89726b] font-mono">cos(θ) = (A · B) / (|A| |B|)</div>
                  </div>
                  <span className="text-base font-bold font-mono text-[#9f4122]">
                    {cosSim.toFixed(3)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/80 border border-white flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#1d1c15]">Dot Product (Unit Norm)</div>
                    <div className="text-[10px] text-[#89726b] font-mono">Σ (A_i × B_i)</div>
                  </div>
                  <span className="text-base font-bold font-mono text-[#326578]">
                    {dotProduct.toFixed(3)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/80 border border-white flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#1d1c15]">Euclidean Distance (L2)</div>
                    <div className="text-[10px] text-[#89726b] font-mono">√Σ (A_i - B_i)²</div>
                  </div>
                  <span className="text-base font-bold font-mono text-[#556500]">
                    {euclideanDist.toFixed(3)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Angle Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-[#89726b] uppercase mr-1">Angle Presets:</span>
              {[0, 30, 45, 90, 135, 180].map((deg) => (
                <button
                  key={deg}
                  type="button"
                  onClick={() => setParams({ angle: deg })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                    deg === angleDeg
                      ? 'bg-[#9f4122] text-white shadow-sm'
                      : 'bg-white/80 text-[#56423c] border border-white hover:bg-white'
                  }`}
                >
                  {deg}°
                </button>
              ))}
            </div>
          </div>
        );
      }}
    />
  );
}
