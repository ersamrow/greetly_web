import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
const url=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const react=url('let state,ref;export function useState(initial){state??=initial;return [state,value=>{state=typeof value==="function"?value(state):value}]}export function useRef(initial){return ref??={current:initial}}export function useCallback(fn){return fn}');
const source=ts.transpileModule(fs.readFileSync('app/use-edit-history.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace("from 'react'",`from '${react}'`);
const {useEditHistory}=await import(url(source));
const base={templateId:'a',message:'Original'},read=()=>useEditHistory(base);
let now=1000;const actual=Date.now;Date.now=()=>now;
try{
  read().set({...base,message:'First'});now+=100;read().set({...base,message:'Typing'});
  read().undo();assert.equal(read().g.message,'Original','Consecutive typing undoes as one action');
  read().redo();assert.equal(read().g.message,'Typing');
  now+=1000;read().set({...read().g,templateId:'b'});read().undo();assert.equal(read().g.templateId,'a','Design changes undo');
  now+=1000;read().set({...base,message:'Replacement'});assert.equal(read().canRedo,false,'New edit clears redo');
  read().reset(base);assert.equal(read().canUndo,false);assert.equal(read().canRedo,false);
}finally{Date.now=actual}
console.log('Passed: grouped edits, undo, redo, design changes, divergent edit history, and reset.');
