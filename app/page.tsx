import Studio from './studio';
import {getSiteUrl,homeTitle,homeDescription,pageMetadata,serializeJsonLd} from '@/lib/seo';

export function generateMetadata(){return pageMetadata(homeTitle,homeDescription,'/');}

export default function Home(){
  const base=getSiteUrl();
  const data={
    '@context':'https://schema.org',
    '@type':'WebSite',
    name:'Greetly',
    description:homeDescription,
    inLanguage:'en',
    ...(base?{url:base.href}:{}),
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(data)}}/><Studio/></>;
}
