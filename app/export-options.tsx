'use client';
import {Download,Share2,Link as LinkIcon} from 'lucide-react';
import {toast} from 'sonner';
import type {Greeting,Template} from '@/lib/templates';
import {downloadPrintPDF} from '@/lib/print-pdf';
import {greetingShareText} from '@/lib/share-greeting';
type Props = {
 selected:Template; g:Greeting; busy:boolean; setBusy:(value:boolean)=>void;
 share:()=>Promise<void>; download:()=>Promise<void>; canVideo:boolean;
 downloadVideo:()=>Promise<void>; exportingVideo:boolean;
 video:{url:string;extension:string}|null; videoError:string;
 copyShareMessage:()=>Promise<void>; copyLink:()=>Promise<void>;
 savedLink:string; setPreview:(value:boolean)=>void;
};
export default function ExportOptions({selected,g,busy,setBusy,share,download,canVideo,downloadVideo,exportingVideo,video,videoError,copyShareMessage,copyLink,savedLink,setPreview}:Props){
return <>
<h3>A little kindness, ready to go.</h3>
<p>{selected.motion?'Share a link that plays your animation, or download a video or still image.':'Share your card with its greeting link and a link to Greetlo, or download the image.'}</p>
<button className="primary" disabled={busy} onClick={share}>
<Share2 size={18}/> {selected.motion?'Share animated link':'Share greeting'}</button>
<button className="secondary" disabled={busy} onClick={download}>
<Download size={18}/> {selected.motion?'Download still PNG':'Download image'}</button>
<details className="more-formats">
<summary>More formats and links</summary>
<div className="more-formats-content">
<button className="secondary" disabled={busy} onClick={async()=>{setBusy(true);try{await downloadPrintPDF(selected,g)}catch{toast.error('Could not export PDF. Please try again.')}finally{setBusy(false)}}}>Download print PDF</button>
<small>{selected.kind==='business'?'90 × 54 mm · both sides when enabled':'90 × 90 mm or 90 × 120 mm'} · 3 mm bleed · crop marks. Keep text at least 3 mm inside the trim.</small>{selected.motion&&<>{canVideo?<button className="secondary" disabled={busy} onClick={downloadVideo}>
<Download size={18}/>{exportingVideo?'Preparing video…':'Create animated video'}</button>:<small>Video downloads are unavailable in this browser. Share the animated link instead.</small>}{video&&<div className="video-result">
<video src={video.url} controls loop playsInline aria-label="Your animated greeting video"/>
<a className="primary" href={video.url} download={'greetlo-animated.'+video.extension}>Save {video.extension.toUpperCase()} video</a>
<small>Your video is ready. Preview it above or save it to your device.</small>
</div>}{videoError&&<p role="alert">{videoError}</p>}<small role="status">{exportingVideo?'Keep this tab open for about 6 seconds.':'Video: 6 seconds · 720 px · MP4 or WebM, depending on your browser.'}</small>
</>}<button className="secondary" disabled={busy} onClick={copyShareMessage}>
<LinkIcon size={18}/> Copy share message</button>
<small>Some apps share only the image. Paste the share message into the caption to include both links.</small>
<button className="secondary" disabled={busy} onClick={copyLink}>
<LinkIcon size={18}/> Copy greeting link</button>{savedLink&&<>
<input readOnly aria-label="Your greeting link" value={savedLink} onFocus={e=>e.target.select()}/>
<textarea readOnly aria-label="Share message with links" rows={4} value={greetingShareText(savedLink)} onFocus={e=>e.target.select()}/>
</>}</div>
</details>
<small>Sharing or copying a link uploads this greeting and its photo. Anyone with the link can view it. Delete saved links from Privacy.</small>
<button disabled={busy} onClick={()=>setPreview(false)}>Back to editing</button>
</>;
}
