'use client';
import {useEffect,useRef,useState} from 'react';
import type {Dispatch,SetStateAction} from 'react';
import type {Greeting} from '@/lib/templates';
import {encodePhoto} from '@/lib/photo-format';
import {removePortraitBackground} from '@/lib/portrait';
import SenderOptions from './sender-options';
import {uploadedImageTheme} from '@/lib/image-colours';

export default function CreatorPhoto({g,onChange,onTheme}:{g:Greeting;onChange:Dispatch<SetStateAction<Greeting>>;onTheme:(suggestion:{photo:string;theme:Partial<Greeting>})=>void}){
  const [automatic,setAutomatic]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const request=useRef(0);
  const latest=useRef(g);latest.current=g;
  useEffect(()=>()=>{request.current++},[]);
  async function process(file?:File){
    const id=++request.current,initial=latest.current;
    setError('');setBusy(true);
    try{
      let source=initial.photo;
      let theme:Partial<Greeting>={};
      if(file){
        if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)throw new Error('Choose a JPG, PNG or WebP under 5 MB.');
        const bitmap=await createImageBitmap(file);
        try{
          if(bitmap.width*bitmap.height>40000000)throw new Error('Choose a smaller image (under 40 megapixels).');
          source=encodePhoto(bitmap,file.type);
          theme=uploadedImageTheme(bitmap);
        }finally{bitmap.close()}
      }
      if(!source)return;
      const cutout=!file||automatic;
      const photo=cutout?await removePortraitBackground(source):source;
      if(id!==request.current||latest.current.photo!==initial.photo)return;
      onChange(current=>({...current,photo,creatorPost:cutout,positions:{...current.positions,photo:undefined}}));
      onTheme({photo,theme});
    }catch(e){if(id===request.current)setError(e instanceof Error?e.message:'This photo could not be processed. Please try another portrait.')}
    finally{if(id===request.current)setBusy(false)}
  }
  return <div className="option-fields creator-photo-fields" aria-busy={busy}>
    <label className="photo-check"><input type="checkbox" checked={automatic} onChange={e=>setAutomatic(e.target.checked)} disabled={busy}/><span>Automatically remove background<small>Create a cutout when you upload your photo.</small></span></label>
    <label className="secondary photo-upload">{busy?'Removing background…':g.photo?'Change your photo':'Upload your photo'}
      <input className="photo-upload-input" type="file" aria-label={g.photo?'Change your photo':'Upload your photo'} accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file)void process(file)}}/>
    </label>
    <small>JPG, PNG or WebP · up to 5 MB. Best with one well-lit person. Processing happens on your device; the first use downloads the photo model.</small>
    {busy&&<><p role="status">Preparing your portrait. This can take a moment on mobile.</p><button type="button" onClick={()=>{request.current++;setBusy(false)}}>Cancel processing</button></>}
    {error&&<p role="alert">{error} You can turn off automatic removal to use your original photo or a transparent PNG.</p>}
    {g.photo&&<>
      {!g.creatorPost&&<button type="button" className="secondary" disabled={busy} onClick={()=>void process()}>Remove background &amp; make creator post</button>}
      <label className="photo-check"><input type="checkbox" checked={!!g.creatorPost} disabled={busy} onChange={e=>onChange(current=>({...current,creatorPost:e.target.checked}))}/><span>Creator post layout<small>Place your portrait beside the greeting.</small></span></label>
      {g.creatorPost&&<><label>Your name on the post<input maxLength={35} placeholder="Your name" value={g.sender} onChange={e=>onChange(current=>({...current,sender:e.target.value}))}/></label>
      <SenderOptions g={g} onChange={onChange}/><label>Portrait size<input aria-label="Portrait size" type="range" min={70} max={120} value={g.portraitScale??100} onChange={e=>onChange(current=>({...current,portraitScale:Number(e.target.value)}))}/></label>
      <small>Choose Photo or Creator / sender name in the Move menu above the preview to position them separately.</small></>}
      <button type="button" className="secondary" disabled={busy} onClick={()=>{request.current++;onChange(current=>({...current,photo:undefined,creatorPost:undefined}))}}>Remove photo</button>
    </>}
  </div>;
}
