import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import ts from 'typescript';

const dataUrl = source => 'data:text/javascript;base64,' + Buffer.from(source).toString('base64');
const environment = dataUrl(`
  export const writes = [];
  export const env = {
    SITE_URL: 'https://greetly.myledgerpro.in',
    DB: { prepare(sql) { return { bind(...values) { return { async run() { writes.push({sql,values}); } }; } }; } },
    BUCKET: { async put() {}, async delete() {} }
  };
`);
const modules = new Map();
function loadUrl(file) {
  file = resolve(file);
  if (modules.has(file)) return modules.get(file);
  let code = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  code = code.replace(/(from\s+)(['"])([^'"]+)\2/g, (_, prefix, quote, specifier) => {
    let target;
    if (specifier === '@/lib/runtime-env') target = environment;
    else if (specifier.startsWith('@/')) target = loadUrl(specifier.slice(2) + '.ts');
    else if (specifier.startsWith('.')) target = loadUrl(resolve(dirname(file), specifier + '.ts'));
    else target = import.meta.resolve(specifier);
    return prefix + JSON.stringify(target);
  });
  const url = dataUrl(code);
  modules.set(file, url);
  return url;
}

const { sameOrigin } = await import(loadUrl('lib/server.ts'));
const publicOrigin = 'https://greetly.myledgerpro.in';
const request = (origin, url = 'http://127.0.0.1:3000/api/greetings', extra = {}) => new Request(url, {
  method: 'POST', headers: { ...(origin === undefined ? {} : { Origin: origin }), ...extra }, body: '{}',
});
assert(sameOrigin(request(publicOrigin)), 'Public HTTPS origin must work behind an internal HTTP proxy');
assert(sameOrigin(request(publicOrigin, publicOrigin + '/api/greetings')));
assert(sameOrigin(request('http://localhost:3000', 'http://localhost:3000/api/greetings')));
assert(sameOrigin(request(undefined)), 'Non-browser clients remain supported');
for (const origin of ['https://evil.example', publicOrigin + '.evil.example', 'http://greetly.myledgerpro.in', publicOrigin + ':444', 'null', 'malformed', publicOrigin + '/path']) {
  assert.equal(sameOrigin(request(origin)), false, `Reject ${origin}`);
}
assert.equal(sameOrigin(request('https://evil.example', undefined, {
  'x-forwarded-host': 'evil.example', 'x-forwarded-proto': 'https',
  forwarded: 'host=evil.example;proto=https',
})), false, 'Forwarded headers must not grant trust');

const { POST: createGreeting } = await import(loadUrl('app/api/greetings/route.ts'));
const { POST: recordEvent } = await import(loadUrl('app/api/events/route.ts'));
const { templates, defaultGreeting } = await import(loadUrl('lib/templates.ts'));
const { writes } = await import(environment);
function post(path, body, origin = publicOrigin) {
  return new Request('http://127.0.0.1:3000' + path, {
    method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
}
const payload = defaultGreeting(templates[0]);
const saved = await createGreeting(post('/api/greetings', payload));
assert.equal(saved.status, 201);
const result = await saved.json();
assert(result.id && result.token, 'Copy/share receives a saved greeting ID and deletion token');
assert.equal(writes.length, 1);
assert.equal((await recordEvent(post('/api/events', { action: 'share', templateId: payload.templateId }))).status, 204);
assert.equal(writes.length, 2);
assert.equal((await createGreeting(post('/api/greetings', payload, 'https://evil.example'))).status, 403);
assert.equal((await recordEvent(post('/api/events', { action: 'share', templateId: payload.templateId }, 'https://evil.example'))).status, 403);
assert.equal(writes.length, 2, 'Rejected origins must not write to storage');
assert.equal((await createGreeting(post('/api/greetings', {}))).status, 400);
console.log('Origin checks passed: proxy HTTPS, direct/local clients, hostile origins, spoofed headers, greeting creation and analytics routes.');
