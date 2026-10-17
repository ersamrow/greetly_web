import {faithTemplates} from './faith-templates';
import type {Faith} from './faith-templates';
export const occasions = ['All occasions','Birthday','Anniversary','Thank you','Daily greetings','Festivals','Dussehra','Diwali','Faith & blessings','Visiting cards','Invitations','Love','Friendship'];
export const palettes = [['#ffeedb','#a6422b'],['#ecb6cd','#76243d'],['#cfddf2','#274582'],['#d7e3cd','#345a42'],['#322a54','#f8de9a'],['#f9d55c','#604018']];
const titles = ['A little celebration','Made of sunshine','With all my heart','The good things','A beautiful chapter','A wish for you','Simply wonderful','Love, always','Golden moments','Just because','A brighter day','Something special'];
const headings = ['Happy\nbirthday!','Here’s to\nyou two.','You make\na difference.','Hello,\nsunshine.','Light up\nthe moment.'];
export const messages = ['Another year of you making the world a little brighter. Have the happiest birthday!','To all the memories you’ve made, and all the beautiful ones still to come. Happy anniversary!','A little note for a big thank you. Your kindness means more than you know.','Here’s to a fresh start, little joys, and a day that feels like you.','May this season bring light to your home, warmth to your heart, and joy to everyone you love.'];
export type Template = {kind?:'business'|'invitation';id:string;name:string;category:string;heading:string;message:string;bg:string;ink:string;pattern:number;festival?:'Dussehra'|'Diwali';artwork?:string;photoArtwork?:string;photoCredit?:string;font?:string;motion?:'sparkle'|'confetti'|'glow';aiArt?:boolean;faith?:Faith;occasion?:string;kicker?:string};
const originalTemplates:Template[] = Array.from({length:60},(_,i)=>{const c=Math.floor(i/12),p=palettes[(i+c+Math.floor((i%12)/6)*2)%6];return {id:`g${i+1}`,name:`${['Birthday','Anniversary','Thank you','Daily greeting','Festival'][c]} · ${['Peach','Rose','Blue','Sage','Plum','Gold'][(i+c+Math.floor((i%12)/6)*2)%6]} ${['confetti','frame','circles','starlight','rings','floral'][i%6]}`,category:occasions[c+1],heading:c===4?['Happy\nDiwali!','Colours\nof joy.','A bright\nnew year.'][i%3]:headings[c],message:messages[c],bg:p[0],ink:p[1],pattern:i%6};});
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

