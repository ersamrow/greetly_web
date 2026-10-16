import {templates, matchesOccasion, type Template} from './templates';
import {collections} from './collections';

// IDs are stable, so existing URLs survive editorial name changes.
export const cardPath = (template: Template) => `/card/${template.id}`;
export const cardDescription = (template: Template) => `${template.name}: a free ${template.motion ? 'animated ' : ''}${template.festival || template.faith || template.category} design. ${template.message} Personalise with your own words and details.`;
export function collectionFor(template: Template) {
  return Object.entries(collections).find(([, collection]) => collection.category === (template.festival || template.category))!;
}
export function collectionPreview(slug: string) {
  return templates.find(template => matchesOccasion(template, collections[slug].category))!;
}
export const featuredIds = ['love-my-person','friendship-always','diwali-family-ready','g1','g15','g28','g40','dussehra-marigold','diwali-diyas','sikh-gurpurab','invite-wedding','business-rose','ai-diwali-dream','motion-birthday-confetti','invite-housewarming'];
export const collectionLabel = (slug: string, category: string) => ({festivals:'Festival wishes',daily:'Daily greetings',faith:'Faith & blessings',business:'Visiting cards',invitations:'Invitations'}[slug] || `${category} wishes`);
