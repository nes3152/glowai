/**
 * Cloudflare Worker that forwards the app's vision request to OpenAI so the
 * API key never ships in the web bundle.
 *
 * Deploy:
 *   npx wrangler deploy server/openai-proxy.js --name glowai-analysis
 *   npx wrangler secret put OPENAI_API_KEY
 *   (optional) npx wrangler secret put ALLOWED_ORIGIN   e.g. https://nes3152.github.io
 *
 * Then set the repo variable EXPO_PUBLIC_ANALYSIS_URL to the worker URL.
 */
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const ALLOWED_MODELS = ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini'];
const MAX_BODY_BYTES = 6 * 1024 * 1024;

const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
});

export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || '*';
    const headers = corsHeaders(origin);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers });

    const length = Number(request.headers.get('content-length') || 0);
    if (length > MAX_BODY_BYTES) return new Response('Payload too large', { status: 413, headers });

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response('Invalid JSON', { status: 400, headers });
    }
    if (!ALLOWED_MODELS.includes(body.model) || !Array.isArray(body.messages)) {
      return new Response('Bad request', { status: 400, headers });
    }

    const upstream = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  },
};
