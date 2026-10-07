import {pipeline,env} from '@huggingface/transformers';
import {MODEL,REVISION,rankEmbeddings,validateSelection} from '../dist/planner.mjs';
env.allowLocalModels=false;
env.useBrowserCache=true;
env.useWasmCache=true;
env.backends.onnx.wasm.numThreads=1;
env.backends.onnx.wasm.proxy=false;
env.backends.onnx.wasm.wasmPaths={mjs:new URL('./vendor/ort/ort-wasm-simd-threaded.mjs',self.location.href).href,wasm:new URL('./vendor/ort/ort-wasm-simd-threaded.wasm',self.location.href).href};
let extractorPromise;
const passageVectors=new Map();
let running=false;
self.onmessage=async({data})=>{
 if(data.type!=='generate'||running) return;
 running=true;
 const started=performance.now();
 try{
  const candidates=data.candidates;
  if(!Array.isArray(candidates)||candidates.length<1||candidates.length>6) throw new Error('Invalid candidate list');
  extractorPromise??=pipeline('feature-extraction',MODEL,{revision:REVISION,device:'wasm',dtype:'q8',progress_callback:event=>self.postMessage({type:'progress',event})}).catch(error=>{extractorPromise=undefined;throw error;});
  const extractor=await extractorPromise;
  self.postMessage({type:'ready'});
  const inferStarted=performance.now();
  for(const activity of candidates){
   if(!passageVectors.has(activity.id)){
    const output=await extractor(`passage: ${activity.descriptionEn}`,{pooling:'mean',normalize:true});
    passageVectors.set(activity.id,output.tolist()[0]);
   }
  }
  const query=await extractor(`query: ${data.preference}`,{pooling:'mean',normalize:true});
  const ranking=rankEmbeddings(candidates,[query.tolist()[0],...candidates.map(a=>passageVectors.get(a.id))]);
  const id=validateSelection({id:ranking[0].id},candidates);
  self.postMessage({type:'result',id,evidence:{model:MODEL,revision:REVISION,dtype:'q8',device:'wasm',method:'multilingual semantic retrieval',pooling:'mean',normalized:true,ranking,inferenceMs:Math.round(performance.now()-inferStarted),totalMs:Math.round(performance.now()-started)}});
 }catch(error){self.postMessage({type:'error',message:error?.message??String(error)});}finally{running=false;}
};
