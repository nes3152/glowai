import { budgetCap } from './budgets';
import { COSMETICS, DEVICES, ROUTINE_STEPS, SUPPLEMENTS } from '../data/products';
import { sumPrices } from './money';
import { BASELINE_SCORE, topConcerns } from './skinAnalysis';

/** Ingredients that must not be recommended for a given safety flag. */
export const SAFETY_EXCLUSIONS = {
  pregnancy: ['retinoid'],
  sensitive: ['retinoid', 'aha', 'bha'],
};

/** Ingredient pairs that are fine separately but should not be layered. */
export const CONFLICT_RULES = [
  {
    ingredients: ['retinoid', 'aha'],
    message: 'Do not layer the retinal serum with AHA on the same night — alternate evenings.',
  },
  {
    ingredients: ['retinoid', 'bha'],
    message: 'Do not layer the retinal serum with BHA on the same night — alternate evenings.',
  },
];

export function scoreProduct(product, scores) {
  return product.targets.reduce((total, target) => total + (scores[target] ?? 0), 0);
}

export function isAllowed(product, safetyFlags = []) {
  const blocked = safetyFlags.flatMap((flag) => SAFETY_EXCLUSIONS[flag] ?? []);
  return !product.ingredients?.some((ingredient) => blocked.includes(ingredient));
}

export function findConflicts(products) {
  const present = new Set(products.flatMap((product) => product.ingredients ?? []));
  return CONFLICT_RULES.filter((rule) => rule.ingredients.every((i) => present.has(i))).map(
    (rule) => rule.message
  );
}

function candidatesFor(step, safetyFlags) {
  return COSMETICS.filter((product) => product.step === step).filter((product) =>
    isAllowed(product, safetyFlags)
  );
}

function bestCandidate(step, { scores, safetyFlags, remaining }) {
  return candidatesFor(step, safetyFlags)
    .filter((product) => product.price.amount <= remaining)
    .sort((a, b) => scoreProduct(b, scores) - scoreProduct(a, scores) || a.price.amount - b.price.amount)[0];
}

/** Cheapest way to still cover the given steps, used to reserve budget. */
function minimumCost(steps, safetyFlags) {
  return steps.reduce((total, step) => {
    const prices = candidatesFor(step.id, safetyFlags).map((product) => product.price.amount);
    return total + (prices.length ? Math.min(...prices) : 0);
  }, 0);
}

/**
 * Greedy routine builder. Essential steps are filled first, and each pick
 * reserves the cheapest way to cover the remaining essentials, so a tight
 * budget downgrades a product instead of dropping SPF entirely. Optional steps
 * are only added with what is left, and the total is always <= the cap.
 */
export function selectRoutine({ scores, budgetId, safetyFlags = [] }) {
  const cap = budgetCap(budgetId);
  const picked = new Map();
  let spent = 0;

  const essentials = ROUTINE_STEPS.filter((step) => step.essential);
  const optional = ROUTINE_STEPS.filter((step) => !step.essential);

  essentials.forEach((step, index) => {
    const reserved = minimumCost(essentials.slice(index + 1), safetyFlags);
    const candidate = bestCandidate(step.id, {
      scores,
      safetyFlags,
      remaining: cap - spent - reserved,
    });
    if (candidate) {
      picked.set(step.id, candidate);
      spent += candidate.price.amount;
    }
  });

  optional.forEach((step) => {
    const candidate = bestCandidate(step.id, { scores, safetyFlags, remaining: cap - spent });
    if (candidate) {
      picked.set(step.id, candidate);
      spent += candidate.price.amount;
    }
  });

  const items = ROUTINE_STEPS.filter((step) => picked.has(step.id)).map((step) => ({
    ...picked.get(step.id),
    stepLabel: step.label,
  }));

  return {
    items,
    total: sumPrices(items),
    skippedSteps: ROUTINE_STEPS.filter((step) => !picked.has(step.id)).map((step) => step.label),
    warnings: findConflicts(items),
  };
}

export function selectSupplements({ scores, lifestyle = [], limit = 2 }) {
  return SUPPLEMENTS.map((supplement) => ({
    supplement,
    rank:
      scoreProduct(supplement, scores) +
      supplement.triggers.filter((trigger) => lifestyle.includes(trigger)).length * 40,
  }))
    .sort((a, b) => b.rank - a.rank || a.supplement.price.amount - b.supplement.price.amount)
    .slice(0, limit)
    .map((entry) => entry.supplement);
}

export function selectDevices({ scores, limit = 2 }) {
  const relevant = DEVICES.filter((device) =>
    device.targets.some((target) => (scores[target] ?? 0) > BASELINE_SCORE)
  );
  return relevant
    .sort((a, b) => scoreProduct(b, scores) - scoreProduct(a, scores) || a.price.amount - b.price.amount)
    .slice(0, limit);
}

/** Human-readable reason tying a product back to the user's own scores. */
export function explain(product, scores) {
  const matched = product.targets
    .filter((target) => (scores[target] ?? 0) > BASELINE_SCORE)
    .map((target) => target.replace(/^\w/, (c) => c.toUpperCase()));
  if (matched.length === 0) return 'Core step every routine needs, kept neutral for your skin.';
  return `Picked for your ${matched.join(' and ').toLowerCase()} scores.`;
}

export function buildRecommendations({ report, budgetId, safetyFlags = [], lifestyle = [] }) {
  const routine = selectRoutine({ scores: report.scores, budgetId, safetyFlags });
  return {
    priorities: topConcerns(report.scores),
    cosmetics: routine.items.map((item) => ({ ...item, reason: explain(item, report.scores) })),
    cosmeticsTotal: routine.total,
    skippedSteps: routine.skippedSteps,
    warnings: routine.warnings,
    supplements: selectSupplements({ scores: report.scores, lifestyle }),
    devices: selectDevices({ scores: report.scores }),
  };
}
