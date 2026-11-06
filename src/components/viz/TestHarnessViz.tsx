import VizCardWrapper from './VizCardWrapper';
import type { VizComponentProps } from './types';

export default function TestHarnessViz({ viz }: VizComponentProps) {
  return (
    <VizCardWrapper
      viz={viz}
      title="Release Golden Evaluation Harness"
      renderVisual={(params, setParams) => {
        const release = params.release ?? 1;
        const totalReleases = 10;

        // Mock test suite questions evaluated across releases
        const goldenTests = [
          { q: 'Token budgeting for multilingual queries', baseline: 'Pass (320 tok)', current: release === 1 ? 'Pass (320 tok)' : `Pass (${320 - release * 8} tok)` },
          { q: 'Hallucination refusal on out-of-domain prompt', baseline: 'Refusal (Correct)', current: release >= 3 ? 'Refusal (Grounding verified)' : 'Partial Drift (Review needed)' },
          { q: 'Citation accuracy against course syllabus', baseline: '92% match', current: `${Math.min(99, 90 + release * 1.1).toFixed(1)}% match` },
        ];

        return (
          <div className="space-y-4">
            {/* Release Selector Grid */}
            <div className="flex flex-wrap items-center gap-1.5">
              {Array.from({ length: totalReleases }, (_, i) => i + 1).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setParams({ release: r })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
                    r === release
                      ? 'bg-[#9f4122] text-white shadow-sm'
                      : r === 1
                      ? 'bg-[#d6ed7a]/60 text-[#3f4c00] border border-[#d6ed7a]'
                      : 'bg-white/80 text-[#56423c] border border-white hover:bg-white'
                  }`}
                >
                  v0.{r}
                </button>
              ))}
            </div>

            {/* Test Harness Comparison Table */}
            <div className="overflow-x-auto rounded-xl border border-white/80 bg-white/60">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#89726b]/10 bg-white/40 text-[10px] font-bold uppercase text-[#89726b]">
                    <th className="p-3">Golden Question Test Case</th>
                    <th className="p-3">Baseline (v0.1)</th>
                    <th className="p-3">Release v0.{release} Evaluation</th>
                    <th className="p-3">Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#89726b]/10">
                  {goldenTests.map((t, idx) => (
                    <tr key={idx} className="hover:bg-white/50">
                      <td className="p-3 font-medium text-[#1d1c15]">{t.q}</td>
                      <td className="p-3 font-mono text-[#89726b]">{t.baseline}</td>
                      <td className="p-3 font-mono font-bold text-[#9f4122]">{t.current}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          release === 1
                            ? 'bg-[#89726b]/15 text-[#56423c]'
                            : release >= 3
                            ? 'bg-[#d6ed7a]/40 text-[#3f4c00]'
                            : 'bg-[#ff8a65]/20 text-[#752305]'
                        }`}>
                          {release === 1 ? 'REF' : release >= 3 ? '+IMPROVED' : 'STABLE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }}
    />
  );
}
