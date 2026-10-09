import {positionedText} from './element-positions';
import {drawQR,qrPayload} from './card-qr';
import {drawBusiness} from './draw-business';
import {Greeting,Template} from './templates';
import {drawEditable,hasEditorOptions,textLines} from './editor-layout';
const artworkCache=new Map<string,Promise<HTMLImageElement>>();
function loadArtwork(path:string){let pending=artworkCache.get(path);if(!pending){pending=new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>{artworkCache.delete(path);reject(new Error('Could not load card artwork'))};image.src=path});artworkCache.set(path,pending)}return pending}
export async function draw(canvas:HTMLCanvasElement,t:Template,g:Greeting){
if(g.font.startsWith('Noto Sans')&&typeof document!=='undefined')await document.fonts.load(`32px "${g.font}"`);
if(g.socialSize&&g.socialSize!=='original'){const source=document.createElement('canvas');await draw(source,t,{...g,socialSize:'original'});canvas.width=1080;canvas.height=g.socialSize==='story'?1920:g.socialSize==='portrait'?1350:1080;const ctx=canvas.getContext('2d')!;ctx.fillStyle=g.bg;ctx.fillRect(0,0,canvas.width,canvas.height);const ratio=Math.min(canvas.width/source.width,canvas.height/source.height);ctx.drawImage(source,(canvas.width-source.width*ratio)/2,(canvas.height-source.height*ratio)/2,source.width*ratio,source.height*ratio);return}
if(t.kind==='business'&&g.side==='back'&&g.back){canvas.width=1080;canvas.height=648;const c=canvas.getContext('2d')!;c.fillStyle=g.bg;c.fillRect(0,0,1080,648);c.fillStyle=g.headingColor||t.ink;c.fillRect(60,50,960,4);c.textAlign='center';c.textBaseline='top';const sections:[[string,number],[string,number],[string,number]]=[[g.back.heading,48],[g.back.message,28],[g.back.website,24]];const measure=(scale:number)=>sections.map(([text,size])=>{c.font=`${size*scale}px "${g.font}"`;return {size:size*scale,lines:textLines(c,text,900)}});let scale=1,blocks=measure(scale);while(blocks.reduce((n,b)=>n+b.lines.length*b.size*1.3+28,0)>490&&scale>.1){scale*=.9;blocks=measure(scale)}let y=95;for(const block of blocks){c.font=`${block.size}px "${g.font}"`;for(const line of block.lines){c.fillText(line,540,y);y+=block.size*1.3}y+=28;}return}
if(t.kind==='business'){canvas.width=1080;canvas.height=648;await drawBusiness(positionedText(canvas.getContext('2d')!,g,t.photoCredit),t,g);return}
if(t.kind==='invitation'){const d=g.details||{};g={...g,heading:g.heading??t.heading,message:[g.message,[d.date,d.time].filter(Boolean).join(' · '),d.venue,d.rsvp?'RSVP: '+d.rsvp:'',g.sender?'Hosted by '+g.sender:''].filter(Boolean).join('\n\n'),sender:''}}
const w=1080,h=g.layout==='vertical'?1440:1080;canvas.width=w;canvas.height=h;const c=positionedText(canvas.getContext('2d')!,g,t.photoCredit);c.fillStyle=g.bg;c.fillRect(0,0,w,h);c.fillStyle=t.ink;c.strokeStyle=t.ink;
if(t.artwork){const art=await loadArtwork(t.artwork);c.drawImage(art,0,0,art.width,art.height/2,0,0,w,540);if(h>1080)c.drawImage(art,0,art.height/3,art.width,art.height/3,0,540,w,h-1080);c.drawImage(art,0,art.height/2,art.width,art.height/2,0,h-540,w,540);if(g.bg!==t.bg){c.save();c.globalAlpha=.22;c.fillStyle=g.bg;c.fillRect(0,0,w,h);c.restore()}}
if(t.pattern===0){for(let i=0;i<34;i++){let x=(i*197+45)%w,y=(i*313+35)%h;if(x>130&&x<950&&y>170&&y<h-150)continue;c.save();c.translate(x,y);c.rotate(i);c.globalAlpha=.55;c.fillRect(-7,-17,14,34);c.restore();}}
if(t.pattern===1){c.lineWidth=3;for(let i=0;i<3;i++)c.strokeRect(35+i*15,35+i*15,w-70-i*30,h-70-i*30);}
if(t.pattern===2){c.globalAlpha=.12;for(let i=0;i<9;i++){c.beginPath();c.arc(i%2?w:0,i*h/8,125,0,Math.PI*2);c.fill();}c.globalAlpha=1;}
if(t.pattern===3){for(let i=0;i<70;i++){c.globalAlpha=.17;c.beginPath();c.arc((i*173)%w,(i*271)%h,4+(i%4)*2,0,Math.PI*2);c.fill();}c.globalAlpha=1;}
if(t.pattern===4){c.lineWidth=2;c.globalAlpha=.4;for(let i=0;i<7;i++){c.beginPath();c.arc(w/2,h/2,460+i*15,0,Math.PI*2);c.stroke();}c.globalAlpha=1;}
if(t.pattern===5){try{const im=await new Promise<HTMLImageElement>((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src='/floral.png'});c.drawImage(im,0,0,w,h)}catch{}}
c.textAlign='center';const rgb=(t.artwork?t.bg:g.bg).slice(1).match(/../g)!.map(v=>parseInt(v,16));const dark=rgb[0]*.299+rgb[1]*.587+rgb[2]*.114<130;c.fillStyle=dark?'#fff6df':t.ink==='#f8de9a'?'#322a54':t.ink;
const wrap=(text:string,y:number,size:number,max=790)=>{c.font=`${size}px ${g.font}`;const words=text.split(/\s+/);let line='',lines:string[]=[];for(const word of words){let next=line?line+' '+word:word;if(c.measureText(next).width>max&&line){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);for(const [i,l] of lines.entries())c.fillText(l,w/2,y+i*size*1.38);return y+lines.length*size*1.38;};
if(t.photoArtwork){const photo=await loadArtwork(t.photoArtwork);const sh=photo.width*420/960,sy=(photo.height-sh)*(t.photoArtwork.includes('night')?.25:.55);c.drawImage(photo,0,sy,photo.width,sh,60,h-480,960,420);}
if(hasEditorOptions(g)||t.photoArtwork){await drawEditable(c,t,g,t.kind==='invitation'&&qrPayload(g)?h-260:h,c.fillStyle as string)}else{
let y=g.photo?190:Math.round(h*.27);c.font='18px Arial';c.fillText(t.kicker|| (t.festival==='Dussehra'?'CELEBRATING THE TRIUMPH OF GOOD':t.festival==='Diwali'?'A SEASON OF LOVE AND LIGHT':'A LITTLE SOMETHING, JUST FOR YOU'),540,g.photo?90:Math.round(h*.13));
if(g.photo){const img=await new Promise<HTMLImageElement>((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=g.photo!});c.save();c.beginPath();c.arc(540,230,110,0,Math.PI*2);c.clip();const s=Math.min(img.width,img.height);c.drawImage(img,(img.width-s)/2,(img.height-s)/2,s,s,430,120,220,220);c.restore();y=425;}
c.font=`${g.photo?72:100}px ${g.font}`;for(const line of t.heading.split('\n')){c.fillText(line,540,y,820);y+=g.photo?82:110;}
if(g.name){y=wrap(g.name,y+12,44,800)+12;}else y+=30;
y=wrap(g.message,y,27,730);if(g.sender)wrap('With love, '+g.sender,Math.min(y+40,h-110),27);
}
if(t.kind==='invitation')drawQR(c,g,430,h-290,220);
if(g.branding){c.font='20px Arial';c.globalAlpha=.65;c.fillText('made with greetly',540,h-42);c.globalAlpha=1;}
if(t.photoCredit){c.save();c.textAlign='center';c.font='15px Arial';c.fillStyle=t.ink;c.fillText(t.photoCredit,540,h-16,1000);c.restore();}
}
