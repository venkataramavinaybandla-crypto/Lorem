import { Link, useParams } from 'react-router-dom';
import { getCO } from '../content';
import { coTitles } from '../coTitles';

export default function CheatSheet() {
  const { id } = useParams<{ id: string }>();
  const co = getCO(id ?? '');

  if (!co) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold text-[#1d1c15]">Course Outcome Not Found</h1>
          <p className="text-sm text-[#56423c]">No cheat sheet exists for "{id}".</p>
          <Link to="/" className="inline-block px-5 py-2 rounded-full bg-[#9f4122] text-white text-xs font-bold">
            Back to Overview
          </Link>
        </div>
      </div>
    );
  }

  const conceptTotal = co.parts.reduce((sum, part) => sum + part.concepts.length, 0);

  return (
    <div className="min-h-screen bg-[#f3effb] print:bg-white">
      {/* Screen-only toolbar (never printed) */}
      <div className="print-hidden sticky top-0 z-10 bg-[#fdfcff]/85 backdrop-blur-xl border-b border-[#89726b]/15">
        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center justify-between gap-3">
          <Link
            to={`/co/${co.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#56423c] hover:text-[#9f4122] transition-colors focus-visible:outline-2 focus-visible:outline-[#9f4122] rounded-full"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to {co.id}
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#9f4122] text-white shadow-[0_4px_16px_rgba(159,65,34,0.25)] hover:bg-[#85341a] transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#9f4122]"
          >
            <span className="material-symbols-outlined text-[15px]">print</span>
            Print / Save as PDF
          </button>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-5 sm:px-8 py-8 print:max-w-none print:px-0 print:py-0">
        <article className="bg-white rounded-3xl border border-white/80 shadow-[0_8px_32px_rgba(159,65,34,0.05)] p-6 sm:p-10 print:rounded-none print:border-0 print:shadow-none print:p-0">
          <header className="pb-4 mb-6 border-b border-[#89726b]/20 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-[#9f4122]">
                Cheat Sheet
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f3effb] text-[#56423c] border border-[#ddc0b8] print:bg-transparent print:border-[#89726b]">
                {co.id}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1d1c15]">
              {coTitles[co.id] ?? co.title}
            </h1>
            <p className="text-[11px] font-mono text-[#89726b]">
              {co.parts.length} {co.parts.length === 1 ? 'part' : 'parts'} · {conceptTotal}{' '}
              {conceptTotal === 1 ? 'concept' : 'concepts'} · 25CS2207E
            </p>
          </header>

          <div className="space-y-7">
            {co.parts.map((part) => (
              <section key={part.part.id} className="space-y-4 break-inside-avoid-page">
                <h2 className="text-sm font-extrabold uppercase tracking-widest text-[#752305] border-b border-[#9f4122]/20 pb-1.5 break-after-avoid">
                  Part {part.part.order} — {part.part.title}
                </h2>

                {part.concepts.length === 0 && (
                  <p className="text-xs text-[#89726b]">No concepts in this part.</p>
                )}

                <div className="space-y-4">
                  {part.concepts.map((concept) => (
                    <div
                      key={concept.id}
                      className="break-inside-avoid space-y-1.5"
                    >
                      <h3 className="text-[13px] font-bold text-[#1d1c15] leading-snug">
                        <span className="font-mono text-[10px] font-extrabold text-[#9f4122] mr-2">
                          {concept.code}
                        </span>
                        {concept.title}
                      </h3>

                      {concept.key_points.length > 0 && (
                        <ul className="space-y-1 pl-1">
                          {concept.key_points.map((point, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-[11px] text-[#56423c] leading-relaxed"
                            >
                              <span className="text-[#9f4122] shrink-0 leading-none mt-0.5">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {concept.formulas.length > 0 && (
                        <div className="space-y-1">
                          {concept.formulas.map((formula, index) => (
                            <pre
                              key={index}
                              className="text-[10.5px] font-mono text-[#1d1c15] bg-[#f3effb]/60 border border-[#ddc0b8]/60 rounded-lg px-3 py-2 overflow-x-auto whitespace-pre-wrap print:bg-transparent print:border-[#89726b]"
                            >
                              {formula}
                            </pre>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <footer className="mt-8 pt-4 border-t border-[#89726b]/20 text-[10px] font-mono text-[#89726b] flex items-center justify-between">
            <span>Lorem · Generative AI and AI Platform Engineering</span>
            <span>{co.id} quick reference</span>
          </footer>
        </article>
      </main>
    </div>
  );
}
