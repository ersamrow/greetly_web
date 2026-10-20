'use client';
import type {Greeting,Template} from '@/lib/templates';

export default function EditorOptions({g,template,onChange,section}:{g:Greeting;template:Template;onChange:(g:Greeting)=>void;section:'text'|'photo'}){
  const update=(value:Partial<Greeting>)=>onChange({...g,...value});
  const rgb=(template.artwork?template.bg:g.bg).slice(1).match(/../g)!.map(v=>parseInt(v,16));
  const autoColor=rgb[0]*.299+rgb[1]*.587+rgb[2]*.114<130?'#fff6df':template.ink==='#f8de9a'?'#322a54':template.ink;
  const range=(label:string,key:'logoScale'|'headingSize'|'messageSize'|'photoSize'|'photoZoom'|'photoX'|'photoY',value:number,min:number,max:number,step=1,suffix='')=><label>{label} <output>{value}{suffix}</output><input aria-label={label} type="range" min={min} max={max} step={step} value={value} onChange={e=>update({[key]:Number(e.target.value)})}/></label>;
  const colour=(label:string,key:'headingColor'|'textColor')=><div className="colour-selection"><label className="colour-field">{label}<input aria-label={label} type="color" value={g[key]??autoColor} onInput={e=>update({[key]:e.currentTarget.value})}/></label><div className="text-swatches">{[['Gold','#ffce73'],['White','#ffffff'],['Ink','#263b35'],['Rose','#c53a64'],['Blue','#3078db'],['Green','#26734d']].map(([name,hex])=><button type="button" key={name} aria-label={`${label}: ${name}`} aria-pressed={g[key]===hex} style={{background:hex}} onClick={()=>update({[key]:hex})}/>)}</div></div>;
  return <>
    {section==='text'&&<details className="editor-options" open><summary>Text style</summary><div className="option-fields">
      <label>Heading<textarea aria-label="Heading" maxLength={90} rows={2} value={g.heading??template.heading} onChange={e=>update({heading:e.target.value})}/><small>Use a new line to split your heading. Up to 90 characters.</small></label>
      <div className="text-colour-controls">{colour('Heading colour','headingColor')}{colour('Message colour','textColor')}</div>
      {range('Heading size','headingSize',g.headingSize??(g.photo?72:100),40,140,2,' px')}
      {range('Message size','messageSize',g.messageSize??27,20,48,1,' px')}
      <label>Text alignment<select aria-label="Text alignment" value={g.textAlign??'center'} onChange={e=>update({textAlign:e.target.value as Greeting['textAlign']})}><option value="left">Left</option><option value="center">Centre</option><option value="right">Right</option></select></label>
      <small>Names and signatures use the message colour. Long text automatically shrinks to stay inside the card.</small>
      <button type="button" className="reset-options" onClick={()=>update({heading:undefined,headingColor:undefined,textColor:undefined,headingSize:undefined,messageSize:undefined,textAlign:undefined})}>Reset text style</button>
    </div></details>}
    {section==='photo'&&g.photo&&template.kind==='business'&&<details className="editor-options" open><summary>Logo size</summary><div className="option-fields">{range('Logo size','logoScale',g.logoScale??100,50,120,5,'%')}<small>Scale your logo within its space, keeping its original proportions.</small><button type="button" className="reset-options" onClick={()=>update({logoScale:undefined})}>Reset logo size</button></div></details>}
    {section==='photo'&&g.photo&&!g.creatorPost&&template.kind!=='business'&&<details className="editor-options" open><summary>Photo layout</summary><div className="option-fields">
      <div className="two-controls"><label>Placement<select aria-label="Photo placement" value={g.photoPlacement??'top'} onChange={e=>update({photoPlacement:e.target.value as Greeting['photoPlacement']})}><option value="top">Above text</option><option value="middle">Between heading and message</option><option value="in-message">Middle of message</option><option value="after-message">After message, before signature</option><option value="bottom">Below all text</option><option value="left">Left of text</option><option value="right">Right of text</option></select></label><label>Shape<select aria-label="Photo shape" value={g.photoShape??'circle'} onChange={e=>update({photoShape:e.target.value as Greeting['photoShape']})}><option value="circle">Circle</option><option value="rounded">Rounded square</option><option value="square">Square</option></select></label></div>
      {range('Photo size','photoSize',g.photoSize??220,160,360,10,' px')}
      {range('Photo zoom','photoZoom',g.photoZoom??1,1,3,.1,'×')}
      {range('Crop horizontal','photoX',g.photoX??50,0,100,1,'%')}
      {range('Crop vertical','photoY',g.photoY??50,0,100,1,'%')}
      <small>Zoom in to adjust the crop. Placement keeps the photo clear of your text.</small>
      <button type="button" className="reset-options" onClick={()=>update({photoPlacement:undefined,photoSize:undefined,photoShape:undefined,photoZoom:undefined,photoX:undefined,photoY:undefined})}>Reset photo layout</button>
    </div></details>}
  </>;
}
