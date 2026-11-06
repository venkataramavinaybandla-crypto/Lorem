import type { VizOutcome } from './types';

/**
 * Evaluates conditions like "stage >= 1 && stage <= 2", "release == 1", "dimension > 4"
 * safely against a dictionary of numeric param values.
 */
export function evaluateCondition(condition: string, params: Record<string, number>): boolean {
  if (!condition || typeof condition !== 'string') return true;

  // Split multiple clauses joined by &&
  const clauses = condition.split('&&').map((c) => c.trim());

  for (const clause of clauses) {
    // Match: [paramName] [operator] [number]
    const match = clause.match(/^([a-zA-Z0-9_]+)\s*(>=|<=|>|<|===|==|!=)\s*(-?\d+(?:\.\d+)?)$/);
    if (!match) continue;

    const [, paramName, operator, numStr] = match;
    const currentVal = params[paramName] ?? 0;
    const targetVal = parseFloat(numStr);

    let clauseResult = false;
    switch (operator) {
      case '>=':
        clauseResult = currentVal >= targetVal;
        break;
      case '<=':
        clauseResult = currentVal <= targetVal;
        break;
      case '>':
        clauseResult = currentVal > targetVal;
        break;
      case '<':
        clauseResult = currentVal < targetVal;
        break;
      case '==':
      case '===':
        clauseResult = Math.abs(currentVal - targetVal) < 0.0001;
        break;
      case '!=':
        clauseResult = Math.abs(currentVal - targetVal) >= 0.0001;
        break;
      default:
        clauseResult = true;
    }

    if (!clauseResult) return false;
  }

  return true;
}

export function getActiveOutcome(
  outcomes: VizOutcome[] | undefined,
  params: Record<string, number>
): VizOutcome | undefined {
  if (!outcomes || outcomes.length === 0) return undefined;
  for (const outcome of outcomes) {
    if (evaluateCondition(outcome.when, params)) {
      return outcome;
    }
  }
  return outcomes[0];
}
