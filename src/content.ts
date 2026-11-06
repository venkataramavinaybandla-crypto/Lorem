import * as yaml from 'js-yaml';

export interface QuizItem {
  type: string;
  question: string;
  options?: string[];
  answer: string | number;
  explanation: string;
  /** Quiz fields without a dedicated renderer (e.g. expected_answer). */
  extra: Record<string, unknown>;
}

export interface Concept {
  id: string;
  code: string;
  title: string;
  session: number | string;
  eli5: string;
  key_points: string[];
  deep_dive: string;
  formulas: string[];
  common_mistakes: string[];
  mini_task: string;
  quiz: QuizItem[];
  exam_tags: string[];
  skilling_exp?: string | number;
  btl?: string | number;
  difficulty?: string | number;
  prereqs?: string[];
  viz?: Record<string, unknown>;
  /** Any field in the YAML without a dedicated renderer. Rendered generically, never dropped. */
  extra: Record<string, unknown>;
}

export interface PartMeta {
  id: string;
  co: string;
  title: string;
  order: number;
  concept_ids: string[];
}

export type CoSource = 'field' | 'folder' | 'filename' | 'unassigned';

export interface Part {
  part: PartMeta;
  concepts: Concept[];
  /** Path as reported by import.meta.glob, e.g. /content/CO-1/co1_01_....yaml */
  sourcePath: string;
  /** Where the CO id for this file came from. */
  coSource: CoSource;
  loadError?: string;
}

export interface CO {
  id: string;
  label: string;
  title: string;
  parts: Part[];
  /** Numbered slots for the parts navigator (1..N). */
  partSlots: number[];
  /** Target slots that have no file yet. */
  emptySlots: number[];
  /** Target number of parts per CO (10). */
  partsTarget: number;
}

/** The curriculum blueprint this app is built against. */
export const CONTENT_TARGETS = {
  totalFiles: 60,
  partsPerCO: 10,
  coIds: ['CO1', 'CO2', 'CO3', 'CO4', 'CO5', 'CO6'],
} as const;

const KNOWN_QUIZ_KEYS = new Set([
  'type',
  'question',
  'options',
  'answer',
  'explanation',
]);

const KNOWN_CONCEPT_KEYS = new Set([
  'id',
  'code',
  'title',
  'session',
  'eli5',
  'key_points',
  'deep_dive',
  'formulas',
  'common_mistakes',
  'mini_task',
  'quiz',
  'exam_tags',
  'skilling_exp',
  'btl',
  'difficulty',
  'prereqs',
  'viz',
]);

/**
 * Recursive glob: every .yaml/.yml anywhere under /content is loaded eagerly at
 * build time. Filenames are never hardcoded and no file is ever skipped.
 */
const yamlModules = import.meta.glob<string>('/content/**/*.{yaml,yml}', {
  eager: true,
  query: '?raw',
  import: 'default',
});

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function toText(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

function toTextList(value: unknown): string[] {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== null && item !== undefined)
      .map((item) =>
        typeof item === 'string'
          ? item
          : typeof item === 'number' || typeof item === 'boolean'
            ? String(item)
            : JSON.stringify(item)
      );
  }
  const text = toText(value);
  return text ? [text] : [];
}

function toOptionalNumberOrText(value: unknown): string | number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const text = toText(value);
  return text ? text : undefined;
}

function normalizeCoId(value: string): string | undefined {
  const match = /co\s*[-_]?\s*(\d+)/i.exec(value);
  if (!match) return undefined;
  return `CO${Number.parseInt(match[1], 10)}`;
}

function stripExtension(path: string): string {
  return path.replace(/\.ya?ml$/i, '');
}

function basename(path: string): string {
  return path.split('/').pop() ?? path;
}

