import { Link } from 'react-router-dom';
import { useNow } from '../utils/useNow';
import { formatIstDateTime, targetTime } from '../utils/exams';
import { coTitles } from '../coTitles';

type Tone = 'normal' | 'warm' | 'urgent' | 'critical' | 'done';

const DAY_MS = 86_400_000;

function toneFor(remaining: number): Tone {
  if (remaining <= 0) return 'done';
  if (remaining < DAY_MS) return 'critical';
  if (remaining < 3 * DAY_MS) return 'urgent';
  if (remaining < 14 * DAY_MS) return 'warm';
  return 'normal';
}

const numberTone: Record<Tone, string> = {
  normal: 'text-[#1d1c15]',
  warm: 'text-[#9f4122]',
  urgent: 'text-[#752305]',
  critical: 'text-[#752305]',
  done: 'text-[#752305]',
};

const chipStyle: Record<'warm' | 'urgent' | 'critical', string> = {
  warm: 'bg-[#ff8a65]/20 text-[#752305] border-[#ff8a65]/30',
  urgent: 'bg-[#9f4122] text-white border-[#9f4122]',
  critical: 'bg-[#9f4122] text-white border-[#9f4122]',
};

const chipLabel: Record<'warm' | 'urgent' | 'critical', string> = {
  warm: 'Soon',
  urgent: 'Final days',
  critical: 'Under 24h',
};

function pad(value: number): string {
  return String(Math.max(0, value)).padStart(2, '0');
}

function Unit({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: string;
}) {
  return (
    <div className="flex-1 min-w-0 rounded-xl bg-white/70 border border-white/80 px-1 py-2 text-center">
      <div
        className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight tabular-nums leading-none ${tone}`}
      >
        {pad(value)}
      </div>
      <div className="mt-1 text-[9px] font-bold uppercase tracking-widest text-[#89726b]">
        {label}
      </div>
    </div>
  );
}

function Colon() {
  return (
    <span
      aria-hidden="true"
      className="pt-1 sm:pt-1.5 text-2xl font-bold text-[#89726b]/50 select-none"
    >
      :
    </span>
  );
}

export interface CountdownProps {
  /** ISO timestamp with an explicit offset, e.g. 2026-12-14T08:00:00+05:30. */
  target: string;
  label: string;
  /** Covered course outcomes, rendered as links under the counter. */
  cos: string[];
  heavierCos?: string[];
  /** Muted line shown under the counter only while the target is still ahead. */
  doomsday?: string;
}

export default function Countdown({
  target,
  label,
  cos,
  heavierCos = [],
  doomsday,
}: CountdownProps) {
  const now = useNow();
  const targetMs = targetTime(target);
  const mounted = now !== null;
  const remaining = mounted ? targetMs - now : 0;
  const passed = mounted && remaining <= 0;
  const tone = toneFor(remaining);

  const totalSeconds = Math.max(0, Math.floor(remaining / 1000));
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  const statusLabel =
    now === null || remaining > 0
      ? null
      : now - targetMs < DAY_MS
        ? 'Exam started'
        : 'Completed';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-[#9f4122]">
            event
          </span>
          <h3 className="text-sm font-bold text-[#1d1c15] tracking-tight">{label}</h3>
        </div>

        {mounted && !passed && tone !== 'normal' && tone !== 'done' && (
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${chipStyle[tone]}`}
          >
            {tone === 'critical' && (
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse motion-reduce:animate-none" />
            )}
            {chipLabel[tone]}
          </span>
        )}
      </div>

      {!mounted ? (
        // Nothing is rendered until the client clock is known (no flash of stale values).
        <div className="h-[76px]" aria-hidden="true" />
      ) : passed ? (
        <div className="h-[76px] flex items-center">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#752305]">
            {statusLabel}
          </span>
        </div>
      ) : (
        <div
          role="timer"
          aria-label={`${label} in ${days} days, ${hours} hours, ${minutes} minutes`}
          className="flex items-start gap-1 sm:gap-1.5"
        >
          <Unit value={days} label="Days" tone={numberTone[tone]} />
          <Colon />
          <Unit value={hours} label="Hours" tone={numberTone[tone]} />
          <Colon />
          <Unit value={minutes} label="Minutes" tone={numberTone[tone]} />
          <Colon />
          <Unit value={seconds} label="Seconds" tone={numberTone[tone]} />
        </div>
      )}

      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {cos.map((coId) => {
            const heavier = heavierCos.includes(coId);
            return (
              <Link
                key={coId}
                to={`/co/${coId}`}
                title={
                  heavier
                    ? `${coTitles[coId] ?? coId} — heavier emphasis`
                    : coTitles[coId] ?? coId
                }
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border transition-all focus-visible:outline-2 focus-visible:outline-[#9f4122] ${
                  heavier
                    ? 'bg-[#9f4122] text-white border-[#9f4122] hover:bg-[#85341a]'
                    : 'bg-white/80 text-[#56423c] border-[#ddc0b8] hover:bg-white hover:text-[#9f4122]'
                }`}
              >
                {coId}
                {heavier && <span className="font-sans font-semibold">heavier</span>}
              </Link>
            );
          })}
        </div>

        <p className="text-[10px] font-mono text-[#89726b]">{formatIstDateTime(target)}</p>

        {doomsday && mounted && !passed && (
          <p className="text-[10px] italic text-[#89726b] leading-snug">{doomsday}</p>
        )}
      </div>
    </div>
  );
}
