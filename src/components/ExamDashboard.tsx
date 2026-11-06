import Countdown from './Countdown';
import { exams } from '../utils/exams';

const DOOMSDAY = 'Doomsday arrives 18 Dec 2026. Finish CO1-CO3 first.';

export default function ExamDashboard() {
  return (
    <section className="max-w-6xl mx-auto px-6 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#89726b]/15">
        <span className="text-xs font-bold text-[#89726b] uppercase tracking-widest">
          Exam Countdown
        </span>
        <span className="text-[11px] font-mono text-[#89726b]">
          Live · IST
        </span>
      </div>

      <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-[0_8px_32px_rgba(159,65,34,0.04)] p-6 sm:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          {exams.map((exam, index) => (
            <div
              key={exam.id}
              className={
                index === 0 ? 'sm:pr-8 sm:border-r sm:border-[#89726b]/15' : ''
              }
            >
              <Countdown
                target={exam.target}
                label={exam.label}
                cos={exam.coIds}
                heavierCos={exam.heavierCoIds}
                doomsday={exam.id === 'mid-term' ? DOOMSDAY : undefined}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
