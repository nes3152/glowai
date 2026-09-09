import { CONCERN_IDS, CONCERNS } from './concerns';
import { deriveSkinType } from './skinAnalysis';

export const SKIN_TYPES = ['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive'];
export const VISION_FLAGS = ['blurry', 'poor_lighting', 'face_not_visible', 'makeup_detected'];

/** Structured-output schema sent to the model; `parseVisionReport` re-validates the reply. */
export const VISION_SCHEMA = {
  name: 'skin_report',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['scores', 'skinType', 'confidence', 'flags'],
    properties: {
      scores: {
        type: 'object',
        additionalProperties: false,
        required: CONCERN_IDS,
        properties: Object.fromEntries(
          CONCERN_IDS.map((id) => [id, { type: 'integer', minimum: 0, maximum: 100 }]),
        ),
      },
      skinType: { type: 'string', enum: SKIN_TYPES },
      confidence: { type: 'number', minimum: 0, maximum: 1 },
      flags: { type: 'array', items: { type: 'string', enum: VISION_FLAGS } },
    },
  },
};

export function buildVisionPrompt(concerns = []) {
  const concernList = CONCERNS.map((c) => `- ${c.id}: ${c.label}`).join('\n');
  const selfReported = concerns.length ? concerns.join(', ') : 'none';
  return [
    'You are a cosmetic skin-analysis assistant. You receive three selfies of the same person',
    '(front, left side, right side). Rate the visible severity of each concern from 0 (none)',
    'to 100 (severe). This is cosmetic guidance only, not a medical diagnosis.',
    '',
    'Concerns to score:',
    concernList,
    '',
    `The user self-reported these concerns: ${selfReported}. Use them as a hint, but score`,
    'what you actually see. Set confidence below 0.5 if a face is not clearly visible in all',
    'three photos, and add the matching flags for blur, poor lighting, missing face or makeup.',
  ].join('\n');
}

export class VisionParseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'VisionParseError';
  }
}

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

/** Normalises a model reply into the report shape `buildSkinReport` produces. */
export function parseVisionReport(raw) {
  const data = typeof raw === 'string' ? safeJson(raw) : raw;
  if (!data || typeof data !== 'object') throw new VisionParseError('Reply was not an object.');
  if (!data.scores || typeof data.scores !== 'object') {
    throw new VisionParseError('Reply had no scores.');
  }

  const scores = {};
  CONCERN_IDS.forEach((id) => {
    const value = Number(data.scores[id]);
    if (!Number.isFinite(value)) throw new VisionParseError(`Missing score for ${id}.`);
    scores[id] = Math.round(clamp(value, 0, 100));
  });

  const confidence = Number(data.confidence);
  if (!Number.isFinite(confidence)) throw new VisionParseError('Missing confidence.');

  const flags = Array.isArray(data.flags)
    ? data.flags.filter((f) => VISION_FLAGS.includes(f))
    : [];

  const severity = CONCERN_IDS.reduce((sum, id) => sum + scores[id], 0) / CONCERN_IDS.length;

  return {
    skinType: SKIN_TYPES.includes(data.skinType) ? data.skinType : deriveSkinType(scores),
    score: Math.round(100 - severity * 0.6),
    scores,
    confidence: Number(clamp(confidence, 0, 1).toFixed(2)),
    flags,
  };
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    throw new VisionParseError('Reply was not valid JSON.');
  }
}
