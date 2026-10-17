import type {Metadata} from 'next';
import './globals.css';
import './mobile-site.css';
import {homeTitle,homeDescription,siteVerification} from '@/lib/seo';
export const metadata:Metadata={title:homeTitle,description:homeDescription,applicationName:'Greetlo',verification:siteVerification(),manifest:'/manifest.webmanifest',icons:{icon:'/favicon.png',apple:'/apple-touch-icon.png'},other:{'google-adsense-account':'ca-pub-4905030687832208'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
