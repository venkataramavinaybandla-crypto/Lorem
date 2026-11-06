import * as yaml from 'js-yaml';

export interface QuizItem {
  type: string;
  question: string;
  options?: string[];
  answer: string | number;
  explanation: string;
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
}

export interface PartMeta {
  id: string;
  co: string;
  title: string;
  order: number;
  concept_ids: string[];
}

export interface Part {
  part: PartMeta;
  concepts: Concept[];
}

export interface CO {
  id: string;
  label: string;
  title: string;
  parts: Part[];
}

const yamlModules = import.meta.glob('../content/**/*.yaml', {
  eager: true,
  query: '?raw',
  import: 'default',
});

function loadAllCOs(): CO[] {
  const coMap = new Map<string, Part[]>();

  for (const [, raw] of Object.entries(yamlModules)) {
    const parsed = yaml.load(raw as string) as {
      part: PartMeta;
      concepts: Concept[];
    };
    if (!parsed?.part?.co) continue;

    const coId = parsed.part.co.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!coMap.has(coId)) coMap.set(coId, []);
    coMap.get(coId)!.push({ part: parsed.part, concepts: parsed.concepts });
  }

  const cos: CO[] = [];
  for (const [coId, parts] of coMap) {
    parts.sort((a, b) => a.part.order - b.part.order);
    cos.push({
      id: coId,
      label: coId.replace(/(\d+)/, ' $1').trim(),
      title: parts[0]?.part.title ?? coId,
      parts,
    });
  }

  cos.sort((a, b) => {
    const numA = parseInt(a.id.replace(/\D/g, ''), 10);
    const numB = parseInt(b.id.replace(/\D/g, ''), 10);
    return numA - numB;
  });

  return cos;
}

export const allCOs = loadAllCOs();

export function getCO(id: string): CO | undefined {
  return allCOs.find(
    (co) => co.id === id.toUpperCase().replace(/[^A-Z0-9]/g, '')
  );
}

