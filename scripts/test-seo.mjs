import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const moduleUrl = source => 'data:text/javascript;base64,' + Buffer.from(ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText).toString('base64');
const read = path => fs.readFileSync(path, 'utf8');
const collectionsUrl = moduleUrl(read('lib/collections.ts'));
const seoSource = read('lib/seo.ts').replace("import { env } from '@/lib/runtime-env';", 'const env = {};');
const seoUrl = moduleUrl(seoSource);
const seo = await import(seoUrl);
const { collections } = await import(collectionsUrl);
const origin = 'https://greetly.myledgerpro.in';
assert.equal(seo.getSiteUrl().origin, origin);
const loadRoute = path => import(moduleUrl(read(path)
  .replaceAll("'@/lib/collections'", JSON.stringify(collectionsUrl))
  .replaceAll("'@/lib/seo'", JSON.stringify(seoUrl))));
const { default: sitemap } = await loadRoute('app/sitemap.ts');
const urls = sitemap().map(entry => entry.url);
assert.equal(urls.length, Object.keys(collections).length + 1);
assert.equal(new Set(urls).size, urls.length);
assert.deepEqual(urls, ['/', ...Object.keys(collections).map(slug => `/occasions/${slug}`)].map(path => origin + path));
for (const [slug, collection] of Object.entries(collections)) {
  assert(seo.collectionDescriptions[slug], `Missing description: ${slug}`);
  const metadata = seo.pageMetadata(collection.category, seo.collectionDescriptions[slug], `/occasions/${slug}`);
  assert.equal(metadata.alternates.canonical, `${origin}/occasions/${slug}`);
  assert.equal(metadata.openGraph.url, metadata.alternates.canonical);
  assert.equal(metadata.twitter.description, metadata.description);
}
const { default: robots } = await loadRoute('app/robots.ts');
assert.equal(robots().sitemap, `${origin}/sitemap.xml`);
assert.deepEqual(robots().rules.disallow, ['/api/']);
assert(!fs.existsSync('public/robots.txt'), 'No conflicting public robots file');
for (const path of ['app/admin/layout.tsx', 'app/privacy/layout.tsx']) {
  const { metadata } = await import(moduleUrl(read(path)));
  assert.equal(metadata.robots.index, false, `${path} must not be indexed`);
}
assert.match(read('app/g/[id]/page.tsx'), /index:false/);
assert(!seo.serializeJsonLd({ name: '</script><script>alert(1)</script>' }).includes('<'));
const override = await import(moduleUrl(seoSource.replace('const env = {};', "const env = { SITE_URL: 'https://cards.example.org' };")));
assert.equal(override.getSiteUrl().origin, 'https://cards.example.org');
for (const invalid of ['https://example.org/path', 'http://localhost:3000', 'javascript:alert(1)', 'https://user:pass@example.org']) {
  const configured = await import(moduleUrl(seoSource.replace('const env = {};', `const env = { SITE_URL: ${JSON.stringify(invalid)} };`)));
  assert.throws(() => configured.getSiteUrl());
}
console.log('SEO checks passed: domain, all collection canonicals, sitemap coverage, sharing metadata, noindex rules, and safe JSON-LD.');
