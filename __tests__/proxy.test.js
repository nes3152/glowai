import worker, { checkAndCount, secondsUntilUtcMidnight, utcDay } from '../server/openai-proxy';

const memoryKv = () => {
  const store = new Map();
  return {
    store,
    get: jest.fn(async (k) => store.get(k) ?? null),
    put: jest.fn(async (k, v) => store.set(k, v)),
  };
};

const validBody = () => ({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: 'x' },
    { role: 'user', content: [{ type: 'image_url', image_url: { url: 'data:,a' } }] },
  ],
});

const post = (body, headers = {}) =>
  new Request('https://proxy.test/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '1.2.3.4', ...headers },
    body: JSON.stringify(body),
  });

describe('checkAndCount', () => {
  const opts = { day: '2026-09-14', ipHash: 'abc', dailyLimit: 3, ipLimit: 2 };

  it('counts each call under both keys', async () => {
    const kv = memoryKv();
    expect(await checkAndCount(kv, opts)).toBeNull();
    expect(kv.store.get('day:2026-09-14')).toBe('1');
    expect(kv.store.get('ip:abc:2026-09-14')).toBe('1');
  });

  it('stops a single IP at its limit without touching the daily counter', async () => {
    const kv = memoryKv();
    await checkAndCount(kv, opts);
    await checkAndCount(kv, opts);
    expect(await checkAndCount(kv, opts)).toEqual({ scope: 'ip', used: 2, limit: 2 });
    expect(kv.store.get('day:2026-09-14')).toBe('2');
  });

  it('stops everyone once the daily cap is reached', async () => {
    const kv = memoryKv();
    kv.store.set('day:2026-09-14', '3');
    expect(await checkAndCount(kv, { ...opts, ipHash: 'fresh' })).toEqual({
      scope: 'daily',
      used: 3,
      limit: 3,
    });
    expect(kv.put).not.toHaveBeenCalled();
  });

  it('expires counters so old days do not accumulate', async () => {
    const kv = memoryKv();
    await checkAndCount(kv, opts);
    expect(kv.put).toHaveBeenCalledWith(
      'day:2026-09-14',
      '1',
      expect.objectContaining({ expirationTtl: expect.any(Number) }),
    );
  });
});

describe('time helpers', () => {
  it('formats the UTC day and counts down to midnight', () => {
    const now = new Date('2026-09-14T21:30:00Z');
    expect(utcDay(now)).toBe('2026-09-14');
    expect(secondsUntilUtcMidnight(now)).toBe(2.5 * 3600);
  });
});

describe('worker fetch', () => {
  let logSpy;
  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    global.fetch = jest.fn();
  });
  afterEach(() => {
    logSpy.mockRestore();
  });

  const logged = () => logSpy.mock.calls.map(([line]) => JSON.parse(line));

  it('returns 429 with Retry-After once the IP limit is hit and logs it', async () => {
    const kv = memoryKv();
    const env = { OPENAI_API_KEY: 'k', USAGE: kv, IP_DAILY_LIMIT: '0' };
    const res = await worker.fetch(post(validBody()), env);
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ error: 'rate_limited', scope: 'ip' });
    expect(Number(res.headers.get('Retry-After'))).toBeGreaterThan(0);
    expect(global.fetch).not.toHaveBeenCalled();
    expect(logged()[0]).toMatchObject({ event: 'rejected', reason: 'rate_limited', status: 429 });
    expect(logged()[0].ip).not.toBe('1.2.3.4');
  });

  it('forwards to OpenAI and logs token usage without image data', async () => {
    global.fetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ finish_reason: 'stop', message: { content: '{}' } }],
          usage: { prompt_tokens: 100, completion_tokens: 20, total_tokens: 120 },
        }),
        { status: 200 },
      ),
    );
    const res = await worker.fetch(post(validBody()), { OPENAI_API_KEY: 'k', USAGE: memoryKv() });
    expect(res.status).toBe(200);
    const [, init] = global.fetch.mock.calls[0];
    expect(init.headers.Authorization).toBe('Bearer k');
    const entry = logged()[0];
    expect(entry).toMatchObject({
      event: 'completed',
      status: 200,
      model: 'gpt-4o-mini',
      images: 1,
      usage: { prompt: 100, completion: 20, total: 120 },
      finishReason: 'stop',
    });
    expect(JSON.stringify(entry)).not.toContain('data:,a');
  });

  it('runs unlimited when no KV binding is configured', async () => {
    global.fetch.mockResolvedValue(new Response('{}', { status: 200 }));
    const res = await worker.fetch(post(validBody()), { OPENAI_API_KEY: 'k' });
    expect(res.status).toBe(200);
  });

  it('answers 502 and logs when OpenAI is unreachable', async () => {
    global.fetch.mockRejectedValue(new Error('boom'));
    const res = await worker.fetch(post(validBody()), { OPENAI_API_KEY: 'k' });
    expect(res.status).toBe(502);
    expect(logged()[0]).toMatchObject({ event: 'upstream_error', status: 502 });
  });
});
