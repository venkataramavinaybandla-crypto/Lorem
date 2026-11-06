import { Link } from 'react-router-dom';
import { allCOs } from '../content';
import { coTitles, coDescriptions } from '../coTitles';
import { useProgress } from '../utils/useProgress';
import { useMasteryRecords, masteryPercentage } from '../utils/selfTest';
import ExamDashboard from '../components/ExamDashboard';
import MasteryRing from '../components/MasteryRing';

export default function Home() {
  const { getCOProgress } = useProgress();
  const masteryRecords = useMasteryRecords();

  const totalParts = allCOs.reduce((acc, co) => acc + co.parts.length, 0);
  const totalConcepts = allCOs.reduce(
    (acc, co) => acc + co.parts.reduce((pAcc, p) => pAcc + p.concepts.length, 0),
    0
  );

  const partsText = `${totalParts} ${totalParts === 1 ? 'part' : 'parts'}`;
  const conceptsText = `${totalConcepts} ${totalConcepts === 1 ? 'concept' : 'concepts'}`;

  // Gradients for the 6 CO cards
  const coGradients = [
    {
      wash: 'from-[#38bdf8]/20 via-[#c084fc]/15 to-[#ff8a65]/20',
      badge: 'bg-[#ff8a65]/20 text-[#752305]',
      accent: '#9f4122',
      tag: '01 / 06',
    },
    {
      wash: 'from-[#ff8a65]/20 via-[#fcd34d]/15 to-[#38bdf8]/20',
      badge: 'bg-[#d6ed7a]/40 text-[#3f4c00]',
      accent: '#556500',
      tag: '02 / 06',
    },
    {
      wash: 'from-[#38bdf8]/25 via-[#80b1c7]/20 to-[#dfd9cf]/30',
      badge: 'bg-[#80b1c7]/30 text-[#074457]',
      accent: '#326578',
      tag: '03 / 06',
    },
    {
      wash: 'from-[#c084fc]/20 via-[#ff8a65]/15 to-[#fff9ee]',
      badge: 'bg-[#c084fc]/20 text-[#581c87]',
      accent: '#7f2a0d',
      tag: '04 / 06',
    },
    {
      wash: 'from-[#d6ed7a]/30 via-[#38bdf8]/15 to-[#ff8a65]/20',
      badge: 'bg-[#d6ed7a]/50 text-[#3f4c00]',
      accent: '#5a6c00',
      tag: '05 / 06',
    },
    {
      wash: 'from-[#80b1c7]/25 via-[#ffb59e]/25 to-[#c084fc]/15',
      badge: 'bg-[#ffb59e]/40 text-[#752305]',
      accent: '#9f4122',
      tag: '06 / 06',
    },
  ];

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-6 max-w-6xl mx-auto flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Soft atmospheric gradient wash behind hero with subtle peach wash at top-right */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#38bdf8]/10 via-[#c084fc]/10 to-transparent -z-10 rounded-3xl blur-2xl" />
        <div className="absolute -top-12 -right-12 w-96 h-96 bg-[radial-gradient(ellipse_at_center,_rgba(255,138,101,0.18)_0%,_transparent_70%)] pointer-events-none -z-10 blur-xl" />

        <div className="inline-flex items-center gap-2 bg-[#fdfcff]/80 backdrop-blur-xl border border-white/90 rounded-full px-4 py-1.5 mb-8 shadow-[0_4px_20px_rgba(159,65,34,0.04)]">
          <span className="bg-[#d6ed7a] text-[#5a6c00] font-bold text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            25CS2207E
          </span>
          <span className="text-xs font-semibold text-[#1d1c15]">
            Generative AI and AI Platform Engineering
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#1d1c15] max-w-4xl mb-6 leading-[1.1]">
          Learn with <span className="text-[#9f4122]">Lorem</span>
        </h1>

        <p className="text-base sm:text-lg text-[#56423c] max-w-2xl mb-10 leading-relaxed font-normal">
          Master the complete outside-in progression from raw tokenization to production-grade,
          governed AI platforms across {partsText} and {conceptsText}.
        </p>

        {/* Hero Interactive Prompt / Action bar matching Image 2 reference */}
        <div className="w-full max-w-2xl bg-white/70 rounded-3xl border border-white/80 shadow-[0_12px_40px_rgba(159,65,34,0.06)] p-4 sm:p-5 mb-8 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto text-left">
              <div className="w-10 h-10 rounded-2xl bg-[#ff8a65]/20 text-[#9f4122] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
              </div>
              <div>
                <div className="text-xs font-bold text-[#1d1c15]">Explore Comprehensive Curriculum</div>
                <div className="text-[11px] text-[#89726b]">Structured outside-in course trajectory (CO1 – CO6)</div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Link
                to="/co/CO1"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#9f4122] text-white text-xs font-bold px-6 py-3 rounded-full shadow-[0_4px_16px_rgba(159,65,34,0.25)] hover:bg-[#85341a] transition-all hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-[#9f4122]"
              >
                <span>Enter Course</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick pill tag links */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {allCOs.map((co) => (
            <Link
              key={co.id}
              to={`/co/${co.id}`}
              className="bg-white/50 text-[#1d1c15] border border-white/80 shadow-sm rounded-full px-4 py-1.5 text-xs font-medium hover:bg-white hover:text-[#9f4122] transition-all backdrop-blur-md focus-visible:outline-2 focus-visible:outline-[#9f4122]"
            >
              {co.id}: {coTitles[co.id] ?? co.title}
            </Link>
          ))}
        </div>
      </section>

      {/* Exam countdown */}
      <ExamDashboard />

      {/* 6 CO Feature Cards */}
      <section className="max-w-6xl mx-auto px-6 space-y-10">
        <div className="flex items-center justify-between pb-2 border-b border-[#89726b]/15">
          <span className="text-xs font-bold text-[#89726b] uppercase tracking-widest">
            Course Outcomes Catalog
          </span>
          <span className="text-xs font-mono text-[#89726b]">01 – 06 Modules</span>
        </div>

        <div className="space-y-8">
          {allCOs.map((co, index) => {
            const style = coGradients[index % coGradients.length];
            const partCount = co.parts.length;
            const partStr = `${partCount} ${partCount === 1 ? 'part' : 'parts'}`;
            const conceptIds = co.parts.flatMap((p) => p.concepts.map((c) => c.id));
            const conceptCount = conceptIds.length;
            const conceptStr = `${conceptCount} ${conceptCount === 1 ? 'concept' : 'concepts'}`;
            const progress = getCOProgress(conceptIds);

            return (
              <div
                key={co.id}
                className="bg-white/50 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-[0_8px_32px_rgba(159,65,34,0.04)] overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-[0_16px_48px_rgba(159,65,34,0.08)] group"
              >
                {/* Content Side */}
                <div className="p-8 sm:p-12 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-6">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-extrabold text-[#89726b] tracking-widest uppercase">
                          {style.tag}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/80 border border-white text-[#56423c]">
                          {co.id}
                        </span>
                      </div>

                      {/* Progress + mastery */}
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#f3effb] text-[#9f4122] border border-[#ddc0b8]">
                          {progress.completed}/{progress.total} done ({progress.percentage}%)
                        </span>
                        <MasteryRing percentage={masteryPercentage(masteryRecords[co.id])} />
                      </div>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-bold text-[#1d1c15] mb-4 tracking-tight leading-tight group-hover:text-[#9f4122] transition-colors">
                      {coTitles[co.id] ?? co.title}
                    </h3>

                    <p className="text-sm text-[#56423c] mb-8 leading-relaxed max-w-lg">
                      {coDescriptions[co.id] ?? `${partStr} covering ${co.title}.`}
                    </p>

                    {/* Progress Bar on Home Card */}
                    {progress.total > 0 && (
                      <div className="mb-6 space-y-1">
                        <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#9f4122] to-[#ff8a65] transition-all duration-300 rounded-full"
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[#89726b]/10">
                    <Link
                      to={`/co/${co.id}`}
                      className="inline-flex items-center gap-2 bg-white/70 border border-white shadow-sm backdrop-blur-md text-[#1d1c15] font-semibold text-xs px-6 py-3 rounded-full hover:bg-white hover:text-[#9f4122] hover:scale-105 transition-all focus-visible:outline-2 focus-visible:outline-[#9f4122]"
                    >
                      <span>Explore {co.id}</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>

                    <div className="text-xs font-mono text-[#89726b]">
                      <span>{partStr}</span>
                      <span className="mx-2">·</span>
                      <span>{conceptStr}</span>
                    </div>
                  </div>
                </div>

                {/* Visual Glass Gradient Preview Side */}
                <div className="flex-1 bg-gradient-to-br from-white/30 via-white/10 to-transparent relative overflow-hidden flex items-center justify-center p-8 md:p-12 border-t md:border-t-0 md:border-l border-white/60 min-h-[260px]">
                  {/* Pastel background blur bubble */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${style.wash} opacity-60 group-hover:opacity-80 transition-opacity`}
                  />

                  {/* Floating inner glass panel */}
                  <div className="relative z-10 w-full max-w-sm bg-white/70 backdrop-blur-2xl rounded-2xl border border-white/90 shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-black/5 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#9f4122]" />
                        <span className="text-xs font-bold text-[#1d1c15]">{co.id} Overview</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#89726b]">{partStr}</span>
                    </div>

                    <div className="space-y-2">
                      {co.parts.slice(0, 3).map((p) => (
                        <div
                          key={p.part.id}
                          className="bg-white/60 rounded-xl p-2.5 border border-white/60 flex items-center justify-between text-xs"
                        >
                          <span className="text-[#1d1c15] font-medium truncate pr-2">
                            {p.part.title}
                          </span>
                          <span className="text-[10px] font-mono text-[#89726b] shrink-0">
                            {p.concepts.length} {p.concepts.length === 1 ? 'concept' : 'concepts'}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] font-semibold text-[#9f4122]">
                      <span>Curriculum verified</span>
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
