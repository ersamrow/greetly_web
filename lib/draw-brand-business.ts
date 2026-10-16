import {drawQR,qrPayload} from './card-qr';
import {textLines} from './editor-layout';
import type {Greeting,Template} from './templates';

type Block={text:string;size:number;bold?:boolean;color?:string};
/** Keep each content group inside its own panel, including long contact details. */
function copy(c:CanvasRenderingContext2D,g:Greeting,blocks:Block[],x:number,y:number,w:number,h:number,color:string){
  const measure=(scale:number)=>blocks.filter(b=>b.text).map(b=>{
    const size=b.size*scale;c.font=`${b.bold?'bold ':''}${size}px ${g.font}`;
    return {...b,size,lines:textLines(c,b.text,w)};
  });
  let scale=1,rows=measure(scale);
  while(rows.reduce((n,r)=>n+r.lines.length*r.size*1.25+12*scale,0)>h&&scale>.05){scale*=.9;rows=measure(scale)}
  const align=g.textAlign||'left';c.textAlign=align;c.textBaseline='top';
  const anchor=align==='right'?x+w:align==='center'?x+w/2:x;
  for(const row of rows){c.fillStyle=row.color||color;c.font=`${row.bold?'bold ':''}${row.size}px ${g.font}`;
    for(const line of row.lines){c.fillText(line,anchor,y);y+=row.size*1.25}y+=12*scale;
  }
}
function contrast(hex:string){
  const values=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
  return values[0]*.2126+values[1]*.7152+values[2]*.0722>.179?'#111827':'#ffffff';
}
export async function drawBrandBusiness(c:CanvasRenderingContext2D,t:Template,g:Greeting){
  const accent=t.ink,ink=g.textColor||accent,headingInk=g.headingColor||ink,onAccent=contrast(accent),d=g.details||{},hasQR=!!qrPayload(g);
  const identity:Block[]=[{text:g.heading??t.heading,size:(g.headingSize??68)*.7,bold:true,color:headingInk},{text:g.name,size:38,bold:true},{text:d.role||'',size:26},{text:g.message,size:g.messageSize??24}];
  const contacts:Block[]=[{text:[d.phone,d.email,d.website,d.address].filter(Boolean).join('\n'),size:g.messageSize??25}];
  let logo={x:805,y:82,size:190},qr={x:790,y:348};
  c.save();c.fillStyle=g.bg;c.fillRect(0,0,1080,648);
  if(t.pattern===8){
    c.fillStyle=accent;c.beginPath();c.moveTo(0,0);c.lineTo(660,0);c.lineTo(815,648);c.lineTo(0,648);c.closePath();c.fill();
    c.globalAlpha=.3;c.beginPath();c.moveTo(980,0);c.lineTo(1080,0);c.lineTo(1080,460);c.closePath();c.fill();c.globalAlpha=1;
    copy(c,g,identity.map(b=>({...b,color:b.color?g.headingColor||onAccent:undefined})),65,62,535,265,g.textColor||onAccent);
    copy(c,g,contacts,65,365,565,190,g.textColor||onAccent);
  }else if(t.pattern===9){
    logo={x:78,y:130,size:250};qr={x:95,y:405};
    c.fillStyle=accent;c.fillRect(396,70,2,490);c.fillRect(0,612,1080,36);
    copy(c,g,identity,460,75,550,260,ink);copy(c,g,contacts,460,370,550,195,ink);
  }else if(t.pattern===10){
    logo={x:65,y:62,size:190};qr={x:795,y:408};
    c.fillStyle=accent;c.beginPath();c.moveTo(0,370);c.lineTo(675,370);c.lineTo(760,460);c.lineTo(1080,460);c.lineTo(1080,648);c.lineTo(0,648);c.closePath();c.fill();
    copy(c,g,identity,345,58,655,265,ink);
    copy(c,g,contacts,65,405,650,190,g.textColor||onAccent);
  }else{
    logo={x:60,y:140,size:225};qr={x:70,y:410};
    c.fillStyle=accent;c.fillRect(0,0,1080,648);c.fillStyle=g.bg;
    c.beginPath();c.ellipse(-45,324,410,480,0,0,Math.PI*2);c.fill();
    copy(c,g,identity.map(b=>({...b,color:b.color?g.headingColor||onAccent:undefined})),430,65,580,270,g.textColor||onAccent);
    copy(c,g,contacts,430,380,580,205,g.textColor||onAccent);
  }
  if(g.photo){
    const image=await new Promise<HTMLImageElement>((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('Could not load logo'));im.src=g.photo!});
    const size=logo.size*(g.logoScale??100)/100,ratio=Math.min(size/image.width,size/image.height);
    c.drawImage(image,logo.x+(logo.size-image.width*ratio)/2+(g.positions?.photo?.x||0),logo.y+(logo.size-image.height*ratio)/2+(g.positions?.photo?.y||0),image.width*ratio,image.height*ratio);
  }else{
    c.fillStyle=accent;c.font=`bold ${logo.size*.5}px ${g.font}`;c.textAlign='center';c.textBaseline='middle';
    c.fillText((g.heading||t.heading).trim().charAt(0).toUpperCase(),logo.x+logo.size/2,logo.y+logo.size/2);
  }
  if(hasQR)drawQR(c,g,qr.x,qr.y,190);
  if(g.branding){c.fillStyle=t.pattern===8?ink:t.pattern===9||t.pattern===10?onAccent:g.textColor||onAccent;c.font='14px Arial';c.textAlign='right';c.textBaseline='top';c.fillText('made with greetlo',1020,625)}
  c.restore();
}