/** CO from folder segment (CO-1), else from filename prefix (co1_01_...). */
function resolveCo(path: string, declaredCo: unknown): { coId: string; source: CoSource } {
  const fromField = normalizeCoId(toText(declaredCo));
  if (fromField) return { coId: fromField, source: 'field' };

  const segments = path.split('/');
  for (const segment of segments.slice(0, -1)) {
    const match = /^co[-_ ]?(\d+)$/i.exec(segment);
    if (match) return { coId: `CO${Number.parseInt(match[1], 10)}`, source: 'folder' };
  }

  const fromFilename = /^co[-_ ]?(\d+)/i.exec(basename(path));
  if (fromFilename) {
    return { coId: `CO${Number.parseInt(fromFilename[1], 10)}`, source: 'filename' };
  }

  return { coId: 'UNASSIGNED', source: 'unassigned' };
}

/** Order from the part.order field, else from the file name (co1_07_...), else position. */
function resolveOrder(value: unknown, path: string, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const numeric = Number.parseInt(toText(value), 10);
  if (Number.isFinite(numeric)) return numeric;

  const base = stripExtension(basename(path));
  const fromName =
    /^co\d+[_-](\d+)/i.exec(base) ?? /[_-](\d{1,2})(?:[_-]|$)/.exec(base.replace(/^co\d+/i, ''));
  if (fromName) {
    const parsed = Number.parseInt(fromName[1], 10);
    if (Number.isFinite(parsed)) return parsed;
  }

  return fallback;
}

function normalizeViz(raw: unknown): Record<string, unknown> | undefined {
  if (raw === null || raw === undefined || raw === '') return undefined;
  const record = asRecord(raw);
  if (record) return record;
  if (Array.isArray(raw)) {
    const lines = toTextList(raw).join('\n');
    return lines ? { description: lines } : undefined;
  }
  const text = toText(raw);
  return text ? { description: text } : undefined;
}

function normalizeQuiz(raw: unknown): QuizItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, index) => {
    const src = asRecord(item) ?? { question: toText(item) };
    const answer = src.answer;
    const extra: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(src)) {
      if (!KNOWN_QUIZ_KEYS.has(key) && value !== null && value !== undefined) {
        extra[key] = value;
      }
    }
    return {
      type: toText(src.type) || 'question',
      question: toText(src.question) || `Question ${index + 1}`,
      options: toTextList(src.options),
      answer:
        typeof answer === 'number' || typeof answer === 'string' ? answer : toText(answer),
      explanation: toText(src.explanation),
      extra,
    };
  });
}

function normalizeConcept(raw: unknown, index: number, partId: string): Concept {
  const source = asRecord(raw);
  const src: Record<string, unknown> = source ?? {
    title: typeof raw === 'string' ? raw : `Concept ${index + 1}`,
    value: raw,
  };

  const id = toText(src.id) || `${partId}-C${String(index + 1).padStart(2, '0')}`;
  const extra: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(src)) {
    if (!KNOWN_CONCEPT_KEYS.has(key) && value !== null && value !== undefined) {
      extra[key] = value;
    }
  }

  return {
    id,
    code: toText(src.code) || id,
    title: toText(src.title) || `Concept ${index + 1}`,
    session: toOptionalNumberOrText(src.session) ?? '',
    eli5: toText(src.eli5),
    key_points: toTextList(src.key_points),
    deep_dive: toText(src.deep_dive),
    formulas: toTextList(src.formulas),
    common_mistakes: toTextList(src.common_mistakes),
    mini_task: toText(src.mini_task),
    quiz: normalizeQuiz(src.quiz),
    exam_tags: toTextList(src.exam_tags),
    skilling_exp: toOptionalNumberOrText(src.skilling_exp),
    btl: toOptionalNumberOrText(src.btl),
    difficulty: toOptionalNumberOrText(src.difficulty),
    prereqs: src.prereqs === undefined ? undefined : toTextList(src.prereqs),
    viz: normalizeViz(src.viz),
    extra,
  };
}

