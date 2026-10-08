import {faithTemplates} from './faith-templates';
import type {Faith} from './faith-templates';
export const occasions = ['All occasions','Birthday','Anniversary','Thank you','Daily greetings','Festivals','Dussehra','Diwali','Faith & blessings','Visiting cards','Invitations'];
export const palettes = [['#ffeedb','#a6422b'],['#ecb6cd','#76243d'],['#cfddf2','#274582'],['#d7e3cd','#345a42'],['#322a54','#f8de9a'],['#f9d55c','#604018']];
const titles = ['A little celebration','Made of sunshine','With all my heart','The good things','A beautiful chapter','A wish for you','Simply wonderful','Love, always','Golden moments','Just because','A brighter day','Something special'];
const headings = ['Happy\nbirthday!','Here’s to\nyou two.','You make\na difference.','Hello,\nsunshine.','Light up\nthe moment.'];
export const messages = ['Another year of you making the world a little brighter. Have the happiest birthday!','To all the memories you’ve made, and all the beautiful ones still to come. Happy anniversary!','A little note for a big thank you. Your kindness means more than you know.','Here’s to a fresh start, little joys, and a day that feels like you.','May this season bring light to your home, warmth to your heart, and joy to everyone you love.'];
export type Template = {kind?:'business'|'invitation';id:string;name:string;category:string;heading:string;message:string;bg:string;ink:string;pattern:number;festival?:'Dussehra'|'Diwali';artwork?:string;photoArtwork?:string;photoCredit?:string;font?:string;motion?:'sparkle'|'confetti'|'glow';aiArt?:boolean;faith?:Faith;occasion?:string;kicker?:string};
const originalTemplates:Template[] = Array.from({length:60},(_,i)=>{const c=Math.floor(i/12),p=palettes[(i+c+Math.floor((i%12)/6)*2)%6];return {id:`g${i+1}`,name:titles[i%12],category:occasions[c+1],heading:c===4?['Happy\nDiwali!','Colours\nof joy.','A bright\nnew year.'][i%3]:headings[c],message:messages[c],bg:p[0],ink:p[1],pattern:i%6};});
export const festivalTemplates:Template[] = [
  {id:'dussehra-marigold',name:'Marigold wishes',festival:'Dussehra',category:'Festivals',heading:'Happy\nDussehra!',message:'May goodness guide your way and courage fill your heart. Wishing you and your family a joyful Dussehra.',bg:'#fff0d9',ink:'#813a21',pattern:-1,artwork:'/festivals/dussehra.webp'},
  {id:'dussehra-victory',name:'The light of victory',festival:'Dussehra',category:'Festivals',heading:'Goodness\nalways wins.',message:'May this Vijayadashami bring the strength to begin again, the courage to do good, and countless reasons to smile.',bg:'#fff0d9',ink:'#813a21',pattern:-1,artwork:'/festivals/dussehra.webp',font:'Verdana'},
  {id:'dussehra-blessings',name:'Vijayadashami blessings',festival:'Dussehra',category:'Festivals',heading:'Happy\nVijayadashami',message:'Wishing you new beginnings, peaceful days, and the triumph of kindness in every part of your life.',bg:'#fff0d9',ink:'#813a21',pattern:-1,artwork:'/festivals/dussehra.webp'},
  {id:'dussehra-saffron',name:'Saffron celebration',festival:'Dussehra',category:'Festivals',heading:'Celebrate\nthe good.',message:'This Dussehra, may every challenge become a new beginning and every small act of goodness light the way.',bg:'#ffcf70',ink:'#742f20',pattern:1},
  {id:'dussehra-crimson',name:'Courage in crimson',festival:'Dussehra',category:'Festivals',heading:'Joyful\nDussehra',message:'May your home be filled with love, your days with hope, and your heart with the courage to follow what is right.',bg:'#7b2438',ink:'#ffe6b2',pattern:4},
  {id:'dussehra-new-dawn',name:'A brighter beginning',festival:'Dussehra',category:'Festivals',heading:'A new dawn.\nA good beginning.',message:'Sending warm Dussehra wishes for a season of fresh hope, meaningful moments, and happiness shared with those you love.',bg:'#f6e6c8',ink:'#704025',pattern:0},
  {id:'diwali-diyas',name:'A thousand little lights',festival:'Diwali',category:'Festivals',heading:'Happy\nDiwali!',message:'May every diya bring a little more hope, every gathering a little more joy, and every day a little more light.',bg:'#201e46',ink:'#ffe6a7',pattern:-1,artwork:'/festivals/diwali.webp'},
  {id:'diwali-home',name:'Light for your home',festival:'Diwali',category:'Festivals',heading:'Love, light\nand Diwali.',message:'Wishing you a home full of laughter, a heart full of gratitude, and a Diwali full of beautiful memories.',bg:'#201e46',ink:'#ffe6a7',pattern:-1,artwork:'/festivals/diwali.webp'},
  {id:'diwali-deepavali',name:'Deepavali glow',festival:'Diwali',category:'Festivals',heading:'Joyful\nDeepavali',message:'May the glow of this festival bring peace to your heart and happiness to everyone you hold dear.',bg:'#201e46',ink:'#ffe6a7',pattern:-1,artwork:'/festivals/diwali.webp',font:'Verdana'},
  {id:'diwali-gold',name:'Golden Diwali',festival:'Diwali',category:'Festivals',heading:'A season\nto shine.',message:'Sending you golden wishes for a bright Diwali, sweet celebrations, and wonderful beginnings.',bg:'#f9d55c',ink:'#604018',pattern:1},
  {id:'diwali-rose',name:'Sweet celebrations',festival:'Diwali',category:'Festivals',heading:'Sweet wishes.\nBright Diwali.',message:'Here’s to shared sweets, warm reunions, and all the little things that make Diwali feel like home.',bg:'#f5cccf',ink:'#782c47',pattern:2},
  {id:'diwali-starlight',name:'Starlit wishes',festival:'Diwali',category:'Festivals',heading:'Let your\nlight shine.',message:'May this Diwali bring brighter possibilities, moments of wonder, and a little extra sparkle to your world.',bg:'#252f4b',ink:'#ffe6a7',pattern:3},
];
export const motionTemplates:Template[] = [
  {...festivalTemplates[0],id:'motion-dussehra-marigold',name:'Marigold celebration',motion:'confetti'},
  {...festivalTemplates[4],id:'motion-dussehra-glow',name:'A glowing victory',motion:'glow'},
  {...festivalTemplates[6],id:'motion-diwali-lights',name:'Diwali after dark',motion:'sparkle'},
  {...festivalTemplates[11],id:'motion-diwali-stars',name:'A sky full of wishes',motion:'glow'},
  {...originalTemplates[0],id:'motion-birthday-confetti',name:'Make a little noise',motion:'confetti',bg:'#cfddf2',ink:'#274582',pattern:1},
  {...originalTemplates[36],id:'motion-daily-sparkle',name:'Your daily dose of wonder',motion:'sparkle',bg:'#322a54',ink:'#f8de9a',pattern:3},
];
export const aiTemplates:Template[] = [
  {...festivalTemplates[0],id:'ai-dussehra-paper',name:'Marigold dreamscape',aiArt:true,artwork:'/posts/dussehra-dream.webp',bg:'#fff0d9',ink:'#713522',pattern:-1},
  {...festivalTemplates[1],id:'ai-dussehra-dream',name:'Golden beginnings',aiArt:true,artwork:'/posts/dussehra-dream.webp',bg:'#fff0d9',ink:'#713522',pattern:-1,motion:'confetti'},
  {...festivalTemplates[6],id:'ai-diwali-dream',name:'Dreams in diya light',aiArt:true,artwork:'/posts/diwali-dream.webp',bg:'#171938',ink:'#ffe6a7',pattern:-1},
  {...festivalTemplates[7],id:'ai-diwali-glow',name:'An enchanted Diwali',aiArt:true,artwork:'/posts/diwali-dream.webp',bg:'#171938',ink:'#ffe6a7',pattern:-1,motion:'sparkle'},
];

