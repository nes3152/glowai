import { CONCERN_IDS } from '../src/domain/concerns';
import {
  VISION_SCHEMA,
  VisionParseError,
  buildVisionPrompt,
  parseVisionReport,
} from '../src/domain/visionReport';
import { analyzeSkin } from '../src/services/analysisService';
import {
  OPENAI_URL,
  VisionRequestError,
  buildVisionRequest,
  getVisionConfig,
  requestVisionReport,
} from '../src/services/visionService';

const photos = ['data:image/jpeg;base64,AAA', 'data:image/jpeg;base64,BBB', 'data:image/jpeg;base64,CCC'];

const validReply = {
  scores: { acne: 65, pores: 40, wrinkles: 10, dryness: 20, oiliness: 55, pigmentation: 30, redness: 45 },
  skinType: 'Oily',
  confidence: 0.82,
  flags: [],
};

const openAiResponse = (content, extra = {}) => ({
  ok: true,
  status: 200,
  json: async () => ({ choices: [{ message: { content, ...extra } }] }),
});

describe('parseVisionReport', () => {
  it('normalises a valid reply into the report shape', () => {
    const report = parseVisionReport(validReply);
    expect(report.scores).toEqual(validReply.scores);
    expect(report.skinType).toBe('Oily');
    expect(report.confidence).toBe(0.82);
    expect(report.flags).toEqual([]);
    expect(report.score).toBe(Math.round(100 - (265 / 7) * 0.6));
  });

  it('accepts a JSON string and clamps out-of-range values', () => {
    const report = parseVisionReport(
      JSON.stringify({ ...validReply, scores: { ...validReply.scores, acne: 140, pores: -5 }, confidence: 1.4 }),
    );
    expect(report.scores.acne).toBe(100);
    expect(report.scores.pores).toBe(0);
    expect(report.confidence).toBe(1);
  });

  it('derives the skin type when the model returns an unknown one', () => {
    const report = parseVisionReport({ ...validReply, skinType: 'Glowy' });
    expect(report.skinType).toBe('Oily');
  });

  it('drops flags it does not know about', () => {
    const report = parseVisionReport({ ...validReply, flags: ['blurry', 'alien'] });
    expect(report.flags).toEqual(['blurry']);
  });

  it.each([
    ['not json', 'nope{'],
    ['no scores', { confidence: 0.9 }],
    ['missing concern', { ...validReply, scores: { acne: 10 } }],
    ['missing confidence', { scores: validReply.scores }],
    ['null', null],
  ])('rejects %s', (_, input) => {
    expect(() => parseVisionReport(input)).toThrow(VisionParseError);
  });

  it('keeps the schema in sync with the concern list', () => {
    expect(VISION_SCHEMA.schema.properties.scores.required).toEqual(CONCERN_IDS);
    expect(buildVisionPrompt(['acne'])).toContain('acne');
  });
});

describe('getVisionConfig', () => {
  it('returns null when nothing is configured', () => {
    expect(getVisionConfig({})).toBeNull();
  });

  it('prefers the proxy over a direct key', () => {
    const config = getVisionConfig({
      EXPO_PUBLIC_ANALYSIS_URL: 'https://proxy.test/',
      EXPO_PUBLIC_OPENAI_API_KEY: 'sk-test',
    });
    expect(config).toEqual({ url: 'https://proxy.test/', apiKey: null, model: 'gpt-4o-mini' });
  });

  it('calls OpenAI directly with a key and custom model', () => {
    const config = getVisionConfig({ EXPO_PUBLIC_OPENAI_API_KEY: 'sk-test', EXPO_PUBLIC_OPENAI_MODEL: 'gpt-4o' });
    expect(config).toEqual({ url: OPENAI_URL, apiKey: 'sk-test', model: 'gpt-4o' });
  });
});

