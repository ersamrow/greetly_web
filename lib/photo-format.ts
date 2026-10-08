/** Recognise only the raster formats we produce, including legacy JPEG uploads. */
export function photoContentType(bytes: Uint8Array): 'image/png' | 'image/jpeg' | null {
  if ([137,80,78,71,13,10,26,10].every((value,index)=>bytes[index]===value)) return 'image/png';
  if (bytes[0]===255 && bytes[1]===216 && bytes[2]===255) return 'image/jpeg';
  return null;
}

/** PNG preserves alpha from both PNG and WebP sources. Never flatten to meet size limits. */
export function encodePhoto(bitmap: ImageBitmap, sourceType: string): string {
  const canvas=document.createElement('canvas');
  const type=sourceType==='image/jpeg'?'image/jpeg':'image/png';
  let edge=800;
  while (edge>=100) {
    const ratio=Math.min(1,edge/Math.max(bitmap.width,bitmap.height));
    canvas.width=Math.max(1,Math.round(bitmap.width*ratio));
    canvas.height=Math.max(1,Math.round(bitmap.height*ratio));
    canvas.getContext('2d')!.drawImage(bitmap,0,0,canvas.width,canvas.height);
    const data=canvas.toDataURL(type,.8);
    if (data.startsWith(`data:${type};base64,`) && data.length<=1500000) return data;
    edge=Math.floor(edge*.75);
  }
  throw new Error('Image could not be resized');
}
