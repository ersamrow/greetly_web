import type {Metadata} from 'next';
import './globals.css';
import {getAdSenseSettings} from '@/lib/adsense-server';
export const metadata:Metadata={title:'Greetly — Make someone’s day',description:'Create a personal greeting in a minute. Free original cards for birthdays, anniversaries, thank-yous and everyday moments.',manifest:'/manifest.webmanifest',icons:{icon:'/favicon.svg',apple:'/icon-192.png'}};
export default function RootLayout({children}:{children:React.ReactNode}){const {publisherId}=getAdSenseSettings();return <html lang="en"><head>{publisherId&&<meta name="google-adsense-account" content={publisherId}/>}</head><body>{children}</body></html>}
