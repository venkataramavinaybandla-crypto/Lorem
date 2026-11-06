import VizCardWrapper from './VizCardWrapper';
import type { VizComponentProps } from './types';

export default function SequenceGenerationViz({ viz }: VizComponentProps) {
  const sequence = (viz.compute?.sequence as string[]) || [
    'The',
    'model',
    'predicts',
    'one',
    'token',
    'at',
    'a',
    'time',
  ];

  return (
    <VizCardWrapper
      viz={viz}
      title="Autoregressive Next-Token Generation"
      renderVisual={(params, setParams) => {
        const step = Math.min(sequence.length, Math.max(1, params.step ?? 1));
        const promptTokens = ['<s>', 'Generate:'];
        const generatedTokens = sequence.slice(0, step);

        return (
          <div className="space-y-4">
            {/* Interactive Token Stream Container */}
            <div className="p-4 rounded-xl bg-white/70 border border-white/80 space-y-3">
              <div className="text-[10px] font-bold text-[#89726b] uppercase tracking-wider">
                Current Context Window (Sequential Conditioning)
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Fixed Prompt Prefix */}
                {promptTokens.map((tok, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-[#dfd9cf]/40 text-[#56423c] border border-[#dfd9cf]"
                    title="Prompt Token"
                  >
                    {tok}
                  </span>
                ))}

                {/* Generated Tokens */}
                {generatedTokens.map((tok, i) => {
                  const isLatest = i === generatedTokens.length - 1;
                  return (
                    <span
                      key={i}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                        isLatest
                          ? 'bg-[#9f4122] text-white shadow-md scale-105 ring-2 ring-[#ff8a65]/40 animate-pulse'
                          : 'bg-[#ff8a65]/20 text-[#752305] border border-[#ff8a65]/30'
                      }`}
                    >
                      {tok}
                    </span>
                  );
                })}

                {/* Cursor Indicator */}
                {step < sequence.length && (
                  <span className="w-2 h-5 bg-[#9f4122] rounded animate-ping inline-block opacity-75" />
                )}
              </div>
            </div>

            {/* Stepper Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={step <= 1}
                  onClick={() => setParams({ step: step - 1 })}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-white shadow-sm disabled:opacity-40 hover:bg-[#ff8a65]/10 text-[#1d1c15] cursor-pointer"
                >
                  ← Step Back
                </button>
                <button
                  type="button"
                  disabled={step >= sequence.length}
                  onClick={() => setParams({ step: step + 1 })}
                  className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#9f4122] text-white shadow-sm disabled:opacity-40 hover:bg-[#85341a] cursor-pointer"
                >
                  Predict Next Token →
                </button>
              </div>

              <span className="text-xs font-mono text-[#89726b]">
                Token Step {step} of {sequence.length}
              </span>
            </div>
          </div>
        );
      }}
    />
  );
}
