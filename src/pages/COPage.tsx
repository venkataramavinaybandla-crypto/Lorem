import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { getCO } from '../content';
import type { Part } from '../content';
import { coTitles, coDescriptions } from '../coTitles';
import CodeBlock from '../components/CodeBlock';
import GenericBlock from '../components/GenericBlock';
import VizRenderer from '../components/viz/VizRenderer';
import { useProgress } from '../utils/useProgress';
import SelfTestModal from '../components/SelfTestModal';

export default function COPage() {
  const { id } = useParams<{ id: string }>();
  const co = getCO(id ?? '');
  const { toggleConcept, isConceptCompleted, getCOProgress } = useProgress();
  const { hash } = useLocation();
  const [activeOrder, setActiveOrder] = useState<number | null>(null);
  const [activeTestPart, setActiveTestPart] = useState<Part | null>(null);
  const partRefs = useRef(new Map<number, HTMLElement>());

  // Deep links from search results (#concept-id or #part-N)
  useEffect(() => {
    if (!hash) return;
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash, co?.id]);

  if (!co) {
    return (
      <div className="text-center py-24 space-y-4 bg-white/50 backdrop-blur-xl rounded-3xl border border-white/80 p-8 shadow-sm">
        <div className="inline-block px-3.5 py-1 rounded-full text-xs font-bold bg-[#ff8a65]/20 text-[#752305]">
          404 Not Found
        </div>
        <h1 className="text-3xl font-bold text-[#1d1c15]">Course Outcome Not Found</h1>
        <p className="text-sm text-[#56423c] max-w-sm mx-auto">
          We could not find any syllabus details for module identifier "{id}".
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#9f4122] text-white text-xs font-bold hover:bg-[#85341a] transition-all shadow-md focus-visible:outline-2 focus-visible:outline-[#9f4122]"
          >
            ← Return to Curriculum Overview
          </Link>
        </div>
      </div>
    );
  }

  const partCount = co.parts.length;
  const partText = `${partCount} ${partCount === 1 ? 'part' : 'parts'}`;
  const conceptIds = co.parts.flatMap((p) => p.concepts.map((c) => c.id));
  const totalConcepts = conceptIds.length;
  const conceptsText = `${totalConcepts} ${totalConcepts === 1 ? 'concept' : 'concepts'}`;
  const progress = getCOProgress(conceptIds);

  const presentOrders = co.parts.map((part) => part.part.order);
  const active = activeOrder ?? presentOrders[0];
  const activeIndex = active === undefined ? -1 : presentOrders.indexOf(active);
  const canPrev = activeIndex > 0;
  const canNext = activeIndex >= 0 && activeIndex < presentOrders.length - 1;

  const goToIndex = (index: number) => {
    const order = presentOrders[index];
    if (order === undefined) return;
    setActiveOrder(order);
    partRefs.current.get(order)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const contentFolder = co.id.startsWith('CO')
    ? `CO-${co.id.slice(2)}`
    : 'content';

  return (
    <div className="space-y-12">
      {/* CO Header Banner Card */}
      <div className="relative bg-[#fdfcff]/80 backdrop-blur-2xl rounded-3xl border border-white/90 p-8 sm:p-10 shadow-[0_12px_40px_rgba(159,65,34,0.05)] overflow-hidden">
        {/* Soft decorative gradient wash */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#38bdf8]/15 via-[#c084fc]/10 to-[#ff8a65]/15 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Link to="/" className="text-[#89726b] hover:text-[#9f4122] transition-colors focus-visible:outline-2 focus-visible:outline-[#9f4122]">
              Overview
            </Link>
            <span className="text-[#ddc0b8]">/</span>
            <span className="text-[#9f4122] font-bold">{co.id}</span>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link
              to={`/co/${co.id}/cheat-sheet`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border border-[#ddc0b8] bg-white/80 text-[#56423c] hover:border-[#9f4122] hover:text-[#9f4122] transition-all focus-visible:outline-2 focus-visible:outline-[#9f4122]"
            >
              <span className="material-symbols-outlined text-[14px]">print</span>
              Print cheat sheet
            </Link>

            {/* Module Completion Meter */}
            <div className="flex items-center gap-2 bg-[#f3effb] px-3.5 py-1.5 rounded-full border border-[#ddc0b8] text-xs font-mono font-bold text-[#9f4122]">
              <span className="material-symbols-outlined text-[16px]">
                {progress.percentage === 100 ? 'task_alt' : 'incomplete_circle'}
              </span>
              <span>{progress.completed}/{progress.total} Completed ({progress.percentage}%)</span>
            </div>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1d1c15] mb-3 leading-tight">
          {coTitles[co.id] ?? co.title}
        </h1>

        <p className="text-sm sm:text-base text-[#56423c] leading-relaxed max-w-3xl mb-6 font-normal">
          {coDescriptions[co.id] ?? `${co.title} structured syllabus components.`}
        </p>

        {/* Progress bar in banner */}
        <div className="w-full bg-black/5 h-2 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-[#9f4122] to-[#ff8a65] transition-all duration-300"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[#89726b] pt-4 border-t border-[#89726b]/15">
          <span className="bg-white/80 px-3 py-1 rounded-full border border-white/80 text-[#1d1c15]">
            {partText}
          </span>
          <span className="bg-white/80 px-3 py-1 rounded-full border border-white/80 text-[#1d1c15]">
            {conceptsText}
          </span>
          <span className="text-[#89726b] ml-1">Course 25CS2207E</span>
        </div>
      </div>

      {/* Parts Navigator — every target slot is always visible */}
      <nav
        aria-label={`${co.id} parts navigator`}
        className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/80 p-5 shadow-[0_4px_24px_rgba(159,65,34,0.03)] space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-bold text-[#1d1c15] tracking-tight">Parts Navigator</h2>
            <span className="text-[11px] font-mono text-[#89726b]">
              {partCount} of {Math.max(co.partsTarget, partCount)} parts present
            </span>
            {co.emptySlots.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ff8a65]/20 text-[#752305] border border-[#ff8a65]/30 uppercase">
                {co.emptySlots.length} missing
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToIndex(activeIndex - 1)}
              disabled={!canPrev}
              aria-label="Previous part"
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-white/80 bg-white/70 text-[#56423c] shadow-sm transition-all hover:bg-white hover:text-[#9f4122] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/70 disabled:hover:text-[#56423c] focus-visible:outline-2 focus-visible:outline-[#9f4122]"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Prev
            </button>
            <button
              type="button"
              onClick={() => goToIndex(activeIndex + 1)}
              disabled={!canNext}
              aria-label="Next part"
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-white/80 bg-white/70 text-[#56423c] shadow-sm transition-all hover:bg-white hover:text-[#9f4122] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/70 disabled:hover:text-[#56423c] focus-visible:outline-2 focus-visible:outline-[#9f4122]"
            >
              Next
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

        <ol className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {co.partSlots.map((slot) => {
            const part = co.parts.find((candidate) => candidate.part.order === slot);

            if (!part) {
              return (
                <li key={slot}>
                  <div
                    aria-disabled="true"
                    title={`Part ${slot} has no YAML file yet`}
                    className="h-full rounded-2xl border border-dashed border-[#89726b]/30 bg-white/30 px-3 py-2.5"
                  >
                    <div className="text-[10px] font-mono font-bold text-[#89726b]">
                      PART {slot}
                    </div>
                    <div className="text-[11px] text-[#89726b] leading-snug">Not added yet</div>
                  </div>
                </li>
              );
            }

            const isActive = active === part.part.order;

            return (
              <li key={slot}>
                <button
                  type="button"
                  onClick={() => goToIndex(presentOrders.indexOf(part.part.order))}
                  aria-current={isActive ? 'true' : undefined}
                  className={`w-full h-full text-left rounded-2xl border px-3 py-2.5 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#9f4122] ${
                    isActive
                      ? 'bg-[#9f4122] border-[#9f4122] text-white shadow-md'
                      : 'bg-white/80 border-white/80 text-[#1d1c15] shadow-sm hover:bg-white hover:border-[#ff8a65]/40'
                  }`}
                >
                  <div
                    className={`text-[10px] font-mono font-bold ${
                      isActive ? 'text-white/80' : 'text-[#9f4122]'
                    }`}
                  >
                    PART {slot}
                  </div>
                  <div className="text-[11px] font-semibold leading-snug line-clamp-2">
                    {part.part.title}
                  </div>
                  <div
                    className={`text-[10px] font-mono mt-1 ${
                      isActive ? 'text-white/70' : 'text-[#89726b]'
                    }`}
                  >
                    {part.concepts.length}{' '}
                    {part.concepts.length === 1 ? 'concept' : 'concepts'}
                  </div>
                </button>
              </li>
            );
          })}
        </ol>

        {co.emptySlots.length > 0 && (
          <div className="pt-3 border-t border-[#89726b]/10 space-y-1">
            <p className="text-[11px] font-bold text-[#89726b] uppercase tracking-widest">
              Empty part slots
            </p>
            <p className="text-[11px] text-[#56423c] leading-relaxed">
              {co.id}:{' '}
              <span className="font-mono text-[#752305]">
                {co.emptySlots.map((slot) => `part ${slot}`).join(', ')}
              </span>
              {' — '}
              expected as{' '}
              <span className="font-mono text-[#56423c]">
                content/{contentFolder}/{co.id.toLowerCase()}_
                {String(co.emptySlots[0]).padStart(2, '0')}_*.yaml
              </span>{' '}
              and so on.
            </p>
          </div>
        )}
      </nav>

      {/* Parts Sections */}
      <div className="space-y-12">
        {co.parts.length === 0 && (
          <div className="rounded-3xl border border-dashed border-[#89726b]/30 bg-white/40 p-8 text-center space-y-2">
            <p className="text-sm font-semibold text-[#1d1c15]">
              No YAML files loaded for {co.id} yet
            </p>
            <p className="text-xs text-[#56423c]">
              Add files under content/{contentFolder}/ and they will appear here automatically.
            </p>
          </div>
        )}

        {co.parts.map((part) => {
          const cCount = part.concepts.length;
          const cText = `${cCount} ${cCount === 1 ? 'concept' : 'concepts'}`;

          return (
            <section
              key={part.part.id}
              id={`part-${part.part.order}`}
              ref={(element) => {
                if (element) partRefs.current.set(part.part.order, element);
                else partRefs.current.delete(part.part.order);
              }}
              className="space-y-5 scroll-mt-28"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#89726b]/20">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="bg-[#ff8a65]/20 text-[#752305] text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                    Part {part.part.order}
                  </span>
                  <h2 className="text-xl font-bold text-[#1d1c15] tracking-tight">
                    {part.part.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTestPart(part)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold border border-[#ddc0b8] bg-white/80 text-[#56423c] hover:border-[#9f4122] hover:text-[#9f4122] transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#9f4122]"
                  >
                    <span className="material-symbols-outlined text-[14px]">quiz</span>
                    Test yourself
                  </button>
                  <span className="text-xs font-mono text-[#89726b]">
                    {cText}
                  </span>
                </div>
              </div>

              {part.loadError && (
                <div className="p-4 rounded-2xl border border-[#ba1a1a]/20 bg-[#ba1a1a]/5">
                  <GenericBlock label="File could not be rendered" value={part.loadError} />
                  <p className="text-[10px] font-mono text-[#89726b] mt-2">
                    {part.sourcePath}
                  </p>
                </div>
              )}

              <div className="space-y-5">
                {part.concepts.length === 0 && !part.loadError && (
                  <div className="rounded-3xl border border-dashed border-[#89726b]/30 bg-white/40 p-6 text-center space-y-1">
                    <p className="text-xs font-semibold text-[#1d1c15]">
                      This part has no concepts yet
                    </p>
                    <p className="text-[11px] text-[#56423c]">
                      {part.sourcePath} was loaded but contains no concept entries.
                    </p>
                  </div>
                )}

                {part.concepts.map((concept) => (
                  <ConceptCard
                    key={concept.id}
                    concept={concept}
                    isDone={isConceptCompleted(concept.id)}
                    onToggleDone={() => toggleConcept(concept.id)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {activeTestPart && (
        <SelfTestModal
          key={activeTestPart.part.id}
          coId={co.id}
          part={activeTestPart}
          onClose={() => setActiveTestPart(null)}
        />
      )}
    </div>
  );
}

function formatQuizAnswer(quiz: import('../content').QuizItem): string {
  if (typeof quiz.answer === 'number') {
    const option = quiz.options?.[quiz.answer];
    return option
      ? `${String.fromCharCode(65 + quiz.answer)}. ${option}`
      : String(quiz.answer);
  }
  return quiz.answer;
}

function ConceptCard({
  concept,
  isDone,
  onToggleDone,
}: {
  concept: import('../content').Concept;
  isDone: boolean;
  onToggleDone: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const extraFields = Object.entries(concept.extra);

  return (
    <div
      id={concept.id}
      className={`rounded-3xl border transition-all scroll-mt-28 ${
        isDone
          ? 'bg-white/90 border-[#d6ed7a] shadow-[0_4px_20px_rgba(85,101,0,0.06)]'
          : 'border-white/80 bg-white/60 backdrop-blur-xl shadow-[0_4px_24px_rgba(159,65,34,0.03)] hover:bg-white/70'
      }`}
    >
      {/* Header Button */}
      <div className="p-6 flex items-start justify-between gap-4">
        {/* Checkbox toggle for completion */}
        <button
          type="button"
          onClick={onToggleDone}
          className={`mt-1 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#9f4122] ${
            isDone
              ? 'bg-[#556500] border-[#556500] text-white shadow-sm'
              : 'border-[#ddc0b8] bg-white hover:border-[#9f4122] text-transparent'
          }`}
          title={isDone ? 'Mark as incomplete' : 'Mark section as done'}
          aria-label={isDone ? `Mark ${concept.title} as incomplete` : `Mark ${concept.title} as completed`}
        >
          <span className="material-symbols-outlined text-[16px] font-bold">check</span>
        </button>

        <button
          onClick={() => setExpanded(!expanded)}
          type="button"
          className="text-left flex-1 min-w-0 cursor-pointer space-y-2 focus-visible:outline-2 focus-visible:outline-[#9f4122] rounded-xl"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-extrabold bg-[#9f4122]/10 text-[#9f4122] border border-[#9f4122]/20">
              {concept.code}
            </span>

            {isDone && (
              <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-[#d6ed7a] text-[#3f4c00]">
                ✓ Completed
              </span>
            )}

            {concept.session !== '' && (
              <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] bg-white/80 text-[#56423c] border border-[#ddc0b8]">
                Session {concept.session}
              </span>
            )}

            {concept.difficulty !== undefined && (
              <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] bg-white/80 text-[#56423c] border border-[#ddc0b8]">
                Difficulty: {concept.difficulty}
              </span>
            )}

            {concept.btl !== undefined && (
              <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] bg-white/80 text-[#56423c] border border-[#ddc0b8]">
                BTL: {concept.btl}
              </span>
            )}

            {concept.skilling_exp !== undefined && (
              <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] bg-white/80 text-[#56423c] border border-[#ddc0b8]">
                Skilling Exp: {concept.skilling_exp}
              </span>
            )}

            {concept.exam_tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#d6ed7a]/50 text-[#3f4c00] border border-[#d6ed7a] uppercase"
              >
                {tag}
              </span>
            ))}
          </div>

          <h3 className="text-lg font-bold text-[#1d1c15] tracking-tight">{concept.title}</h3>

          {/* ELI5 preview */}
          {concept.eli5 && (
            <p className="text-xs sm:text-sm text-[#56423c] leading-relaxed pt-1">
              <span className="font-bold text-[#9f4122]">Plain English: </span>
              {concept.eli5}
            </p>
          )}
        </button>

        <div className="pt-1 shrink-0">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="w-8 h-8 rounded-full bg-white/80 border border-white flex items-center justify-center text-[#89726b] shadow-sm hover:text-[#1d1c15] cursor-pointer"
            aria-label={expanded ? 'Collapse section' : 'Expand section'}
          >
            <span
              className={`material-symbols-outlined text-[18px] transition-transform ${
                expanded ? 'rotate-180' : ''
              }`}
            >
              expand_more
            </span>
          </button>
        </div>
      </div>

      {/* Expanded Concept Content */}
      {expanded && (
        <div className="px-6 pb-6 pt-2 border-t border-[#89726b]/10 space-y-6 text-xs text-[#56423c]">
          {/* Key Points */}
          {concept.key_points.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-[#9f4122]">
                Key Takeaways
              </h4>
              <ul className="space-y-1.5 pl-1">
                {concept.key_points.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[#1d1c15]/85 leading-relaxed">
                    <span className="text-[#9f4122] mt-0.5 shrink-0 text-sm leading-none">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Deep Dive */}
          {concept.deep_dive && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-[#89726b]">
                Deep Dive &amp; Architecture Notes
              </h4>
              <p className="text-[#1d1c15]/80 leading-relaxed bg-white/50 p-4 rounded-2xl border border-white shadow-sm whitespace-pre-line">
                {concept.deep_dive}
              </p>
            </div>
          )}

          {/* Prerequisites */}
          {concept.prereqs && concept.prereqs.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-[#89726b]">
                Prerequisites
              </h4>
              <div className="flex flex-wrap items-center gap-2">
                {concept.prereqs.map((prereq) => (
                  <span
                    key={prereq}
                    className="px-2.5 py-0.5 rounded-full font-mono text-[10px] bg-white/80 text-[#56423c] border border-[#ddc0b8]"
                  >
                    {prereq}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Formulas */}
          {concept.formulas.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-[#89726b]">
                Formulas
              </h4>
              <div className="space-y-2">
                {concept.formulas.map((formula, idx) => (
                  <CodeBlock key={idx} code={formula} language="mathematical formulation" />
                ))}
              </div>
            </div>
          )}

          {/* Interactive Visualization (Engine Component) */}
          {concept.viz && (
            <div className="space-y-2">
              <VizRenderer viz={concept.viz} />
            </div>
          )}

          {/* Common Mistakes */}
          {concept.common_mistakes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-[#ba1a1a]">
                Common Misconceptions &amp; Mistakes
              </h4>
              <ul className="space-y-1.5 pl-1">
                {concept.common_mistakes.map((mistake, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[#93000a] leading-relaxed">
                    <span className="material-symbols-outlined text-[16px] text-[#ba1a1a] shrink-0">
                      warning
                    </span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mini Task */}
          {concept.mini_task && (
            <div className="p-4 rounded-2xl border border-[#9f4122]/20 bg-[#ff8a65]/10 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#9f4122]">
                  task_alt
                </span>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#752305]">
                  Practical Exercise
                </span>
              </div>
              <p className="text-[#1d1c15] font-medium leading-relaxed">{concept.mini_task}</p>
            </div>
          )}

          {/* Quiz Preview */}
          {concept.quiz.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-[#89726b]">
                Self-Assessment Quiz ({concept.quiz.length} {concept.quiz.length === 1 ? 'question' : 'questions'})
              </h4>
              <div className="space-y-3">
                {concept.quiz.map((q, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-white/80 bg-white/70 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#89726b]">
                      <span className="uppercase font-bold text-[#9f4122]">{q.type}</span>
                      <span>Item #{idx + 1}</span>
                    </div>

                    <p className="text-[#1d1c15] font-semibold leading-relaxed">{q.question}</p>

                    {q.options && q.options.length > 0 && (
                      <div className="space-y-1 pt-1 pl-1">
                        {q.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className="text-[#56423c] text-xs flex items-start gap-2 leading-relaxed"
                          >
                            <span className="font-mono font-bold text-[#89726b] shrink-0">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {q.answer !== '' && q.answer !== undefined && (
                      <div className="text-[11px] text-[#56423c] leading-relaxed">
                        <span className="font-bold text-[#9f4122]">Answer: </span>
                        {formatQuizAnswer(q)}
                      </div>
                    )}

                    {q.explanation && (
                      <div className="text-[11px] text-[#56423c] pt-2 border-t border-[#89726b]/10 leading-relaxed">
                        <span className="font-bold text-[#9f4122]">Explanation: </span>
                        {q.explanation}
                      </div>
                    )}

                    {Object.entries(q.extra).length > 0 && (
                      <div className="pt-2 border-t border-[#89726b]/10 space-y-3">
                        {Object.entries(q.extra).map(([key, value]) => (
                          <GenericBlock key={key} label={key} value={value} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Any field without a dedicated renderer, rendered generically */}
          {extraFields.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-[#89726b]/10">
              {extraFields.map(([key, value]) => (
                <GenericBlock key={key} label={key} value={value} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
