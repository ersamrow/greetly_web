import legacyCards from './legacy-cards.json';
import {templates, matchesOccasion, type Template} from './templates';
import {collections} from './collections';

// Saved greetings and preview filenames keep their IDs; only public slugs change.
export const cardSlug=(template:Template)=>legacyCards[template.id as keyof typeof legacyCards]?.slug||template.id;
export const cardPath = (template: Template) => `/card/${cardSlug(template)}`;
export const templateForSlug=(slug:string)=>templates.find(t=>cardSlug(t)===slug);
// Explicit editorial groups only: alternate typography/message editions retain their editor,
// but consolidate search signals into the original faith-card page.
export function canonicalCard(template:Template):Template {
 if(template.id.endsWith('-warm-wishes'))return templates.find(t=>t.id===template.id.replace(/-warm-wishes$/, ''))||template;
 // Generated colour editions share the same layout and wording. Keep their
 // editor URLs, but consolidate each matching pair into its first edition.
 if(/^g\d+$/.test(template.id))return templates.find(t=>/^g\d+$/.test(t.id)&&t.category===template.category&&t.pattern===template.pattern&&t.heading===template.heading&&t.message===template.message)||template;
 return template;
}
export const indexableTemplates=templates.filter(t=>canonicalCard(t).id===t.id);
export function cardDescription(t:Template){
 const type=t.kind==='business'?'visiting':t.kind==='invitation'?'invitation':'greeting';
 const starts=[`Create a free ${t.motion?'animated ':''}${type} card.`,`Personalise this free ${t.motion?'animated ':''}${type} card online.`];
 const edits=t.kind==='business'
  ? ['Add your logo and contact details.','Add your business name, logo and contact details.','Choose your colours and add your logo, name and contact details.']
  : ['Add your message and photo.','Add names, a photo and your own message.','Personalise the message, photo, colours and font.','Add a personal message and photo, then choose your colours and font.'];
 const endings=['Download or share online.','Download an image or share a greeting link.','Save your design and share a link. No sign-up needed.','Download your design or send a link. No sign-up needed.','Save a draft on this device, download an image or share a link.','Download an image or share a link with friends and family. No sign-up needed.'];
 const descriptions=starts.flatMap(start=>edits.flatMap(edit=>endings.map(end=>`${t.name}. ${start} ${edit} ${end}`))).filter(text=>text.length<=160);
 return descriptions.sort((a,b)=>Math.abs(a.length-155)-Math.abs(b.length-155))[0]||`${t.name}. Personalise and share this free ${type} card.`;
}
export function relatedCards(t:Template){
 return indexableTemplates.filter(other=>other.id!==canonicalCard(t).id&&other.category===t.category&&(!t.faith||other.faith===t.faith))
 .sort((a,b)=>Number(b.festival===t.festival&&b.occasion===t.occasion)-Number(a.festival===t.festival&&a.occasion===t.occasion)).slice(0,4);
}
export function collectionFor(template: Template) {
  return Object.entries(collections).find(([, collection]) => collection.category === (template.festival || template.category))!;
}
export function collectionPreview(slug: string) {
  return templates.find(template => matchesOccasion(template, collections[slug].category))!;
}
export const featuredIds = ['love-my-person','friendship-always','diwali-family-ready','g1','g15','g28','g40','dussehra-marigold','diwali-diyas','sikh-gurpurab','invite-wedding','business-rose','ai-diwali-dream','motion-birthday-confetti','invite-housewarming'];
export const collectionLabel = (slug: string, category: string) => ({festivals:'Festival wishes',daily:'Daily greetings',faith:'Faith & blessings',business:'Visiting cards',invitations:'Invitations'}[slug] || `${category} wishes`);
