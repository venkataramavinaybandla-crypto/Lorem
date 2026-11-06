import type { ReactNode } from 'react';
import GenericBlock from '../GenericBlock';

interface GenericVizProps {
  viz: Record<string, unknown>;
}

const KNOWN_KEYS = new Set(['type', 'description', 'params', 'compute', 'outcomes', 'combos_to_try']);

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function formatTypeName(type: string): string {
  return type
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function toText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

/**
 * Renders a visualization definition that has no dedicated interactive component.
 * Every part of the definition (description, parameters, computation, outcomes,
 * presets and any extra keys) is displayed so nothing is silently dropped.
 */
export default function GenericViz({ viz }: GenericVizProps) {
  const type = toText(viz.type) || 'Visualization';
  const description = toText(viz.description);
  const params = Array.isArray(viz.params) ? viz.params : [];
  const outcomes = Array.isArray(viz.outcomes) ? viz.outcomes : [];
  const combos = Array.isArray(viz.combos_to_try) ? viz.combos_to_try : [];
  const compute = viz.compute;
  const extraKeys = Object.keys(viz).filter((key) => !KNOWN_KEYS.has(key));

  const objectParams = params
    .map((param) => asRecord(param))
    .filter((param): param is Record<string, unknown> => Boolean(param));
  const textParams = params.filter((param) => typeof param === 'string') as string[];

  let computeBody: ReactNode = null;
  if (typeof compute === 'string' || typeof compute === 'number' || typeof compute === 'boolean') {
    computeBody = (
      <p className="text-[#1d1c15]/80 leading-relaxed bg-white/60 p-3.5 rounded-xl border border-white">
        {String(compute)}
      </p>
    );
  } else if (asRecord(compute)) {
    computeBody = (
      <div className="space-y-3">
        {Object.entries(asRecord(compute)!).map(([key, value]) => (
          <GenericBlock key={key} label={key} value={value} />
        ))}
      </div>
    );
  }

  return (
    <div className="my-5 rounded-2xl border border-white/90 bg-[#fdfcff]/90 backdrop-blur-xl p-5 shadow-[0_4px_24px_rgba(159,65,34,0.04)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-[#89726b]/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#9f4122] text-[18px]">insights</span>
          <span className="text-xs font-bold text-[#1d1c15] uppercase tracking-wider">
            {formatTypeName(type)}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f3effb] text-[#56423c] border border-[#ddc0b8]">
            {type}
          </span>
        </div>

        {description && (
          <p className="text-[11px] text-[#56423c] leading-snug max-w-md sm:text-right">
            {description}
          </p>
        )}
      </div>

      {/* Parameters */}
      {params.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#89726b]">
            Parameters
          </h4>

          {textParams.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {textParams.map((param, index) => (
                <span
                  key={`${param}-${index}`}
                  className="px-2.5 py-0.5 rounded-full font-mono text-[10px] bg-white/80 text-[#56423c] border border-[#ddc0b8]"
                >
                  {param}
                </span>
              ))}
            </div>
          )}

          {objectParams.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {objectParams.map((param, index) => {
                const name = toText(param.name) || `param_${index + 1}`;
                const label = toText(param.label) || name;
                const unit = toText(param.unit);
                const min = toText(param.min);
                const max = toText(param.max);
                const step = toText(param.step);
                const fallback = toText(param.default);

                return (
                  <div
                    key={`${name}-${index}`}
                    className="bg-white/60 rounded-xl border border-white px-3 py-2 space-y-0.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-[#1d1c15]">{label}</span>
                      <span className="text-[10px] font-mono text-[#9f4122]">
                        {fallback}
                        {unit ? ` ${unit}` : ''}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-[#89726b]">
                      {name}
                      {min || max ? ` · ${min || '?'}–${max || '?'}` : ''}
                      {step ? ` · step ${step}` : ''}
                      {unit ? ` · ${unit}` : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Compute */}
      {computeBody && (
        <div className="space-y-2">
          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#89726b]">
            How It Computes
          </h4>
          {computeBody}
        </div>
      )}

      {/* Outcomes */}
      {outcomes.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#89726b]">
            Outcomes ({outcomes.length})
          </h4>
          <div className="space-y-2">
            {outcomes.map((outcome, index) => {
              const outcomeRecord = asRecord(outcome);

              if (!outcomeRecord) {
                return (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-[11px] text-[#1d1c15]/85 leading-relaxed bg-white/50 rounded-xl border border-white px-3 py-2"
                  >
                    <span className="text-[#9f4122] shrink-0">•</span>
                    <span>{toText(outcome)}</span>
                  </div>
                );
              }

              const severity = toText(outcomeRecord.severity);
              const tone =
                severity === 'warn'
                  ? 'bg-[#ff8a65]/10 border-[#ff8a65]/30'
                  : severity === 'error'
                    ? 'bg-[#ffdad6]/40 border-[#ba1a1a]/30'
                    : 'bg-[#d6ed7a]/15 border-[#556500]/20';

              return (
                <div
                  key={index}
                  className={`rounded-xl border px-3 py-2 space-y-1 ${tone}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-[#1d1c15]">
                      {toText(outcomeRecord.title)}
                    </span>
                    {toText(outcomeRecord.when) && (
                      <span className="text-[10px] font-mono text-[#89726b]">
                        when {toText(outcomeRecord.when)}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#1d1c15]/85 leading-relaxed">
                    {toText(outcomeRecord.explain)}
                  </p>
                  {severity && (
                    <span className="inline-block text-[9px] font-mono uppercase tracking-wider text-[#89726b]">
                      {severity}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Presets */}
      {combos.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-[#89726b]/10">
          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#89726b]">
            Combinations To Try
          </h4>
          <div className="space-y-1.5">
            {combos.map((combo, index) => {
              const comboRecord = asRecord(combo) ?? {};
              const set = asRecord(comboRecord.set);
              return (
                <div
                  key={index}
                  className="text-[11px] text-[#56423c] leading-relaxed bg-white/50 rounded-xl border border-white px-3 py-2"
                >
                  {set && Object.keys(set).length > 0 && (
                    <span className="font-mono text-[10px] text-[#9f4122] mr-2">
                      {Object.entries(set)
                        .map(([key, value]) => `${key}=${toText(value)}`)
                        .join(', ')}
                    </span>
                  )}
                  <span>{toText(comboRecord.lesson)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Anything else present in the definition */}
      {extraKeys.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-[#89726b]/10">
          {extraKeys.map((key) => (
            <GenericBlock key={key} label={key} value={viz[key]} />
          ))}
        </div>
      )}
    </div>
  );
}
