import { VISION_SCHEMA, buildVisionPrompt, parseVisionReport } from '../domain/visionReport';

export const DEFAULT_MODEL = 'gpt-4o-mini';
export const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Two ways to reach the model:
 *  - `EXPO_PUBLIC_ANALYSIS_URL`: a proxy (see server/openai-proxy.js) that holds the real key.
 *    This is the only safe option for a published web build.
 *  - `EXPO_PUBLIC_OPENAI_API_KEY`: direct call, for local development only. Anything in an
 *    EXPO_PUBLIC_ variable ships inside the bundle.
 */
export function getVisionConfig(env = process.env) {
  const proxyUrl = env.EXPO_PUBLIC_ANALYSIS_URL?.trim();
  const apiKey = env.EXPO_PUBLIC_OPENAI_API_KEY?.trim();
  const model = env.EXPO_PUBLIC_OPENAI_MODEL?.trim() || DEFAULT_MODEL;
  if (proxyUrl) return { url: proxyUrl, apiKey: null, model };
  if (apiKey) return { url: OPENAI_URL, apiKey, model };
  return null;
}

export class VisionRequestError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'VisionRequestError';
    this.status = status;
  }
}

/** Camera URIs are `blob:` on web and `file:` on native; the API needs inline data. */
export async function toDataUrl(uri, fetchFn = fetch) {
  if (uri.startsWith('data:')) return uri;
  const blob = await (await fetchFn(uri)).blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new VisionRequestError('Could not read photo.'));
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

export function buildVisionRequest({ images, concerns, model }) {
  return {
    model,
    max_tokens: 300,
    response_format: { type: 'json_schema', json_schema: VISION_SCHEMA },
    messages: [
      { role: 'system', content: buildVisionPrompt(concerns) },
      {
        role: 'user',
        content: images.map((url) => ({
          type: 'image_url',
          image_url: { url, detail: 'low' },
        })),
      },
    ],
  };
}

export async function requestVisionReport(
  { photos, concerns = [] },
  { config = getVisionConfig(), fetchFn = fetch, timeoutMs = 30_000 } = {},
) {
  if (!config) throw new VisionRequestError('Vision analysis is not configured.');

  const images = await Promise.all(photos.map((uri) => toDataUrl(uri, fetchFn)));
  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

  let response;
  try {
    response = await fetchFn(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
      },
      body: JSON.stringify(buildVisionRequest({ images, concerns, model: config.model })),
      signal: controller?.signal,
    });
  } catch (e) {
    throw new VisionRequestError(
      e?.name === 'AbortError' ? 'The analysis timed out.' : 'Could not reach the analysis service.',
    );
  } finally {
    if (timer) clearTimeout(timer);
  }

  if (!response.ok) {
    throw new VisionRequestError(`Analysis service returned ${response.status}.`, response.status);
  }

  const body = await response.json();
  const message = body?.choices?.[0]?.message;
  if (message?.refusal) throw new VisionRequestError('The model declined to analyze the photos.');
  return parseVisionReport(message?.content);
}
