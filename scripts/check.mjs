import {readFile,stat,readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
const files=['dist/app.js','dist/planner.mjs','dist/sw.js','dist/ai-worker.js'];
for(const file of files){const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(result.status!==0)throw new Error(result.stderr);}
const html=await readFile('dist/index.html','utf8');
for(const match of html.matchAll(/(?:src|href)="(\.?\/[^"#?]+)"/g)){
 if(match[1]==='./')continue;
 await stat(resolve('dist',match[1].replace(/^\//,'')));
}
const worker=await stat('dist/ai-worker.js');if(worker.size<1000)throw new Error('AI worker was not bundled');
const runtimeFiles=await readdir('dist/vendor/ort');
if(runtimeFiles.length!==2||!runtimeFiles.includes('ort-wasm-simd-threaded.mjs')||!runtimeFiles.includes('ort-wasm-simd-threaded.wasm'))throw new Error('Unexpected WASM runtime assets');
for(const file of runtimeFiles)if((await stat(`dist/vendor/ort/${file}`)).size>25*1024*1024)throw new Error('Runtime file exceeds hosting limit');
console.log('JavaScript syntax, local HTML references, and browser AI bundle verified.');
