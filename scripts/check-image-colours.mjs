import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
const source=ts.transpileModule(fs.readFileSync('lib/image-colours.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {imageColours,imageTheme,contrastRatio}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const pixels=new Uint8ClampedArray([0,0,0,0,255,0,0,255,255,0,0,255,0,0,255,255,0,255,0,50]);
assert.deepEqual(imageColours(pixels),['#ff0000','#0000ff'],'Ignore transparent pixels and rank visible colours');
assert.deepEqual(imageColours(new Uint8ClampedArray(40)),[],'Fully transparent image produces no colours');
assert.deepEqual(imageColours(new Uint8ClampedArray([250,0,0,255,252,0,0,255])),['#fb0000'],'Similar colours combine');
for(const color of ['#ffffff','#000000','#ff0033','#ffff00','#00ff00','#4466ff']){
  const theme=imageTheme(color);
  assert(contrastRatio(theme.bg,theme.headingColor)>=4.5,'Suggested heading is readable');
  assert(contrastRatio(theme.bg,theme.textColor)>=4.5,'Suggested text is readable');
}
for(const path of ['app/studio.tsx']){
  const result=ts.transpileModule(fs.readFileSync(path,'utf8'),{fileName:path,reportDiagnostics:true,compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}});
  assert(!result.diagnostics?.length,'Component syntax is valid: '+path);
}
console.log('Passed: transparent pixels, dominant colours, similar-colour grouping, theme contrast, and component syntax.');
