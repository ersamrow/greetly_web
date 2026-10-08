const rgb=(hex:string)=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
const hex=(values:number[])=>'#'+values.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');
export function imageColours(pixels:Uint8ClampedArray):string[]{
  const bins=new Map<string,{count:number;sum:number[]}>();
  for(let i=0;i<pixels.length;i+=4){
    if(pixels[i+3]<128)continue;
    const values=[pixels[i],pixels[i+1],pixels[i+2]],key=values.map(v=>Math.floor(v/32)).join(',');
    const bin=bins.get(key)||{count:0,sum:[0,0,0]};
    const weight=pixels[i+3]/255;bin.count+=weight;values.forEach((v,j)=>bin.sum[j]+=v*weight);bins.set(key,bin);
  }
  const result:number[][]=[];
  for(const bin of [...bins.values()].sort((a,b)=>b.count-a.count)){
    const color=bin.sum.map(v=>v/bin.count);
    if(result.every(other=>Math.hypot(...color.map((v,i)=>v-other[i]))>55))result.push(color);
    if(result.length===5)break;
  }
  return result.map(hex);
}
function luminance(color:string){const v=rgb(color).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return v[0]*.2126+v[1]*.7152+v[2]*.0722}
export function contrastRatio(a:string,b:string){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
export function imageTheme(color:string){
  const values=rgb(color),bg=hex(values.map(v=>v*.1+255*.9));
  let headingColor=color;
  while(contrastRatio(bg,headingColor)<4.5)headingColor=hex(rgb(headingColor).map(v=>v*.85));
  return {bg,headingColor,textColor:'#17212b'};
}
export function uploadedImageTheme(image:ImageBitmap){
  const canvas=document.createElement('canvas'),ratio=Math.min(1,96/Math.max(image.width,image.height));
  canvas.width=Math.max(1,Math.round(image.width*ratio));canvas.height=Math.max(1,Math.round(image.height*ratio));
  const context=canvas.getContext('2d',{willReadFrequently:true})!;
  context.drawImage(image,0,0,canvas.width,canvas.height);
  const colors=imageColours(context.getImageData(0,0,canvas.width,canvas.height).data);
  // Prefer the logo's brand colour over a dominant white or black area.
  const color=colors.find(color=>{const values=rgb(color);return Math.max(...values)-Math.min(...values)>40})||colors[0];
  return color?imageTheme(color):{};
}
