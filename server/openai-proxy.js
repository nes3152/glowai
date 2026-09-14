/**
 * Cloudflare Worker that forwards the app's vision request to OpenAI so the
 * API key never ships in the web bundle.
 *
 * Deploy (from repo root, uses server/wrangler.toml):
 *   npx wrangler kv namespace create USAGE -c server/wrangler.toml   # once; paste id into wrangler.toml
 *   npx wrangler deploy -c server/wrangler.toml
 *   npx wrangler secret put OPENAI_API_KEY -c server/wrangler.toml
 *   (optional) npx wrangler secret put ALLOWED_ORIGIN -c server/wrangler.toml
 *
 * Limits (vars in wrangler.toml): DAILY_LIMIT total calls per UTC day, IP_DAILY_LIMIT per
 * client IP per UTC day. Counters live in the USAGE KV namespace; without the binding the
 * worker runs unlimited. Every request emits one JSON log line (see `logEvent`) that shows
 * up in Workers Logs / `wrangler tail`; image data is never logged.
 */
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const ALLOWED_MODELS = ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini'];
const MAX_BODY_BYTES = 6 * 1024 * 1024;
const DEFAULT_DAILY_LIMIT = 200;
const DEFAULT_IP_DAILY_LIMIT = 10;
const COUNTER_TTL_SECONDS = 2 * 24 * 60 * 60;

const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
});

export const utcDay = (now = new Date()) => now.toISOString().slice(0, 10);

export const secondsUntilUtcMidnight = (now = new Date()) => {
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return Math.max(1, Math.ceil((next - now.getTime()) / 1000));
};

const limitFrom = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

async function hashIp(ip) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
  return [...new Uint8Array(digest).slice(0, 8)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Best-effort daily counters. KV is eventually consistent, so a burst can
 * slightly overshoot; that is acceptable for a cost cap.
 * @returns {Promise<{scope: 'daily'|'ip', used: number, limit: number} | null>} the limit hit, if any
 */
export async function checkAndCount(kv, { day, ipHash, dailyLimit, ipLimit }) {
  const dayKey = `day:${day}`;
  const ipKey = `ip:${ipHash}:${day}`;
  const [dayUsed, ipUsed] = (await Promise.all([kv.get(dayKey), kv.get(ipKey)])).map(
    (v) => Number(v) || 0,
  );
  if (dayUsed >= dailyLimit) return { scope: 'daily', used: dayUsed, limit: dailyLimit };
  if (ipUsed >= ipLimit) return { scope: 'ip', used: ipUsed, limit: ipLimit };
  await Promise.all([
    kv.put(dayKey, String(dayUsed + 1), { expirationTtl: COUNTER_TTL_SECONDS }),
    kv.put(ipKey, String(ipUsed + 1), { expirationTtl: COUNTER_TTL_SECONDS }),
  ]);
  return null;
}

const json = (status, body, headers) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });

const logEvent = (event) => console.log(JSON.stringify(event));

export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || '*';
    const headers = corsHeaders(origin);
    const startedAt = Date.now();
    const requestOrigin = request.headers.get('origin');
    const country = request.headers.get('cf-ipcountry') || null;
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const ipHash = await hashIp(ip);
    const log = (event) =>
      logEvent({
        ts: new Date(startedAt).toISOString(),
        ms: Date.now() - startedAt,
        ip: ipHash,
        country,
        origin: requestOrigin,
        ...event,
      });

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'POST') {
      log({ event: 'rejected', reason: 'method', status: 405 });
      return new Response('Method not allowed', { status: 405, headers });
    }

    const length = Number(request.headers.get('content-length') || 0);
    if (length > MAX_BODY_BYTES) {
      log({ event: 'rejected', reason: 'too_large', status: 413, bytes: length });
      return new Response('Payload too large', { status: 413, headers });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      log({ event: 'rejected', reason: 'invalid_json', status: 400 });
      return new Response('Invalid JSON', { status: 400, headers });
    }
    if (!ALLOWED_MODELS.includes(body.model) || !Array.isArray(body.messages)) {
      log({ event: 'rejected', reason: 'bad_request', status: 400, model: body.model ?? null });
      return new Response('Bad request', { status: 400, headers });
    }

    if (env.USAGE) {
      const hit = await checkAndCount(env.USAGE, {
        day: utcDay(),
        ipHash,
        dailyLimit: limitFrom(env.DAILY_LIMIT, DEFAULT_DAILY_LIMIT),
        ipLimit: limitFrom(env.IP_DAILY_LIMIT, DEFAULT_IP_DAILY_LIMIT),
      });
      if (hit) {
        log({ event: 'rejected', reason: 'rate_limited', status: 429, ...hit });
        return json(
          429,
          { error: 'rate_limited', scope: hit.scope },
          { ...headers, 'Retry-After': String(secondsUntilUtcMidnight()) },
        );
      }
    }

    let upstream;
    try {
      upstream = await fetch(OPENAI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify(body),
      });
    } catch (e) {
      log({ event: 'upstream_error', status: 502, error: e?.message ?? String(e) });
      return json(502, { error: 'upstream_unreachable' }, headers);
    }

    const text = await upstream.text();
    let usage = null;
    let finishReason = null;
    let upstreamError = null;
    try {
      const parsed = JSON.parse(text);
      usage = parsed.usage
        ? {
            prompt: parsed.usage.prompt_tokens,
            completion: parsed.usage.completion_tokens,
            total: parsed.usage.total_tokens,
          }
        : null;
      finishReason = parsed.choices?.[0]?.finish_reason ?? null;
      upstreamError = parsed.error ? { type: parsed.error.type, code: parsed.error.code } : null;
    } catch {
      /* non-JSON upstream body; still forwarded below */
    }
    log({
      event: upstream.ok ? 'completed' : 'upstream_error',
      status: upstream.status,
      model: body.model,
      images: body.messages.reduce(
        (n, m) => n + (Array.isArray(m.content) ? m.content.filter((c) => c.type === 'image_url').length : 0),
        0,
      ),
      usage,
      finishReason,
      error: upstreamError,
    });

    return new Response(text, {
      status: upstream.status,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  },
};
