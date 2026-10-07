'use client';
import {useEffect,useRef} from 'react';
import {draw} from '@/lib/draw';import {drawMotion} from '@/lib/motion';import {Template,Greeting,defaultGreeting} from '@/lib/templates';
export default function Card({template,greeting,paused=false}:{template:Template;greeting?:Greeting;paused?:boolean}){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    let cancelled=false,frame=0,visible=false,ready=false,last=0;
    const canvas=ref.current!,buffer=document.createElement('canvas');
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const paint=(time=0)=>{const c=canvas.getContext('2d')!;c.clearRect(0,0,canvas.width,canvas.height);c.drawImage(buffer,0,0);drawMotion(c,template,time,canvas.width,canvas.height)};
    const animate=(time:number)=>{if(cancelled)return;if(time-last>40){paint(time);last=time}frame=requestAnimationFrame(animate)};
    const sync=()=>{cancelAnimationFrame(frame);if(!ready||cancelled)return;paint();if(template.motion&&!paused&&!reduced.matches&&visible&&!document.hidden)frame=requestAnimationFrame(animate)};
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync()});observer.observe(canvas);
    reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
    void draw(buffer,template,greeting||defaultGreeting(template)).then(()=>{if(cancelled)return;canvas.width=buffer.width;canvas.height=buffer.height;ready=true;sync()}).catch(()=>{});
    return()=>{cancelled=true;cancelAnimationFrame(frame);observer.disconnect();reduced.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync)};
  },[template,greeting,paused]);
  return <canvas ref={ref} className="greeting-canvas" width={1080} height={greeting?.layout==='vertical'?1440:1080} aria-label={`${template.motion?'Animated ':''}${template.festival||template.category}: ${template.heading.replace('\n',' ')}`} role="img"/>;
}
