import type {Template} from './templates';

const messageIdeas:Record<string,[string,string]>={
 Birthday:['Here is to another year of good stories, unexpected adventures and people who make you feel at home. Happy birthday!','You make ordinary days feel special. I hope your birthday brings back some of the happiness you give to everyone around you.'],
 Anniversary:['Wishing you more shared adventures, quiet cups of tea and reasons to laugh together. Happy anniversary to a wonderful couple.','May the life you are building together keep growing in kindness, patience and joy. Here is to your next chapter.'],
 'Thank you':['Thank you for showing up when it mattered. Your thoughtfulness made a real difference, and I wanted you to know.','I am grateful for your time, your patience and the care you put into helping me. You made a difficult day easier.'],
 'Daily greetings':['A little hello to remind you that someone is thinking of you. May today bring a calm moment and a welcome smile.','Whatever today holds, take it one step at a time. I am cheering you on and hoping something lovely comes your way.'],
 Diwali:['May the diyas at your door welcome laughter, good health and happy reunions. Sending warm Diwali wishes to your whole family.','Wishing you shared sweets, unhurried conversations and a home full of light. May this Diwali leave you with memories to treasure.'],
 Dussehra:['May this Vijayadashami bring the courage to make a fresh start and the kindness to help someone along the way.','Wishing your family a joyful Dussehra. May goodness guide your choices and hope brighten the days that lie ahead.'],
 Festivals:['Sending warm wishes for a celebration filled with good company, meaningful traditions and moments that bring everyone a little closer.','May this festive season bring peace to your home and plenty of reasons to be grateful for the people around you.'],
 Love:['You are part of my favourite memories and the person I want beside me for the ones we have not made yet.','Even on ordinary days, I notice the small things you do. Thank you for making life warmer, kinder and more joyful.'],
 Friendship:['Thank you for the conversations, the laughter and the times you understood without needing an explanation. I am lucky to know you.','We may not catch up every day, but you are never far from my thoughts. Sending a little encouragement and a big friendly hug.'],
 'Faith & blessings':['May this special occasion bring your family time for reflection, gratitude and the quiet joy of being together in faith.','Wishing you peace in your home, kindness in your community and meaningful moments with the people who share your traditions.'],
};
const audiences:Record<string,string>={
 Birthday:'a friend, relative or colleague who would enjoy a personal birthday wish',Anniversary:'a couple celebrating another year together, or your own partner',
 'Thank you':'someone whose help, generosity or encouragement deserves a specific thank-you','Daily greetings':'a friend or relative you want to check in with, even without a special occasion',
 Festivals:'family, friends or neighbours celebrating a shared festive tradition',Love:'your partner, whether you are together every day or keeping in touch across a distance',Friendship:'a close friend who would appreciate a thoughtful check-in or a little encouragement',
};
const patternNotes=[
 'Scattered confetti marks add a playful border while leaving the centre open for a name and a short wish.',
 'Fine geometric borders frame the message, giving the card an orderly finish that works well with a restrained typeface.',
 'Soft circles create a gentle rhythm around the edges, making the design a good companion for warm, conversational wording.',
 'A field of small dots gives the background a starlit feel without asking the message to compete with a large illustration.',
 'Concentric linework adds a decorative frame around the central text. Keep your opening sentence short to let that framing breathe.',
 'Floral decoration gives the design a softer finish. A personal note and a simple photograph work well with its illustrated setting.',
 'Small hearts around the edges reinforce an affectionate message while keeping the centre clear for your own words.',
 'Linked circular accents and a curved flourish give this card a friendly, informal character suited to a conversational note.',
];
function appearance(t:Template){
 if(t.artworkTextTop)return t.artwork?.includes('ayodhya')?'Ram and Sita stand together against a lamp-lit Ayodhya scene. Golden diyas and a midnight-blue sky give this homecoming design its warmth, with the greeting above the figures.':'Ram and Sita are framed by lotus flowers, marigolds and fine golden details. The ivory background and traditional painted style suit a gentle blessing, with dark lettering above the portrait.';
 if(t.photoArtwork)return 'A photograph of Harmandir Sahib anchors this design. The separate space above the photograph keeps your blessing readable and preserves the temple as the visual focus.';
 if(t.artwork?.includes('diwali'))return 'Glowing diyas, hanging lanterns and a deep evening backdrop frame the central message. The light lettering is designed to stand out against the darker artwork.';
 if(t.artwork?.includes('dussehra'))return 'Warm marigold-inspired artwork surrounds a clear message area. Its celebratory details suit wishes about courage, goodness and the hope of beginning again.';
 if(t.faith)return `The ${t.faith} artwork provides a setting for ${t.occasion?.toLowerCase()||'a blessing'}. Keep the greeting connected to the recipient’s own tradition and choose wording they will recognise and appreciate.`;
 if(t.kind==='business')return `The ${t.name.toLowerCase()} layout gives your business identity and contact details their own visual hierarchy. Preview it with your actual logo, since a wide wordmark and a square symbol occupy space differently.`;
 return patternNotes[t.pattern]||'This design keeps a clear area for the main message, with decorative details supporting the text rather than replacing it.';
}
export function cardEditorial(t:Template){
 const topic=t.festival||t.occasion||t.category;
 let audience=t.faith?`someone who observes ${t.occasion||'this occasion'} within the ${t.faith} tradition`:audiences[t.category]||'someone you want to include in a meaningful celebration';
 if(/family|reunion|homecoming/.test(t.id))audience='family members sharing a celebration, including relatives who cannot join you in person';
 if(/distance|far-from|afar/.test(t.id))audience='a loved one celebrating far from home, when a specific memory can make the distance feel smaller';
 if(/business-ready/.test(t.id))audience='clients, colleagues or business partners you want to thank with a warm seasonal greeting';
 if(t.kind==='business')audience='a freelancer, shop owner or professional who needs a clear introduction and an easy way to stay in touch';
 if(t.kind==='invitation')audience=`guests you want to welcome with a ${t.name.toLowerCase()} that makes the practical details easy to find`;
 const examples=t.kind==='business'?['Thoughtful design for homes that feel like you. Contact us to discuss your next project.','Friendly, reliable support for local businesses. Let us know what you need and how we can help.','Independent advice, clear answers and service built around you. Save these details for your next enquiry.']:
 t.kind==='invitation'?[t.message,'Please join us for a celebration with our favourite people. Add the date, starting time and full address before sending this invitation.','We would be delighted to see you there. Please let us know whether you can come, and include any details your guests should know.']:
 [t.message,...(messageIdeas[topic]||messageIdeas[t.category]||messageIdeas['Faith & blessings'])];
 return {
  intro:`${t.name} is a ${t.motion?'moving':'still'} ${t.festival||t.occasion||t.category.toLowerCase()} design built around “${t.heading.replaceAll('\n',' ')}”. Use its ready-written message as a starting point, or replace it with a note that sounds like you.`,
  audience:`This card suits ${audience}. Think about the relationship before choosing your words: a shared memory feels natural for someone close, while a brief, considerate wish works well for a more formal connection.`,
  design:appearance(t)+(t.motion?' This edition includes animation; share its greeting link to preserve the movement, or download a still image.':''),
  personalisation:t.kind==='business'?'Add your business name, your own name, profession and contact details. Upload a logo with enough clear space around it, then check the phone number, email and website carefully. Keep the services line concise, and preview both sides if you enable a back.':t.kind==='invitation'?'Replace the sample wording with your event details. Include the date, time, venue and RSVP contact, then check that guests have enough information to plan their visit. Add a personal photo if it helps set the tone, and preview the final invitation before sending.':'Start with the recipient’s name and one detail that belongs to your relationship: a recent achievement, a shared memory or a wish for the coming weeks. Add a photo if you like, adjust the font and colours in Style, and preview long names before sharing.',
  examples,
  sharing:'Save a named draft to keep your version on this device. Download an image for a message or social post, or create a greeting link. Anyone with that link can view the card, so check the details you include.',
 };
}
