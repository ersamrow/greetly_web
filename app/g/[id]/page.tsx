import Recipient from './recipient';
export const metadata={title:'A greeting for you · Greetly',robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <Recipient id={id}/>}
