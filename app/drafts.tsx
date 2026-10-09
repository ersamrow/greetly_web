'use client';
import {useState} from 'react';
import {ArrowRight,Bookmark,ImageIcon,Trash2} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {templates, type Greeting, type Template} from '@/lib/templates';
import Card from './card';
import {DRAFT_LIMIT,type SavedDraft} from '@/lib/local-drafts';
import './drafts.css';

export default function Drafts({open,onOpenChange,drafts,onEdit,onRemove,onFavorite}:{open:boolean;onOpenChange:(open:boolean)=>void;drafts:SavedDraft[];onEdit:(template:Template,draft:Greeting)=>void;onRemove:(index:number)=>boolean;onFavorite:(index:number)=>void}){
  const [query,setQuery]=useState(''),[favorites,setFavorites]=useState(false);
  const matches=(d:SavedDraft)=>(!favorites||!!d.favorite)&&`${d.draftName} ${d.name} ${d.heading||''} ${d.message}`.toLowerCase().includes(query.toLowerCase());
  const [removing,setRemoving]=useState<number|null>(null);
  return <Dialog open={open} onOpenChange={value=>{setRemoving(null);onOpenChange(value)}}><DialogContent className="drafts-modal">
    <div className="drafts-heading"><span className="drafts-icon"><Bookmark size={22}/></span><div><DialogTitle>My drafts <span className="drafts-count">{drafts.length}</span></DialogTitle><DialogDescription>Your words, saved for later. Pick up where you left off.</DialogDescription></div></div>
    {drafts.length?<><div className="draft-filter"><input className="draft-search" type="search" aria-label="Search drafts" placeholder="Search drafts" value={query} onChange={e=>setQuery(e.target.value)}/><button aria-pressed={favorites} onClick={()=>setFavorites(!favorites)}>★ Favourites</button></div><div className="drafts-summary"><span>Recently saved</span><span>{drafts.length} of {DRAFT_LIMIT} spaces used</span></div>{!drafts.some(matches)&&<p role="status">No drafts match these filters.</p>}<div className="drafts-list">{drafts.map((draft,index)=>{if(!matches(draft))return null;
      const template=templates.find(t=>t.id===draft.templateId);
      const title=draft.draftName||template?.name||'Untitled draft';
      return <article className="draft-item" key={draft.draftId}>
        <button className="draft-thumbnail" disabled={!template} aria-label={'Edit '+title} onClick={()=>{setRemoving(null);onEdit(template!,draft)}}>{template?<Card template={template} greeting={draft} paused/>:<ImageIcon aria-hidden="true"/>}</button>
        <div className="draft-details"><div className="draft-tags"><span>{template?.faith||template?.festival||template?.category||'Saved greeting'}</span><span>{template?.kind==='business'?'Landscape':draft.layout==='vertical'?'Portrait':'Square'}{template?.motion?' · Animated':''}</span></div><h3>{title}</h3><p className="draft-recipient">{template?.name}</p>{draft.savedAt&&<p className="draft-recipient">Saved {new Date(draft.savedAt).toLocaleString()}</p>}<p className="draft-recipient">{template?.kind==='business'?(draft.heading||'Your business card'):draft.name?'For '+draft.name:'Add a recipient when you’re ready'}</p><p className="draft-message">{draft.message}</p>
        {removing===index?<div className="draft-confirm" role="group" aria-label={'Delete '+title+'?'}><p>Delete this draft?</p><button className="secondary" onClick={()=>setRemoving(null)}>Keep draft</button><button className="draft-delete-confirm" onClick={()=>{if(onRemove(index))setRemoving(null)}}>Delete draft</button></div>:<div className="draft-actions"><button aria-label={draft.favorite?'Remove favourite':'Add favourite'} aria-pressed={!!draft.favorite} onClick={()=>onFavorite(index)}>{draft.favorite?'★':'☆'}</button><button className="draft-resume" disabled={!template} onClick={()=>{setRemoving(null);onEdit(template!,draft)}}>Continue editing <ArrowRight size={16}/></button><button className="draft-delete" aria-label={'Delete '+title} onClick={()=>setRemoving(index)}><Trash2 size={17}/></button></div>}
        {!template&&<p className="draft-unavailable">This design is no longer available.</p>}</div>
      </article>;
    })}</div></>:<div className="drafts-empty"><span><Bookmark size={32}/></span><h3>A little inspiration, ready to save.</h3><p>Choose a design, make it yours, then tap <strong>Save draft</strong> in the editor. Your unfinished greetings will appear here.</p><button className="primary" onClick={()=>onOpenChange(false)}>Explore cards <ArrowRight size={17}/></button></div>}
    <div className="drafts-footer">Saved in this browser on this device. Clearing browser data removes your drafts.</div>
  </DialogContent></Dialog>;
}
