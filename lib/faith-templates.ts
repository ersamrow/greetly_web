import type {Template} from './templates';

export const faiths=['Sikh','Hindu','Muslim','Christian','Buddhist','Jain'] as const;
export type Faith=typeof faiths[number];

type FaithCard={id:string;name:string;faith:Faith;occasion:string;heading:string;message:string;motion?:Template['motion']};
const cards:FaithCard[]=[
  {id:'sikh-gurpurab',name:'Gurpurab blessings',faith:'Sikh',occasion:'Gurpurab',heading:'Blessed\nGurpurab',message:'May this Gurpurab bring peace to your home, gratitude to your heart, and strength to serve others with kindness.'},
  {id:'sikh-seva',name:'A little kindness, every day',faith:'Sikh',occasion:'Everyday blessings',heading:'Faith, kindness\nand seva.',message:'Wishing you a day of honest work, a generous heart, and the joy of sharing with others.',motion:'glow'},
  {id:'hindu-blessings',name:'Light and blessings',faith:'Hindu',occasion:'Everyday blessings',heading:'A heart full\nof blessings.',message:'May your home be filled with peace, your path with wisdom, and your days with love and joyful beginnings.'},
  {id:'hindu-diwali',name:'A sacred little light',faith:'Hindu',occasion:'Diwali',heading:'Shubh\nDeepavali',message:'May the light of every diya bring hope, happiness, and beautiful moments with the people you love.',motion:'glow'},
  {id:'muslim-eid',name:'Eid with love',faith:'Muslim',occasion:'Eid',heading:'Eid\nMubarak',message:'May Allah bless you and your family with peace, good health, and happiness. Wishing you a joyful Eid.'},
  {id:'muslim-ramadan',name:'A month of blessings',faith:'Muslim',occasion:'Ramadan',heading:'Ramadan\nMubarak',message:'Wishing you a blessed Ramadan filled with prayer, gratitude, generosity, and moments of peace.',motion:'glow'},
  {id:'christian-christmas',name:'Peace this Christmas',faith:'Christian',occasion:'Christmas',heading:'Christmas\nblessings',message:'May the love of Christ bring peace to your heart and joy to your home this Christmas and throughout the year.'},
  {id:'christian-easter',name:'Hope renewed',faith:'Christian',occasion:'Easter',heading:'Blessed\nEaster',message:'Celebrating the hope of the resurrection. May your Easter be filled with faith, renewed joy, and love.',motion:'glow'},
  {id:'buddhist-vesak',name:'A peaceful Vesak',faith:'Buddhist',occasion:'Vesak',heading:'Peaceful\nVesak',message:'May this Vesak inspire compassion in your heart, clarity in your thoughts, and kindness in every step.'},
  {id:'buddhist-kindness',name:'Loving-kindness',faith:'Buddhist',occasion:'Everyday blessings',heading:'May all beings\nbe at peace.',message:'Wishing you moments of stillness, a compassionate heart, and the freedom to meet each day with kindness.',motion:'glow'},
  {id:'jain-mahavir',name:'Mahavir Jayanti wishes',faith:'Jain',occasion:'Mahavir Jayanti',heading:'Happy\nMahavir Jayanti',message:'May the spirit of nonviolence, truth, and compassion inspire your thoughts, words, and actions.'},
  {id:'jain-forgiveness',name:'With a forgiving heart',faith:'Jain',occasion:'Paryushan',heading:'Reflection.\nForgiveness. Peace.',message:'During Paryushan, may reflection deepen understanding, forgiveness renew friendships, and kindness guide the way.',motion:'glow'},
];
const templeCards:Template[]=[
  {id:'golden-temple-peace',name:'Golden Temple · A moment of peace',heading:'Peace in\nevery moment.',message:'May your day be filled with gratitude, kindness, and the quiet strength of faith.',photoArtwork:'/faith/golden-temple-day.webp',bg:'#fff4df',ink:'#59431f'},
  {id:'harmandir-sahib-blessings',name:'Harmandir Sahib · Blessings',heading:'Faith, hope\nand blessings.',message:'Wishing you and your family peace, good health, and the joy of serving others.',photoArtwork:'/faith/golden-temple-day.webp',bg:'#fff4df',ink:'#59431f',motion:'glow'},
  {id:'golden-temple-evening',name:'Golden Temple · Evening reflections',heading:'A peaceful\nevening.',message:'May the day end with a thankful heart, a peaceful mind, and hope for tomorrow.',photoArtwork:'/faith/golden-temple-night.webp',bg:'#142c3b',ink:'#ffe6a7'},
  {id:'harmandir-sahib-gurpurab',name:'Harmandir Sahib · Gurpurab light',heading:'Blessed\nGurpurab',message:'May this Gurpurab inspire kindness, humility, and a life filled with love and seva.',photoArtwork:'/faith/golden-temple-night.webp',bg:'#142c3b',ink:'#ffe6a7',motion:'glow'},
].map(card=>({...card,category:'Faith & blessings',faith:'Sikh',occasion:card.id.includes('gurpurab')?'Gurpurab':'Harmandir Sahib',pattern:-1,kicker:'SRI HARMANDIR SAHIB · AMRITSAR',photoCredit:card.photoArtwork.includes('night')?'Photo: Giridhar Appaji Nag Y / Wikimedia Commons / CC BY 2.0 · cropped':'Photo: Jasdeep Singh / Wikimedia Commons / CC0'})) as Template[];
export const faithTemplates:Template[]=[...templeCards,...cards.map(card=>({
  ...card,category:'Faith & blessings',artwork:`/faith/${card.faith.toLowerCase()}.webp`,pattern:-1,aiArt:true,
  bg:card.faith==='Muslim'?'#102e35':card.faith==='Christian'?'#172741':'#f8eedb',
  ink:card.faith==='Muslim'||card.faith==='Christian'?'#ffe6a7':'#4e432b',
  kicker:'WITH PEACE, LOVE AND WARM WISHES',
}))];
