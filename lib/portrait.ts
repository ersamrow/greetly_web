import {encodePhoto} from './photo-format';

/** Load the portrait model only when requested; photos never leave this browser. */
export async function removePortraitBackground(source:string):Promise<string>{
  const {FilesetResolver,ImageSegmenter}=await import('@mediapipe/tasks-vision');
  const vision=await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm');
  const segmenter=await ImageSegmenter.createFromOptions(vision,{
    baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/1/selfie_segmenter.tflite'},
    runningMode:'IMAGE',outputConfidenceMasks:true,outputCategoryMask:false,
  });
  try{
    const image=await createImageBitmap(await (await fetch(source)).blob());
    try{
      const canvas=document.createElement('canvas');
      canvas.width=image.width;canvas.height=image.height;
      const context=canvas.getContext('2d')!;
      context.drawImage(image,0,0);
      segmenter.segment(canvas,result=>{
        const mask=result.confidenceMasks?.[0];
        if(!mask)throw new Error('Could not identify a person in this photo.');
        const confidence=mask.getAsFloat32Array();
        const pixels=context.getImageData(0,0,canvas.width,canvas.height);
        let visible=0;
        for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){
          const probability=confidence[Math.min(mask.height-1,Math.floor(y*mask.height/canvas.height))*mask.width+Math.min(mask.width-1,Math.floor(x*mask.width/canvas.width))];
          const alpha=Math.max(0,Math.min(1,(probability-.25)/.5));
          const index=(y*canvas.width+x)*4+3;
          pixels.data[index]=Math.round(pixels.data[index]*alpha);
          if(pixels.data[index]>127)visible++;
        }
        if(visible<canvas.width*canvas.height*.01)throw new Error('No clear person found. Try a well-lit portrait.');
        context.putImageData(pixels,0,0);
      });
      // Trim empty margins so the person, rather than the original photo, fits the layout.
      const pixels=context.getImageData(0,0,canvas.width,canvas.height).data;
      let left=canvas.width,top=canvas.height,right=0,bottom=0;
      for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++)if(pixels[(y*canvas.width+x)*4+3]>16){
        left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
      }
      const trimmed=await createImageBitmap(canvas,left,top,right-left+1,bottom-top+1);
      try{return encodePhoto(trimmed,'image/png')}finally{trimmed.close()}
    }finally{image.close()}
  }finally{segmenter.close()}
}
