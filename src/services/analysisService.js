import { buildRecommendations } from '../domain/recommendations';
import { REQUIRED_PHOTOS, buildSkinReport } from '../domain/skinAnalysis';

export class AnalysisError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'AnalysisError';
    this.code = code;
  }
}

export const MIN_CONFIDENCE = 0.5;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Single seam between the UI and whatever produces a skin report. Screens must
 * only depend on the resolved shape below, so swapping this for a real HTTP
 * call requires no screen changes.
 *
 * @returns {Promise<{analysisId: string, skinType: string, score: number,
 *   scores: Object, confidence: number, flags: string[],
 *   recommendations: Object, disclaimers: string[]}>}
 */
export async function analyzeSkin(input, { delayMs = 2400 } = {}) {
  const { photos = [], concerns = [], budget, safetyFlags = [], lifestyle = [] } = input ?? {};

  if (photos.length < REQUIRED_PHOTOS) {
    throw new AnalysisError(
      'MISSING_PHOTOS',
      `We need ${REQUIRED_PHOTOS} photos to analyze your skin.`
    );
  }

  if (delayMs > 0) await delay(delayMs);

  const report = buildSkinReport({ photos, concerns });

  if (report.confidence < MIN_CONFIDENCE) {
    throw new AnalysisError('LOW_CONFIDENCE', 'The photos were too unclear to analyze.');
  }

  return {
    analysisId: `local-${Date.now()}`,
    ...report,
    recommendations: buildRecommendations({ report, budgetId: budget, safetyFlags, lifestyle }),
    disclaimers: ['not_medical_advice'],
  };
}
