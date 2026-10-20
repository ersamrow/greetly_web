export type EditablePart='heading'|'message'|'name'|'sender'|'photo';
export type ElementBox={part:EditablePart;x:number;y:number;width:number;height:number};
export type EditorGeometry={width:number;height:number;boxes:ElementBox[]};
type Frame={geometry:EditorGeometry;anchors:Partial<Record<EditablePart,{x:number;y:number}>>};
const contexts=new WeakMap<CanvasRenderingContext2D,Frame>();
const canvases=new WeakMap<HTMLCanvasElement,EditorGeometry>();

export function beginGeometry(canvas:HTMLCanvasElement,c:CanvasRenderingContext2D){
  const geometry={width:canvas.width,height:canvas.height,boxes:[]};
  canvases.set(canvas,geometry);contexts.set(c,{geometry,anchors:{}});
}
export function getGeometry(canvas:HTMLCanvasElement):EditorGeometry{
  return canvases.get(canvas)??{width:canvas.width,height:canvas.height,boxes:[]};
}
export function copyGeometry(source:HTMLCanvasElement,target:HTMLCanvasElement,scale:number,x:number,y:number){
  canvases.set(target,{width:target.width,height:target.height,boxes:getGeometry(source).boxes.map(b=>({...b,x:x+b.x*scale,y:y+b.y*scale,width:b.width*scale,height:b.height*scale}))});
}
export function textAnchor(c:CanvasRenderingContext2D,part:EditablePart,x:number,y:number){
  const frame=contexts.get(c);
  if(!frame)return {x,y};
  return frame.anchors[part]??(frame.anchors[part]={x,y});
}
export function recordBox(c:CanvasRenderingContext2D,box:ElementBox){
  const frame=contexts.get(c);if(!frame)return;
  const prior=frame.geometry.boxes.find(b=>b.part===box.part);
  if(prior){
    const right=Math.max(prior.x+prior.width,box.x+box.width),bottom=Math.max(prior.y+prior.height,box.y+box.height);
    prior.x=Math.min(prior.x,box.x);prior.y=Math.min(prior.y,box.y);prior.width=right-prior.x;prior.height=bottom-prior.y;
  }else frame.geometry.boxes.push({...box});
}
export function hitElement(geometry:EditorGeometry,x:number,y:number,padding=8){
  // Text sits in front of the portrait. Small text regions take precedence.
  return [...geometry.boxes].sort((a,b)=>Number(a.part==='photo')-Number(b.part==='photo')||a.width*a.height-b.width*b.height)
    .find(b=>x>=b.x-padding&&x<=b.x+b.width+padding&&y>=b.y-padding&&y<=b.y+b.height+padding)?.part??null;
}
/** Snap only when an element's actual edge or centre approaches an alignment. */
export function snapElement(box:ElementBox,dx:number,dy:number,geometry:EditorGeometry,tolerance:number){
  const others=geometry.boxes.filter(b=>b.part!==box.part);
  const xs=[0,geometry.width/2,geometry.width,...others.flatMap(b=>[b.x,b.x+b.width/2,b.x+b.width])];
  const ys=[0,geometry.height/2,geometry.height,...others.flatMap(b=>[b.y,b.y+b.height/2,b.y+b.height])];
  const closest=(points:number[],targets:number[])=>{
    let distance=tolerance+1,line:number|undefined;
    for(const p of points)for(const target of targets)if(Math.abs(target-p)<Math.abs(distance)){distance=target-p;line=target}
    return Math.abs(distance)<=tolerance?{delta:distance,line}:{delta:0,line:undefined};
  };
  const x=closest([box.x+dx,box.x+dx+box.width/2,box.x+dx+box.width],xs);
  const y=closest([box.y+dy,box.y+dy+box.height/2,box.y+dy+box.height],ys);
  return {dx:dx+x.delta,dy:dy+y.delta,x:x.line,y:y.line};
}
