export const IST_TIME_ZONE = 'Asia/Kolkata';

export interface ExamDefinition {
  id: string;
  label: string;
  /**
   * Hard-coded start time with an explicit +05:30 offset. The browser's own
   * timezone is never consulted when computing the countdown.
   */
  target: string;
  /** Course outcomes in scope, in display order. */
  coIds: string[];
  /** COs that carry extra weight, if any. */
  heavierCoIds?: string[];
}

export const exams: ExamDefinition[] = [
  {
    id: 'mid-term',
    label: 'Mid-Term',
    target: '2026-12-14T08:00:00+05:30',
    coIds: ['CO1', 'CO2', 'CO3'],
  },
  {
    id: 'end-semester',
    label: 'End Semester',
    target: '2027-02-01T08:00:00+05:30',
    coIds: ['CO1', 'CO2', 'CO3', 'CO4', 'CO5', 'CO6'],
    heavierCoIds: ['CO4', 'CO5', 'CO6'],
  },
];

export function targetTime(target: string): number {
  return new Date(target).getTime();
}

/** e.g. "14 Dec 2026, 08:00 AM IST" — always rendered in IST. */
export function formatIstDateTime(target: string): string {
  const date = new Date(target);
  const day = new Intl.DateTimeFormat('en-GB', {
    timeZone: IST_TIME_ZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: IST_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
    .format(date)
    .toUpperCase();
  return `${day}, ${time} IST`;
}
