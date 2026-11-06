import VizCardWrapper from './VizCardWrapper';
import type { VizComponentProps } from './types';

export default function DecisionMatrixViz({ viz }: VizComponentProps) {
  const allCriteria = [
    { name: 'Task Accuracy / Quality', weight: 'High', optA: 8.5, optB: 9.0 },
    { name: 'Language & Script Coverage', weight: 'High', optA: 7.0, optB: 8.8 },
    { name: 'Inference Latency (p95 TTFT)', weight: 'Medium', optA: 9.2, optB: 7.4 },
    { name: 'Cost per 1M Output Tokens', weight: 'High', optA: 8.9, optB: 6.5 },
    { name: 'Data Privacy & Self-Hosting', weight: 'Critical', optA: 9.5, optB: 6.0 },
  ];

  return (
    <VizCardWrapper
      viz={viz}
      title="Architecture Decision Record (ADR) Matrix"
      renderVisual={(params) => {
        const criteriaCount = Math.min(5, Math.max(1, params.criteria ?? 3));
        const activeCriteria = allCriteria.slice(0, criteriaCount);

        const scoreA = activeCriteria.reduce((sum, c) => sum + c.optA, 0) / criteriaCount;
        const scoreB = activeCriteria.reduce((sum, c) => sum + c.optB, 0) / criteriaCount;

        return (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-white/80 bg-white/70">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#89726b]/10 bg-white/50 text-[10px] font-bold uppercase text-[#89726b]">
                    <th className="p-3">Evaluated Criterion ({criteriaCount}/5 active)</th>
                    <th className="p-3">Weight</th>
                    <th className="p-3">Option A (Local / OSS)</th>
                    <th className="p-3">Option B (Hosted Provider API)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#89726b]/10">
                  {activeCriteria.map((c, idx) => (
                    <tr key={idx} className="hover:bg-white/40">
                      <td className="p-3 font-semibold text-[#1d1c15]">{c.name}</td>
                      <td className="p-3 text-[#56423c]">{c.weight}</td>
                      <td className="p-3 font-mono font-bold text-[#326578]">{c.optA} / 10</td>
                      <td className="p-3 font-mono font-bold text-[#9f4122]">{c.optB} / 10</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[#89726b]/20 bg-white/60 font-bold">
                    <td className="p-3 uppercase text-[10px] text-[#89726b]">Normalized Average Score</td>
                    <td className="p-3 text-[#89726b]">-</td>
                    <td className="p-3 font-mono text-[#326578] text-sm">{scoreA.toFixed(1)} / 10</td>
                    <td className="p-3 font-mono text-[#9f4122] text-sm">{scoreB.toFixed(1)} / 10</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="p-3 rounded-xl bg-white/60 border border-white flex items-center justify-between text-xs">
              <span className="text-[#56423c]">ADR Trade-off Verdict:</span>
              <span className="font-bold text-[#1d1c15]">
                {scoreA > scoreB ? 'Option A leads based on selected criteria' : 'Option B leads based on selected criteria'}
              </span>
            </div>
          </div>
        );
      }}
    />
  );
}
