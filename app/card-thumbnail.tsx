'use client';
/* eslint-disable @next/next/no-img-element -- Responsive WebP assets are optimised at generation time. */
import {useEffect,useRef,useState} from 'react';
import type {Template} from '@/lib/templates';
import Card from './card';

export default function CardThumbnail({template:t,eager=false,paused=false}:{template:Template;eager?:boolean;paused?:boolean}){
  const ref=useRef<HTMLDivElement>(null),[visible,setVisible]=useState(false);
  useEffect(()=>{
    if(!t.motion)return;
    const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting));
    observer.observe(ref.current!);return()=>observer.disconnect();
  },[t.motion]);
  return <div ref={ref} className="card-thumbnail">
    <img src={`/previews/${t.id}-640.webp`} srcSet={`/previews/${t.id}-320.webp 320w, /previews/${t.id}-640.webp 640w`} sizes="(max-width: 650px) 45vw, (max-width: 1100px) 30vw, 23vw" loading={eager?'eager':'lazy'} decoding="async" width={640} height={t.kind==='business'?384:t.kind==='invitation'?853:640} alt={`${t.name}: ${t.heading.replaceAll('\n',' ')}`}/>
    {visible&&t.motion&&!paused&&<div className="thumbnail-motion" aria-hidden="true"><Card template={t}/></div>}
  </div>;
}