export const businessTemplates:Template[]=[
  {id:'business-rose',name:'Rose signature',bg:'#fffaf8',ink:'#b52342',pattern:0},
  {id:'business-midnight',name:'Midnight professional',bg:'#142c3b',ink:'#ffe6a7',pattern:1},
  {id:'business-minimal',name:'Minimal white',bg:'#ffffff',ink:'#202838',pattern:1},
  {id:'business-sage',name:'Sage studio',bg:'#edf3e9',ink:'#294533',pattern:0},
  {id:'business-navy-panel',name:'Navy executive',bg:'#f2f5fa',ink:'#203b63',pattern:2},
  {id:'business-gold-frame',name:'Black & gold',bg:'#191b20',ink:'#e8ca86',pattern:3},
  {id:'business-coral-geometry',name:'Coral creative',bg:'#fff1e9',ink:'#a63828',pattern:4},
  {id:'business-plum-editorial',name:'Plum editorial',bg:'#f7eef8',ink:'#63346c',pattern:5},
  {id:'business-teal-orbit',name:'Teal orbit',bg:'#eaf7f4',ink:'#17665e',pattern:6},
  {id:'business-cobalt-stripe',name:'Cobalt bold',bg:'#edf2ff',ink:'#254bb5',pattern:7},
  {id:'business-ledger-diagonal',name:'Ledger diagonal',bg:'#fffaf0',ink:'#d82f50',pattern:8},
  {id:'business-logo-signature',name:'Logo signature',bg:'#fffaf0',ink:'#b52342',pattern:9},
  {id:'business-finance-banner',name:'Finance banner',bg:'#f8faff',ink:'#203b63',pattern:10},
  {id:'business-modern-curve',name:'Modern curve',bg:'#fffaf0',ink:'#d82f50',pattern:11},
].map(t=>({...t,kind:'business',category:'Visiting cards',heading:'Your business name',message:'A short tagline about what you do',font:'Arial'}));
export const invitationTemplates:Template[]=[
  {id:'invite-wedding',name:'Wedding invitation',heading:'Together with love',message:'We would love you to join us as we celebrate our wedding.',bg:'#fff4df',ink:'#6f4a27',pattern:1},
  {id:'invite-birthday',name:'Birthday party',heading:'You’re invited!',message:'Join us for a birthday celebration filled with laughter, cake, and happy memories.',bg:'#fce8ed',ink:'#982640',pattern:0},
  {id:'invite-housewarming',name:'Housewarming invitation',heading:'A new home.\nA warm welcome.',message:'Help us make our new house a home. Come celebrate with us!',bg:'#edf3e9',ink:'#294533',pattern:2},
  {id:'invite-baby-shower',name:'Baby shower',heading:'A little one\nis on the way!',message:'Join us to shower the parents-to-be with love and good wishes.',bg:'#e9f1fc',ink:'#304875',pattern:3},
  {id:'invite-opening',name:'Grand opening',heading:'Our doors\nare opening.',message:'You are warmly invited to celebrate our grand opening. We look forward to welcoming you.',bg:'#142c3b',ink:'#ffe6a7',pattern:1},
  {id:'invite-dinner',name:'Dinner & gathering',heading:'Good food.\nGreat company.',message:'Join us for a special gathering with friends, food, and conversation.',bg:'#f7ece3',ink:'#6d4037',pattern:4},
].map(t=>({...t,kind:'invitation',category:'Invitations',kicker:'PLEASE JOIN US'}));

