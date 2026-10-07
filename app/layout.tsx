import type {Metadata} from 'next';
import './globals.css';
import {getAdSenseSettings} from '@/lib/adsense-server';
import {homeTitle,homeDescription} from '@/lib/seo';
export const metadata:Metadata={title:homeTitle,description:homeDescription,applicationName:'Greetly',manifest:'/manifest.webmanifest',icons:{icon:'/favicon.svg',apple:'/icon-192.png'}};
export default function RootLayout({children}:{children:React.ReactNode}){const {publisherId}=getAdSenseSettings();return <html lang="en"><head>{publisherId&&<meta name="google-adsense-account" content={publisherId}/>}</head><body>{children}</body></html>}
