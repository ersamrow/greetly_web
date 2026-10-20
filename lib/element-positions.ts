import type {Greeting} from './templates';
import {recordBox,textAnchor} from './editor-geometry';
export type TextPart='heading'|'message'|'name'|'sender';
/** Individual offsets compose with the legacy whole-text offset. */
export function partText(c:CanvasRenderingContext2D,g:Greeting,part:TextPart,text:string,x:number,y:number,maxWidth?:number){
  const p=g.positions?.[part],scale=g.elementScales?.[part]??1,anchor=textAnchor(c,part,x,y);
  const px=anchor.x+(x-anchor.x)*scale+(p?.x??0),py=anchor.y+(y-anchor.y)*scale+(p?.y??0);
  c.save();
  c.font=c.font.replace(/([\d.]+)px/,(_,size)=>`${Number(size)*scale}px`);
  if(maxWidth===undefined)c.fillText(text,px,py);
  else c.fillText(text,px,py,maxWidth*scale);
  if(text){
    const metrics=c.measureText(text),width=Math.min(metrics.width,maxWidth===undefined?Infinity:maxWidth*scale);
    const left=c.textAlign==='center'?width/2:c.textAlign==='right'||c.textAlign==='end'?width:0;
    const ascent=metrics.actualBoundingBoxAscent,descent=metrics.actualBoundingBoxDescent;
    recordBox(c,{part,x:px-left+(g.positions?.text?.x??0),y:py-ascent+(g.positions?.text?.y??0),width,height:Math.max(1,ascent+descent)});
  }
  c.restore();
}
/** Offset editable text without moving decorations or attribution. */
export function positionedText(context:CanvasRenderingContext2D,g:Greeting,credit?:string):CanvasRenderingContext2D{
  const offset=g.positions?.text;if(!offset)return context;
  return new Proxy(context,{
    get(target,key){
      if(key==='fillText')return (text:string,x:number,y:number,maxWidth?:number)=>{
        const fixed=text==='made with greetlo'||text===credit;
        const args:[string,number,number,number?]=[text,x+(fixed?0:offset.x),y+(fixed?0:offset.y)];
        if(maxWidth!==undefined)args.push(maxWidth);target.fillText(...args as [string,number,number,number]);
      };
      const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;
    },
    set(target,key,value){return Reflect.set(target,key,value,target)}
  });
}
