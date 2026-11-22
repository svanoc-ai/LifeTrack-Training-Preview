const assert=require('node:assert/strict');const fs=require('node:fs');const read=n=>fs.readFileSync('src/'+n,'utf8');
const session=read('SessionExecution.tsx');assert.match(session,/plans\.some\(p=>p\.id===requestedPlan\)/);assert.match(session,/setChoice\('plan:'\+requestedPlan\)/);assert.match(session,/SÉANCE PLANIFIÉE/);assert.match(session,/AVANT LA SÉANCE/);assert.match(session,/Commencer la séance/);assert.match(session,/plannedId:plan\?\.id\|\|null/);
const stats=read('StatsDashboard.tsx');assert.match(stats,/selectedSession/);assert.match(stats,/scopedExecutions/);assert.match(stats,/all<\{id:string;name:string\}>\(db,'customExercises'\)/);assert.match(stats,/exerciseNames=\{exerciseNames\}/);
const progress=read('StatsProgression.tsx');assert.match(progress,/exerciseNames\[id\]/);assert.match(progress,/Exercice personnalisé \(nom indisponible\)/);
const program=read('ProgramEditor.tsx');assert.match(program,/Supprimer définitivement/);assert.match(program,/programId:null/);assert.match(program,/pending\.length/);
console.log('PASS V25 consolidation: planned launch, preflight, session statistics, custom labels, safe program deletion');
