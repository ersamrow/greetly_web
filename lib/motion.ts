import type {Template,Greeting} from './templates';
import {draw} from './draw';

// Shared rendering keeps live cards and video downloads consistent.
export function drawMotion(c:CanvasRenderingContext2D,t:Template,time:number,w:number,h:number){
  if(!t.motion)return;
  c.save();c.scale(w/1080,h/1080);
  const phase=(time%6000)/6000;
  for(let i=0;i<32;i++){
    const x=i%2===0?32+(i*37)%115:933+(i*29)%115;
    const y=((phase+i/32)%1)*1160-40;
    const wave=Math.sin(phase*Math.PI*2+i);
    c.fillStyle=['#ffd883','#fff2cd','#eaa456','#f6a8b9'][i%4];
    if(t.motion==='confetti'){
      c.globalAlpha=.7;c.save();c.translate(x+wave*12,y);c.rotate(phase*Math.PI*2+i);c.fillRect(-4,-8,8,16);c.restore();
    }else if(t.motion==='sparkle'){
      const sy=(i*173+60)%1010,size=3+(wave+1)*4;c.globalAlpha=.2+(wave+1)*.3;c.beginPath();
      c.moveTo(x-size,sy);c.lineTo(x,sy-size*2);c.lineTo(x+size,sy);c.lineTo(x,sy+size*2);c.closePath();c.fill();
    }else{
      c.globalAlpha=.12+(wave+1)*.13;c.beginPath();c.arc(x+wave*16,1080-y,7+(i%4)*3,0,Math.PI*2);c.fill();
    }
  }
  c.restore();
}

export function videoMime(){
  if(typeof MediaRecorder==='undefined')return '';
  return ['video/mp4;codecs=avc1.42E01E','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(type=>MediaRecorder.isTypeSupported(type))||'';
}

export async function createVideo(t:Template,g:Greeting):Promise<{blob:Blob;extension:string}>{
  const mimeType=videoMime();
  if(!mimeType||!HTMLCanvasElement.prototype.captureStream)throw Error('Video export is unavailable in this browser. Copy the greeting link to share the animation.');
  const base=document.createElement('canvas');await draw(base,t,g);
  const canvas=document.createElement('canvas');canvas.width=720;canvas.height=g.layout==='vertical'?960:720;
  const c=canvas.getContext('2d')!;c.drawImage(base,0,0,canvas.width,canvas.height);
  const stream=canvas.captureStream(24);
  return new Promise((resolve,reject)=>{
    const chunks:Blob[]=[];let frame=0;let timer:ReturnType<typeof setTimeout>;let settled=false;
    let recorder:MediaRecorder;
    const cleanup=()=>{cancelAnimationFrame(frame);clearTimeout(timer);stream.getTracks().forEach(track=>track.stop());document.removeEventListener('visibilitychange',hidden)};
    const fail=(message:string)=>{if(settled)return;settled=true;cleanup();if(recorder?.state==='recording')recorder.stop();reject(Error(message))};
    const hidden=()=>{if(document.hidden)fail('Keep this tab open while the video is prepared. Please try again.')};
    try{recorder=new MediaRecorder(stream,{mimeType,videoBitsPerSecond:4_000_000})}catch{fail('Video export could not start. Copy the animated greeting link instead.');return}
    recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
    recorder.onerror=()=>fail('Video export failed. Please try again or copy the greeting link.');
    recorder.onstop=()=>{if(settled)return;settled=true;cleanup();const blob=new Blob(chunks,{type:recorder.mimeType});if(!blob.size){reject(Error('The video was empty. Please try again.'));return}resolve({blob,extension:recorder.mimeType.includes('mp4')?'mp4':'webm'})};
    document.addEventListener('visibilitychange',hidden);
    const start=performance.now();
    const render=(now:number)=>{c.clearRect(0,0,canvas.width,canvas.height);c.drawImage(base,0,0,canvas.width,canvas.height);drawMotion(c,t,now-start,canvas.width,canvas.height);if(now-start>=6000){recorder.stop();return}frame=requestAnimationFrame(render)};
    recorder.start();frame=requestAnimationFrame(render);
    timer=setTimeout(()=>fail('Video export took too long. Please try again with this tab open.'),12000);
  });
}
