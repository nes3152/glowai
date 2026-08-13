import { CONCERN_IDS } from './concerns';

export const BASELINE_SCORE = 30;
export const SELECTED_SCORE = 72;
export const REQUIRED_PHOTOS = 3;

/**
 * Placeholder scoring: turns the user's self-reported concerns into the same
 * shape a real vision model would return, so screens can be built against the
 * final contract. `confidence` and `flags` exist so a low-quality capture can
 * be pushed back to the user instead of silently producing a fake report.
 */
export function buildSkinReport({ photos = [], concerns = [] } = {}) {
  const selected = concerns.filter((id) => CONCERN_IDS.includes(id));
  const scores = {};
  CONCERN_IDS.forEach((id) => {
    scores[id] = selected.includes(id) ? SELECTED_SCORE : BASELINE_SCORE;
  });

  const flags = [];
  if (photos.length < REQUIRED_PHOTOS) flags.push('incomplete_capture');
  if (selected.length === 0) flags.push('no_concerns_selected');

  const severity = CONCERN_IDS.reduce((sum, id) => sum + scores[id], 0) / CONCERN_IDS.length;

  return {
    skinType: deriveSkinType(scores),
    score: Math.round(100 - severity * 0.6),
    scores,
    confidence: Number((Math.min(photos.length, REQUIRED_PHOTOS) / REQUIRED_PHOTOS * 0.9).toFixed(2)),
    flags,
  };
}

export function deriveSkinType(scores) {
  const oily = scores.oiliness > BASELINE_SCORE;
  const dry = scores.dryness > BASELINE_SCORE;
  if (oily && dry) return 'Combination';
  if (oily) return 'Oily';
  if (dry) return 'Dry';
  if (scores.redness > BASELINE_SCORE) return 'Sensitive';
  return 'Normal';
}

/** Concern ids ordered by severity, so the UI can lead with what matters. */
export function topConcerns(scores, limit = 3) {
  return Object.entries(scores)
    .filter(([, value]) => value > BASELINE_SCORE)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([id]) => id);
}
