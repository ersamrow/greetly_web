import type {Greeting,Template} from './templates';

export type DesignMode='mix'|'classic'|'artwork';
export type DesignOptions={mode:DesignMode;keepColours:boolean;keepFont:boolean;keepLayout:boolean};
export type DesignVariation={template:Template;greeting:Greeting};
const colourPairs=[['#fff2dd','#68351c'],['#f7e4ee','#672c50'],['#e7effa','#233e69'],['#e7f1e4','#294c35'],['#302744','#fff0c7'],['#173d46','#e4f5df'],['#faf7f0','#343038'],['#fbe4da','#743823']];
const fonts=['Georgia','Arial','Verdana','Courier New'];

// Keep occasion-specific imagery and layouts relevant to the user's card.
export function compatibleDesigns(current:Template,all:Template[],hidden:string[]=[]){
 return all.filter(t=>!hidden.includes(t.id)&&t.kind===current.kind&&t.category===current.category&&t.festival===current.festival&&t.faith===current.faith&&t.occasion===current.occasion);
}
export function generateVariations(g:Greeting,current:Template,all:Template[],options:DesignOptions,random= Math.random):DesignVariation[]{
 const pool=all.filter(t=>(!options.keepLayout||t.id===current.id)&&(options.mode==='mix'||(options.mode==='artwork'?!!t.aiArt:!t.aiArt)));
 if(!pool.length)return [];
 const candidates:DesignVariation[]=[];
 for(const template of pool){
  // Artwork has its own tested contrast palette; avoid random tints over paintings.
  const pairs=options.keepColours?[[g.bg,g.headingColor||current.ink]]:template.artwork||template.photoArtwork?[[template.bg,template.ink]]:colourPairs;
  const availableFonts=options.keepFont||g.language==='hi'||g.language==='pa'||g.font.startsWith('Noto ')?[g.font]:fonts;
  for(const [bg,ink] of pairs)for(const font of availableFonts){
   const greeting:Greeting={...g,templateId:template.id,heading:g.heading??current.heading,font,...(!options.keepColours?{bg,headingColor:ink,textColor:ink}:{headingColor:g.headingColor||current.ink,textColor:g.textColor||current.ink})};
   if(template.id===g.templateId&&font===g.font&&bg===g.bg&&(options.keepColours||ink===g.headingColor))continue;
   candidates.push({template,greeting});
  }
 }
 // Sample without replacement so every displayed option differs.
 const result:DesignVariation[]=[];
 if(options.mode==='mix')for(const ai of [true,false]){
  const matches=candidates.map((v,i)=>({v,i})).filter(({v})=>!!v.template.aiArt===ai);
  if(matches.length){const pick=matches[Math.min(matches.length-1,Math.floor(Math.max(0,random())*matches.length))];result.push(candidates.splice(pick.i,1)[0]);}
 }
 while(candidates.length&&result.length<3){const index=Math.min(candidates.length-1,Math.floor(Math.max(0,random())*candidates.length));result.push(candidates.splice(index,1)[0]);}
 return result;
}
