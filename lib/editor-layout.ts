import type {Greeting,Template} from './templates';

export function hasEditorOptions(g:Greeting){return ['positions','heading','headingColor','textColor','headingSize','messageSize','textAlign','photoPlacement','photoSize','photoShape','photoZoom','photoX','photoY'].some(key=>g[key as keyof Greeting]!==undefined)}

export function textLines(c:CanvasRenderingContext2D,text:string,width:number){
  const lines:string[]=[];
  for(const paragraph of text.trim().replace(/\n{3,}/g,'\n\n').split('\n')){
    if(!paragraph){lines.push('');continue}
    let line='';
    for(const word of paragraph.split(/\s+/)){
      if(c.measureText(line?line+' '+word:word).width<=width){line=line?line+' '+word:word;continue}
      if(line){lines.push(line);line=''}
      // Split long unbroken names and words instead of clipping them.
      for(const char of Array.from(new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(word),part=>part.segment)){if(line&&c.measureText(line+char).width>width){lines.push(line);line=''}line+=char}
    }
    if(line)lines.push(line);
  }
  return lines;
}

export async function drawEditable(c:CanvasRenderingContext2D,t:Template,g:Greeting,h:number,defaultColor:string){
  if(t.photoArtwork)h-=480;
  let left=150,right=930,top=t.photoArtwork?130:240,bottom=h-(t.photoArtwork?30:150);
  const size=t.photoArtwork?Math.min(g.photoSize??220,140):g.photoSize??220,placement=g.photoPlacement??'top';
  const inline=!!g.photo&&['middle','in-message','after-message'].includes(placement);
  const paintPhoto=async(px:number,py:number)=>{
    const image=await new Promise<HTMLImageElement>((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('Could not load your photo'));im.src=g.photo!});
    px+=g.positions?.photo?.x||0;py+=g.positions?.photo?.y||0;
    c.save();c.beginPath();
    const shape=g.photoShape??'circle';
    if(shape==='circle')c.arc(px+size/2,py+size/2,size/2,0,Math.PI*2);
    else if(shape==='rounded')c.roundRect(px,py,size,size,28);
    else c.rect(px,py,size,size);
    c.clip();const crop=Math.min(image.width,image.height)/(g.photoZoom??1);
    const sx=(image.width-crop)*(g.photoX??50)/100,sy=(image.height-crop)*(g.photoY??50)/100;
    c.drawImage(image,sx,sy,crop,crop,px,py,size,size);c.restore();
  };
  if(inline)top=160;
  if(g.photo&&!inline){
    let px=540-size/2,py=120;
    if(placement==='top'){top=120+size+65}
    if(placement==='bottom'){py=h-125-size;bottom=py-40;top=190}
    if(placement==='left'){px=95;py=(h-size)/2;left=px+size+45;right=985;top=220}
    if(placement==='right'){px=985-size;py=(h-size)/2;left=95;right=px-45;top=220}
    await paintPhoto(px,py);
  }
  const align=g.textAlign??'center',x=align==='left'?left:align==='right'?right:(left+right)/2,width=right-left;
  const heading=g.heading??t.heading;
  const message=(text:string)=>({text,size:g.messageSize??27,color:g.textColor??defaultColor,gap:28});
  const photoBlock={photo:true,text:'',size:0,color:'',gap:24};
  const sections:{photo?:boolean;text:string;size:number;color:string;gap:number}[]=[{text:heading,size:g.headingSize??(g.photo?72:100),color:g.headingColor??defaultColor,gap:24},{text:g.name,size:44,color:g.textColor??defaultColor,gap:22}];
  if(inline&&placement==='middle')sections.push(photoBlock);
  if(inline&&placement==='in-message'){
    const words=g.message.trim().split(/\s+/),mid=Math.ceil(words.length/2);
    sections.push(message(words.slice(0,mid).join(' ')),photoBlock,message(words.slice(mid).join(' ')));
  }else sections.push(message(g.message));
  if(inline&&placement==='after-message')sections.push(photoBlock);
  sections.push({...message(g.sender?'With love, '+g.sender:''),gap:0});
  const measure=(scale:number)=>sections.filter(s=>s.photo||s.text.length).map(s=>{const fontSize=s.size*scale;c.font=`${fontSize}px ${g.font}`;const lines=s.photo?[]:textLines(c,s.text,width);return {...s,size:fontSize,lines,height:s.photo?size:lines.length*fontSize*1.25,gap:s.photo?24:s.gap*scale}});
  let scale=1,blocks=measure(scale);
  while(blocks.reduce((sum,b)=>sum+b.height+b.gap,0)>bottom-top&&scale>.01){scale*=.9;blocks=measure(scale)}
  c.textAlign=align;c.textBaseline='top';let y=top;
  for(const block of blocks){if(block.photo){await paintPhoto(540-size/2,y);y+=size+block.gap;continue}c.font=`${block.size}px ${g.font}`;c.fillStyle=block.color;for(const line of block.lines){c.fillText(line,x,y);y+=block.size*1.25}y+=block.gap}
  c.textAlign='center';c.textBaseline='alphabetic';c.fillStyle=g.textColor??defaultColor;c.font='18px Arial';
  c.fillText(t.kicker|| (t.festival==='Dussehra'?'CELEBRATING THE TRIUMPH OF GOOD':t.festival==='Diwali'?'A SEASON OF LOVE AND LIGHT':'A LITTLE SOMETHING, JUST FOR YOU'),540,85,790);
}