function buildPart(path: string, raw: string, fallbackOrder: number): Part {
  const declared = (() => {
    try {
      return asRecord(yaml.load(raw));
    } catch {
      return undefined;
    }
  })();

  const declaredPart = asRecord(declared?.part);
  const { coId, source } = resolveCo(path, declaredPart?.co);
  const order = resolveOrder(declaredPart?.order, path, fallbackOrder);

  if (!declared) {
    return {
      part: {
        id: stripExtension(basename(path)),
        co: coId,
        title: basename(path),
        order,
        concept_ids: [],
      },
      concepts: [],
      sourcePath: path,
      coSource: source,
      loadError: 'This file could not be parsed as YAML, so its content is unavailable.',
    };
  }

  const rawConcepts = Array.isArray(declared.concepts) ? declared.concepts : [];
  const partId = toText(declaredPart?.id) || stripExtension(basename(path));
  const concepts = rawConcepts.map((concept, index) =>
    normalizeConcept(concept, index, partId)
  );

  return {
    part: {
      id: partId,
      co: coId,
      title: toText(declaredPart?.title) || stripExtension(basename(path)),
      order,
      concept_ids: concepts.map((concept) => concept.id),
    },
    concepts,
    sourcePath: path,
    coSource: source,
  };
}

function buildCOs(): CO[] {
  const partsByCo = new Map<string, Part[]>();
  const entries = Object.entries(yamlModules).sort(([a], [b]) => a.localeCompare(b));

  entries.forEach(([path, raw], index) => {
    const part = buildPart(path, typeof raw === 'string' ? raw : '', index + 1);
    const bucket = partsByCo.get(part.part.co) ?? [];
    bucket.push(part);
    partsByCo.set(part.part.co, bucket);
  });

  const coIds = [
    ...CONTENT_TARGETS.coIds,
    ...[...partsByCo.keys()].filter(
      (coId) => !(CONTENT_TARGETS.coIds as readonly string[]).includes(coId)
    ),
  ];

  const cos: CO[] = coIds.map((coId) => {
    const parts = partsByCo.get(coId) ?? [];
    parts.sort((a, b) => {
      if (a.part.order !== b.part.order) return a.part.order - b.part.order;
      return a.sourcePath.localeCompare(b.sourcePath);
    });

    const presentOrders = new Set(parts.map((part) => part.part.order));
    const slotCount = Math.max(
      CONTENT_TARGETS.partsPerCO,
      parts.length
    );
    const partSlots = Array.from({ length: slotCount }, (_, index) => index + 1);
    const emptySlots = partSlots.filter(
      (slot) => slot <= CONTENT_TARGETS.partsPerCO && !presentOrders.has(slot)
    );

    return {
      id: coId,
      label: coId.replace(/^CO(\d+)$/, 'CO $1'),
      title: parts[0]?.part.title ?? `${coId} has no loaded parts yet`,
      parts,
      partSlots,
      emptySlots,
      partsTarget: CONTENT_TARGETS.partsPerCO,
    };
  });

  cos.sort((a, b) => {
    const numA = Number.parseInt(a.id.replace(/\D/g, ''), 10);
    const numB = Number.parseInt(b.id.replace(/\D/g, ''), 10);
    if (Number.isFinite(numA) && Number.isFinite(numB) && numA !== numB) return numA - numB;
    if (Number.isFinite(numA) !== Number.isFinite(numB)) return Number.isFinite(numA) ? -1 : 1;
    return a.id.localeCompare(b.id);
  });

  return cos;
}

export const allCOs = buildCOs();

export const totalParts = allCOs.reduce((sum, co) => sum + co.parts.length, 0);

export const totalConcepts = allCOs.reduce(
  (sum, co) => sum + co.parts.reduce((acc, part) => acc + part.concepts.length, 0),
  0
);

export function getCO(id: string): CO | undefined {
  const normalized = id.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return allCOs.find((co) => co.id === normalized);
}
