import { useEffect, useMemo, useState } from 'react';
import type { Part } from '../content';
import { buildSelfTest, recordSelfTest } from '../utils/selfTest';
import MasteryRing from './MasteryRing';

interface SelfTestModalProps {
  coId: string;
  part: Part;
  onClose: () => void;
}

type Verdict = 'got' | 'revisit';

export default function SelfTestModal({ coId, part, onClose }: SelfTestModalProps) {
  const items = useMemo(() => buildSelfTest(part), [part]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<Record<string, Verdict>>({});
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const current = items[index];
  const gotCount = Object.values(results).filter((verdict) => verdict === 'got').length;

  const mark = (verdict: Verdict) => {
    if (!current) return;
    const nextResults: Record<string, Verdict> = { ...results, [current.id]: verdict };

    if (index + 1 >= items.length) {
      const got = Object.values(nextResults).filter((value) => value === 'got').length;
      recordSelfTest(coId, got, items.length);
      setResults(nextResults);
      setFinished(true);
    } else {
      setResults(nextResults);
      setIndex(index + 1);
      setFlipped(false);
    }
  };

  const restart = () => {
    setIndex(0);
    setFlipped(false);
    setResults({});
    setFinished(false);
  };

  const runPercentage = items.length > 0 ? Math.round((gotCount / items.length) * 100) : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Self-test for ${part.part.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#fdfcff] rounded-3xl border border-white/80 shadow-[0_20px_60px_rgba(159,65,34,0.12)] p-6 space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#9f4122]">
              Self-test · Part {part.part.order}
            </div>
            <h2 className="text-base font-bold text-[#1d1c15] tracking-tight truncate">
              {part.part.title}
            </h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-mono text-[#89726b]">
              {items.length === 0 ? 0 : finished ? items.length : index + 1} / {items.length}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close self-test"
              className="w-7 h-7 rounded-full bg-white/80 border border-white flex items-center justify-center text-[#89726b] shadow-sm hover:text-[#1d1c15] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>

        {items.length === 0 && (
          <div className="py-10 text-center space-y-2">
            <span className="material-symbols-outlined text-[32px] text-[#89726b]/40">quiz</span>
            <p className="text-xs font-semibold text-[#1d1c15]">No testable content in this part yet</p>
            <p className="text-[11px] text-[#89726b]">
              This part has no quiz items, definitions or key points to draw from.
            </p>
          </div>
        )}

        {items.length > 0 && !finished && current && (
          <>
            <div className="w-full bg-black/5 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#9f4122] to-[#ff8a65] transition-all duration-300"
                style={{ width: `${((index + (flipped ? 1 : 0)) / items.length) * 100}%` }}
              />
            </div>

            <div className="[perspective:1200px]">
              <div
                className={`relative h-[280px] w-full transition-transform duration-300 [transform-style:preserve-3d] ${
                  flipped ? '[transform:rotateY(180deg)]' : ''
                }`}
              >
                {/* Front */}
                <button
                  type="button"
                  onClick={() => setFlipped(true)}
                  className="absolute inset-0 h-full w-full text-left rounded-2xl border border-white/80 bg-white/70 p-5 shadow-sm [backface-visibility:hidden] overflow-y-auto cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded-full font-mono text-[9px] font-extrabold uppercase bg-[#9f4122]/10 text-[#9f4122] border border-[#9f4122]/20">
                      {current.kind === 'mcq' ? 'MCQ' : 'Flashcard'}
                    </span>
                    <span className="text-[10px] font-mono text-[#89726b] truncate">
                      {current.conceptTitle}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-[#1d1c15] leading-relaxed whitespace-pre-line">
                    {current.prompt}
                  </p>

                  {current.options && current.options.length > 0 && (
                    <div className="space-y-1.5 pt-3">
                      {current.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className="text-[11px] text-[#56423c] flex items-start gap-2 leading-relaxed"
                        >
                          <span className="font-mono font-bold text-[#89726b] shrink-0">
                            {String.fromCharCode(65 + optionIndex)}.
                          </span>
                          <span>{option}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="absolute bottom-4 left-5 right-5 flex items-center gap-1.5 text-[10px] font-semibold text-[#9f4122]">
                    <span className="material-symbols-outlined text-[14px]">flip</span>
                    <span>Click to reveal the answer</span>
                  </div>
                </button>

                {/* Back */}
                <button
                  type="button"
                  onClick={() => setFlipped(false)}
                  className="absolute inset-0 h-full w-full text-left rounded-2xl border border-[#9f4122]/20 bg-[#fff9ee] p-5 shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-y-auto cursor-pointer"
                >
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#9f4122] mb-2">
                    Answer
                  </div>

                  {current.isCode ? (
                    <pre className="text-[11px] font-mono text-[#1d1c15]/90 bg-white/70 rounded-xl border border-white px-3 py-2 overflow-x-auto whitespace-pre-wrap">
                      {current.answer}
                    </pre>
                  ) : (
                    <p className="text-xs text-[#1d1c15]/85 leading-relaxed whitespace-pre-line">
                      {current.answer}
                    </p>
                  )}

                  {current.explanation && (
                    <p className="text-[11px] text-[#56423c] leading-relaxed pt-3 mt-3 border-t border-[#89726b]/15">
                      <span className="font-bold text-[#9f4122]">Why: </span>
                      {current.explanation}
                    </p>
                  )}

                  <div className="absolute bottom-4 left-5 right-5 flex items-center gap-1.5 text-[10px] font-semibold text-[#89726b]">
                    <span className="material-symbols-outlined text-[14px]">flip</span>
                    <span>Click to flip back</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => mark('revisit')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border border-[#ddc0b8] bg-white/80 text-[#56423c] hover:border-[#9f4122] hover:text-[#9f4122] transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#9f4122]"
              >
                <span className="material-symbols-outlined text-[15px]">replay</span>
                Revisit
              </button>
              <button
                type="button"
                onClick={() => mark('got')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#9f4122] text-white shadow-[0_4px_16px_rgba(159,65,34,0.25)] hover:bg-[#85341a] transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#9f4122]"
              >
                <span className="material-symbols-outlined text-[15px]">check</span>
                Got it
              </button>
            </div>
          </>
        )}

        {items.length > 0 && finished && (
          <div className="space-y-5 text-center py-2">
            <div className="flex justify-center">
              <MasteryRing percentage={runPercentage} size={92} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-[#1d1c15]">
                {gotCount} of {items.length} marked got it
              </p>
              <p className="text-[11px] text-[#89726b]">
                Saved to {coId} mastery. Cumulative scores appear on the course cards.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={restart}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border border-[#ddc0b8] bg-white/80 text-[#56423c] hover:border-[#9f4122] hover:text-[#9f4122] transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#9f4122]"
              >
                <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                Retake
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#9f4122] text-white shadow-[0_4px_16px_rgba(159,65,34,0.25)] hover:bg-[#85341a] transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#9f4122]"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
