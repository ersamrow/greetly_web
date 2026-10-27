import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const moduleUrl = source => 'data:text/javascript;base64,' + Buffer.from(ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText).toString('base64');
const read = path => fs.readFileSync(path, 'utf8');
const collectionsUrl = moduleUrl(read('lib/collections.ts'));
const faithUrl = moduleUrl(read('lib/faith-templates.ts'));
const templatesUrl = moduleUrl(read('lib/templates.ts').replaceAll("'./faith-templates'", JSON.stringify(faithUrl)));
const catalogUrl = moduleUrl(read('lib/card-catalog.ts').replace("import legacyCards from './legacy-cards.json';",'const legacyCards = '+read('lib/legacy-cards.json')+';').replaceAll("'./templates'", JSON.stringify(templatesUrl)).replaceAll("'./collections'", JSON.stringify(collectionsUrl)));
const {templates} = await import(templatesUrl);
const {cardPath,cardSlug,cardDescription,canonicalCard,indexableTemplates,templateForSlug,collectionFor,collectionPreview,featuredIds} = await import(catalogUrl);
const seoSource = read('lib/seo.ts').replace("import { env } from '@/lib/runtime-env';", 'const env = {};');
const seoUrl = moduleUrl(seoSource);
const seo = await import(seoUrl);
const { collections } = await import(collectionsUrl);
const origin = 'https://greetlo.in';
assert.equal(seo.getSiteUrl().origin, origin);
const loadRoute = path => import(moduleUrl(read(path)
  .replaceAll("'@/lib/templates'", JSON.stringify(templatesUrl))
  .replaceAll("'@/lib/card-catalog'", JSON.stringify(catalogUrl))
  .replaceAll("'@/lib/collections'", JSON.stringify(collectionsUrl))
  .replaceAll("'@/lib/seo'", JSON.stringify(seoUrl))
  .replaceAll("'@/lib/content-dates'",JSON.stringify(moduleUrl(read('lib/content-dates.ts'))))));
const { default: sitemap } = await loadRoute('app/sitemap.ts');
const urls = sitemap().map(entry => entry.url);
assert.equal(urls.length, Object.keys(collections).length + indexableTemplates.length + 4);
assert.equal(new Set(urls).size, urls.length);
assert.deepEqual(urls, ['/', '/about', '/help', '/contact', ...Object.keys(collections).map(slug => `/occasions/${slug}`), ...indexableTemplates.map(cardPath)].map(path => origin + path));
assert.equal(new Set(templates.map(t=>t.name)).size,templates.length,'Template names must be unique');
for(const id of featuredIds)assert(templates.some(t=>t.id===id),'Featured card exists');
for(const t of templates){assert(collectionFor(t),'Card has a parent collection');for(const suffix of ['-320.webp','-640.webp','-social.jpg'])assert(fs.existsSync(`public/previews/${t.id}${suffix}`),`Missing preview ${t.id}${suffix}`);}
for (const [slug, collection] of Object.entries(collections)) {
  assert(seo.collectionDescriptions[slug], `Missing description: ${slug}`);
  const metadata = seo.pageMetadata(collection.category, seo.collectionDescriptions[slug], `/occasions/${slug}`);
  assert.equal(metadata.alternates.canonical, `${origin}/occasions/${slug}`);
  assert.equal(metadata.openGraph.url, metadata.alternates.canonical);
  assert.equal(metadata.twitter.description, metadata.description);
  assert.equal(metadata.twitter.card, 'summary_large_image');
  assert.equal(metadata.openGraph.images[0].width,1200);
  assert.equal(metadata.openGraph.images[0].height,630);
  assert(metadata.openGraph.images[0].url.startsWith(origin));
  assert(collectionPreview(slug),'Each collection has a representative card');
}
const { default: robots } = await loadRoute('app/robots.ts');
assert.equal(robots().sitemap, `${origin}/sitemap.xml`);
assert.deepEqual(robots().rules.disallow, ['/api/', '/admin']);
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

const {cardEditorial}=await import(moduleUrl(read('lib/card-editorial.ts')));
const slugs=templates.map(cardSlug);
assert.equal(new Set(slugs).size,templates.length);
assert(!slugs.some(slug=>/^g\d+$/.test(slug)),'No opaque public card slugs');
const legacy=JSON.parse(read('lib/legacy-cards.json'));
assert.equal(Object.keys(legacy).length,60);
for(const [id,entry] of Object.entries(legacy)){
 const t=templates.find(t=>t.id===id);assert.equal(t.name,entry.name);assert.equal(cardSlug(t),entry.slug);assert.equal(templateForSlug(entry.slug).id,id);
}
assert.match(read('next.config.ts'),/statusCode:301/);
assert.match(read('app/studio.tsx'),/href=\{cardPath\(t\)\}/);
assert(!read('app/studio.tsx').includes('href={`?template='));
assert.equal(new Set(templates.map(cardDescription)).size,templates.length,'Descriptions are unique');
for(const t of templates){
 const description=cardDescription(t);assert(description.length>=150&&description.length<=160,`${t.id}: description is too long`);
 const copy=cardEditorial(t);const words=Object.values(copy).flat().join(' ').split(/\s+/).length;
 assert(words>=150&&words<=300,`${t.id}: ${words} editorial words`);assert.equal(copy.examples.length,3);
 assert.notEqual(description,copy.intro);
 const target=canonicalCard(t);assert.equal(canonicalCard(target).id,target.id,'No canonical chains');
 if(target.id!==t.id)assert(!urls.includes(origin+cardPath(t)),'Only canonical editions in sitemap');
}
for(const entry of sitemap()){assert.match(String(entry.lastModified),/^\d{4}-\d{2}-\d{2}$/);assert(new Date(entry.lastModified)<=new Date(),'No future sitemap dates');}
assert.match(read('app/occasions/[slug]/page.tsx'),/'@type':'ItemList'/);
assert.deepEqual(seo.siteVerification(),{});
const verified=await import(moduleUrl(seoSource.replace('const env = {};',"const env = {GOOGLE_SITE_VERIFICATION:'google-token',BING_SITE_VERIFICATION:'bing-token'};")));
assert.deepEqual(verified.siteVerification(),{google:'google-token',other:{'msvalidate.01':'bing-token'}});
console.log('SEO additions passed: 60 descriptive slugs, unique short descriptions, substantive card copy, canonical groups, dates and verification tokens.');
console.log('Card description lengths:',Math.min(...templates.map(t=>cardDescription(t).length)),Math.max(...templates.map(t=>cardDescription(t).length)));

for(let i=1;i<=60;i++){const t=templates.find(t=>t.id===`g${i}`);const target=canonicalCard(t);assert.equal(target.pattern,t.pattern);assert.equal(target.heading,t.heading);assert.equal(target.message,t.message);assert.equal(target.category,t.category);}
assert.equal(indexableTemplates.filter(t=>/^g\d+$/.test(t.id)).length,30);
