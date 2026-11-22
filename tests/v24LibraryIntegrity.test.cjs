const assert=require('node:assert/strict');const fs=require('node:fs');const {spawnSync}=require('node:child_process');const os=require('node:os');const path=require('node:path');
const audit=path.resolve('scripts/audit-backup-library.cjs');
const backup=path.resolve('../lifetrack-training-backup-2026-11-22.json');
if(fs.existsSync(backup)){
 const run=spawnSync(process.execPath,[audit,backup],{encoding:'utf8'});assert.equal(run.status,0,run.stderr||run.stdout);const data=JSON.parse(run.stdout);assert.equal(data.standardExercises,69);assert.equal(data.counts.executions,21);assert.deepEqual(data.issues,[]);
 const tmp=path.join(os.tmpdir(),'lifetrack-integrity-'+process.pid+'.json');const b=JSON.parse(fs.readFileSync(backup));b.workoutTemplates[0].targets[0].exerciseId='std:missing-reference';fs.writeFileSync(tmp,JSON.stringify(b));try{const bad=spawnSync(process.execPath,[audit,tmp],{encoding:'utf8'});assert.equal(bad.status,1);assert.match(bad.stdout,/missing-reference/)}finally{fs.unlinkSync(tmp)}
}
const main=fs.readFileSync('src/main.tsx','utf8');assert.match(main,/missingLocal\.length > 0/);assert.match(main,/Restauration bloquée/);assert.match(main,/guardedStores/);assert.match(main,/missingCustom/);
console.log('PASS audit bibliothèque + protection restauration historique');