describe('requestVisionReport', () => {
  const config = { url: 'https://proxy.test/', apiKey: null, model: 'gpt-4o-mini' };

  it('posts three images with the structured-output schema', async () => {
    const fetchFn = jest.fn().mockResolvedValue(openAiResponse(JSON.stringify(validReply)));
    const report = await requestVisionReport({ photos, concerns: ['acne'] }, { config, fetchFn });

    expect(report.scores.acne).toBe(65);
    const [url, init] = fetchFn.mock.calls[0];
    expect(url).toBe(config.url);
    expect(init.headers.Authorization).toBeUndefined();
    const body = JSON.parse(init.body);
    expect(body.response_format.json_schema.name).toBe('skin_report');
    expect(body.messages[1].content).toHaveLength(3);
    expect(body.messages[1].content[0].image_url.url).toBe(photos[0]);
  });

  it('sends a bearer token when calling OpenAI directly', async () => {
    const fetchFn = jest.fn().mockResolvedValue(openAiResponse(JSON.stringify(validReply)));
    await requestVisionReport({ photos }, { config: { ...config, apiKey: 'sk-test' }, fetchFn });
    expect(fetchFn.mock.calls[0][1].headers.Authorization).toBe('Bearer sk-test');
  });

  it('fails on HTTP errors, refusals and network errors', async () => {
    await expect(
      requestVisionReport({ photos }, { config, fetchFn: jest.fn().mockResolvedValue({ ok: false, status: 429 }) }),
    ).rejects.toMatchObject({ name: 'VisionRequestError', status: 429 });

    await expect(
      requestVisionReport(
        { photos },
        { config, fetchFn: jest.fn().mockResolvedValue(openAiResponse(null, { refusal: 'no' })) },
      ),
    ).rejects.toBeInstanceOf(VisionRequestError);

    await expect(
      requestVisionReport({ photos }, { config, fetchFn: jest.fn().mockRejectedValue(new Error('down')) }),
    ).rejects.toBeInstanceOf(VisionRequestError);
  });

  it('throws when not configured', async () => {
    await expect(requestVisionReport({ photos }, { config: null })).rejects.toBeInstanceOf(VisionRequestError);
  });

  it('builds a low-detail request to keep token cost down', () => {
    const body = buildVisionRequest({ images: photos, concerns: [], model: 'gpt-4o-mini' });
    expect(body.messages[1].content.every((c) => c.image_url.detail === 'low')).toBe(true);
  });
});

describe('analyzeSkin with vision', () => {
  const run = (vision) => analyzeSkin({ photos, concerns: ['acne'], budget: 'budget3' }, { delayMs: 0, vision });

  it('uses the vision report and tags the id', async () => {
    const request = jest.fn().mockResolvedValue(parseVisionReport(validReply));
    const analysis = await run({ config: {}, request });
    expect(analysis.analysisId).toMatch(/^vision-/);
    expect(analysis.scores.acne).toBe(65);
    expect(analysis.recommendations.cosmetics.length).toBeGreaterThan(0);
  });

  it('falls back to the estimate with a flag when vision fails', async () => {
    const request = jest.fn().mockRejectedValue(new VisionRequestError('down'));
    const analysis = await run({ config: {}, request });
    expect(analysis.analysisId).toMatch(/^local-/);
    expect(analysis.flags).toContain('vision_unavailable');
    expect(analysis.scores.acne).toBe(72);
  });

  it('rejects LOW_CONFIDENCE when the model cannot see a face', async () => {
    const request = jest.fn().mockResolvedValue(
      parseVisionReport({ ...validReply, confidence: 0.2, flags: ['face_not_visible'] }),
    );
    await expect(run({ config: {}, request })).rejects.toMatchObject({ code: 'LOW_CONFIDENCE' });
  });

  it('rejects NO_FACE when the model flags a missing face even at passable confidence', async () => {
    const request = jest.fn().mockResolvedValue(
      parseVisionReport({ ...validReply, confidence: 0.5, flags: ['face_not_visible'] }),
    );
    await expect(run({ config: {}, request })).rejects.toMatchObject({ code: 'NO_FACE' });
  });

  it('skips vision entirely when not configured', async () => {
    const request = jest.fn();
    const analysis = await run({ config: null, request });
    expect(request).not.toHaveBeenCalled();
    expect(analysis.analysisId).toMatch(/^local-/);
  });
});
