import VizCardWrapper from './VizCardWrapper';
import type { VizComponentProps } from './types';

export default function ModelSelectionViz({ viz }: VizComponentProps) {
  const profiles = (viz.compute?.profiles as string[]) || [
    'English',
    'Multilingual',
    'Mixed English and Indian languages',
  ];

  const criteria = (viz.compute?.criteria as string[]) || [
    'quality',
    'latency',
    'dimension',
    'licence',
    'input limit',
  ];

  // Benchmark scorecard comparing 3 candidate architectures
  const scorecards = [
    {
      name: 'text-embedding-3-small',
      provider: 'API Hosted',
      dim: '1536d',
      latency: '45ms',
      maxTokens: '8,191',
      langScore: 8.8,
      licence: 'Proprietary API',
    },
    {
      name: 'bge-m3',
      provider: 'Open Weights / Self-Hosted',
      dim: '1024d',
      latency: '28ms (GPU)',
      maxTokens: '8,192',
      langScore: 9.6,
      licence: 'MIT License',
    },
    {
      name: 'all-MiniLM-L6-v2',
      provider: 'Lightweight CPU/Edge',
      dim: '384d',
      latency: '12ms (CPU)',
      maxTokens: '256',
      langScore: 6.2,
      licence: 'Apache 2.0',
    },
  ];

  return (
    <VizCardWrapper
      viz={viz}
      title="Embedding Model Selection & Constraint Scorecard"
      renderVisual={(params, setParams) => {
        const langIdx = Math.min(profiles.length, Math.max(1, params.language ?? 1));
        const currentProfile = profiles[langIdx - 1] || 'English';

        return (
          <div className="space-y-4">
            {/* Language profile selector buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-[#89726b] uppercase mr-1">
                Target Language Mix:
              </span>
              {profiles.map((prof, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setParams({ language: i + 1 })}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                    i + 1 === langIdx
                      ? 'bg-[#9f4122] text-white shadow-sm'
                      : 'bg-white/80 text-[#56423c] border border-white hover:bg-white'
                  }`}
                >
                  {prof}
                </button>
              ))}
            </div>

            {/* Scorecard Table */}
            <div className="overflow-x-auto rounded-xl border border-white/80 bg-white/70">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#89726b]/10 bg-white/50 text-[10px] font-bold uppercase text-[#89726b]">
                    <th className="p-3">Candidate Model</th>
                    <th className="p-3">Hosting</th>
                    <th className="p-3">Dim</th>
                    <th className="p-3">Latency</th>
                    <th className="p-3">Context</th>
                    <th className="p-3">Profile Fit ({currentProfile})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#89726b]/10">
                  {scorecards.map((model, idx) => {
                    const isRecommended = (langIdx === 1 && idx === 0) || (langIdx >= 2 && idx === 1);

                    return (
                      <tr
                        key={idx}
                        className={`transition-colors ${
                          isRecommended ? 'bg-[#ff8a65]/10 font-medium' : 'hover:bg-white/40'
                        }`}
                      >
                        <td className="p-3">
                          <div className="font-bold text-[#1d1c15]">{model.name}</div>
                          <div className="text-[10px] text-[#89726b]">{model.licence}</div>
                        </td>
                        <td className="p-3 text-[#56423c]">{model.provider}</td>
                        <td className="p-3 font-mono font-bold text-[#326578]">{model.dim}</td>
                        <td className="p-3 font-mono text-[#1d1c15]">{model.latency}</td>
                        <td className="p-3 font-mono text-[#1d1c15]">{model.maxTokens}</td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              isRecommended
                                ? 'bg-[#d6ed7a] text-[#3f4c00]'
                                : 'bg-[#dfd9cf]/40 text-[#56423c]'
                            }`}
                          >
                            {isRecommended ? '★ Recommended' : 'Alternative'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Evaluation Criteria Checklist */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-[#56423c]">
              <span className="font-bold text-[#89726b] uppercase text-[10px] mr-1">
                Criteria Included:
              </span>
              {criteria.map((c, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-white border border-[#ddc0b8] font-mono text-[10px]"
                >
                  ✓ {c}
                </span>
              ))}
            </div>
          </div>
        );
      }}
    />
  );
}
