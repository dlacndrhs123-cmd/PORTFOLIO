const json = (body, status = 200, extra = {}) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra }
});
function localTesting(request, env) {
  const host = new URL(request.url).hostname;
  return env.ALLOW_LOCAL_GUESTBOOK_TEST === 'true' && ['localhost', '127.0.0.1', '[::1]'].includes(host);
}
function configured(request, env) {
  return Boolean(env.GITHUB_TOKEN && /^[a-zA-Z0-9-]+$/.test(env.GITHUB_OWNER || '') && /^[a-zA-Z0-9_.-]+$/.test(env.GITHUB_REPO || '') && env.GITHUB_BRANCH &&
    ((env.TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY) || localTesting(request, env)));
}
async function readJSON(request) {
  if (Number(request.headers.get('content-length')) > 8192) throw new Error('size');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('json');
  let length = 0;
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > 8192) { await reader.cancel(); throw new Error('size'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(bytes));
}
export async function onRequest({ request, env }) {
  if (request.method === 'GET') {
    return json({ available: configured(request, env), siteKey: env.TURNSTILE_SITE_KEY || '' });
  }
  if (request.method !== 'POST') return json({ message: '지원하지 않는 요청입니다.' }, 405, { Allow: 'GET, POST' });
  if (request.headers.get('origin') !== new URL(request.url).origin) return json({ message: '허용되지 않은 요청입니다.' }, 403);
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') return json({ message: 'JSON 요청만 허용됩니다.' }, 415);
  let input;
  try { input = await readJSON(request); }
  catch (error) { return json({ message: error.message === 'size' ? '입력 내용이 너무 깁니다.' : '입력 형식이 올바르지 않습니다.' }, error.message === 'size' ? 413 : 400); }
  if (!input || typeof input !== 'object' || Array.isArray(input)) return json({ message: '입력 형식이 올바르지 않습니다.' }, 400);
  if (input.website) return json({ ok: true }, 201); // Honeypot: never save spam.
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const message = typeof input.message === 'string' ? input.message.trim() : '';
  if (!name || !message || [...name].length > 40 || [...message].length > 500 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(name + message)) {
    return json({ message: '이름은 1~40자, 메시지는 1~500자로 입력해주세요.' }, 400);
  }
  if (!configured(request, env)) return json({ message: '방명록 준비 중입니다. 잠시 후 다시 방문해주세요.' }, 503);
  try {
    if (!localTesting(request, env)) {
      const token = input.turnstileToken;
      if (typeof token !== 'string' || !token || token.length > 2048) return json({ message: '스팸 방지 인증을 완료해주세요.' }, 400);
      const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: token, remoteip: request.headers.get('CF-Connecting-IP') || undefined }),
        signal: AbortSignal.timeout(10000)
      });
      if (!verification.ok) throw new Error('Verification unavailable');
      const result = await verification.json();
      if (!result.success || result.action !== 'guestbook' || result.hostname !== new URL(request.url).hostname) {
        return json({ message: '인증에 실패했습니다. 다시 인증해주세요.' }, 403);
      }
    }
    const createdAt = new Date().toISOString();
    const filename = `${createdAt.replace(/[:.]/g, '-')}-${crypto.randomUUID()}.json`;
    const content = JSON.stringify({ name, message, createdAt, approved: false }, null, 2) + '\n';
    const bytes = new TextEncoder().encode(content);
    const encoded = btoa(String.fromCharCode(...bytes));
    const url = `https://api.github.com/repos/${encodeURIComponent(env.GITHUB_OWNER)}/${encodeURIComponent(env.GITHUB_REPO)}/contents/content/guestbook/${filename}`;
    const saved = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'portfolio-guestbook',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify({ message: 'Add guestbook message for moderation', content: encoded, branch: env.GITHUB_BRANCH }),
      signal: AbortSignal.timeout(10000)
    });
    if (saved.status !== 201) throw new Error('Save failed');
    return json({ ok: true }, 201);
  } catch {
    // Never return upstream responses: they may contain repository or credential details.
    return json({ message: '전송하지 못했습니다. 잠시 후 다시 시도해주세요.' }, 502);
  }
}
