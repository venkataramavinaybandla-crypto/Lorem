import { useState } from 'react';
import VizCardWrapper from './VizCardWrapper';
import type { VizComponentProps } from './types';

export default function StoppingConditionViz({ viz }: VizComponentProps) {
  const [stopMode, setStopMode] = useState<'max_tokens' | 'eos_token' | 'stop_sequence'>('max_tokens');

  return (
    <VizCardWrapper
      viz={viz}
      title="Generation Loop & Stopping Guardrails"
      renderVisual={(params) => {
        const maxTokens = Math.min(20, Math.max(1, params.max_tokens ?? 8));
        const sampleGenerated = [
          'Attention', 'mechanisms', 'allow', 'transformers', 'to', 'weight', 'context', 'dynamically',
          'across', 'all', 'preceding', 'input', 'tokens', 'in', 'the', 'sequence', 'effectively', 'period', '[EOS]', '.'
        ];

        let actualLength = maxTokens;
        let finishReason = 'length (max_tokens reached)';

        if (stopMode === 'eos_token') {
          actualLength = Math.min(maxTokens, 6);
          finishReason = actualLength < maxTokens ? 'stop (model emitted <eos>)' : 'length (max_tokens hit before <eos>)';
        } else if (stopMode === 'stop_sequence') {
          actualLength = Math.min(maxTokens, 8);
          finishReason = actualLength < maxTokens ? 'stop (matched stop string "dynamically")' : 'length';
        }

        const visibleTokens = sampleGenerated.slice(0, actualLength);

        return (
          <div className="space-y-4">
            {/* Mode selection toggles */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-[#89726b] uppercase mr-1">Condition Trigger:</span>
              <button
                type="button"
                onClick={() => setStopMode('max_tokens')}
                className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                  stopMode === 'max_tokens'
                    ? 'bg-[#9f4122] text-white shadow-sm'
                    : 'bg-white/80 text-[#56423c] border border-white'
                }`}
              >
                Max Output Tokens Cap
              </button>
              <button
                type="button"
                onClick={() => setStopMode('eos_token')}
                className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                  stopMode === 'eos_token'
                    ? 'bg-[#9f4122] text-white shadow-sm'
                    : 'bg-white/80 text-[#56423c] border border-white'
                }`}
              >
                Model &lt;eos&gt; End Token
              </button>
              <button
                type="button"
                onClick={() => setStopMode('stop_sequence')}
                className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                  stopMode === 'stop_sequence'
                    ? 'bg-[#9f4122] text-white shadow-sm'
                    : 'bg-white/80 text-[#56423c] border border-white'
                }`}
              >
                Custom Stop String
              </button>
            </div>

            {/* Simulated Generated Response Stream */}
            <div className="p-4 rounded-xl bg-white/70 border border-white/80 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#89726b]">
                <span>Emitted Tokens: {visibleTokens.length} / {maxTokens} allowed</span>
                <span className="font-bold text-[#9f4122] uppercase">Finish: {finishReason}</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {visibleTokens.map((t, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md text-xs font-mono bg-white border border-[#ddc0b8] text-[#1d1c15]"
                  >
                    {t}
                  </span>
                ))}
                {stopMode === 'eos_token' && actualLength < maxTokens && (
                  <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-[#d6ed7a] text-[#3f4c00]">
                    &lt;eos&gt;
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}
