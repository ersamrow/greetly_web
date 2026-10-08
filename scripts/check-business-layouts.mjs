import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
const moduleURL=source=>'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64');
const layout=moduleURL(fs.readFileSync('lib/editor-layout.ts','utf8'));
const qr=moduleURL(fs.readFileSync('lib/card-qr.ts','utf8').replace("'qrcode/lib/core/qrcode.js'",JSON.stringify(import.meta.resolve('qrcode/lib/core/qrcode.js'))));
const source=fs.readFileSync('lib/draw-brand-business.ts','utf8').replace("'./editor-layout'",JSON.stringify(layout)).replace("'./card-qr'",JSON.stringify(qr));
const {drawBrandBusiness}=await import(moduleURL(source));
globalThis.Image=class{width=640;height=320;set src(value){queueMicrotask(()=>this.onload())}};
for(const pattern of [8,9,10,11])for(const textAlign of ['left','center','right'])for(const logoScale of [50,100,120]){
  const texts=[],images=[];
  const c={font:'',fillStyle:'',textAlign:'',textBaseline:'',save(){},restore(){},fillRect(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){},ellipse(){},measureText(text){return {width:text.length*parseFloat(this.font.match(/[\d.]+/)[0])*.55}},fillText(text,x,y){const size=parseFloat(this.font.match(/[\d.]+/)[0]);const width=this.measureText(text).width;const left=this.textAlign==='center'?x-width/2:this.textAlign==='right'?x-width:x;texts.push({left,y,width,size})},drawImage(...args){images.push(args)}};
  const g={heading:'My Ledger Pro Financial Services',name:'A long full name for a professional',message:'Accounting, bookkeeping and financial services for your business.',font:'Arial',bg:'#fffaf0',textAlign,photo:'test',branding:true,qr:{mode:'url',value:'https://example.com'},details:{role:'Founder & financial consultant',phone:'+91 98765 43210',email:'contact@myledgerpro.example.com',website:'https://myledgerpro.example.com',address:'123 Business Park, Main Road, New Delhi'}};
  await drawBrandBusiness(c,{pattern,ink:'#d82f50',heading:'Your business name'},{...g,logoScale});
  assert(texts.every(t=>t.left>=0&&t.left+t.width<=1081&&t.y>=0&&t.y+t.size<=648),'Text fits card');
  assert.equal(images.length,1);
  const [,x,y,w,h]=images[0];
  assert(texts.every(t=>t.left+t.width<=x||t.left>=x+w||t.y+t.size<=y||t.y>=y+h),'Text does not overlap logo');
}
console.log('Passed: four branded layouts, all text alignments, long contact details, logo bounds, and QR rendering.');
