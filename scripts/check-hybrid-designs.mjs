import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const url=source=>'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64');
const {generateVariations,compatibleDesigns}=await import(url(fs.readFileSync('lib/design-variations.ts','utf8')));
const t={id:'one',category:'Festivals',festival:'Diwali',heading:'Happy Diwali',bg:'#fff2dd',ink:'#68351c',pattern:1};
const art={...t,id:'art',aiArt:true,artwork:'/art.webp'};
const other={...t,id:'wrong-occasion',festival:'Dussehra'};
const g={templateId:t.id,name:'Alex',message:'My message',sender:'Sam',bg:t.bg,font:'Arial',layout:'vertical',branding:false,photo:'photo-data',details:{phone:'123'},qr:{mode:'url',value:'example.com'},positions:{text:{x:12,y:10}},back:{heading:'Back',message:'Services',website:'example.com'}};
const pool=compatibleDesigns(t,[t,art,other,{...t,id:'hidden'}],['hidden']);assert.deepEqual(pool.map(t=>t.id),['one','art']);
const options={mode:'mix',keepColours:false,keepFont:false,keepLayout:false};
const variants=generateVariations(g,t,pool,options,()=>0);
assert.equal(variants.length,3);assert(variants.some(v=>v.template.aiArt));assert(variants.some(v=>!v.template.aiArt));
for(const {greeting:n} of variants){for(const key of ['name','message','sender','photo','details','qr','positions','back','layout'])assert.deepEqual(n[key],g[key]);assert.equal(n.heading,t.heading);}
assert.equal(new Set(variants.map(v=>JSON.stringify(v.greeting))).size,3);
assert.equal(g.templateId,'one');
for(const {greeting:n} of generateVariations({...g,language:'hi',font:'Noto Sans Devanagari'},t,pool,options))assert.equal(n.font,'Noto Sans Devanagari');
assert.equal(generateVariations(g,t,pool,{...options,keepColours:true,keepFont:true,keepLayout:true}).length,0);
assert.equal(generateVariations(g,t,[t],{...options,mode:'artwork'}).length,0);
console.log('Passed: occasion filtering, unique hybrid options, content and language preservation, and design locks.');

const faithUrl=url(fs.readFileSync('lib/faith-templates.ts','utf8'));
const templatesUrl=url(fs.readFileSync('lib/templates.ts','utf8').replaceAll("'./faith-templates'",JSON.stringify(faithUrl)));
const {templates,expandedAiTemplates,defaultGreeting}=await import(templatesUrl);
const schemaUrl=url(fs.readFileSync('lib/greeting-schema.ts','utf8').replaceAll("'./templates'",JSON.stringify(templatesUrl)).replaceAll("'zod'",JSON.stringify(import.meta.resolve('zod'))));
const {greetingSchema}=await import(schemaUrl);
assert.equal(expandedAiTemplates.length,20);
for(const t of templates){
 const original=defaultGreeting(t);
 for(const {greeting:n} of generateVariations(original,t,compatibleDesigns(t,templates),options))assert(greetingSchema.safeParse(n).success,`${t.id}: variation must survive save/share validation`);
 for(const {greeting:n} of generateVariations(original,t,compatibleDesigns(t,templates),{...options,keepColours:true})){assert.equal(n.bg,original.bg);assert.equal(n.headingColor,t.ink);assert.equal(n.textColor,t.ink)}
}
console.log('Passed: 20 new library designs and schema-valid variations across the complete catalog.');
