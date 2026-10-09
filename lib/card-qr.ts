import * as QRCode from 'qrcode/lib/core/qrcode.js';
import type {Greeting} from './templates';
const escape=(s:string)=>s.replace(/\\/g,'\\\\').replace(/\r?\n|\r/g,'\\n').replace(/[,;]/g,'\\$&');
export function qrPayload(g:Greeting):string|undefined{
  if(!g.qr)return;
  const {mode,value}=g.qr,d=g.details||{};
  if(mode==='contact')return g.name||g.heading?['BEGIN:VCARD','VERSION:3.0',`FN:${escape(g.name||g.heading||'')}`,`ORG:${escape(g.heading||'')}`,`TITLE:${escape(d.role||'')}`,`TEL:${escape(d.phone||'')}`,`EMAIL:${escape(d.email||'')}`,`URL:${escape(d.website||'')}`,'END:VCARD'].join('\r\n'):undefined;
  if(!value.trim())return;
  if(mode==='whatsapp'){const digits=value.replace(/[\s()+-]/g,'');return /^\d{8,15}$/.test(digits)?'https://wa.me/'+digits:undefined}
  if(mode==='map'){const url='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(value.trim());return url.length<=1800?url:undefined}
  try{const url=new URL(/^[a-z][a-z\d+.-]*:/i.test(value)?value:'https://'+value);return ['https:','http:'].includes(url.protocol)&&url.hostname.includes('.')&&!url.username&&!url.password&&url.href.length<=1800?url.href:undefined}catch{return}
}
export function drawQR(c:CanvasRenderingContext2D,g:Greeting,x:number,y:number,size=220){
  const payload=qrPayload(g);if(!payload)return;
  x+=g.positions?.qr?.x||0;y+=g.positions?.qr?.y||0;
  const qr=QRCode.create(payload,{errorCorrectionLevel:'M'}),n=qr.modules.size,cell=Math.floor(size/(n+8)),width=cell*(n+8);
  c.save();c.fillStyle='#ffffff';c.fillRect(x,y,width,width);c.fillStyle='#000000';
  for(let row=0;row<n;row++)for(let col=0;col<n;col++)if(qr.modules.get(row,col))c.fillRect(x+(col+4)*cell,y+(row+4)*cell,cell,cell);
  c.restore();
}
