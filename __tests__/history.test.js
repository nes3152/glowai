import {
  MAX_ENTRIES,
  appendEntry,
  compareLatest,
  polylinePoints,
  scoreSeries,
  toHistoryEntry,
  trendPoints,
} from '../src/domain/history';
import { HISTORY_KEY, clearHistory, loadHistory, saveAnalysis } from '../src/services/historyService';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const DAY = 86_400_000;

const analysis = (id, score, scores, extra = {}) => ({
  analysisId: id,
  score,
  scores,
  skinType: 'Normal',
  confidence: 0.9,
  flags: [],
  recommendations: { cosmetics: [] },
  disclaimers: ['not_medical_advice'],
  ...extra,
});

const entry = (id, createdAt, score, scores = {}) =>
  toHistoryEntry(analysis(id, score, scores), createdAt);

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: jest.fn(async (key) => data[key] ?? null),
    setItem: jest.fn(async (key, value) => {
      data[key] = value;
    }),
    removeItem: jest.fn(async (key) => {
      delete data[key];
    }),
  };
}

describe('toHistoryEntry', () => {
  it('keeps what the result screen and trend need, and drops disclaimers', () => {
    const saved = toHistoryEntry(analysis('a1', 70, { acne: 72 }), 1000);
    expect(saved).toMatchObject({ id: 'a1', createdAt: 1000, score: 70, scores: { acne: 72 } });
    expect(saved.recommendations).toEqual({ cosmetics: [] });
    expect(saved).not.toHaveProperty('disclaimers');
  });
});

describe('appendEntry', () => {
  it('puts the newest report first', () => {
    const list = appendEntry([entry('a', 1000, 60)], entry('b', 2000, 65));
    expect(list.map((e) => e.id)).toEqual(['b', 'a']);
  });

  it('replaces an entry with the same id instead of duplicating it', () => {
    const list = appendEntry([entry('a', 1000, 60)], entry('a', 1000, 61));
    expect(list).toHaveLength(1);
    expect(list[0].score).toBe(61);
  });

  it('drops the oldest entries past the cap', () => {
    const many = Array.from({ length: MAX_ENTRIES }, (_, i) => entry(`e${i}`, i * DAY, 50));
    const list = appendEntry(many, entry('new', MAX_ENTRIES * DAY, 50));
    expect(list).toHaveLength(MAX_ENTRIES);
    expect(list[0].id).toBe('new');
    expect(list.map((e) => e.id)).not.toContain('e0');
  });
});

describe('compareLatest', () => {
  it('is null with fewer than two reports', () => {
    expect(compareLatest([])).toBeNull();
    expect(compareLatest([entry('a', 1000, 60)])).toBeNull();
  });

  it('reports the score change, days elapsed and which concerns moved', () => {
    const previous = entry('a', 0, 60, { acne: 72, dryness: 30, redness: 30 });
    const latest = entry('b', 14 * DAY, 66, { acne: 30, dryness: 72, redness: 30 });
    const diff = compareLatest([latest, previous]);
    expect(diff.scoreDelta).toBe(6);
    expect(diff.days).toBe(14);
    expect(diff.improved).toEqual([{ id: 'acne', delta: -42 }]);
    expect(diff.worsened).toEqual([{ id: 'dryness', delta: 42 }]);
  });

  it('ignores concerns missing from either report', () => {
    const diff = compareLatest([entry('b', DAY, 60, { acne: 30 }), entry('a', 0, 60, {})]);
    expect(diff.improved).toEqual([]);
    expect(diff.worsened).toEqual([]);
  });
});

describe('scoreSeries', () => {
  it('is oldest-first regardless of input order', () => {
    const series = scoreSeries([entry('b', 2000, 65), entry('c', 3000, 70), entry('a', 1000, 60)]);
    expect(series.map((p) => p.value)).toEqual([60, 65, 70]);
  });
});

describe('trendPoints', () => {
  it('spreads points across the width and maps 0-100 onto the height', () => {
    const points = trendPoints([0, 50, 100], 120, 60, 10);
    expect(points).toEqual([
      { x: 10, y: 50 },
      { x: 60, y: 30 },
      { x: 110, y: 10 },
    ]);
  });

  it('centres a single point', () => {
    expect(trendPoints([50], 120, 60, 10)).toEqual([{ x: 60, y: 30 }]);
  });

  it('clamps values outside 0-100', () => {
    const [low, high] = trendPoints([-20, 140], 100, 100, 0);
    expect(low.y).toBe(100);
    expect(high.y).toBe(0);
  });

  it('renders as an SVG polyline string', () => {
    expect(polylinePoints([{ x: 1, y: 2 }, { x: 3.5, y: 4 }])).toBe('1,2 3.5,4');
  });
});

describe('historyService', () => {
  it('returns an empty list when nothing is stored or the JSON is corrupt', async () => {
    expect(await loadHistory(memoryStorage())).toEqual([]);
    expect(await loadHistory(memoryStorage({ [HISTORY_KEY]: '{not json' }))).toEqual([]);
    expect(await loadHistory(memoryStorage({ [HISTORY_KEY]: '{"a":1}' }))).toEqual([]);
  });

  it('saves newest-first and round-trips through storage', async () => {
    const storage = memoryStorage();
    await saveAnalysis(analysis('a', 60, { acne: 72 }), { now: 1000, storage });
    const history = await saveAnalysis(analysis('b', 66, { acne: 30 }), { now: 2000, storage });

    expect(history.map((e) => e.id)).toEqual(['b', 'a']);
    expect(await loadHistory(storage)).toEqual(history);
  });

  it('still resolves with the merged history when storage writes fail', async () => {
    const storage = memoryStorage();
    storage.setItem.mockRejectedValue(new Error('quota'));
    const history = await saveAnalysis(analysis('a', 60, {}), { now: 1000, storage });
    expect(history).toHaveLength(1);
  });

  it('clears everything', async () => {
    const storage = memoryStorage();
    await saveAnalysis(analysis('a', 60, {}), { now: 1000, storage });
    await clearHistory(storage);
    expect(await loadHistory(storage)).toEqual([]);
  });
});
