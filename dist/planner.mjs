export const MODEL = 'Xenova/multilingual-e5-small';
export const REVISION = '761b726dd34fb83930e26aab4e9ac3899aa1fa78';
export const CATALOG = [
 {id:'A',seated:true,goals:['quiet','notice'],descriptionEn:'Sit comfortably outside and notice nearby sounds, birds and rustling leaves. Quiet, no photographs.',pt:{title:'Escute o que passava despercebido.',action:'Deixe os sons chegarem',body:'Perceba três sons diferentes: perto, longe e ao seu redor. Não precisa identificar, fotografar ou pesquisar nada.'},en:{title:'Listen to what you were missing.',action:'Let the sounds arrive',body:'Notice three sounds: nearby, far away, and around you. No need to identify, photograph, or look anything up.'}},
 {id:'B',seated:true,goals:['notice','quiet'],descriptionEn:'Observe five natural colors from a comfortable spot. Focus on leaves, sky and small details; no photos.',pt:{title:'Encontre cinco cores lá fora.',action:'Olhe com um pouco mais de calma',body:'Encontre cinco cores diferentes ao seu redor. Escolha uma folha ou detalhe natural e perceba seus tons.'},en:{title:'Find five colors outside.',action:'Look a little more slowly',body:'Find five different colors around you. Choose a leaf or natural detail and notice its shades.'}},
 {id:'C',seated:true,goals:['quiet','notice'],descriptionEn:'Rest in a comfortable outdoor spot and observe changing shadows and sunlight without staring at the sun.',pt:{title:'Acompanhe a luz por alguns minutos.',action:'Observe as sombras',body:'Repare nas sombras de folhas, árvores ou objetos. Veja o que muda enquanto você permanece num lugar confortável.'},en:{title:'Follow the light for a few minutes.',action:'Watch the shadows',body:'Notice the shadows of leaves, trees, or objects. See what changes while you stay in a comfortable spot.'}},
 {id:'D',seated:true,goals:['notice','quiet'],descriptionEn:'Observe outdoor textures such as bark, leaves and stone from a familiar comfortable place. No collecting or photography.',pt:{title:'Um detalhe merece seu olhar.',action:'Encontre três texturas',body:'Observe, sem coletar, uma superfície lisa, uma áspera e uma irregular. Escolha um detalhe que normalmente passaria despercebido.'},en:{title:'One small detail deserves your attention.',action:'Find three textures',body:'Without collecting anything, notice a smooth, a rough, and an uneven surface. Choose one detail you would usually miss.'}},
 {id:'E',seated:false,goals:['move'],descriptionEn:'Take a gentle self-paced walk only in a familiar place. Notice three landmarks and return; no route recommendations.',pt:{title:'Caminhe sem precisar chegar a lugar nenhum.',action:'Dê uma volta pequena',body:'Caminhe no seu ritmo por um trecho que já conhece. Perceba três pontos de referência e retorne quando desejar.'},en:{title:'Walk without needing to get anywhere.',action:'Take one small loop',body:'Walk at your own pace in a place you already know. Notice three familiar landmarks and return whenever you want.'}},
 {id:'F',seated:false,goals:['move','notice'],descriptionEn:'Move gently around a familiar outdoor place and stop to notice small natural details. No collecting, routes, or photos.',pt:{title:'Faça três pequenas descobertas.',action:'Caminhe e pare para reparar',body:'Num trecho conhecido, faça três paradas curtas para observar folhas, padrões ou sons. Não precisa guardar nada além da lembrança.'},en:{title:'Make three small discoveries.',action:'Move, then stop to notice',body:'In a familiar place, make three short stops to notice leaves, patterns, or sounds. Keep only the memory.'}}
];
export function validatePreferences(input) {
 if(!input || typeof input !== 'object') throw new Error('Invalid preferences');
 const duration=Number(input.duration);
 if(![10,20,30].includes(duration)) throw new Error('Invalid duration');
 if(!['quiet','notice','move'].includes(input.goal)) throw new Error('Invalid goal');
 if(typeof input.place!=='string' || !input.place.trim() || input.place.length>80) throw new Error('Invalid place');
 if(typeof input.context!=='string'||input.context.length>180) throw new Error('Invalid context');
 if(typeof input.seated!=='boolean') throw new Error('Invalid mobility');
 return {duration,goal:input.goal,place:input.place.trim(),context:input.context.trim(),seated:input.seated};
}
export function candidatesFor(input) {
 const p=validatePreferences(input);
 const allowed=CATALOG.filter(a=>!p.seated||a.seated);
 const matching=allowed.filter(a=>a.goals.includes(p.goal));
 return matching.length?matching:allowed;
}
export function rankEmbeddings(candidates,vectors){
 if(!Array.isArray(candidates)||!candidates.length||!Array.isArray(vectors)||vectors.length!==candidates.length+1) throw new Error('Invalid embedding batch');
 const dimensions=vectors[0]?.length;
 if(!dimensions||vectors.some(v=>!Array.isArray(v)||v.length!==dimensions||v.some(n=>!Number.isFinite(n)))) throw new Error('Invalid embeddings');
 const query=vectors[0];
 return candidates.map((a,i)=>({id:a.id,score:query.reduce((sum,value,j)=>sum+value*vectors[i+1][j],0)})).sort((a,b)=>b.score-a.score).map(a=>({...a,score:Math.round(a.score*1e6)/1e6}));
}
export function validateSelection(answer,candidates) {
 if(!answer || typeof answer!=='object' || Array.isArray(answer)||Object.keys(answer).length!==1 || typeof answer.id!=='string' || !candidates.some(a=>a.id===answer.id)) throw new Error('Invalid AI selection');
 return answer.id;
}
export function createPlan(input,id,source='local-ai',evidence={}) {
 const preferences=validatePreferences(input);
 const activity=candidatesFor(preferences).find(a=>a.id===id);
 if(!activity) throw new Error('Activity violates preferences');
 if(!['local-ai','catalog'].includes(source)) throw new Error('Invalid source');
 const edge=preferences.duration===10?2:3;
 return {version:1,activityId:activity.id,preferences,source,evidence,createdAt:new Date().toISOString(),minutes:[edge,preferences.duration-2*edge,edge]};
}
export function planText(plan,language='pt') {
 const activity=CATALOG.find(a=>a.id===plan.activityId);
 if(!activity) throw new Error('Unknown activity');
 const copy=activity[language];
 const steps=language==='pt'?[{title:'Chegue de verdade',body:plan.preferences.seated?'Encontre um lugar confortável onde você possa ficar sentado. Guarde a tela e repare no que está ao seu redor.':'Chegue ao seu local conhecido. Observe o espaço e guarde a tela.'},{title:copy.action,body:copy.body},{title:'Volte com um detalhe',body:'Escolha uma coisa que você não tinha notado antes. Leve só essa lembrança.'}]:[{title:'Arrive, really',body:plan.preferences.seated?'Find a comfortable place to sit. Put the screen away and notice what is around you.':'Go to your familiar spot. Notice your surroundings and put the screen away.'},{title:copy.action,body:copy.body},{title:'Bring back one detail',body:'Choose one thing you had not noticed before. Keep only that memory.'}];
 return {title:copy.title,steps:steps.map((s,i)=>({...s,minutes:plan.minutes[i]}))};
}
export function remainingSeconds(endAt,now=Date.now()) {return Math.max(0,Math.ceil((endAt-now)/1000));}
export function pocketCard(plan,language='pt'){
 const text=planText(plan,language),h=escapeHtml;
 const origin=plan.source==='local-ai'?(language==='pt'?'IA LOCAL':'LOCAL AI'):(language==='pt'?'SEM IA':'NO AI');
 const rhythm=language==='pt'?'Você define o ritmo. O plano se adapta ao tempo escolhido.':'You set the pace. The plan follows your chosen time.';
 return `<!doctype html><html lang="${language==='en'?'en':'pt-BR'}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Saia em 20 — pocket card</title><style>body{font:18px/1.6 system-ui;max-width:520px;padding:30px;margin:auto;color:#173d2a;background:#f6f8f4}h1{font-size:29px;line-height:1.2}section{border-top:1px solid #c8d8bd;padding:16px 0}h2{font-size:20px;margin:0}small{color:#546658}p{margin:6px 0}</style><small>SAIA EM 20 · ${plan.preferences.duration} MIN · ${origin}</small><h1>${h(text.title)}</h1><p>${h(plan.preferences.place)}</p>${text.steps.map(s=>`<section><small>${s.minutes} min</small><h2>${h(s.title)}</h2><p>${h(s.body)}</p></section>`).join('')}<small>${rhythm}<br>${h(plan.createdAt)}</small></html>`;
}
export function escapeHtml(value) {return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
