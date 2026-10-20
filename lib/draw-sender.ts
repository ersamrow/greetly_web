import type {Greeting} from './templates';
import {partText} from './element-positions';
import {recordBox} from './editor-geometry';

export async function drawSender(c:CanvasRenderingContext2D,g:Greeting,h:number,color:string){
  if(!g.sender)return;
  const s=g.senderStyle??{},treatment=s.treatment??'badge',font=s.font??g.font,size=s.size??44;
  if(font.startsWith('Noto Sans')&&typeof document!=='undefined')await document.fonts.load(`${size}px "${font}"`);
  const text=[s.prefix??'From',g.sender].filter(Boolean).join(' ');
  const scale=g.elementScales?.sender??1;
  const dx=(g.positions?.text?.x??0)+(g.positions?.sender?.x??0),dy=(g.positions?.text?.y??0)+(g.positions?.sender?.y??0);
  c.save();c.textAlign='center';c.textBaseline='top';
  c.font=`${treatment==='signature'?'italic ':''}${size}px "${font}"`;
  const width=treatment==='banner'?990:Math.min(990,c.measureText(text).width+48),height=size*1.35+24;
  const baseline=h-123-Math.max(0,size-36)*1.35;
  const x=540-width*scale/2+dx,y=baseline-12*scale+dy;
  const textColor=s.color??g.textColor??color;
  if(treatment==='badge'||treatment==='banner'||treatment==='outline'){
    c.beginPath();c.roundRect(x,y,width*scale,height*scale,treatment==='banner'?0:Math.min(18*scale,height*scale/2));
    if(treatment==='outline'){c.strokeStyle=textColor;c.lineWidth=2*scale;c.stroke()}
    else{c.fillStyle=s.background??g.bg;c.globalAlpha=(s.opacity??90)/100;c.fill();c.globalAlpha=1}
    recordBox(c,{part:'sender',x,y,width:width*scale,height:height*scale});
  }
  c.fillStyle=textColor;
  partText(c,g,'sender',text,540,baseline,942);
  c.restore();
}
