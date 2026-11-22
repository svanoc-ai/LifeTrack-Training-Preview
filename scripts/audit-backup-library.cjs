#!/usr/bin/env node
// Audit de lecture seule : catalogue réel et références de sauvegarde JSON V4.
const fs=require('node:fs');
const path=require('node:path');
const filename=process.argv[2];
if(!filename){console.error('Usage: node scripts/audit-backup-library.cjs sauvegarde.json');process.exit(2)}
const backup=JSON.parse(fs.readFileSync(filename,'utf8'));
const source=fs.readFileSync(path.resolve(__dirname,'../src/main.tsx'),'utf8');
const catalogue=source.match(/const STANDARD_EXERCISES: Exercise\[\] = \[([\s\S]*?)\]\.map\(/);
if(!catalogue)throw new Error('Catalogue standard introuvable : audit annulé');
const standard=new Set([...catalogue[1].matchAll(/^\s*\[\s*['"]([^'"]+)['"]\s*,/gm)].map(m=>'std:'+m[1]));
const custom=new Set((backup.customExercises||[]).map(e=>e.id));
const templates=new Set((backup.workoutTemplates||[]).map(e=>e.id));
const programs=new Set((backup.trainingPrograms||[]).map(e=>e.id));
const planned=new Set((backup.plannedWorkouts||[]).map(e=>e.id));
const issues=[];
const issue=(context,type,ref)=>issues.push({context,type,ref});
function exercise(id,context){if(id&&!standard.has(id)&&!custom.has(id))issue(context,'exercise-reference',id)}
function template(id,context){if(id&&!templates.has(id))issue(context,'template-reference',id)}
function program(id,context){if(id&&!programs.has(id))issue(context,'program-reference',id)}
function snapshot(target,context){const s=target.muscleSnapshot;if(!s)return;if(s.exerciseId!==target.exerciseId)issue(context,'snapshot-exercise-mismatch',s.exerciseId);if(target.variantId&&s.variantId!==target.variantId)issue(context,'snapshot-variant-mismatch',s.variantId)}
for(const t of backup.workoutTemplates||[])for(const x of t.targets||[]){exercise(x.exerciseId,t.id);snapshot(x,t.id)}
for(const p of backup.trainingPrograms||[])for(const id of p.templateIds||[])template(id,p.id);
for(const p of backup.plannedWorkouts||[]){template(p.templateId,p.id);program(p.programId,p.id)}
for(const e of backup.executions||[]){template(e.templateId,e.id);if(e.plannedId&&!planned.has(e.plannedId))issue(e.id,'planned-reference',e.plannedId);for(const x of e.targets||[]){exercise(x.exerciseId,e.id);snapshot(x,e.id)}}
const counts=Object.fromEntries(['customExercises','workoutTemplates','trainingPrograms','plannedWorkouts','executions'].map(k=>[k,(backup[k]||[]).length]));
console.log(JSON.stringify({format:backup.format,version:backup.version,standardExercises:standard.size,counts,issues},null,2));
process.exitCode=issues.length?1:0;
