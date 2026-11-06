import { allCOs } from '../content';
import type { Concept } from '../content';

export interface SearchResult {
  coId: string;
  coTitle: string;
  partTitle: string;
  partOrder: number;
  concept: Concept;
  matchType: 'title' | 'code' | 'eli5' | 'deep_dive' | 'formulas' | 'key_points';
  snippet: string;
}

// Flat search index built at runtime from all loaded CO content
export function searchCurriculum(query: string): SearchResult[] {
  const cleanQ = query.trim().toLowerCase();
  if (!cleanQ) return [];

  const results: SearchResult[] = [];

  for (const co of allCOs) {
    for (const part of co.parts) {
      for (const concept of part.concepts) {
        // 1. Check title and code
        if (concept.title.toLowerCase().includes(cleanQ)) {
          results.push({
            coId: co.id,
            coTitle: co.title,
            partTitle: part.part.title,
            partOrder: part.part.order,
            concept,
            matchType: 'title',
            snippet: concept.title,
          });
          continue;
        }

        if (concept.code.toLowerCase().includes(cleanQ)) {
          results.push({
            coId: co.id,
            coTitle: co.title,
            partTitle: part.part.title,
            partOrder: part.part.order,
            concept,
            matchType: 'code',
            snippet: `${concept.code} — ${concept.title}`,
          });
          continue;
        }

        // 2. Check ELI5
        if (concept.eli5 && concept.eli5.toLowerCase().includes(cleanQ)) {
          results.push({
            coId: co.id,
            coTitle: co.title,
            partTitle: part.part.title,
            partOrder: part.part.order,
            concept,
            matchType: 'eli5',
            snippet: extractSnippet(concept.eli5, cleanQ),
          });
          continue;
        }

        // 3. Check key points
        if (concept.key_points) {
          const matchedPoint = concept.key_points.find((p) => p.toLowerCase().includes(cleanQ));
          if (matchedPoint) {
            results.push({
              coId: co.id,
              coTitle: co.title,
              partTitle: part.part.title,
              partOrder: part.part.order,
              concept,
              matchType: 'key_points',
              snippet: extractSnippet(matchedPoint, cleanQ),
            });
            continue;
          }
        }

        // 4. Check formulas
        if (concept.formulas) {
          const matchedFormula = concept.formulas.find((f) => f.toLowerCase().includes(cleanQ));
          if (matchedFormula) {
            results.push({
              coId: co.id,
              coTitle: co.title,
              partTitle: part.part.title,
              partOrder: part.part.order,
              concept,
              matchType: 'formulas',
              snippet: matchedFormula,
            });
            continue;
          }
        }

        // 5. Check deep dive
        if (concept.deep_dive && concept.deep_dive.toLowerCase().includes(cleanQ)) {
          results.push({
            coId: co.id,
            coTitle: co.title,
            partTitle: part.part.title,
            partOrder: part.part.order,
            concept,
            matchType: 'deep_dive',
            snippet: extractSnippet(concept.deep_dive, cleanQ),
          });
          continue;
        }
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
