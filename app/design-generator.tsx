'use client';
import {useState} from 'react';
import type {Greeting,Template} from '@/lib/templates';
import {templates} from '@/lib/templates';
import {compatibleDesigns,generateVariations,type DesignMode,type DesignVariation} from '@/lib/design-variations';
import Card from './card';
import './design-generator.css';

export default function DesignGenerator({g,template,hidden,onChange}:{g:Greeting;template:Template;hidden:string[];onChange:(g:Greeting)=>void}){
 const [mode,setMode]=useState<DesignMode>('mix');
 const [keepColours,setKeepColours]=useState(template.kind==='business');
 const [keepFont,setKeepFont]=useState(false),[keepLayout,setKeepLayout]=useState(false);
 const [batch,setBatch]=useState<{source:Greeting;items:DesignVariation[]}|null>(null);
 const [status,setStatus]=useState('');
 const pool=compatibleDesigns(template,templates,hidden);
 const hasArt=pool.some(t=>t.aiArt);
 const items=batch?.source===g?batch.items.filter(v=>!hidden.includes(v.template.id)):[];
 function generate(){
  const next=generateVariations(g,template,pool,{mode,keepColours,keepFont,keepLayout});
  setBatch({source:g,items:next});
  setStatus(next.length?`${next.length} new options ready. Choose one to apply.`:'No new combinations with these settings. Unlock a setting or choose another artwork source.');
 }
 return <details className="editor-options hybrid-designs" open>
  <summary>Generate a design</summary>
  <div className="option-fields">
   <p>Explore curated layouts, fresh colour combinations and our AI-created artwork library. Your words, photo and details stay yours.</p>
   <label>Artwork source<select value={mode} onChange={e=>{setMode(e.target.value as DesignMode);setBatch(null);setStatus('')}}><option value="mix">Mix layouts and AI artwork</option><option value="classic">Classic layouts</option><option value="artwork" disabled={!hasArt}>AI artwork library{!hasArt?' — not available for this occasion':''}</option></select></label>
   {!hasArt&&<small>This occasion uses classic variations. AI artwork is available for selected festivals and faith cards.</small>}
   <div className="design-locks">
    <label><input type="checkbox" checked={keepColours} onChange={e=>{setKeepColours(e.target.checked);setBatch(null)}}/> Keep my colours</label>
    <label><input type="checkbox" checked={keepFont} onChange={e=>{setKeepFont(e.target.checked);setBatch(null)}}/> Keep my font</label>
    <label><input type="checkbox" checked={keepLayout} onChange={e=>{setKeepLayout(e.target.checked);setBatch(null)}}/> Keep this layout</label>
   </div>
   <button type="button" className="secondary" onClick={generate}>{items.length?'Generate more options':'Generate design options'}</button>
   <small role="status" aria-live="polite">{status}</small>
   {items.length>0&&<div className="design-variations">{items.map((v,index)=><div className="design-variation" key={`${v.template.id}-${index}`}><Card template={v.template} greeting={v.greeting} paused/><span>{v.template.aiArt?'AI artwork':'Classic layout'} · {v.greeting.font}</span><button type="button" className="secondary" onClick={()=>{onChange(v.greeting);setBatch(null);setStatus('Design applied. Use Undo to return to your previous design.')}}>Use option {index+1}</button></div>)}</div>}
   <small>AI artwork comes from our existing library. Save a named draft to keep a favourite variation.</small>
  </div>
 </details>;
}
