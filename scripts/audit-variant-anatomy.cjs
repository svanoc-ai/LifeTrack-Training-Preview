#!/usr/bin/env node
/** Read-only static checks for exercise variants and 20-group mapping. */
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,'src',p),'utf8');
const catalog=read('main.tsx');
const body=catalog.match(/const STANDARD_EXERCISES: Exercise\[\] = \[([\s\S]*?)\]\.map\(/);
if(!body)throw Error('Catalogue standard non reconnu');
const ids=new Set([...body[1].matchAll(/^\s*\[\s*['"]([^'"]+)['"]\s*,/gm)].map(x=>'std:'+x[1]));
const registry=read('muscleRegistry.ts');
const anatomy=read('anatomy20.ts');
const variants=[...registry.matchAll(/\bv\('([^']+)','([^']+)','([^']+)'\s*,/g)].map(x=>({exerciseId:x[1],slug:x[2],label:x[3]}));
const muscleBlock=registry.match(/export const MUSCLE_GROUPS = \{([\s\S]*?)\} as const/);
const muscles=new Set([...muscleBlock[1].matchAll(/'([a-z_]+)'/g)].map(x=>x[1]));
const mapping=anatomy.match(/const groupMap:[\s\S]*?=\{([\s\S]*?)\};/);
const mapped=new Map([...mapping[1].matchAll(/([a-z_]+):'([^']+)'/g)].map(x=>[x[1],x[2]]));
const groups=[...anatomy.match(/export const GROUPS_20 = \[([\s\S]*?)\] as const/)[1].matchAll(/'([^']+)'/g)].map(x=>x[1]);
const issues=[];const variantIds=new Set();
for(const v of variants){const id=`variant:${v.exerciseId.slice(4)}:${v.slug}`;if(variantIds.has(id))issues.push({type:'duplicate-variant',id});variantIds.add(id);if(!ids.has(v.exerciseId))issues.push({type:'unknown-exercise',id,exerciseId:v.exerciseId});}
for(const muscle of muscles)if(!mapped.has(muscle))issues.push({type:'unmapped-muscle',muscle});
for(const [muscle,group] of mapped){if(!muscles.has(muscle))issues.push({type:'unknown-muscle',muscle});if(!groups.includes(group))issues.push({type:'unknown-20-group',muscle,group});}
const result={standardExercises:ids.size,variants:variants.length,uniqueVariantExercises:new Set(variants.map(v=>v.exerciseId)).size,muscleIds:muscles.size,mappedMuscles:mapped.size,groups20:groups.length,issues,policy:'Audit structurel en lecture seule ; ne certifie ni la pertinence biomécanique ni la publication des fiches en revue.'};
console.log(JSON.stringify(result,null,2));
if(issues.length)process.exitCode=1;
