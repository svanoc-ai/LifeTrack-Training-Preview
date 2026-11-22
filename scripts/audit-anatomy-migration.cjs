#!/usr/bin/env node
/** Audit read-only: V14 decisions against published standard exercise ids.
 * An active lt7: target maps to std: only for identity checks; it is never published here.
 */
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const rows=JSON.parse(fs.readFileSync(path.join(root,'src/catalogue20-v14-statut.json'),'utf8'));
const source=fs.readFileSync(path.join(root,'src/main.tsx'),'utf8');
const match=source.match(/const STANDARD_EXERCISES: Exercise\[\] = \[([\s\S]*?)\]\.map\(/);
if(!match)throw new Error('Catalogue standard introuvable');
const standard=new Set([...match[1].matchAll(/^\s*\[\s*['"]([^'"]+)['"]\s*,/gm)].map(m=>`std:${m[1]}`));
const statuses={};const issues=[];const active=[];const seen=new Set();
for(const [index,row] of rows.entries()){
 const status=row.statut_v14;statuses[status]=(statuses[status]||0)+1;
 const key=`${row.numero}:${row.exercice}`;
 if(seen.has(key))issues.push({index,type:'duplicate-row',key});seen.add(key);
 if(!status||!row.id_cible)issues.push({index,type:'incomplete-decision'});
 if(status?.startsWith('ACTIF_PREVIEW')){
   const target=row.id_cible.startsWith('lt7:')?`std:${row.id_cible.slice(4)}`:row.id_cible;
   active.push({numero:row.numero,exercice:row.exercice,sourceId:row.id_cible,catalogueId:target});
   if(!standard.has(target))issues.push({index,type:'active-missing-from-catalogue',target});
 }
}
const result={source:'catalogue20-v14-statut.json',total:rows.length,standardExercises:standard.size,statuses,active,issues,policy:'Only ACTIF_PREVIEW statuses are considered published; REVUE_REQUISE, SUSPENDU and EXCLU_DOUBLON are not automatically promoted.'};
console.log(JSON.stringify(result,null,2));
if(issues.length)process.exitCode=1;
