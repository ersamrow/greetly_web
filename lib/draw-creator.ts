import {drawSender} from './draw-sender';
import {recordBox} from './editor-geometry';
import {partText,type TextPart} from './element-positions';
import type {Greeting,Template} from './templates';
import {textLines} from './editor-layout';

/** Shared by preview, PNG, video, print and saved-link rendering. */
export async function drawCreator(c:CanvasRenderingContext2D,t:Template,g:Greeting,h:number,color:string){
  const image=await new Promise<HTMLImageElement>((resolve,reject)=>{
    const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('Could not load your portrait'));img.src=g.photo!;
  });
  const footer=g.sender?150:65;
  const scale=Math.min(560/image.width,(h*.65-footer*.3)/image.height)*(g.portraitScale??100)/100;
  const width=image.width*scale,height=image.height*scale;
  const x=1060-width+(g.positions?.photo?.x??0),y=h-footer-height+(g.positions?.photo?.y??0);
  c.save();
  // A soft wash keeps the text legible on illustrated festival backgrounds.
  const wash=c.createLinearGradient(20,0,640,0);wash.addColorStop(0,g.bg);wash.addColorStop(1,g.bg+'00');
  c.fillStyle=wash;c.fillRect(20,h*.27,620,h*.73-55);
  const portraitScale=g.elementScales?.photo??1;
  c.drawImage(image,x,y,width*portraitScale,height*portraitScale);
  recordBox(c,{part:'photo',x,y,width:width*portraitScale,height:height*portraitScale});
  c.textAlign=g.textAlign??'left';c.textBaseline='top';
  const textX=c.textAlign==='right'?495:c.textAlign==='center'?280:65;
  const sections=[
    {part:'heading' as TextPart,text:g.heading??t.heading,size:g.headingSize??72,color:g.headingColor??color,gap:24},
    {part:'name' as TextPart,text:g.name,size:32,color:g.textColor??color,gap:20},
    {part:'message' as TextPart,text:g.message,size:g.messageSize??27,color:g.textColor??color,gap:0},
  ].filter(s=>s.text);
  const measure=(factor:number)=>sections.map(s=>{c.font=`${s.size*factor}px "${g.font}"`;return {...s,size:s.size*factor,lines:textLines(c,s.text,430)}});
  let factor=1,blocks=measure(factor);
  const available=h*.56-footer;
  while(blocks.reduce((n,s)=>n+s.lines.length*s.size*1.3+s.gap,0)>available&&factor>.1){factor*=.9;blocks=measure(factor)}
  let ty=h*.37;
  for(const block of blocks){c.font=`${block.size}px "${g.font}"`;c.fillStyle=block.color;for(const line of block.lines){partText(c,g,block.part,line,textX,ty);ty+=block.size*1.3}ty+=block.gap}
  await drawSender(c,g,h,color);
  c.restore();
}
