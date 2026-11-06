import React, { useState } from 'react';
import type { VizComponentProps, VizParam } from './types';
import { getActiveOutcome } from './evaluateCondition';

interface WrapperProps extends VizComponentProps {
  title?: string;
  renderVisual: (params: Record<string, number>, setParams: (p: Record<string, number>) => void) => React.ReactNode;
}

export default function VizCardWrapper({ viz, title, renderVisual }: WrapperProps) {
  // Initialize param state from YAML defaults
  const [params, setParams] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    if (viz.params) {
      for (const p of viz.params) {
        initial[p.name] = p.default ?? p.min ?? 0;
      }
    }
    return initial;
  });

  const activeOutcome = getActiveOutcome(viz.outcomes, params);

  const handleParamChange = (name: string, value: number) => {
    setParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleComboClick = (comboSet: Record<string, number>) => {
    setParams((prev) => ({ ...prev, ...comboSet }));
  };

  const formatTypeName = (type: string) => {
    return type
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  return (
    <div className="my-5 rounded-2xl border border-white/90 bg-[#fdfcff]/90 backdrop-blur-xl p-5 shadow-[0_4px_24px_rgba(159,65,34,0.04)] space-y-4">
      {/* Viz Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#89726b]/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#9f4122] text-[18px]">
            query_stats
          </span>
          <span className="text-xs font-bold text-[#1d1c15] uppercase tracking-wider">
            {title || formatTypeName(viz.type)}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ff8a65]/15 text-[#752305] border border-[#ff8a65]/20">
            Interactive
          </span>
        </div>

        {viz.description && (
          <p className="text-[11px] text-[#56423c] leading-tight max-w-md sm:text-right">
            {viz.description}
          </p>
        )}
      </div>

      {/* Main Interactive Controls */}
      {viz.params && viz.params.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#f3effb]/40 p-3 rounded-xl border border-white/60">
          {viz.params.map((p: VizParam) => {
            const currentVal = params[p.name] ?? p.default ?? p.min;
            return (
              <div key={p.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <label htmlFor={`param-${p.name}`} className="text-[#1d1c15]">
                    {p.label || p.name}
                  </label>
                  <span className="font-mono font-bold text-[#9f4122] bg-white/80 px-2 py-0.5 rounded-md border border-white text-[11px]">
                    {currentVal} {p.unit || ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id={`param-${p.name}`}
                    type="range"
                    min={p.min}
                    max={p.max}
                    step={p.step || 1}
                    value={currentVal}
                    onChange={(e) => handleParamChange(p.name, parseFloat(e.target.value))}
                    className="w-full accent-[#9f4122] cursor-pointer"
                  />
                  <input
                    type="number"
                    min={p.min}
                    max={p.max}
                    step={p.step || 1}
                    value={currentVal}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!isNaN(v)) handleParamChange(p.name, v);
                    }}
                    className="w-16 px-1.5 py-0.5 text-xs text-center font-mono rounded-lg border border-[#ddc0b8] bg-white text-[#1d1c15]"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Visual Canvas / Graph Section */}
      <div className="py-2">
        {renderVisual(params, setParams)}
      </div>

      {/* Live Explanation Panel (Cause & Effect) */}
      {activeOutcome && (
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            activeOutcome.severity === 'warn'
              ? 'bg-[#ff8a65]/10 border-[#ff8a65]/30 text-[#752305]'
              : activeOutcome.severity === 'error'
              ? 'bg-[#ffdad6]/40 border-[#ba1a1a]/30 text-[#93000a]'
              : 'bg-[#d6ed7a]/20 border-[#556500]/20 text-[#3f4c00]'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[16px]">
              {activeOutcome.severity === 'warn' ? 'warning' : 'info'}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider">
              {activeOutcome.title}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-[#1d1c15]/90">
            {activeOutcome.explain}
          </p>
        </div>
      )}

      {/* Combos To Try Pills */}
      {viz.combos_to_try && viz.combos_to_try.length > 0 && (
        <div className="pt-2 border-t border-[#89726b]/10 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold text-[#89726b] uppercase tracking-widest mr-1">
            Suggested Presets:
          </span>
          {viz.combos_to_try.map((combo, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleComboClick(combo.set)}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#9f4122] bg-white/90 border border-white hover:bg-[#ff8a65]/20 transition-all px-2.5 py-1 rounded-full cursor-pointer shadow-sm hover:scale-[1.02]"
              title={combo.lesson}
            >
              <span className="material-symbols-outlined text-[13px]">play_circle</span>
              <span>{combo.lesson || `Preset #${idx + 1}`}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
