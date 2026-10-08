import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
import jsQR from 'jsqr';
const load=async path=>import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(fs.readFileSync(path,'utf8').replace("'qrcode/lib/core/qrcode.js'",JSON.stringify(import.meta.resolve('qrcode/lib/core/qrcode.js'))),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64'));
const {prepareDrafts,saveDraftVersion}=await load('lib/local-drafts.ts');
const base={templateId:'business-rose',name:'Alex',message:'Design services',sender:'',bg:'#ffffff',font:'Arial',layout:'square',branding:false};
const legacy=prepareDrafts([base,base]);assert.notEqual(legacy[0].draftId,legacy[1].draftId);
let drafts=saveDraftVersion(legacy,base,null,'Second version');assert.equal(drafts.length,3);
const id=drafts[0].draftId;
drafts=saveDraftVersion(drafts,{...base,name:'Edited'},id,'Updated');assert.equal(drafts.length,3);assert.equal(drafts[0].draftId,id);assert.equal(drafts[1].name,'Alex');
assert.throws(()=>saveDraftVersion(prepareDrafts(Array.from({length:24},()=>base)),base,null,'Overflow'),/full/);
const {qrPayload,drawQR}=await load('lib/card-qr.ts');
assert.equal(qrPayload({...base,qr:{mode:'url',value:'example.com'}}),'https://example.com/');
assert.equal(qrPayload({...base,qr:{mode:'url',value:'javascript:alert(1)'}}),undefined);
assert.equal(qrPayload({...base,qr:{mode:'map',value:'界'.repeat(400)}}),undefined,'Oversized encoded links must not crash card rendering');
assert.equal(qrPayload({...base,qr:{mode:'whatsapp',value:'+91 98765 43210'}}),'https://wa.me/919876543210');
for(const qr of [{mode:'url',value:'https://example.com/rsvp'},{mode:'whatsapp',value:'+91 98765 43210'},{mode:'map',value:'Rose Hall, New Delhi'},{mode:'contact',value:''}]){
  const g={...base,heading:'Example Studio',details:{phone:'+91 98765 43210',email:'hello@example.com'},qr};
  const width=240,data=new Uint8ClampedArray(width*width*4).fill(255);
  const c={fillStyle:'#fff',save(){},restore(){},fillRect(x,y,w,h){for(let row=y;row<y+h;row++)for(let col=x;col<x+w;col++){const index=(row*width+col)*4;data[index]=data[index+1]=data[index+2]=this.fillStyle==='#000000'?0:255}}};
  drawQR(c,g,10,10,210);
  const decoded=jsQR(data,width,width);assert(decoded,'QR must scan: '+qr.mode);assert.equal(decoded.data,qrPayload(g));
}
console.log('Passed: legacy draft migration, separate copies, updates, capacity protection, safe URLs, and QR round-trip decoding for all four modes.');
