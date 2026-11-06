/**
 * Build-time content assertion.
 *
 * Compares what is physically on disk under /content against the curriculum
 * blueprint (60 files, 10 parts per CO across CO1-CO6).
 *
 * Per the project brief this check is ADVISORY: it prints the exact CO/part
 * slots that are empty and continues the build. Exit code is always 0 so a
 * partially populated content folder does not break deployment.
 */
import fs from 'node:fs';
import path from 'node:path';
import { load } from 'js-yaml';

const CONTENT_DIR = process.env.CONTENT_DIR ?? 'content';
const TARGET_FILES = 60;
const TARGET_PARTS_PER_CO = 10;
const CO_IDS = ['CO1', 'CO2', 'CO3', 'CO4', 'CO5', 'CO6'];

function collectFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectFiles(full));
    else if (/\.ya?ml$/i.test(entry.name)) out.push(full.split(path.sep).join('/'));
  }
  return out.sort();
}

function normalizeCoId(value) {
  if (typeof value !== 'string') return undefined;
  const match = /co\s*[-_]?\s*(\d+)/i.exec(value);
  return match ? `CO${Number.parseInt(match[1], 10)}` : undefined;
}

function resolveCo(file, declaredCo) {
  const fromField = normalizeCoId(declaredCo);
  if (fromField) return fromField;

  const segments = file.split('/');
  for (const segment of segments.slice(0, -1)) {
    const match = /^co[-_ ]?(\d+)$/i.exec(segment);
    if (match) return `CO${Number.parseInt(match[1], 10)}`;
  }

  const base = segments[segments.length - 1];
  return normalizeCoId(base) ?? 'UNASSIGNED';
}

const files = collectFiles(CONTENT_DIR);

const perCO = new Map(
  CO_IDS.map((coId) => [coId, { files: [], orders: [], concepts: 0, errors: [] }])
);

for (const file of files) {
  let doc;
  const errors = [];
  try {
    doc = load(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    errors.push(`YAML parse error: ${error.message}`);
  }

  const declaredPart = doc && typeof doc === 'object' ? doc.part : undefined;
  const coId = resolveCo(file, declaredPart?.co);
  if (!perCO.has(coId)) perCO.set(coId, { files: [], orders: [], concepts: 0, errors: [] });

  const bucket = perCO.get(coId);
  bucket.files.push(file);
  bucket.errors.push(...errors);

  const concepts = Array.isArray(doc?.concepts) ? doc.concepts : [];
  bucket.concepts += concepts.length;

  if (errors.length === 0) {
    const declaredOrder = declaredPart?.order;
    const numericOrder =
      typeof declaredOrder === 'number'
        ? declaredOrder
        : Number.parseInt(String(declaredOrder ?? ''), 10);
    if (Number.isFinite(numericOrder)) bucket.orders.push(numericOrder);
    else bucket.orders.push(undefined);
  }
}

let totalConcepts = 0;
const rows = [];
const missingByCo = [];

for (const [coId, bucket] of perCO) {
  const numericOrders = bucket.orders.filter((order) => Number.isFinite(order));
  const presentSlots = new Set(numericOrders);
  const emptySlots = [];
  for (let slot = 1; slot <= TARGET_PARTS_PER_CO; slot += 1) {
    if (!presentSlots.has(slot)) emptySlots.push(slot);
  }

  const duplicates = [...presentSlots].filter(
    (order) => numericOrders.filter((candidate) => candidate === order).length > 1
  );

  totalConcepts += bucket.concepts;
  rows.push({
    coId,
    files: bucket.files.length,
    parts: bucket.files.length,
    concepts: bucket.concepts,
    slots: `${presentSlots.size}/${TARGET_PARTS_PER_CO}`,
    emptySlots,
    duplicates,
    errors: bucket.errors,
  });

  if (emptySlots.length > 0) {
    const folder = coId === 'UNASSIGNED' ? CONTENT_DIR : `content/${coId.replace(/^CO/, 'CO-')}`;
    missingByCo.push({
      coId,
      folder,
      emptySlots,
      prefix: `${coId.toLowerCase()}_`,
    });
  }
}

const totalFiles = files.length;
const totalParts = rows.reduce((sum, row) => sum + row.parts, 0);

const pad = (value, width) => String(value).padEnd(width);
const padStart = (value, width) => String(value).padStart(width);
const pad2 = (value) => String(value).padStart(2, '0');

console.log('');
console.log('[content-check] Lorem content verification (advisory)');
console.log(
  `[content-check] Target: ${TARGET_FILES} files / ${TARGET_PARTS_PER_CO} parts per CO (${CO_IDS.join(', ')})`
);
console.log('');
console.log(
  `${pad('CO', 12)}${padStart('files', 6)}${padStart('parts', 7)}${padStart('slots', 8)}${padStart('concepts', 10)}  empty slots`
);
console.log('-'.repeat(78));
for (const row of rows) {
  const empty = row.emptySlots.length === 0 ? 'none' : row.emptySlots.join(',');
  console.log(
    `${pad(row.coId, 12)}${padStart(row.files, 6)}${padStart(row.parts, 7)}${padStart(row.slots, 8)}${padStart(row.concepts, 10)}  ${empty}`
  );
}
console.log('-'.repeat(78));
console.log(
  `${pad('TOTAL', 12)}${padStart(totalFiles, 6)}${padStart(totalParts, 7)}${padStart(`${totalParts}/${TARGET_FILES}`, 8)}${padStart(totalConcepts, 10)}  ${TARGET_FILES - totalParts} empty`
);
console.log('');

for (const row of rows) {
  if (row.duplicates.length > 0) {
    console.log(
      `[content-check] WARNING ${row.coId}: duplicate part order values ${row.duplicates.join(', ')}`
    );
  }
  for (const error of row.errors) {
    console.log(`[content-check] WARNING ${row.coId}: ${error}`);
  }
}

if (missingByCo.length > 0) {
  const missingCount = missingByCo.reduce((sum, entry) => sum + entry.emptySlots.length, 0);
  console.log(
    `[content-check] WARNING ${missingCount} of ${TARGET_FILES} part slots have no YAML file.`
  );
  console.log('[content-check] Empty slots (expected file patterns):');
  for (const entry of missingByCo) {
    for (const slot of entry.emptySlots) {
      console.log(
        `  - ${entry.coId} part ${pad2(slot)}  ->  ${entry.folder}/${entry.prefix}${pad2(slot)}_*.yaml`
      );
    }
  }
  console.log('');
  console.log(
    '[content-check] Advisory only: the build continues. Add the missing YAML files to reach the full blueprint.'
  );
} else if (totalFiles !== TARGET_FILES) {
  console.log(
    `[content-check] WARNING expected ${TARGET_FILES} files, found ${totalFiles}.`
  );
} else {
  console.log('[content-check] OK: all 60 parts across CO1-CO6 are present.');
}

console.log('');

// Advisory check: never fail the build on content completeness.
process.exitCode = 0;
