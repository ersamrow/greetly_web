import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import ts from 'typescript';
const js=ts.transpile(readFileSync('lib/templates.ts','utf8'),{module:ts.ModuleKind.ESNext});
const {templates,festivalTemplates,isTemplateId,matchesOccasion,defaultGreeting}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
assert.equal(templates.length,72);
assert.equal(new Set(templates.map(t=>t.id)).size,72);
for(let i=1;i<=60;i++)assert.ok(isTemplateId('g'+i),'Legacy greeting ID preserved');
assert.equal(templates.filter(t=>matchesOccasion(t,'Dussehra')).length,6);
assert.equal(templates.filter(t=>matchesOccasion(t,'Diwali')).length,6);
assert.equal(templates.filter(t=>matchesOccasion(t,'Festivals')).length,24);
assert.ok(!isTemplateId('dussehra-fake'));
for(const t of festivalTemplates){assert.ok(isTemplateId(t.id));assert.ok(t.message.length<=200);assert.equal(defaultGreeting(t).templateId,t.id);if(t.artwork)assert.ok(existsSync('public'+t.artwork));}
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:5173';
for(const id of ['dussehra-marigold','diwali-diyas']){
  const t=templates.find(t=>t.id===id);
  const response=await fetch(base+'/api/greetings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...defaultGreeting(t),name:'Festival test'})});
  assert.equal(response.status,201,await response.clone().text());
  const saved=await response.json();
  try{
    const read=await fetch(base+'/api/greetings/'+saved.id);assert.equal((await read.json()).templateId,id);
    const event=await fetch(base+'/api/events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'select',templateId:id})});assert.equal(event.status,204);
    const route=await fetch(base+'/occasions/'+t.festival.toLowerCase());assert.equal(route.status,200);assert.ok((await route.text()).includes(t.name));
  }finally{assert.equal((await fetch(base+'/api/greetings/'+saved.id,{method:'DELETE',headers:{Authorization:'Bearer '+saved.token}})).status,204)}
}
console.log('PASS: 72 unique designs, legacy IDs, festival filters, artwork assets, saved links, events, collection routes and deletion');
