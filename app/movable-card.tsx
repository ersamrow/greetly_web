'use client';
import {useRef,useState,type PointerEvent} from 'react';
import Card from './card';
import type {Greeting,Template} from '@/lib/templates';
import {hitElement,snapElement,type EditablePart,type EditorGeometry,type ElementBox} from '@/lib/editor-geometry';
import './movable-card.css';
type Part=EditablePart|'text'|'qr';
type Gesture={part:Part;mode:'move'|'resize';x:number;y:number;px:number;py:number;scale:number;box?:ElementBox;geometry:EditorGeometry};
const labels:Record<Part,string>={heading:'Heading',message:'Message',name:'Recipient name',sender:'Creator / sender name',photo:'Photo',text:'All text together',qr:'QR code'};
export default function MovableCard({template,greeting,paused,onChange}:{template:Template;greeting:Greeting;paused:boolean;onChange:(g:Greeting)=>void}){
  const [selectedPart,setPart]=useState<Part|null>(null),[safe,setSafe]=useState(false);
  const part=(selectedPart==='photo'&&!greeting.photo)||(selectedPart==='name'&&!greeting.name)||(selectedPart==='sender'&&!greeting.sender)?null:selectedPart;
  const [geometry,setGeometry]=useState<EditorGeometry>({width:1080,height:1080,boxes:[]});
  const [guides,setGuides]=useState<{x?:number;y?:number}>({});
  const start=useRef<Gesture|undefined>(undefined);
  const latest=useRef(greeting);latest.current=greeting;
  const outputHeight=greeting.socialSize==='story'?1920:greeting.socialSize==='portrait'?1350:greeting.socialSize==='square'?1080:0;
  const height=template.kind==='business'?648:greeting.layout==='vertical'?1440:1080;
  const nativeScale=outputHeight?Math.min(1,outputHeight/height):1;
  const box=geometry.boxes.find(b=>b.part===part);
  const resizePart=box?.part;
  const update=(target:Part,x:number,y:number)=>{const current=latest.current;onChange({...current,positions:{...current.positions,[target]:{x:Math.max(-1080,Math.min(1080,Math.round(x))),y:Math.max(-height,Math.min(height,Math.round(y)))}}})};
  const resize=(target:EditablePart,value:number)=>{const current=latest.current;onChange({...current,elementScales:{...current.elementScales,[target]:Math.max(.5,Math.min(2,Math.round(value*100)/100))}})};
  const stop=()=>{start.current=undefined;setGuides({})};
  const begin=(e:PointerEvent<HTMLDivElement>)=>{
    if(e.button!==0||(e.target as HTMLElement).closest('.resize-handle'))return;
    const rect=e.currentTarget.getBoundingClientRect();
    const x=(e.clientX-rect.left)*geometry.width/rect.width,y=(e.clientY-rect.top)*geometry.height/rect.height;
    const hit=hitElement(geometry,x,y,6*geometry.width/rect.width);
    const target=part==='text'&&hit?'text':part==='qr'||template.kind==='business'?part:hit;
    setPart(target);setGuides({});
    if(!target){start.current=undefined;return}
    e.preventDefault();e.currentTarget.focus({preventScroll:true});e.currentTarget.setPointerCapture(e.pointerId);
    const position=greeting.positions?.[target];
    start.current={part:target,mode:'move',x:e.clientX,y:e.clientY,px:position?.x??0,py:position?.y??0,scale:1,box:geometry.boxes.find(b=>b.part===target),geometry};
  };
  const move=(e:PointerEvent<HTMLDivElement>)=>{
    const initial=start.current;if(!initial)return;
    const rect=e.currentTarget.getBoundingClientRect();
    const dx=(e.clientX-initial.x)*geometry.width/rect.width,dy=(e.clientY-initial.y)*geometry.height/rect.height;
    if(initial.mode==='resize'&&initial.box){
      const {width,height}=initial.box;
      // Project the pointer onto the diagonal, preserving the element's proportions.
      const ratio=1+(dx*width+dy*height)/(width*width+height*height);
      resize(initial.part as EditablePart,initial.scale*ratio);return;
    }
    const snapped=initial.box&&!e.altKey?snapElement(initial.box,dx,dy,initial.geometry,6*geometry.width/rect.width):{dx,dy,x:undefined,y:undefined};
    setGuides({x:snapped.x,y:snapped.y});
    update(initial.part,initial.px+snapped.dx/nativeScale,initial.py+snapped.dy/nativeScale);
  };
  if(greeting.side==='back'&&greeting.back)return <Card template={template} greeting={greeting} paused={paused}/>;
  return <div className="movable-card">
    <div className="move-tools" aria-label="Move card elements">
      <label className="move-select">Move<select aria-label="Move element" value={part??''} onChange={e=>{stop();setPart(e.target.value as Part||null)}}>
        <option value="">Click to select</option>
        {template.kind!=='business'&&<><option value="heading">Heading</option><option value="message">Message</option>{greeting.name&&<option value="name">Recipient name</option>}{greeting.sender&&template.kind!=='invitation'&&<option value="sender">Creator / sender name</option>}</>}
        <option value="text">All text together</option>
        {greeting.photo&&<option value="photo">{template.kind==='business'?'Logo':'Photo'}</option>}
        {greeting.qr&&<option value="qr">QR code</option>}
      </select></label>
      {part&&<button type="button" onClick={()=>update(part,0,0)}>Reset selected</button>}
    </div>
    <div className="move-nudges" aria-label="Fine-tune selected element">
      {part?<>
        {([['Left',-10,0,'←'],['Up',0,-10,'↑'],['Down',0,10,'↓'],['Right',10,0,'→']] as const).map(([label,dx,dy,arrow])=><button type="button" key={label} aria-label={`Move selected ${label.toLowerCase()}`} onClick={()=>{const p=greeting.positions?.[part];update(part,(p?.x??0)+dx,(p?.y??0)+dy)}}>{arrow}</button>)}
        <output aria-live="polite">X {greeting.positions?.[part]?.x??0} · Y {greeting.positions?.[part]?.y??0}</output>
      </>:<small>Click text or your photo to select it.</small>}
    </div>
    <label className="element-size" style={{visibility:resizePart?'visible':'hidden'}} aria-hidden={!resizePart}>{resizePart&&<>Size<input aria-label="Selected element size" type="range" min={50} max={200} step={5} value={Math.round((greeting.elementScales?.[resizePart]??1)*100)} onChange={e=>resize(resizePart,Number(e.target.value)/100)}/><output>{Math.round((greeting.elementScales?.[resizePart]??1)*100)}%</output><button type="button" onClick={()=>resize(resizePart,1)}>Reset size</button></>}</label>
    <div className={`move-surface ${part?'can-move':''}`} tabIndex={0} role="group" aria-label={part?`Move ${part}. Drag here or use arrow keys.`:'Card editor. Click text or a photo to select.'}
      onPointerDown={begin} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}
      onKeyDown={e=>{if(e.key==='Escape'){stop();setPart(null);return}if(!part||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)||(e.target as HTMLElement).closest('.resize-handle'))return;e.preventDefault();const p=greeting.positions?.[part]||{x:0,y:0},step=e.shiftKey?10:1;update(part,p.x+(e.key==='ArrowRight'?step:e.key==='ArrowLeft'?-step:0),p.y+(e.key==='ArrowDown'?step:e.key==='ArrowUp'?-step:0))}}>
      <Card template={template} greeting={greeting} paused={paused} onGeometry={setGeometry}/>
      {box&&<div className="element-selection" data-part={box.part} style={{left:`${box.x/geometry.width*100}%`,top:`${box.y/geometry.height*100}%`,width:`${box.width/geometry.width*100}%`,height:`${box.height/geometry.height*100}%`}}>
        <span className="selection-label">{labels[box.part]}</span>
        <button type="button" className="resize-handle" aria-label={`Resize ${labels[box.part].toLowerCase()}`} title="Drag to resize. Arrow keys adjust size."
          onPointerDown={e=>{if(e.button!==0)return;e.stopPropagation();e.preventDefault();e.currentTarget.focus({preventScroll:true});e.currentTarget.setPointerCapture(e.pointerId);start.current={part:box.part,mode:'resize',x:e.clientX,y:e.clientY,px:0,py:0,scale:greeting.elementScales?.[box.part]??1,box,geometry};setGuides({})}}
          onKeyDown={e=>{if(['ArrowLeft','ArrowDown','ArrowRight','ArrowUp'].includes(e.key)){e.preventDefault();e.stopPropagation();resize(box.part,(greeting.elementScales?.[box.part]??1)+(['ArrowLeft','ArrowDown'].includes(e.key)?-.05:.05))}}}>↘</button>
      </div>}
      {guides.x!==undefined&&<div className="snap-guide vertical" style={{left:`${guides.x/geometry.width*100}%`}} aria-hidden="true"/>}
      {guides.y!==undefined&&<div className="snap-guide horizontal" style={{top:`${guides.y/geometry.height*100}%`}} aria-hidden="true"/>}
      {safe&&(!greeting.socialSize||greeting.socialSize==='original')&&<div className="print-safe-guide" style={{inset:template.kind==='business'?'5.56% 3.33%':greeting.layout==='vertical'?'2.5% 3.33%':'3.33%'}} aria-hidden="true"/>}
    </div>
    <label className="safe-guide-toggle"><input type="checkbox" checked={safe} onChange={e=>setSafe(e.target.checked)}/> Show 3 mm print safe margin (original format)</label>
    <small>{part?'Drag to move. Drag the corner to resize, or use the size slider. Arrow keys fine-tune; Shift moves faster. Hold Alt to bypass snapping.':'Select an element on the preview, or use the Move menu. Click empty space or press Escape to clear selection.'}</small>
  </div>;
}