export const templates:Template[] = [...businessTemplates,...invitationTemplates,...faithTemplates,...motionTemplates,...aiTemplates,...festivalTemplates,...originalTemplates];
export function isTemplateId(id:unknown):id is string{return typeof id==='string'&&templates.some(t=>t.id===id)}
export function matchesOccasion(t:Template,occasion:string){return occasion==='All occasions'||t.category===occasion||t.festival===occasion}
export type Greeting = {logoScale?:number;qr?:{mode:'url'|'whatsapp'|'map'|'contact';value:string};details?:{role?:string;phone?:string;email?:string;website?:string;address?:string;date?:string;time?:string;venue?:string;rsvp?:string};templateId:string;name:string;message:string;sender:string;bg:string;font:string;layout:string;branding:boolean;photo?:string;heading?:string;headingColor?:string;textColor?:string;headingSize?:number;messageSize?:number;textAlign?:'left'|'center'|'right';photoPlacement?:'top'|'bottom'|'left'|'right'|'middle'|'in-message'|'after-message';photoSize?:number;photoShape?:'circle'|'rounded'|'square';photoZoom?:number;photoX?:number;photoY?:number};
export const defaultGreeting=(t:Template):Greeting=>({templateId:t.id,name:'',message:t.message,sender:'',bg:t.bg,font:t.font||'Georgia',layout:t.kind==='invitation'?'vertical':'square',branding:t.kind==='business'?false:true});