// New compositions reuse the reviewed AI artwork library; no external API calls.
export const expandedAiTemplates:Template[]=[
 {...aiTemplates[0],id:'ai-dussehra-family',name:'Marigolds for the family',heading:'Goodness begins\nat home.',message:'Wishing your family a Dussehra full of courage, kindness and happy moments together.',font:'Georgia'},
 {...aiTemplates[0],id:'ai-dussehra-gratitude',name:'A golden thank you',heading:'Grateful for\nyour goodness.',message:'This Dussehra, thank you for the kindness you bring into my life. May hope and happiness always find you.',font:'Arial',motion:'glow'},
 {...aiTemplates[0],id:'ai-dussehra-fresh-start',name:'A marigold morning',heading:'New hope.\nNew beginnings.',message:'May this Vijayadashami open the door to brighter days, brave choices and beautiful new beginnings.',font:'Verdana'},
 {...aiTemplates[0],id:'ai-dussehra-together',name:'Celebrate goodness together',heading:'A little courage.\nA lot of joy.',message:'Here is to choosing kindness, celebrating goodness and sharing the joy of Dussehra with those we love.',font:'Georgia',motion:'confetti'},
 {...aiTemplates[2],id:'ai-diwali-reunion',name:'Diyas for a homecoming',heading:'Home is brighter\nwith you.',message:'May the glow of Diwali bring us closer, fill our home with laughter and make new memories to treasure.',font:'Georgia'},
 {...aiTemplates[2],id:'ai-diwali-thanks',name:'A luminous thank you',heading:'You make our\nworld brighter.',message:'With gratitude for your warmth and support, wishing you a Diwali filled with peace, happiness and sweet moments.',font:'Arial',motion:'sparkle'},
 {...aiTemplates[2],id:'ai-diwali-distance',name:'Light across the miles',heading:'Far apart.\nClose at heart.',message:'Sending the warmth of a thousand diyas across the miles. Missing you and wishing you a beautiful Diwali.',font:'Verdana'},
 {...aiTemplates[2],id:'ai-diwali-quiet',name:'A quiet Diwali glow',heading:'Peace at home.\nLight within.',message:'May the soft glow of this Diwali bring restful moments, a grateful heart and hope for the days ahead.',font:'Georgia',motion:'glow'},
 ...faithTemplates.filter(t=>t.aiArt).map((t,i)=>({...t,id:`${t.id}-warm-wishes`,name:`${t.name} · Warm wishes`,font:i%2?'Verdana':'Arial',motion:t.motion?undefined:'glow',kicker:'WITH WARMTH AND GOOD WISHES',message:[
  'Wishing you and your loved ones a peaceful Gurpurab, with time for reflection, gratitude and service to others.',
  'May small acts of seva bring joy to your day and comfort to those around you. Sending warm wishes for peace and kindness.',
  'May wisdom guide your choices, love fill your home and each new day bring another reason to be grateful.',
  'Wishing your family a joyful Deepavali, with the warmth of togetherness and the gentle light of hope.',
  'Eid Mubarak to you and your loved ones. May this celebration bring gratitude, generosity and cherished time together.',
  'May this Ramadan bring meaningful reflection, strength in faith and kindness shared with family and neighbours.',
  'Wishing you a Christmas filled with the peace of Christ, the warmth of family and the joy of giving.',
  'May the hope of Easter brighten your heart and bring peace and renewed joy to your family.',
  'On Vesak, may compassion guide your actions and quiet reflection bring peace to your day.',
  'May you meet this day with a gentle heart, a peaceful mind and loving-kindness for yourself and others.',
  'May the teachings of Mahavir inspire compassion, thoughtful choices and peace in every part of your life.',
  'Wishing you a meaningful Paryushan, with time for reflection, forgiveness and renewed kindness.'
 ][i]||t.message})) as Template[],
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


export const readyTemplates:Template[]=[
  {id:'love-my-person',name:'Love · My favourite person',category:'Love',heading:'You are my\nfavourite person.',message:'Life feels warmer, brighter and more beautiful with you in it. Thank you for the little things, the big hugs and the love you give so freely. I am so glad we found each other.',bg:'#ffe7ed',ink:'#8f2648',pattern:6,kicker:'JUST BECAUSE I LOVE YOU'},
  {id:'love-everyday',name:'Love · Choosing you',category:'Love',heading:'I choose you.\nEvery day.',message:'Through busy mornings, quiet evenings and all the days in between, you are the one I want beside me. Here is to our little routines, our shared dreams and a lifetime of choosing each other.',bg:'#f9edda',ink:'#763f3e',pattern:6,kicker:'A LOVE MADE OF LITTLE MOMENTS'},
  {id:'love-distance',name:'Love · Across the miles',category:'Love',heading:'Far apart.\nClose at heart.',message:'I miss your smile, your voice and the comfort of being near you. Until our next hello, carry this little reminder with you: you are loved, you are missed, and you are always on my mind.',bg:'#292443',ink:'#ffe0ec',pattern:6,kicker:'SENDING ALL MY LOVE',motion:'sparkle'},
  {id:'love-grateful',name:'Love · Thank you for us',category:'Love',heading:'Thank you\nfor being you.',message:'Thank you for listening, for making me laugh and for turning ordinary days into memories I treasure. Your kindness means more than I can say. Loving you is one of my favourite parts of life.',bg:'#f2e4e7',ink:'#653345',pattern:6,kicker:'WITH A VERY FULL HEART'},
  {id:'love-good-morning',name:'Love · A morning kiss',category:'Love',heading:'Good morning,\nmy love.',message:'Before the day gets busy, here is a little love from me to you. May your morning feel gentle, your plans go smoothly and your day bring a reason to smile. I cannot wait to hear all about it.',bg:'#fff0dc',ink:'#8a4432',pattern:6,kicker:'YOU ARE MY FIRST HAPPY THOUGHT'},
  {id:'love-together',name:'Love · Our next chapter',category:'Love',heading:'More memories.\nMore us.',message:'Here is to more laughter in the kitchen, more walks with no destination and more dreams we get to build together. Whatever the next chapter holds, I am happy that I get to share it with you.',bg:'#6d2945',ink:'#ffe5c6',pattern:6,kicker:'THE BEST PART IS TOGETHER',motion:'glow'},
  {id:'friendship-always',name:'Friendship · Always in your corner',category:'Friendship',heading:'Always in\nyour corner.',message:'For the exciting days and the difficult ones, I am cheering for you. You do not have to have everything figured out. You have a friend who believes in you, listens to you and is glad you exist.',bg:'#e7f1df',ink:'#35563b',pattern:7,kicker:'A LITTLE NOTE FROM YOUR FRIEND'},
  {id:'friendship-laughter',name:'Friendship · Our kind of laughter',category:'Friendship',heading:'Life is better\nwith you in it.',message:'Thank you for the ridiculous jokes, the honest advice and the conversations that somehow last for hours. You make ordinary days feel special. I am so lucky to call you my friend.',bg:'#fff0bd',ink:'#6b481d',pattern:7,kicker:'GOOD FRIENDS. GREAT MEMORIES.',motion:'confetti'},
  {id:'friendship-distance',name:'Friendship · Miles cannot change us',category:'Friendship',heading:'Different places.\nSame friendship.',message:'We may not see each other as often as we would like, but you are never far from my thoughts. Here is a little hello, a big hug and a promise: there will always be room for you in my life.',bg:'#e2edff',ink:'#304f80',pattern:7,kicker:'UNTIL OUR NEXT CATCH-UP'},
  {id:'friendship-thank-you',name:'Friendship · Thank you for showing up',category:'Friendship',heading:'You showed up.\nIt meant everything.',message:'You listened without judging, helped without being asked and made a hard day feel less heavy. Thank you for being the kind of friend who shows up. I notice it, and I appreciate you so much.',bg:'#f0e6fa',ink:'#63417d',pattern:7,kicker:'GRATEFUL FOR YOU'},
  {id:'friendship-check-in',name:'Friendship · Just checking in',category:'Friendship',heading:'A little hello.\nA big hug.',message:'No special occasion, just a reminder that I am thinking of you. I hope you are finding time to rest, laugh and do something you enjoy. Whenever you feel like talking, I am here.',bg:'#fce5d9',ink:'#804937',pattern:7,kicker:'YOU CROSSED MY MIND TODAY'},
  {id:'friendship-celebrate',name:'Friendship · Proud of you',category:'Friendship',heading:'Look at you go!',message:'I see the effort you put in, even when progress feels slow. Be proud of how far you have come. I am celebrating your courage, your hard work and every small win along the way. Keep going, my friend!',bg:'#214f58',ink:'#e1f6c4',pattern:7,kicker:'YOUR PERSONAL CHEERING SECTION'},
  {id:'diwali-family-ready',name:'Diwali · Love for the whole family',category:'Festivals',festival:'Diwali',heading:'Happy Diwali\nto your family!',message:'May your home glow with diyas, your table be filled with sweets and your hearts be full of love. Wishing your whole family good health, joyful reunions and beautiful memories this Diwali.',bg:'#201e46',ink:'#ffe6a7',pattern:-1,artwork:'/festivals/diwali.webp'},
  {id:'diwali-friends-ready',name:'Diwali · Bright wishes for friends',category:'Festivals',festival:'Diwali',heading:'Sweet moments.\nBright Diwali.',message:'Here is to shared sweets, sparkling evenings and the friends who make every celebration brighter. May this Diwali fill your home with laughter and bring plenty of happy moments your way.',bg:'#fce4cf',ink:'#853e43',pattern:2,motion:'sparkle'},
  {id:'diwali-business-ready',name:'Diwali · Thank you for your trust',category:'Festivals',festival:'Diwali',heading:'Warm Diwali\nwishes.',message:'Thank you for your trust and support. Wishing you and your family a joyful Diwali, good health and new opportunities. We look forward to another year of working together and celebrating your success.',bg:'#17394a',ink:'#ffe0a0',pattern:1,kicker:'WITH GRATITUDE AND GOOD WISHES'},
  {id:'diwali-new-beginnings',name:'Diwali · A brighter beginning',category:'Festivals',festival:'Diwali',heading:'Light a diya.\nWelcome hope.',message:'May every little flame remind you that brighter days can begin with a small spark of hope. Wishing you peace in your heart, warmth in your home and the courage to welcome a fresh beginning.',bg:'#171938',ink:'#ffe6a7',pattern:-1,artwork:'/posts/diwali-dream.webp',aiArt:true},
  {id:'diwali-far-from-home',name:'Diwali · A hug from afar',category:'Festivals',festival:'Diwali',heading:'Across the miles,\nwith love.',message:'Even though we cannot celebrate together, you are part of every happy thought today. Sending you the warmth of home, a box of imaginary sweets and a big Diwali hug. Missing you and wishing you joy!',bg:'#552743',ink:'#ffe4b6',pattern:3,motion:'glow'},
  {id:'diwali-peace-ready',name:'Diwali · Peace, light and kindness',category:'Festivals',festival:'Diwali',heading:'A peaceful,\njoyful Diwali.',message:'May this festival bring light to your home and gentleness to your days. Wishing you meaningful time with loved ones, kindness shared freely and simple moments that leave your heart feeling full.',bg:'#fff2d5',ink:'#75512a',pattern:4,kicker:'LIGHT • LOVE • TOGETHERNESS'},
];

export const templates:Template[] = [...readyTemplates,...businessTemplates,...invitationTemplates,...faithTemplates,...motionTemplates,...expandedAiTemplates,...aiTemplates,...festivalTemplates,...originalTemplates];
export function isTemplateId(id:unknown):id is string{return typeof id==='string'&&templates.some(t=>t.id===id)}
export function matchesOccasion(t:Template,occasion:string){return occasion==='All occasions'||t.category===occasion||t.festival===occasion}
export type Greeting = {socialSize?:'original'|'square'|'portrait'|'story';language?:'en'|'hi'|'pa';side?:'front'|'back';back?:{heading:string;message:string;website:string};rsvpEmail?:string;positions?:Partial<Record<'text'|'photo'|'qr',{x:number;y:number}>>;logoScale?:number;qr?:{mode:'url'|'whatsapp'|'map'|'contact';value:string};details?:{role?:string;phone?:string;email?:string;website?:string;address?:string;date?:string;time?:string;venue?:string;rsvp?:string};templateId:string;name:string;message:string;sender:string;bg:string;font:string;layout:string;branding:boolean;photo?:string;heading?:string;headingColor?:string;textColor?:string;headingSize?:number;messageSize?:number;textAlign?:'left'|'center'|'right';photoPlacement?:'top'|'bottom'|'left'|'right'|'middle'|'in-message'|'after-message';photoSize?:number;photoShape?:'circle'|'rounded'|'square';photoZoom?:number;photoX?:number;photoY?:number};
export const defaultGreeting=(t:Template):Greeting=>({templateId:t.id,name:'',message:t.message,sender:'',bg:t.bg,font:t.font||'Georgia',layout:t.kind==='invitation'?'vertical':'square',branding:t.kind==='business'?false:true});
