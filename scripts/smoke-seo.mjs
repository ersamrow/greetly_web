import assert from 'node:assert/strict';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:3000';
async function html(path){const r=await fetch(base+path);assert.equal(r.status,200,path);return r.text();}
const home=await html('/');
assert.match(home,/<h2[^>]*>Free personalised greeting cards/);
assert.equal((home.match(/href="\/card\//g)||[]).length,12,'Homepage has 12 crawlable card links');
assert(!home.includes('href="/admin"'),'No public admin link');
assert(home.includes('"@type":"Organization"')&&home.includes('"@type":"WebSite"'));
const sitemap=await html('/sitemap.xml'),paths=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]).pathname);
assert.equal(paths.filter(p=>p.startsWith('/card/')).length,118);
for(const path of paths){
  const source=path==='/'?home:await html(path),head=source.split('</head>')[0];
  assert.match(head,/<title>[^<]+<\/title>/,path);
  assert.match(head,/<meta name="description" content="[^"]+"/,path);
  assert.match(head,/<link rel="canonical" href="https?:\/\/[^\"]+"/,path);
  assert.match(head,/<meta name="twitter:card" content="summary_large_image"/,path);
  assert.match(head,/<meta property="og:image:width" content="1200"/,path);
  assert.match(head,/<meta property="og:image:height" content="630"/,path);
  const image=head.match(/<meta property="og:image" content="([^"]+)"/)[1];
  const response=await fetch(base+new URL(image).pathname);assert.equal(response.status,200,image);assert.match(response.headers.get('content-type'),/image\/jpeg/);
  if(path!=='/')assert(source.includes('"@type":"BreadcrumbList"'),path);
  if(path.startsWith('/card/'))assert.match(source,/Personalise this card/);
}
const robots=await html('/robots.txt');assert.match(robots,/Disallow: \/admin/);assert.match(robots,/Sitemap: https?:\/\//);
const admin=await html('/admin');assert.match(admin,/<meta name="robots" content="noindex, nofollow"/);
assert.equal((await fetch(base+'/api/admin')).status,401);
assert.equal((await fetch(base+'/api/admin',{headers:{Authorization:'Bearer incorrect-key'}})).status,401);
assert.equal((await fetch(base+'/card/not-a-real-template')).status,404);
assert.equal((await fetch(base+'/occasions/not-a-collection')).status,404);
console.log(`Verified server HTML and social images for all ${paths.length} sitemap URLs, homepage links, robots, 404s and admin access control.`);
