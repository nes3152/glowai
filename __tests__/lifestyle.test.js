import { DEVICES, SUPPLEMENTS } from '../src/data/products';
import {
  HEALTH_ADVICE,
  HEALTH_FLAGS,
  HEALTH_FLAG_IDS,
  LIFESTYLE_FACTORS,
  LIFESTYLE_FACTOR_IDS,
} from '../src/domain/lifestyle';
import {
  buildRecommendations,
  healthNotes,
  isSafeFor,
  selectDevices,
  selectSupplements,
} from '../src/domain/recommendations';
import { buildSkinReport } from '../src/domain/skinAnalysis';

const photos = ['a.jpg', 'b.jpg', 'c.jpg'];
const reportFor = (concerns) => buildSkinReport({ photos, concerns });
const ids = (items) => items.map((item) => item.id);

describe('intake options', () => {
  it('only uses lifestyle ids that a supplement can be triggered by', () => {
    const triggers = new Set(SUPPLEMENTS.flatMap((supplement) => supplement.triggers));
    triggers.forEach((trigger) => expect(LIFESTYLE_FACTOR_IDS).toContain(trigger));
  });

  it('can answer every avoidFlag in the catalog, or it is a routine safety flag', () => {
    const answerable = [...HEALTH_FLAG_IDS, 'pregnancy', 'sensitive'];
    [...SUPPLEMENTS, ...DEVICES].forEach((item) => {
      (item.avoidFlags ?? []).forEach((flag) => expect(answerable).toContain(flag));
    });
  });

  it('labels every option', () => {
    [...LIFESTYLE_FACTORS, ...HEALTH_FLAGS].forEach((option) => {
      expect(option.label.length).toBeGreaterThan(0);
    });
  });
});

describe('isSafeFor', () => {
  it('drops an item when any flag matches', () => {
    expect(isSafeFor({ avoidFlags: ['fishAllergy'] }, ['poorSleep', 'fishAllergy'])).toBe(false);
  });

  it('keeps items without flags, and items whose flags were not selected', () => {
    expect(isSafeFor({}, ['fishAllergy'])).toBe(true);
    expect(isSafeFor({ avoidFlags: ['epilepsy'] }, ['fishAllergy'])).toBe(true);
    expect(isSafeFor({ avoidFlags: ['epilepsy'] })).toBe(true);
  });
});

describe('selectSupplements', () => {
  const scores = reportFor(['dryness', 'redness']).scores;

  it('excludes marine supplements for a fish allergy', () => {
    const picked = ids(selectSupplements({ scores, healthFlags: ['fishAllergy'], limit: 4 }));
    expect(picked).not.toContain('omega3');
    expect(picked).not.toContain('collagen-peptides');
  });

  it('excludes omega-3 on blood thinners even when the lifestyle answers favour it', () => {
    const picked = ids(
      selectSupplements({ scores, lifestyle: ['lowWater', 'lowVeg'], healthFlags: ['bloodThinners'] })
    );
    expect(picked).not.toContain('omega3');
    expect(picked.length).toBeGreaterThan(0);
  });

  it('still ranks by lifestyle answers when nothing is excluded', () => {
    expect(ids(selectSupplements({ scores, lifestyle: ['poorSleep'] }))).toContain(
      'collagen-peptides'
    );
  });
});

describe('selectDevices', () => {
  const scores = reportFor(['wrinkles', 'acne']).scores;

  it('excludes current-based devices for an implanted device', () => {
    expect(ids(selectDevices({ scores, healthFlags: ['implantedDevice'], limit: 4 }))).not.toContain(
      'microcurrent-device'
    );
  });

  it('excludes light therapy for photosensitising medication or epilepsy', () => {
    expect(ids(selectDevices({ scores, healthFlags: ['photosensitising'], limit: 4 }))).not.toContain(
      'led-mask'
    );
    expect(ids(selectDevices({ scores, healthFlags: ['epilepsy'], limit: 4 }))).not.toContain(
      'led-mask'
    );
  });

  it('keeps them when no flag is selected', () => {
    expect(ids(selectDevices({ scores, limit: 4 }))).toContain('led-mask');
  });
});

describe('buildRecommendations with intake answers', () => {
  const report = reportFor(['wrinkles', 'dryness']);

  it('applies pregnancy from the concern screen to devices too', () => {
    const { devices } = buildRecommendations({
      report,
      budgetId: 'budget3',
      safetyFlags: ['pregnancy'],
    });
    expect(ids(devices)).not.toContain('microcurrent-device');
  });

  it('carries advisory notes for the answers that only warn', () => {
    const { healthNotes: notes } = buildRecommendations({
      report,
      budgetId: 'budget3',
      safetyFlags: ['pregnancy'],
      healthFlags: ['photosensitising'],
    });
    expect(notes).toEqual([HEALTH_ADVICE.photosensitising, HEALTH_ADVICE.pregnancy]);
  });

  it('leaves the routine and notes untouched without answers', () => {
    const base = buildRecommendations({ report, budgetId: 'budget3' });
    const withLifestyle = buildRecommendations({
      report,
      budgetId: 'budget3',
      lifestyle: ['poorSleep'],
    });
    expect(ids(withLifestyle.cosmetics)).toEqual(ids(base.cosmetics));
    expect(base.healthNotes).toEqual([]);
  });
});

describe('healthNotes', () => {
  it('ignores flags that have no advisory copy', () => {
    expect(healthNotes(['fishAllergy'])).toEqual([]);
  });
});
