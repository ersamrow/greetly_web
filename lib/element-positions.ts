import type {Greeting} from './templates';
/** Offset editable text without moving decorations or attribution. */
export function positionedText(context:CanvasRenderingContext2D,g:Greeting,credit?:string):CanvasRenderingContext2D{
  const offset=g.positions?.text;if(!offset)return context;
  return new Proxy(context,{
    get(target,key){
      if(key==='fillText')return (text:string,x:number,y:number,maxWidth?:number)=>{
        const fixed=text==='made with greetly'||text===credit;
        const args:[string,number,number,number?]=[text,x+(fixed?0:offset.x),y+(fixed?0:offset.y)];
        if(maxWidth!==undefined)args.push(maxWidth);target.fillText(...args as [string,number,number,number]);
      };
      const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;
    },
    set(target,key,value){return Reflect.set(target,key,value,target)}
  });
}
