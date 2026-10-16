import Recipient from './recipient';
export const metadata={title:'A greeting for you · Greetlo',robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <Recipient id={id}/>}
