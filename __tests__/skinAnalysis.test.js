import { CONCERN_IDS } from '../src/domain/concerns';
import {
  BASELINE_SCORE,
  SELECTED_SCORE,
  buildSkinReport,
  deriveSkinType,
  topConcerns,
} from '../src/domain/skinAnalysis';

const photos = ['a.jpg', 'b.jpg', 'c.jpg'];

describe('buildSkinReport', () => {
  it('raises only the concerns the user selected', () => {
    const report = buildSkinReport({ photos, concerns: ['acne', 'pores'] });

    expect(report.scores.acne).toBe(SELECTED_SCORE);
    expect(report.scores.pores).toBe(SELECTED_SCORE);
    expect(report.scores.dryness).toBe(BASELINE_SCORE);
    expect(Object.keys(report.scores).sort()).toEqual([...CONCERN_IDS].sort());
  });

  it('ignores unknown concern ids instead of scoring them', () => {
    const report = buildSkinReport({ photos, concerns: ['acne', 'not-a-concern'] });

    expect(report.scores['not-a-concern']).toBeUndefined();
    expect(report.flags).not.toContain('no_concerns_selected');
  });

  it('produces a different score for different concerns', () => {
    const mild = buildSkinReport({ photos, concerns: ['dryness'] });
    const severe = buildSkinReport({ photos, concerns: CONCERN_IDS });

    expect(severe.score).toBeLessThan(mild.score);
  });

  it('flags an incomplete capture and lowers confidence', () => {
    const report = buildSkinReport({ photos: ['a.jpg'], concerns: ['acne'] });

    expect(report.flags).toContain('incomplete_capture');
    expect(report.confidence).toBeLessThan(0.5);
  });

  it('flags an empty concern selection', () => {
    expect(buildSkinReport({ photos, concerns: [] }).flags).toContain('no_concerns_selected');
  });

  it('reaches full confidence with all three photos', () => {
    expect(buildSkinReport({ photos, concerns: ['acne'] }).confidence).toBe(0.9);
  });

  it('tolerates being called with no input', () => {
    expect(() => buildSkinReport()).not.toThrow();
  });
});

describe('deriveSkinType', () => {
  const base = () => {
    const scores = {};
    CONCERN_IDS.forEach((id) => {
      scores[id] = BASELINE_SCORE;
    });
    return scores;
  };

  it.each([
    [{ oiliness: SELECTED_SCORE, dryness: SELECTED_SCORE }, 'Combination'],
    [{ oiliness: SELECTED_SCORE }, 'Oily'],
    [{ dryness: SELECTED_SCORE }, 'Dry'],
    [{ redness: SELECTED_SCORE }, 'Sensitive'],
    [{}, 'Normal'],
  ])('maps %o to %s', (overrides, expected) => {
    expect(deriveSkinType({ ...base(), ...overrides })).toBe(expected);
  });
});

describe('topConcerns', () => {
  it('returns only elevated concerns, capped at the limit', () => {
    const report = buildSkinReport({ photos, concerns: ['acne', 'pores', 'redness', 'dryness'] });

    const top = topConcerns(report.scores, 2);
    expect(top).toHaveLength(2);
    expect(top.every((id) => report.scores[id] === SELECTED_SCORE)).toBe(true);
  });

  it('returns nothing when no concern is elevated', () => {
    expect(topConcerns(buildSkinReport({ photos, concerns: [] }).scores)).toEqual([]);
  });
});
