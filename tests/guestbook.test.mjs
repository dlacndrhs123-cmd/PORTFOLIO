import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../functions/api/guestbook.js';

const env = {
  GITHUB_TOKEN: 'test-token-not-a-real-credential',
  GITHUB_OWNER: 'dlacndrhs123-cmd', GITHUB_REPO: 'PORTFOLIO', GITHUB_BRANCH: 'main',
  TURNSTILE_SITE_KEY: 'test-sitekey', TURNSTILE_SECRET_KEY: 'test-secret'
};
const origin = 'https://portfolio.example';
function request(body, headers = {}, url = origin + '/api/guestbook') {
  return new Request(url, { method: 'POST', headers: { origin: new URL(url).origin, 'content-type': 'application/json', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });
}
const input = { name: '방문자', message: '작품 잘 봤습니다.', turnstileToken: 'test-token' };
function stubFetch(handler) {
  const original = globalThis.fetch;
  globalThis.fetch = handler;
  return () => { globalThis.fetch = original; };
}
const verified = () => new Response(JSON.stringify({ success: true, action: 'guestbook', hostname: 'portfolio.example' }));

test('GET returns public site key only; unconfigured deployment disables submission', async () => {
  let response = await onRequest({ request: new Request(origin + '/api/guestbook'), env });
  assert.deepEqual(await response.json(), { available: true, siteKey: 'test-sitekey' });
  response = await onRequest({ request: new Request(origin + '/api/guestbook'), env: {} });
  assert.equal((await response.json()).available, false);
});
test('unsupported methods and cross-origin submissions are rejected', async () => {
  assert.equal((await onRequest({ request: new Request(origin + '/api/guestbook', { method: 'DELETE' }), env })).status, 405);
  assert.equal((await onRequest({ request: request(input, { origin: 'https://attacker.example' }), env })).status, 403);
  assert.equal((await onRequest({ request: request(input, { 'content-type': 'text/plain' }), env })).status, 415);
});
test('empty, overlong, non-string and malformed data never reach GitHub', async () => {
  const restore = stubFetch(() => { assert.fail('invalid input must not reach network'); });
  try {
    for (const body of [{ ...input, name: '  ' }, { ...input, message: '' }, { ...input, name: '가'.repeat(41) }, { ...input, message: '나'.repeat(501) }, { ...input, name: 12 }, { ...input, message: '\u0000test' }, 'null', '[]', '{']) {
      assert.equal((await onRequest({ request: request(body), env })).status, 400);
    }
    assert.equal((await onRequest({ request: request('x'.repeat(8193)), env })).status, 413);
  } finally { restore(); }
});
test('honeypot pretends success without storing a message', async () => {
  const restore = stubFetch(() => { assert.fail('honeypot must not reach network'); });
  try { assert.equal((await onRequest({ request: request({ ...input, website: 'spam.example' }), env })).status, 201); }
  finally { restore(); }
});
test('deployment requires GitHub secrets and Turnstile; local bypass cannot work on public host', async () => {
  assert.equal((await onRequest({ request: request(input), env: {} })).status, 503);
  const noKeys = { ...env, TURNSTILE_SITE_KEY: '', TURNSTILE_SECRET_KEY: '', ALLOW_LOCAL_GUESTBOOK_TEST: 'true' };
  assert.equal((await onRequest({ request: request(input), env: noKeys })).status, 503);
});
test('missing, invalid, reused or wrong-host Turnstile tokens are rejected', async () => {
  assert.equal((await onRequest({ request: request({ ...input, turnstileToken: '' }), env })).status, 400);
  for (const verification of [{ success: false }, { success: true, hostname: 'attacker.example', action: 'guestbook' }, { success: true, hostname: 'portfolio.example', action: 'login' }]) {
    const restore = stubFetch(async () => new Response(JSON.stringify(verification)));
    try { assert.equal((await onRequest({ request: request(input), env })).status, 403); }
    finally { restore(); }
  }
});
test('valid submission saves UTF-8 JSON and always starts unapproved', async () => {
  let calls = 0;
  const maliciousText = '<script>alert("x")</script> 한글 🎨';
  const restore = stubFetch(async (url, options) => {
    calls++;
    if (calls === 1) {
      assert.equal(JSON.parse(options.body).secret, env.TURNSTILE_SECRET_KEY);
      return verified();
    }
    assert.match(url, /^https:\/\/api.github.com\/repos\/dlacndrhs123-cmd\/PORTFOLIO\/contents\/content\/guestbook\/.*\.json$/);
    assert.equal(options.headers.Authorization, `Bearer ${env.GITHUB_TOKEN}`);
    const body = JSON.parse(options.body);
    assert.equal(body.branch, 'main');
    const content = JSON.parse(Buffer.from(body.content, 'base64').toString('utf8'));
    assert.deepEqual(Object.keys(content), ['name', 'message', 'createdAt', 'approved']);
    assert.equal(content.message, maliciousText);
    assert.equal(content.name, '방문자');
    assert.equal(content.approved, false);
    assert.ok(!Number.isNaN(Date.parse(content.createdAt)));
    return new Response('{}', { status: 201 });
  });
  try {
    const response = await onRequest({ request: request({ ...input, name: ' 방문자 ', message: maliciousText, approved: true, createdAt: 'fake' }), env });
    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), { ok: true });
    assert.equal(calls, 2);
  } finally { restore(); }
});
test('upstream permission or write failure does not report success or leak details', async () => {
  let calls = 0;
  const restore = stubFetch(async () => ++calls === 1 ? verified() : new Response('private error test-secret', { status: 403 }));
  try {
    const response = await onRequest({ request: request(input), env });
    assert.equal(response.status, 502);
    assert.ok(!(await response.text()).includes('test-secret'));
  } finally { restore(); }
});
test('explicit localhost testing skips Turnstile and still stores unapproved entries', async () => {
  const restore = stubFetch(async url => {
    assert.ok(url.startsWith('https://api.github.com/'));
    return new Response('{}', { status: 201 });
  });
  try {
    const localEnv = { ...env, TURNSTILE_SITE_KEY: '', TURNSTILE_SECRET_KEY: '', ALLOW_LOCAL_GUESTBOOK_TEST: 'true' };
    assert.equal((await onRequest({ request: request(input, {}, 'http://localhost:8788/api/guestbook'), env: localEnv })).status, 201);
  } finally { restore(); }
});
