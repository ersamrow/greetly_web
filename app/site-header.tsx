'use client';
import {Clock,Download,Plus,Search} from 'lucide-react';
import './site-header.css';

export default function SiteHeader({collectionSlug,draftCount,onDrafts,onInstall,onCreate,onSearch}:{collectionSlug?:string;draftCount:number;onDrafts:()=>void;onInstall:()=>void;onCreate:()=>void;onSearch:()=>void}){
  const links=[['All designs','/#templates',undefined],['Visiting cards','/occasions/business','business'],['Invitations','/occasions/invitations','invitations'],['Festivals','/occasions/festivals','festivals'],['Faith & blessings','/occasions/faith','faith']];
  return <header className="site-header">
    <div className="site-header-main">
      <div className="brand-lockup"><a href="/" className="brand" aria-label="Greetly home"><span className="brand-mark" aria-hidden="true">✳</span>greetly<span className="brand-dot">.</span></a><a className="brand-parent" href="https://myledgerpro.in/" target="_blank" rel="noopener noreferrer">by My Ledger Pro</a></div>
      <span className="header-purpose">Your moments. Your brand. Your cards.</span>
      <div className="site-header-actions">
        <button type="button" className="header-search" aria-label="Search designs" title="Search designs" onClick={onSearch}><Search size={19}/></button>
        <button type="button" className="header-drafts" onClick={onDrafts}><Clock size={18}/><span>My drafts</span>{draftCount>0&&<span className="header-count">{draftCount}</span>}</button>
        <button type="button" className="header-create" onClick={onCreate}><Plus size={18}/><span>Create a card</span></button>
      </div>
    </div>
    <div className="site-header-bottom"><nav aria-label="Browse card collections">{links.map(([label,href,slug])=><a key={href} href={href} aria-current={collectionSlug===slug?'page':undefined}>{label}</a>)}</nav><button type="button" className="header-install" onClick={onInstall}><Download size={15}/> Install app</button></div>
  </header>;
}
