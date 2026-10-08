import type {Greeting} from './templates';
export type SavedDraft=Greeting&{draftId:string;draftName:string;savedAt?:string};
export const DRAFT_LIMIT=24;
export function prepareDrafts(items:Greeting[]):SavedDraft[]{return items.map((g,i)=>({...g,draftId:(g as SavedDraft).draftId||crypto.randomUUID(),draftName:(g as SavedDraft).draftName||g.name||`Draft ${i+1}`}))}
export function saveDraftVersion(drafts:SavedDraft[],g:Greeting,id:string|null,name:string):SavedDraft[]{
  if(!drafts.some(d=>d.draftId===id)&&drafts.length>=DRAFT_LIMIT)throw Error('Your 24 draft spaces are full. Delete an unused draft before saving another.');
  const {draftId:oldId,draftName:oldName,savedAt:oldDate,...content}=g as SavedDraft;
  const draft={...content,draftId:id||crypto.randomUUID(),draftName:name.trim()||g.name||g.heading||'Untitled draft',savedAt:new Date().toISOString()};
  return [draft,...drafts.filter(d=>d.draftId!==draft.draftId)];
}
