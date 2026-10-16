import {draw} from './draw';
import type {Greeting,Template} from './templates';
const pt=(mm:number)=>mm*72/25.4;
const bytes=(s:string)=>new TextEncoder().encode(s);
export function printDocument(pages:{jpeg:Uint8Array;width:number;height:number;mmWidth:number;mmHeight:number}[]):Uint8Array{
  const objects:Uint8Array[]=[bytes('<< /Type /Catalog /Pages 2 0 R >>'),bytes(`<< /Type /Pages /Count ${pages.length} /Kids [${pages.map((_,i)=>`${3+i*3} 0 R`).join(' ')}] >>`)];
  const join=(parts:Uint8Array[])=>{const out=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let i=0;for(const p of parts){out.set(p,i);i+=p.length}return out};
  for(const [i,p] of pages.entries()){
    const n=3+i*3,w=pt(p.mmWidth),h=pt(p.mmHeight),pad=pt(6),bleed=pt(3),mw=w+pad*2,mh=h+pad*2;
    objects.push(bytes(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${mw} ${mh}] /TrimBox [${pad} ${pad} ${pad+w} ${pad+h}] /BleedBox [${bleed} ${bleed} ${mw-bleed} ${mh-bleed}] /Resources << /XObject << /Im ${n+1} 0 R >> >> /Contents ${n+2} 0 R >>`));
    objects.push(join([bytes(`<< /Type /XObject /Subtype /Image /Width ${p.width} /Height ${p.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.jpeg.length} >>\nstream\n`),p.jpeg,bytes('\nendstream')]));
    let content=`q ${w+2*bleed} 0 0 ${h+2*bleed} ${bleed} ${bleed} cm /Im Do Q\n0 G 0.3 w\n`;
    for(const x of [pad,pad+w])for(const y of [pad,pad+h]){
      const sx=x===pad?0:mw,ex=x===pad?bleed:mw-bleed,sy=y===pad?0:mh,ey=y===pad?bleed:mh-bleed;
      content+=`${sx} ${y} m ${ex} ${y} l S ${x} ${sy} m ${x} ${ey} l S\n`;
    }
    objects.push(bytes(`<< /Length ${bytes(content).length} >>\nstream\n${content}endstream`));
  }
  const parts=[bytes('%PDF-1.4\n')],offsets=[0];let length=parts[0].length;
  objects.forEach((o,i)=>{offsets.push(length);const part=join([bytes(`${i+1} 0 obj\n`),o,bytes('\nendobj\n')]);parts.push(part);length+=part.length});
  parts.push(bytes(`xref\n0 ${objects.length+1}\n0000000000 65535 f \n${offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')}trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${length}\n%%EOF`));return join(parts);
}
export async function downloadPrintPDF(t:Template,g:Greeting){
  const pages=[];
  for(const side of (t.kind==='business'&&g.back?['front','back']:['front']) as ('front'|'back')[]){
    const canvas=document.createElement('canvas');await draw(canvas,t,{...g,side,socialSize:'original'});
    const mmWidth=90,mmHeight=mmWidth*canvas.height/canvas.width,b=Math.round(canvas.width/mmWidth*3);
    const full=document.createElement('canvas');full.width=canvas.width+2*b;full.height=canvas.height+2*b;const c=full.getContext('2d')!;
    c.drawImage(canvas,0,0,canvas.width,canvas.height,0,0,full.width,full.height);
    c.drawImage(canvas,0,0,canvas.width,1,b,0,canvas.width,b);c.drawImage(canvas,0,canvas.height-1,canvas.width,1,b,b+canvas.height,canvas.width,b);
    c.drawImage(canvas,0,0,1,canvas.height,0,b,b,canvas.height);c.drawImage(canvas,canvas.width-1,0,1,canvas.height,b+canvas.width,b,b,canvas.height);c.drawImage(canvas,b,b);
    const jpeg=Uint8Array.from(atob(full.toDataURL('image/jpeg',.98).split(',')[1]),c=>c.charCodeAt(0));pages.push({jpeg,width:full.width,height:full.height,mmWidth,mmHeight});
  }
  const output=printDocument(pages),url=URL.createObjectURL(new Blob([output as BlobPart],{type:'application/pdf'})),a=document.createElement('a');a.href=url;a.download='greetlo-print.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
}
