import VizCardWrapper from './VizCardWrapper';
import type { VizComponentProps } from './types';

export default function ProbabilityDistributionViz({ viz }: VizComponentProps) {
  return (
    <VizCardWrapper
      viz={viz}
      title="Next-Token Logits & Softmax Distribution"
      renderVisual={(params) => {
        const peakLogit = params.peak_logit ?? 2.0;

        // Base illustrative candidate tokens with varying logits
        const rawCandidates = [
          { token: '"learning"', baseLogit: peakLogit },
          { token: '"models"', baseLogit: 1.0 },
          { token: '"tokens"', baseLogit: 0.0 },
          { token: '"transformers"', baseLogit: -1.0 },
          { token: '[others]', baseLogit: -2.0 },
        ];

        // Compute softmax: exp(z_i) / sum(exp(z_j))
        const exps = rawCandidates.map((c) => Math.exp(c.baseLogit));
        const sumExp = exps.reduce((acc, val) => acc + val, 0);
        const distribution = rawCandidates.map((c, i) => ({
          ...c,
          prob: exps[i] / sumExp,
        }));

        return (
          <div className="space-y-4">
            <div className="space-y-2.5">
              {distribution.map((item, idx) => {
                const percent = (item.prob * 100).toFixed(1);
                const isTop = idx === 0;

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#1d1c15]">
                          {item.token}
                        </span>
                        <span className="text-[10px] font-mono text-[#89726b]">
                          (logit: {item.baseLogit.toFixed(1)})
                        </span>
                      </div>
                      <span className="font-mono font-bold text-[#9f4122]">
                        {percent}%
                      </span>
                    </div>

                    <div className="h-3 w-full bg-black/5 rounded-full overflow-hidden p-0.5 border border-black/5">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${isTop
                            ? 'bg-gradient-to-r from-[#9f4122] to-[#ff8a65]'
                            : 'bg-[#326578]/60'
                          }`}
                        style={{ width: `${Math.max(4, item.prob * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 rounded-xl bg-white/70 border border-white/80 flex items-center justify-between text-xs font-mono text-[#89726b]">
              <span>Softmax Normalization:</span>
              <span className="font-bold text-[#1d1c15]">Σ P(token_i) = 1.000 (100.0%)</span>
            </div>
          </div>
        );
      }}
    />
  );
}
