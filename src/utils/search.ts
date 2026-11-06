import { allCOs } from '../content';
import type { Concept } from '../content';

export type SearchMatchType =
  | 'part'
  | 'title'
  | 'code'
  | 'eli5'
  | 'key_points'
  | 'formulas'
  | 'deep_dive'
  | 'common_mistakes'
  | 'mini_task'
  | 'exam_tags'
  | 'extra';

export interface SearchResult {
  coId: string;
  coTitle: string;
  partTitle: string;
  partOrder: number;
  /** Element id to scroll to on the CO page. */
  anchorId: string;
  title: string;
  code?: string;
  matchType: SearchMatchType;
  snippet: string;
}

function stringifyUnknown(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    return value.map(stringifyUnknown).filter(Boolean).join('\n');
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '';
  }
}

/** Every searchable field of a concept, in priority order. */
function conceptFields(concept: Concept): Array<{ matchType: SearchMatchType; text: string }> {
  const fields: Array<{ matchType: SearchMatchType; text: string }> = [];
  const pushList = (matchType: SearchMatchType, values: string[]) => {
    for (const value of values) {
      if (value) fields.push({ matchType, text: value });
    }
  };

  if (concept.title) fields.push({ matchType: 'title', text: concept.title });
  if (concept.code) fields.push({ matchType: 'code', text: concept.code });
  if (concept.eli5) fields.push({ matchType: 'eli5', text: concept.eli5 });
  pushList('key_points', concept.key_points);
  pushList('formulas', concept.formulas);
  pushList('common_mistakes', concept.common_mistakes);
  if (concept.deep_dive) fields.push({ matchType: 'deep_dive', text: concept.deep_dive });
  if (concept.mini_task) fields.push({ matchType: 'mini_task', text: concept.mini_task });
  pushList('exam_tags', concept.exam_tags);

  // Fields without a dedicated renderer are still indexed.
  for (const value of Object.values(concept.extra)) {
    const text = stringifyUnknown(value);
    if (text) fields.push({ matchType: 'extra', text });
  }

  return fields;
}

/**
 * Flat search index over every loaded part. Part titles are indexed as their
 * own entries, and every concept in every part is scanned across all of its
 * content fields, so no part is unreachable from search.
 */
export function searchCurriculum(query: string): SearchResult[] {
  const cleanQ = query.trim().toLowerCase();
  if (!cleanQ) return [];

  const results: SearchResult[] = [];

  for (const co of allCOs) {
    for (const part of co.parts) {
      const partHaystack = `${part.part.title} ${part.part.id} part ${part.part.order}`.toLowerCase();
      if (partHaystack.includes(cleanQ)) {
        results.push({
          coId: co.id,
          coTitle: co.title,
          partTitle: part.part.title,
          partOrder: part.part.order,
          anchorId: part.concepts[0]?.id ?? `part-${part.part.order}`,
          title: part.part.title,
          matchType: 'part',
          snippet: `Part ${part.part.order} — ${part.part.title}`,
        });
      }

      for (const concept of part.concepts) {
        const hit = conceptFields(concept).find((field) =>
          field.text.toLowerCase().includes(cleanQ)
        );
        if (!hit) continue;

        results.push({
          coId: co.id,
          coTitle: co.title,
          partTitle: part.part.title,
          partOrder: part.part.order,
          anchorId: concept.id,
          title: concept.title,
          code: concept.code,
          matchType: hit.matchType,
          snippet: extractSnippet(hit.text, cleanQ),
        });
      }
    }
  }

  return results;
}

function extractSnippet(text: string, query: string, radius = 50): string {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query);
  if (idx === -1) return text.slice(0, radius * 2);

  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + query.length + radius);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < text.length ? '…' : '';

  return `${prefix}${text.slice(start, end)}${suffix}`;
}
