import fs from 'node:fs';
import assert from 'node:assert/strict';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:3000';
async function html(path){const r=await fetch(base+path,{signal:AbortSignal.timeout(20000)});assert.equal(r.status,200,path);return r.text();}
const home=await html('/');
assert.match(home,/<h2[^>]*>Free personalised greeting cards/);
assert((home.match(/href="\/card\//g)||[]).length>=12,'Homepage has crawlable card links');
assert(!home.includes('href="/admin"'),'No public admin link');
assert(home.includes('"@type":"Organization"')&&home.includes('"@type":"WebSite"'));
const sitemap=await html('/sitemap.xml'),paths=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]).pathname);
assert(paths.filter(p=>p.startsWith('/card/')).length>=100);
assert.equal((sitemap.match(/<lastmod>/g)||[]).length,paths.length);
assert(!paths.some(p=>/^\/card\/g\d+$/.test(p)));
for(const [id,card] of Object.entries(JSON.parse(fs.readFileSync('lib/legacy-cards.json','utf8')))){const r=await fetch(base+'/card/'+id,{redirect:'manual'});assert.equal(r.status,301,id);assert.equal(new URL(r.headers.get('location'),base).pathname,'/card/'+card.slug);await r.body?.cancel();}
for(const path of paths){
  const source=path==='/'?home:await html(path),head=source.split('</head>')[0];
  assert.match(head,/<title>[^<]+<\/title>/,path);
  assert.match(head,/<meta name="description" content="[^"]+"/,path);
  assert.match(head,/<link rel="canonical" href="https?:\/\/[^\"]+"/,path);
  assert.match(head,/<meta name="twitter:card" content="summary_large_image"/,path);
  assert.match(head,/<meta property="og:image:width" content="1200"/,path);
  assert.match(head,/<meta property="og:image:height" content="630"/,path);
  const image=head.match(/<meta property="og:image" content="([^"]+)"/)[1];
  const response=await fetch(base+new URL(image).pathname);assert.equal(response.status,200,image);assert.match(response.headers.get('content-type'),/image\/jpeg/);await response.arrayBuffer();
  if(path!=='/')assert(source.includes('"@type":"BreadcrumbList"'),path);
  if(path.startsWith('/card/')){assert.match(source,/Personalise this card/);assert((source.match(/<h2/g)||[]).length>=3);assert(source.includes('Related cards'));}
  if(path.startsWith('/occasions/')){assert(source.includes('\"@type\":\"ItemList\"'));assert.match(source,/href="\/card\//);}
}
const alternate=await html('/card/hindu-diwali-warm-wishes');assert.match(alternate,/<link rel="canonical" href="https:\/\/greetlo.in\/card\/hindu-diwali"/);
const robots=await html('/robots.txt');assert.match(robots,/Disallow: \/admin/);assert.match(robots,/Sitemap: https?:\/\//);
const admin=await html('/admin');assert.match(admin,/<meta name="robots" content="noindex, nofollow"/);
assert.equal((await fetch(base+'/api/admin')).status,401);
assert.equal((await fetch(base+'/api/admin',{headers:{Authorization:'Bearer incorrect-key'}})).status,401);
assert.equal((await fetch(base+'/card/not-a-real-template')).status,404);
assert.equal((await fetch(base+'/occasions/not-a-collection')).status,404);
console.log(`Verified server HTML and social images for all ${paths.length} sitemap URLs, homepage links, robots, 404s and admin access control.`);
