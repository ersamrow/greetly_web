import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
const mod=source=>'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64');
const {printDocument}=await import(mod(fs.readFileSync('lib/print-pdf.ts','utf8').replace("import {draw} from './draw';",'')));
const output=printDocument([1,2].map(()=>({jpeg:new Uint8Array([255,216,255,217]),width:1152,height:720,mmWidth:90,mmHeight:54})));
const text=new TextDecoder('latin1').decode(output);
assert(text.includes('/Count 2'),'Front and back have separate pages');
assert.equal((text.match(/\/TrimBox/g)||[]).length,2);
assert.equal((text.match(/\/BleedBox/g)||[]).length,2);
const xref=Number(text.match(/startxref\n(\d+)/)[1]);
assert.equal(text.slice(xref,xref+4),'xref','PDF cross-reference offset is correct');
const entries=text.slice(xref).split('\n').slice(3,11);
for(const [i,line] of entries.entries())assert(text.slice(Number(line.slice(0,10))).startsWith(`${i+1} 0 obj`),'Object offset is valid');
for(const font of ['devanagari','gurmukhi']){const bytes=fs.readFileSync(`public/fonts/${font}.ttf`);assert.equal(bytes.readUInt32BE(0),0x00010000);assert(fs.readFileSync(`public/fonts/${font}-LICENSE.txt`,'utf8').includes('SIL OPEN FONT LICENSE'));}
console.log('Passed: two-sided PDF pages, trim/bleed boxes, binary offsets, and bundled font files/licenses.');
