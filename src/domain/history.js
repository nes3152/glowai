import { CONCERN_IDS } from './concerns';

/** Oldest entries are dropped past this so storage stays bounded. */
export const MAX_ENTRIES = 30;

/** Stored snapshot of one analysis: enough to reopen the report and draw a trend. */
export function toHistoryEntry(analysis, createdAt = Date.now()) {
  const { analysisId, score, scores, skinType, confidence, recommendations, flags = [] } =
    analysis;
  return {
    id: analysisId,
    createdAt,
    score,
    scores,
    skinType,
    confidence,
    flags,
    recommendations,
  };
}

/** Appends newest-first, replacing an entry with the same id and trimming to `max`. */
export function appendEntry(entries, entry, max = MAX_ENTRIES) {
  return [entry, ...entries.filter((e) => e.id !== entry.id)]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, max);
}

/**
 * Per-concern and overall change between the newest entry and the one before it.
 * `null` when there is nothing to compare against. Concern deltas are severity, so a
 * negative number is an improvement; the overall score delta reads the other way.
 */
export function compareLatest(entries) {
  if (entries.length < 2) return null;
  const [latest, previous] = entries;
  const concerns = CONCERN_IDS.filter(
    (id) => typeof latest.scores?.[id] === 'number' && typeof previous.scores?.[id] === 'number',
  ).map((id) => ({ id, delta: latest.scores[id] - previous.scores[id] }));
  return {
    scoreDelta: latest.score - previous.score,
    days: Math.max(0, Math.round((latest.createdAt - previous.createdAt) / 86_400_000)),
    improved: concerns.filter((c) => c.delta < 0).sort((a, b) => a.delta - b.delta),
    worsened: concerns.filter((c) => c.delta > 0).sort((a, b) => b.delta - a.delta),
  };
}

/** Overall scores oldest-first, the order a time-series chart draws them in. */
export function scoreSeries(entries) {
  return [...entries]
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((entry) => ({ id: entry.id, createdAt: entry.createdAt, value: entry.score }));
}

const round = (n) => Math.round(n * 100) / 100;

/**
 * Cartesian points for a 0-100 series inside `width` x `height`, `padding` px from the
 * edges. A single point is centred so it never renders as a zero-length line.
 */
export function trendPoints(values, width, height, padding = 0) {
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  return values.map((value, index) => {
    const clamped = Math.max(0, Math.min(100, value));
    const x = values.length === 1 ? width / 2 : padding + (index / (values.length - 1)) * innerW;
    return { x: round(x), y: round(padding + innerH - (clamped / 100) * innerH) };
  });
}

/** `"x,y x,y"` polyline string for `trendPoints` output. */
export function polylinePoints(points) {
  return points.map(({ x, y }) => `${x},${y}`).join(' ');
}
