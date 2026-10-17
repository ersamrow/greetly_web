'use client';
export default function PersonaliseCard({templateId,collection}:{templateId:string;collection:string}){
 return <button className="primary" type="button" onClick={()=>{window.location.href=`/occasions/${collection}?template=${encodeURIComponent(templateId)}`}}>Personalise this card</button>;
}
