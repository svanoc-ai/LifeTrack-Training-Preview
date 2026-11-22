const assert=require('node:assert/strict');const {test}=require('node:test');const {resolve}=require('node:path');const {pathToFileURL}=require('node:url');
(async()=>{const d=await import(pathToFileURL(resolve(__dirname,'../src/targetDuration.ts')).href);
 test('59:30 ↔ 1:02:00 sans perte de secondes',()=>{
  assert.equal(d.parseTargetDuration('59:30'),3570);assert.equal(d.parseTargetDuration('1:02:00'),3720);
  assert.equal(d.formatTargetDuration(3570),'59:30');assert.equal(d.formatTargetDuration(3720),'1:02:00');
  assert.equal(d.parseTargetDuration(d.formatTargetDuration(3720)),3720);
 });
 test('saisie vide conservée temporairement, erreurs explicites',()=>{
  assert.equal(d.parseTargetDuration(''),undefined);assert.equal(d.parseTargetDuration('1:62:00'),null);
  assert.equal(d.parseTargetDuration('00:00'),null);assert.equal(d.parseTargetDuration('4:00:01'),null);
 });
 test('ancienne cible en secondes demeure compatible',()=>{
  assert.equal(d.parseTargetDuration('30'),30);assert.equal(d.formatTargetDuration(30),'00:30');
 });
})().catch(e=>{console.error(e);process.exitCode=1});
