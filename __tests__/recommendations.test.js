import { BUDGETS, budgetCap, budgetLabel } from '../src/domain/budgets';
import { COSMETICS, ROUTINE_STEPS } from '../src/data/products';
import {
  buildRecommendations,
  explain,
  findConflicts,
  isAllowed,
  scoreProduct,
  selectDevices,
  selectRoutine,
  selectSupplements,
} from '../src/domain/recommendations';
import { buildSkinReport } from '../src/domain/skinAnalysis';

const photos = ['a.jpg', 'b.jpg', 'c.jpg'];
const reportFor = (concerns) => buildSkinReport({ photos, concerns });

describe('budgetCap', () => {
  it('maps each budget id to its ceiling', () => {
    expect(budgetCap('budget1')).toBe(30);
    expect(budgetCap('budget5')).toBe(Infinity);
  });

  it('falls back to unlimited for an unknown id', () => {
    expect(budgetCap(undefined)).toBe(Infinity);
    expect(budgetLabel('nope')).toBe('Any budget');
  });

  it('exposes the label of a known budget', () => {
    expect(budgetLabel('budget1')).toBe('Under $30');
  });
});

describe('selectRoutine', () => {
  it('never exceeds the selected budget', () => {
    BUDGETS.forEach((budget) => {
      const { total } = selectRoutine({
        scores: reportFor(['acne', 'pores', 'dryness']).scores,
        budgetId: budget.id,
      });
      expect(total).toBeLessThanOrEqual(budget.max);
    });
  });

  it('keeps the essential steps and drops optional ones on a tight budget', () => {
    const { items, skippedSteps } = selectRoutine({
      scores: reportFor(['acne']).scores,
      budgetId: 'budget1',
    });

    const picked = items.map((item) => item.step);
    ROUTINE_STEPS.filter((step) => step.essential).forEach((step) => {
      expect(picked).toContain(step.id);
    });
    expect(skippedSteps.length).toBeGreaterThan(0);
  });

  it('returns a fuller routine as the budget grows', () => {
    const cheap = selectRoutine({ scores: reportFor(['acne']).scores, budgetId: 'budget1' });
    const rich = selectRoutine({ scores: reportFor(['acne']).scores, budgetId: 'budget5' });

    expect(rich.items.length).toBeGreaterThan(cheap.items.length);
    expect(rich.skippedSteps).toEqual([]);
  });

  it('picks different products for different concerns', () => {
    const oily = selectRoutine({ scores: reportFor(['oiliness', 'acne']).scores, budgetId: 'budget5' });
    const dry = selectRoutine({ scores: reportFor(['dryness']).scores, budgetId: 'budget5' });

    expect(oily.items.map((i) => i.id)).not.toEqual(dry.items.map((i) => i.id));
  });

  it('orders items by routine step, not by price', () => {
    const { items } = selectRoutine({ scores: reportFor(['acne']).scores, budgetId: 'budget5' });
    const order = items.map((item) => ROUTINE_STEPS.findIndex((step) => step.id === item.step));

    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it('excludes retinoids during pregnancy', () => {
    const { items } = selectRoutine({
      scores: reportFor(['wrinkles']).scores,
      budgetId: 'budget5',
      safetyFlags: ['pregnancy'],
    });

    expect(items.flatMap((item) => item.ingredients)).not.toContain('retinoid');
  });

  it('excludes acids and retinoids for sensitive skin', () => {
    const { items } = selectRoutine({
      scores: reportFor(['pores', 'wrinkles']).scores,
      budgetId: 'budget5',
      safetyFlags: ['sensitive'],
    });

    const ingredients = items.flatMap((item) => item.ingredients);
    expect(ingredients).not.toContain('aha');
    expect(ingredients).not.toContain('bha');
    expect(ingredients).not.toContain('retinoid');
  });
});

describe('isAllowed', () => {
  const retinal = COSMETICS.find((product) => product.id === 'ordinary-retinal');

  it('allows everything when no flags are set', () => {
    expect(isAllowed(retinal, [])).toBe(true);
  });

  it('blocks a product carrying an excluded ingredient', () => {
    expect(isAllowed(retinal, ['pregnancy'])).toBe(false);
  });

  it('allows a product with no ingredient list and ignores unknown flags', () => {
    expect(isAllowed({}, ['pregnancy'])).toBe(true);
    expect(isAllowed(retinal, ['unknown-flag'])).toBe(true);
  });
});

describe('findConflicts', () => {
  it('warns when a retinoid and an acid end up in the same routine', () => {
    const conflicts = findConflicts([
      { ingredients: ['retinoid'] },
      { ingredients: ['aha', 'bha'] },
    ]);

    expect(conflicts).toHaveLength(2);
  });

  it('stays quiet for a compatible routine', () => {
    expect(findConflicts([{ ingredients: ['ceramide'] }, { ingredients: ['niacinamide'] }])).toEqual([]);
  });

  it('handles products without an ingredient list', () => {
    expect(findConflicts([{}])).toEqual([]);
  });
});

describe('scoreProduct', () => {
  it('sums only the scores of the concerns a product targets', () => {
    const product = { targets: ['acne', 'pores'] };
    expect(scoreProduct(product, { acne: 70, pores: 30, dryness: 100 })).toBe(100);
  });

  it('treats missing scores as zero', () => {
    expect(scoreProduct({ targets: ['acne'] }, {})).toBe(0);
  });
});

describe('selectSupplements', () => {
  it('matches supplements to elevated concerns', () => {
    const picked = selectSupplements({ scores: reportFor(['acne']).scores });
    expect(picked.map((s) => s.id)).toContain('zinc');
  });

  it('boosts supplements whose lifestyle trigger is present', () => {
    const withTrigger = selectSupplements({
      scores: reportFor(['wrinkles']).scores,
      lifestyle: ['poorSleep'],
      limit: 1,
    });
    expect(withTrigger[0].id).toBe('collagen-peptides');
  });

  it('respects the limit', () => {
    expect(selectSupplements({ scores: reportFor(['acne']).scores, limit: 1 })).toHaveLength(1);
  });
});

describe('selectDevices', () => {
  it('only suggests devices relevant to elevated concerns', () => {
    const picked = selectDevices({ scores: reportFor(['dryness']).scores });
    expect(picked.map((d) => d.id)).toEqual(['facial-humidifier']);
  });

  it('suggests nothing when no concern is elevated', () => {
    expect(selectDevices({ scores: reportFor([]).scores })).toEqual([]);
  });

  it('treats an empty score map as nothing to target', () => {
    expect(selectDevices({ scores: {} })).toEqual([]);
  });
});

describe('explain', () => {
  it('names the concerns behind a pick', () => {
    const scores = reportFor(['oiliness']).scores;
    const product = COSMETICS.find((p) => p.id === 'ordinary-niacinamide');
    expect(explain(product, scores)).toContain('oiliness');
  });

  it('falls back to neutral copy when nothing matches', () => {
    expect(explain({ targets: ['acne'] }, reportFor([]).scores)).toMatch(/Core step/);
    expect(explain({ targets: ['acne'] }, {})).toMatch(/Core step/);
  });
});

describe('buildRecommendations', () => {
  it('assembles a budget-respecting bundle with reasons', () => {
    const report = reportFor(['acne', 'pores']);
    const result = buildRecommendations({ report, budgetId: 'budget3' });

    expect(result.cosmeticsTotal).toBeLessThanOrEqual(100);
    expect(result.cosmetics.every((item) => item.reason.length > 0)).toBe(true);
    expect(result.priorities).toContain('acne');
    expect(result.supplements.length).toBeGreaterThan(0);
  });
});
