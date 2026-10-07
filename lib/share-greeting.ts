export function greetingShareText(url:string){
  return `A little greeting for you 💌\nView your greeting: ${url}\n\nCreate your own with Greetly by My Ledger Pro: ${new URL('/',url).href}`;
}

type ShareTarget={share?:(data:ShareData)=>Promise<void>;canShare?:(data:ShareData)=>boolean;clipboard?:{writeText:(text:string)=>Promise<void>}};
export async function shareGreeting(target:ShareTarget,url:string,file?:File){
  const title='A little greeting for you';
  const text=greetingShareText(url);
  // Put both links in the caption as file-sharing apps may ignore the URL field.
  const imageData:ShareData={title,text,...(file?{files:[file]}:{})};
  if(target.share){
    if(file&&target.canShare?.(imageData)){
      try{await target.share(imageData);return 'shared' as const}
      catch(error){if(!(error instanceof Error)||!['NotSupportedError','TypeError'].includes(error.name))throw error}
    }
    await target.share({title,text:`Create your own with Greetly by My Ledger Pro: ${new URL('/',url).href}`,url});
    return 'shared' as const;
  }
  if(!target.clipboard)throw Error('Copy the share message shown below to send your greeting.');
  await target.clipboard.writeText(text);
  return 'copied' as const;
}
