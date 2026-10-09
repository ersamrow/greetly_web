'use client';
import {useRef,useState} from 'react';
import Card from './card';
import type {Greeting,Template} from '@/lib/templates';
import './movable-card.css';
export default function MovableCard({template,greeting,paused,onChange}:{template:Template;greeting:Greeting;paused:boolean;onChange:(g:Greeting)=>void}){
  const [part,setPart]=useState<'text'|'photo'|'qr'|null>(null),[moving,setMoving]=useState(false);
  const [safe,setSafe]=useState(false);
  const start=useRef<{x:number;y:number;px:number;py:number}|undefined>(undefined);
  const outputHeight=greeting.socialSize==='story'?1920:greeting.socialSize==='portrait'?1350:greeting.socialSize==='square'?1080:0;
  const height=template.kind==='business'?648:greeting.layout==='vertical'?1440:1080;
  const update=(x:number,y:number)=>{if(!part)return;onChange({...greeting,positions:{...greeting.positions,[part]:{x:Math.max(-1080,Math.min(1080,Math.round(x))),y:Math.max(-height,Math.min(height,Math.round(y)))}}})};
  if(greeting.side==='back'&&greeting.back)return <Card template={template} greeting={greeting} paused={paused}/>;
  return <div className="movable-card">
    <div className="move-tools" aria-label="Move card elements"><button aria-pressed={!part} onClick={()=>setPart(null)}>View</button>{(['text','photo','qr'] as const).filter(p=>p==='text'||p==='photo'&&greeting.photo||p==='qr'&&greeting.qr).map(p=><button key={p} aria-pressed={part===p} onClick={()=>setPart(p)}>{p==='photo'?(template.kind==='business'?'Logo':'Photo'):p==='qr'?'QR code':'Text'}</button>)}{part&&<button onClick={()=>update(0,0)}>Reset position</button>}</div>
    <div className={`move-surface ${part?'can-move':''}`} tabIndex={part?0:undefined} role={part?'group':undefined} aria-label={part?`Move ${part}. Drag here or use arrow keys.`:undefined}
      onPointerDown={e=>{if(!part)return;e.currentTarget.setPointerCapture(e.pointerId);const position=greeting.positions?.[part];start.current={x:e.clientX,y:e.clientY,px:position?.x||0,py:position?.y||0};setMoving(true)}}
      onPointerMove={e=>{if(!start.current||!part)return;const box=e.currentTarget.getBoundingClientRect();const scale=outputHeight?Math.min(1,outputHeight/height):1;let x=start.current.px+(e.clientX-start.current.x)*1080/box.width/scale,y=start.current.py+(e.clientY-start.current.y)*(outputHeight||height)/box.height/scale;if(Math.abs(x)<8)x=0;if(Math.abs(y)<8)y=0;update(x,y)}}
      onPointerUp={()=>{start.current=undefined;setMoving(false)}} onPointerCancel={()=>{start.current=undefined;setMoving(false)}}
      onKeyDown={e=>{if(!part||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const p=greeting.positions?.[part]||{x:0,y:0},step=e.shiftKey?10:1;update(p.x+(e.key==='ArrowRight'?step:e.key==='ArrowLeft'?-step:0),p.y+(e.key==='ArrowDown'?step:e.key==='ArrowUp'?-step:0))}}>
      <Card template={template} greeting={greeting} paused={paused}/>{moving&&<div className="alignment-guides" aria-hidden="true"/>}{safe&&(!greeting.socialSize||greeting.socialSize==='original')&&<div className="print-safe-guide" style={{inset:template.kind==='business'?'5.56% 3.33%':greeting.layout==='vertical'?'2.5% 3.33%':'3.33%'}} aria-hidden="true"/>}
    </div>
    <label className="safe-guide-toggle"><input type="checkbox" checked={safe} onChange={e=>setSafe(e.target.checked)}/> Show 3 mm print safe margin (original format)</label>
    {part&&<small>Drag to move {part==='photo'?'the image':part==='qr'?'the QR code':'the text group'}. Arrow keys fine-tune; Shift moves faster. Keep content inside the card.</small>}
  </div>;
}
