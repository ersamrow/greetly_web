import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import ts from 'typescript';
const cache=new Map();
function load(file){
  file=path.resolve(file);if(cache.has(file))return cache.get(file);
  let source=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
  source=source.replace(/from ['"]([^'"]+)['"]/g,(_,spec)=>`from ${JSON.stringify(spec.startsWith('.')?load(path.resolve(path.dirname(file),spec+'.ts')):import.meta.resolve(spec))}`);
  const url='data:text/javascript;base64,'+Buffer.from(source).toString('base64');cache.set(file,url);return url;
}
const {draw}=await import(load('lib/draw.ts'));
const {templates,defaultGreeting}=await import(load('lib/templates.ts'));
function canvas(){const text=[];const context={font:'24px Arial',fillStyle:'',textAlign:'',textBaseline:'',fillRect(){},strokeRect(){},save(){},restore(){},measureText(value){return {width:value.length*parseFloat(this.font.match(/[\d.]+/)[0])*.5}},fillText(value,x,y){text.push({value,x,y,size:parseFloat(this.font.match(/[\d.]+/)[0])})},drawImage(){}};return {width:0,height:0,text,getContext(){return context}}}
globalThis.document={createElement:canvas,fonts:{load:async()=>[]}};
const t=templates.find(t=>t.id==='business-minimal'),g=defaultGreeting(t);
for(const [socialSize,height] of [['square',1080],['portrait',1350],['story',1920]]){const c=canvas();await draw(c,t,{...g,socialSize});assert.equal(c.width,1080);assert.equal(c.height,height)}
const back=canvas();await draw(back,t,{...g,side:'back',back:{heading:'H'.repeat(90),message:'Long services description '.repeat(12),website:'w'.repeat(100)}});
assert(back.text.every(t=>t.y>=0&&t.y+t.size<=648),'Back text fits even with long content');
const normal=canvas();await draw(normal,t,g);assert.equal(normal.height,648);
console.log('Passed: all social export dimensions, original business size, and long back-side text fitting.');
