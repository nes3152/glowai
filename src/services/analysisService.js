import { buildRecommendations } from '../domain/recommendations';
import { REQUIRED_PHOTOS, buildSkinReport } from '../domain/skinAnalysis';
import { getVisionConfig, requestVisionReport } from './visionService';

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
 * Uses the vision model when configured, otherwise the self-report estimate.
 * A failed vision call degrades to the estimate with a `vision_unavailable` flag
 * rather than blocking the user, since the routine still works from concerns.
 */
async function resolveReport({ photos, concerns }, vision) {
  const estimate = buildSkinReport({ photos, concerns });
  if (!vision.config) return { report: estimate, source: 'local' };
  try {
    const report = await vision.request({ photos, concerns }, { config: vision.config });
    return { report, source: 'vision' };
  } catch {
    return {
      report: { ...estimate, flags: [...estimate.flags, 'vision_unavailable'] },
      source: 'local',
    };
  }
}

/**
 * Single seam between the UI and whatever produces a skin report. Screens only
 * depend on the resolved shape below.
 *
 * @returns {Promise<{analysisId: string, skinType: string, score: number,
 *   scores: Object, confidence: number, flags: string[],
 *   recommendations: Object, disclaimers: string[]}>}
 */
export async function analyzeSkin(
  input,
  { delayMs = 2400, vision = { config: getVisionConfig(), request: requestVisionReport } } = {},
) {
  const {
    photos = [],
    concerns = [],
    budget,
    safetyFlags = [],
    lifestyle = [],
    healthFlags = [],
  } = input ?? {};

  if (photos.length < REQUIRED_PHOTOS) {
    throw new AnalysisError(
      'MISSING_PHOTOS',
      `We need ${REQUIRED_PHOTOS} photos to analyze your skin.`
    );
  }

  const [{ report, source }] = await Promise.all([
    resolveReport({ photos, concerns }, vision),
    delayMs > 0 ? delay(delayMs) : null,
  ]);

  if (report.confidence < MIN_CONFIDENCE) {
    throw new AnalysisError('LOW_CONFIDENCE', 'The photos were too unclear to analyze.');
  }

  return {
    analysisId: `${source}-${Date.now()}`,
    ...report,
    recommendations: buildRecommendations({
      report,
      budgetId: budget,
      safetyFlags,
      lifestyle,
      healthFlags,
    }),
    disclaimers: ['not_medical_advice'],
  };
}
