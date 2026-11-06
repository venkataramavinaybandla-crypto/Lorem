import { useEffect, useState } from 'react';
import type { Part } from '../content';

export interface SelfTestItem {
  id: string;
  conceptId: string;
  conceptTitle: string;
  kind: 'mcq' | 'card';
  /** Question / prompt shown on the front of the card. */
  prompt: string;
  /** Revealed answer text. */
  answer: string;
  options?: string[];
  answerIndex?: number;
  explanation?: string;
  /** Answers that should be shown as code (formulas). */
  isCode?: boolean;
}

const ITEMS_PER_TEST = 5;

function shorten(text: string, max = 320): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastStop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '));
  return `${lastStop > 80 ? cut.slice(0, lastStop + 1) : cut}…`;
}

/**
 * Builds a 5-item self-test for a part using only fields already present in the
 * part's YAML (quiz items, ELI5 definitions, key points, formulas, deep dives).
 * Nothing is generated from outside the source content.
 */
export function buildSelfTest(part: Part): SelfTestItem[] {
  const mcqs: SelfTestItem[] = [];
  const cards: SelfTestItem[] = [];

  for (const concept of part.concepts) {
    concept.quiz.forEach((quiz, quizIndex) => {
      const options = quiz.options ?? [];
      if (quiz.type !== 'mcq' || options.length < 2) return;
      if (
        typeof quiz.answer !== 'number' ||
        quiz.answer < 0 ||
        quiz.answer >= options.length
      ) {
        return;
      }

      mcqs.push({
        id: `${concept.id}-q${quizIndex}`,
        conceptId: concept.id,
        conceptTitle: concept.title,
        kind: 'mcq',
        prompt: quiz.question,
        options,
        answerIndex: quiz.answer,
        answer: `${String.fromCharCode(65 + quiz.answer)}. ${options[quiz.answer]}`,
        explanation: quiz.explanation,
      });
    });

    if (concept.eli5) {
      cards.push({
        id: `${concept.id}-eli5`,
        conceptId: concept.id,
        conceptTitle: concept.title,
        kind: 'card',
        prompt: `Define: ${concept.title}`,
        answer: concept.eli5,
      });
    }

    if (concept.key_points[0]) {
      cards.push({
        id: `${concept.id}-kp0`,
        conceptId: concept.id,
        conceptTitle: concept.title,
        kind: 'card',
        prompt: `Key takeaway: ${concept.title}`,
        answer: concept.key_points[0],
      });
    }

    if (concept.formulas[0]) {
      cards.push({
        id: `${concept.id}-formula0`,
        conceptId: concept.id,
        conceptTitle: concept.title,
        kind: 'card',
        prompt: `Formula used by ${concept.title}`,
        answer: concept.formulas[0],
        isCode: true,
      });
    }

    if (concept.deep_dive) {
      cards.push({
        id: `${concept.id}-deep`,
        conceptId: concept.id,
        conceptTitle: concept.title,
        kind: 'card',
        prompt: `Explain in more depth: ${concept.title}`,
        answer: shorten(concept.deep_dive),
      });
    }
  }

  const selected = [...mcqs.slice(0, 3), ...cards];
  const seen = new Set<string>();
  return selected
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .slice(0, ITEMS_PER_TEST);
}

const SCORES_KEY = 'lorem_selftest_scores_v1';
const SCORES_EVENT = 'lorem_selftest_updated';

export interface MasteryRecord {
  gotIt: number;
  seen: number;
}

export function getMasteryRecords(): Record<string, MasteryRecord> {
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    const records: Record<string, MasteryRecord> = {};
    for (const [coId, value] of Object.entries(parsed as Record<string, unknown>)) {
      const record = value as Partial<MasteryRecord> | null;
      if (!record) continue;
      const gotIt = Number(record.gotIt);
      const seen = Number(record.seen);
      if (Number.isFinite(gotIt) && Number.isFinite(seen) && seen > 0) {
        records[coId] = { gotIt, seen };
      }
    }
    return records;
  } catch {
    return {};
  }
}

export function recordSelfTest(coId: string, gotIt: number, seen: number): void {
  if (seen <= 0) return;
  try {
    const records = getMasteryRecords();
    const previous = records[coId] ?? { gotIt: 0, seen: 0 };
    records[coId] = {
      gotIt: previous.gotIt + gotIt,
      seen: previous.seen + seen,
    };
    localStorage.setItem(SCORES_KEY, JSON.stringify(records));
    window.dispatchEvent(new Event(SCORES_EVENT));
  } catch (error) {
    console.error('Failed to save self-test score', error);
  }
}

export function masteryPercentage(record: MasteryRecord | undefined): number {
  if (!record || record.seen <= 0) return 0;
  return Math.round((record.gotIt / record.seen) * 100);
}

export function useMasteryRecords(): Record<string, MasteryRecord> {
  const [records, setRecords] = useState<Record<string, MasteryRecord>>(() =>
    getMasteryRecords()
  );

  useEffect(() => {
    const refresh = () => setRecords(getMasteryRecords());
    window.addEventListener(SCORES_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(SCORES_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return records;
}
