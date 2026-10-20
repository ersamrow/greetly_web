'use client';
import type {Dispatch,SetStateAction} from 'react';
import {templates,type Greeting} from '@/lib/templates';

export default function SenderOptions({g,onChange}:{g:Greeting;onChange:Dispatch<SetStateAction<Greeting>>}){
  const s=g.senderStyle??{};
  const set=(value:NonNullable<Greeting['senderStyle']>)=>onChange(current=>({...current,senderStyle:{...current.senderStyle,...value}}));
  const template=templates.find(t=>t.id===g.templateId);
  const rgb=(template?.artwork?template.bg:g.bg).slice(1).match(/../g)!.map(v=>parseInt(v,16));
  const light=rgb[0]*.299+rgb[1]*.587+rgb[2]*.114>130;
  const defaultColor=light?(template?.ink==='#f8de9a'?'#322a54':template?.ink??'#30231b'):'#fff6df';
  return <details className="editor-options sender-options" open>
    <summary>From / name style</summary>
    <div className="option-fields">
      <label>Name treatment<select aria-label="Name treatment" value={s.treatment??'badge'} onChange={e=>set({treatment:e.target.value as NonNullable<Greeting['senderStyle']>['treatment']})}>
        <option value="badge">Compact badge</option><option value="plain">Text only</option><option value="signature">Signature</option><option value="outline">Outlined badge</option><option value="banner">Full-width strip</option>
      </select></label>
      <div className="two-controls">
        <label>Prefix<select aria-label="Name prefix" value={s.prefix??'From'} onChange={e=>set({prefix:e.target.value as NonNullable<Greeting['senderStyle']>['prefix']})}><option>From</option><option>With love,</option><option>Best wishes,</option><option value="">Name only</option></select></label>
        <label>Name font<select aria-label="Name font" value={s.font??g.font} onChange={e=>set({font:e.target.value})}>{['Georgia','Arial','Verdana','Courier New','Noto Sans Devanagari','Noto Sans Gurmukhi'].map(font=><option key={font}>{font}</option>)}</select></label>
      </div>
      <label>Name font size <output>{s.size??44} px</output><input aria-label="Name font size" type="range" min={20} max={80} step={1} value={s.size??44} onChange={e=>set({size:Number(e.target.value)})}/></label>
      <small>The preview’s Size control can also scale the complete name badge.</small>
      <div className="two-controls">
        <label className="colour-field">Name colour<input aria-label="Name colour" type="color" value={s.color??g.textColor??defaultColor} onChange={e=>set({color:e.target.value})}/></label>
        {['badge','banner'].includes(s.treatment??'badge')&&<label className="colour-field">Badge colour<input aria-label="Badge colour" type="color" value={s.background??g.bg} onChange={e=>set({background:e.target.value})}/></label>}
      </div>
      {['badge','banner'].includes(s.treatment??'badge')&&<label>Badge opacity <output>{s.opacity??90}%</output><input aria-label="Badge opacity" type="range" min={0} max={100} value={s.opacity??90} onChange={e=>set({opacity:Number(e.target.value)})}/></label>}
      <button className="secondary" type="button" onClick={()=>onChange(current=>({...current,senderStyle:undefined,elementScales:{...current.elementScales,sender:1}}))}>Reset name style</button>
    </div>
  </details>;
}
