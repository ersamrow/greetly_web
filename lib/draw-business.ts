import {drawQR,qrPayload} from './card-qr';
import type {Greeting,Template} from './templates';
import {textLines} from './editor-layout';
import {drawBrandBusiness} from './draw-brand-business';
export async function drawBusiness(c:CanvasRenderingContext2D,t:Template,g:Greeting){
  if(t.pattern>=8)return drawBrandBusiness(c,t,g);
  const ink=g.textColor||t.ink,headingInk=g.headingColor||ink;
  c.fillStyle=g.bg;c.fillRect(0,0,1080,648);
  c.save();c.fillStyle=headingInk;c.strokeStyle=headingInk;
  if(t.pattern<2)c.fillRect(0,0,t.pattern===1?18:1080,t.pattern===1?648:14);
  if(t.pattern===2){
    c.globalAlpha=.09;c.fillRect(770,0,310,648);c.globalAlpha=1;c.fillRect(0,0,16,648);
    c.fillRect(790,276,210,3);
  }
  if(t.pattern===3){
    c.lineWidth=2;c.strokeRect(26,26,1028,596);c.lineWidth=1;c.strokeRect(34,34,1012,580);
    c.fillRect(80,42,100,4);
  }
  if(t.pattern===4){
    c.globalAlpha=.12;c.beginPath();c.moveTo(730,0);c.lineTo(1080,0);c.lineTo(1080,648);c.lineTo(960,648);c.closePath();c.fill();
    c.globalAlpha=1;c.beginPath();c.moveTo(0,568);c.lineTo(0,648);c.lineTo(80,648);c.closePath();c.fill();
  }
  if(t.pattern===5){
    c.fillRect(80,35,920,3);c.fillRect(80,578,920,3);
    c.globalAlpha=.25;c.fillRect(758,68,1,480);
    c.globalAlpha=1;c.fillRect(80,578,130,9);
  }
  if(t.pattern===6){
    c.globalAlpha=.12;c.lineWidth=30;c.beginPath();c.arc(1080,0,270,0,Math.PI*2);c.stroke();
    c.lineWidth=2;c.beginPath();c.arc(1080,0,315,0,Math.PI*2);c.stroke();
    c.beginPath();c.arc(0,648,44,0,Math.PI*2);c.fill();
  }
  if(t.pattern===7){
    c.fillRect(0,0,32,648);c.fillRect(44,0,7,648);
    c.globalAlpha=.08;c.fillRect(770,0,310,648);c.globalAlpha=1;
    for(let i=0;i<5;i++)c.fillRect(800+i*42,582,24,8);
  }
  c.restore();
  const right=qrPayload(g)||t.pattern>=2?730:g.photo?790:1000,width=right-80,align=g.textAlign||'left',x=align==='right'?right:align==='center'?(80+right)/2:80;
  const d=g.details||{};
  const sections=[{text:g.heading??t.heading,size:(g.headingSize??76)*.7,color:headingInk,gap:20},{text:g.name,size:36,color:ink,gap:6},{text:d.role||'',size:24,color:ink,gap:18},{text:g.message,size:g.messageSize??25,color:ink,gap:22},{text:[d.phone,d.email,d.website,d.address].filter(Boolean).join('\n'),size:g.messageSize??24,color:ink,gap:0}].filter(s=>s.text);
  const measure=(scale:number)=>sections.map(s=>{c.font=`${s.size*scale}px ${g.font}`;const lines=textLines(c,s.text,width);return {...s,lines,size:s.size*scale,gap:s.gap*scale}});
  let scale=1,blocks=measure(scale);
  while(blocks.reduce((sum,b)=>sum+b.lines.length*b.size*1.3+b.gap,0)>480&&scale>.1){scale*=.9;blocks=measure(scale)}
  c.textAlign=align;c.textBaseline='top';let y=68;
  for(const block of blocks){c.fillStyle=block.color;c.font=`${block.size}px ${g.font}`;for(const line of block.lines){c.fillText(line,x,y);y+=block.size*1.3}y+=block.gap}
  if(g.photo){const im=await new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error('Could not load logo'));image.src=g.photo!});const size=160*(g.logoScale??100)/100,ratio=Math.min(size/im.width,size/im.height);c.drawImage(im,920-im.width*ratio/2+(g.positions?.photo?.x||0),148-im.height*ratio/2+(g.positions?.photo?.y||0),im.width*ratio,im.height*ratio)}
  if(g.branding){c.fillStyle=ink;c.font='16px Arial';c.textAlign='right';c.fillText('made with greetly',1000,605)}
  drawQR(c,g,790,340,210);
  c.textBaseline='alphabetic';
}
