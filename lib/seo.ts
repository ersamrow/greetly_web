import type { Metadata } from 'next';
import { env } from '@/lib/runtime-env';

export const homeTitle = 'Free Online Greeting Cards & Personalised Wishes | Greetlo';
export const homeDescription = 'Create free personalised greeting cards for birthdays, anniversaries, Diwali and more. Add your message and photo, then download or share. No sign-up needed.';
export const publicSiteOrigin = 'https://greetlo.in';

// Never invent a domain or publish localhost as a canonical URL.
export function getSiteUrl(): URL | undefined {
  const value = (env as unknown as { SITE_URL?: string }).SITE_URL?.trim() || publicSiteOrigin;
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('SITE_URL must be a public HTTP(S) origin without a path, query, or credentials.');
  }
  if (['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
    throw new Error('SITE_URL must be the public site origin, not localhost.');
  }
  return url;
}

export function pageMetadata(title: string, description: string, path: string, previewId = 'g1'): Metadata {
  const base = getSiteUrl();
  const url = base ? new URL(path, base).href : undefined;
  const images = [{url: new URL(`/previews/${previewId}-social.jpg`, base).href, width:1200, height:630, alt:title}];
  return {
    title,
    description,
    ...(url ? { alternates: { canonical: url } } : {}),
    openGraph: { type: 'website', siteName: 'Greetlo', title, description, images, ...(url ? { url } : {}) },
    twitter: { card: 'summary_large_image', title, description, images },
  };
}

export const collectionDescriptions: Record<string, string> = {
  love: 'Share a ready-written love card for your partner, a morning hello or a long-distance hug. Choose a design, optionally add names or a photo, and send.',
  friendship: 'Send thoughtful friendship cards with complete messages of thanks, encouragement and care. Personalise with names or share your favourite design as it is.',
  business: 'Design a free visiting card with your business name, logo, contact details and services.',
  invitations: 'Create a personal invitation for weddings, birthdays, housewarmings and gatherings, with event and RSVP details.',
  birthday: 'Make a free personalised birthday card with your own wishes, name and photo. Explore birthday message ideas, then download or share your greeting.',
  anniversary: 'Celebrate a special couple with a free personalised anniversary card. Find thoughtful wishes, add a photo and share a greeting made just for them.',
  'thank-you': 'Say thank you with a free personalised greeting card. Find thoughtful messages, add your own words and download or share your appreciation.',
  daily: 'Send good morning wishes and everyday encouragement with free personalised greeting cards. Add a message or photo and make someone’s day.',
  festivals: 'Explore free festival greeting cards and wishes for Diwali and Dussehra. Personalise festive designs with your message and photo, then share.',
  dussehra: 'Create free Dussehra and Vijayadashami greeting cards. Find warm wishes, personalise festive artwork and share the joy of goodness and new beginnings.',
  diwali: 'Create free Diwali and Deepavali greeting cards with glowing diyas and festive wishes. Add your message and photo, then download or share.',
  faith: 'Explore free faith and blessing cards for Sikh, Hindu, Muslim, Christian, Buddhist and Jain occasions. Add your own message and share warm wishes.',
};

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export function siteVerification():Metadata['verification']{
 const values=env as unknown as {GOOGLE_SITE_VERIFICATION?:string;BING_SITE_VERIFICATION?:string};
 const google=values.GOOGLE_SITE_VERIFICATION?.trim(),bing=values.BING_SITE_VERIFICATION?.trim();
 return {...(google?{google}:{}),...(bing?{other:{'msvalidate.01':bing}}:{})};
}
