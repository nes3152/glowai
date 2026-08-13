import { AnalysisError, analyzeSkin } from '../src/services/analysisService';

const photos = ['front.jpg', 'left.jpg', 'right.jpg'];
const run = (input) => analyzeSkin(input, { delayMs: 0 });

describe('analyzeSkin', () => {
  it('returns a report plus recommendations and a disclaimer', async () => {
    const analysis = await run({ photos, concerns: ['acne'], budget: 'budget3' });

    expect(analysis.analysisId).toMatch(/^local-/);
    expect(analysis.skinType).toEqual(expect.any(String));
    expect(analysis.confidence).toBe(0.9);
    expect(analysis.recommendations.cosmetics.length).toBeGreaterThan(0);
    expect(analysis.disclaimers).toContain('not_medical_advice');
  });

  it('keeps the routine inside the selected budget', async () => {
    const analysis = await run({ photos, concerns: ['acne', 'wrinkles'], budget: 'budget1' });
    expect(analysis.recommendations.cosmeticsTotal).toBeLessThanOrEqual(30);
  });

  it('passes safety flags through to the recommendations', async () => {
    const analysis = await run({
      photos,
      concerns: ['wrinkles'],
      budget: 'budget5',
      safetyFlags: ['pregnancy'],
    });

    expect(analysis.recommendations.cosmetics.flatMap((item) => item.ingredients)).not.toContain(
      'retinoid'
    );
  });

  it('rejects with MISSING_PHOTOS when fewer than three photos are given', async () => {
    await expect(run({ photos: ['front.jpg'], concerns: ['acne'] })).rejects.toMatchObject({
      name: 'AnalysisError',
      code: 'MISSING_PHOTOS',
    });
  });

  it('rejects when called with no input at all', async () => {
    await expect(run(undefined)).rejects.toBeInstanceOf(AnalysisError);
  });

  it('waits for the requested delay before resolving', async () => {
    jest.useFakeTimers();
    try {
      const pending = analyzeSkin({ photos, concerns: ['acne'] }, { delayMs: 2400 });
      const settled = jest.fn();
      pending.then(settled);

      await Promise.resolve();
      expect(settled).not.toHaveBeenCalled();

      jest.advanceTimersByTime(2400);
      await pending;
      expect(settled).toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });
});
