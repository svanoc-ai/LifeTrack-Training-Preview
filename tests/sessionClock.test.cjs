const assert=require('node:assert/strict');
const {test}=require('node:test');
const {pathToFileURL}=require('node:url');
const {resolve}=require('node:path');
(async()=>{
 const m=await import(pathToFileURL(resolve(__dirname,'../src/sessionClock.ts')).href);
 const at=t=>new Date(t).toISOString();
 const started=Date.parse('2026-11-22T09:00:00.000Z');
 const s={status:'active',activeMs:0,pauseMs:0,restMs:0,lastTick:at(started),updatedAt:at(started)};
 test('repos inter-séries : séparer temps actif et récupération effective',()=>{
  const running=m.advanceClock(s,started+20_000);
  const resting=m.beginRestClock(running,60,started+20_000);
  const midway=m.advanceClock(resting,started+45_000);
  assert.equal(midway.activeMs,20_000);assert.equal(midway.restMs,25_000);
  const finished=m.stopRestClock(midway,started+80_000);
  assert.equal(finished.restMs,60_000);assert.equal(finished.activeMs,20_000);assert.equal(finished.restRecords.length,1);assert.equal(finished.restRecords[0].plannedSeconds,60);assert.equal(finished.restRecords[0].actualMs,60_000);assert.ok(finished.restRecords[0].endedAt);
  assert.equal(m.sessionTotalMs(finished),80_000);
 });
 test('repos ignoré avant la clôture, activité après l’échéance',()=>{
  const r=m.beginRestClock(s,30,started);
  const end=m.stopRestClock(r,started+35_000);
  assert.equal(end.restMs,30_000);assert.equal(end.activeMs,5_000);
 });
 test('passer le repos arrête la récupération au bon moment',()=>{
  const r=m.beginRestClock(s,90,started);
  const stopped=m.stopRestClock(r,started+12_000);
  assert.equal(stopped.restMs,12_000);assert.equal(stopped.restRecords[0].plannedSeconds,90);assert.equal(stopped.restRecords[0].actualMs,12_000);
  assert.equal(stopped.restUntil,null);
  assert.equal(m.advanceClock(stopped,started+20_000).activeMs,8000);
 });
 test('pause durant un repos : minuterie gelée et interruption distincte',()=>{
  const r=m.beginRestClock(s,60,started);
  const paused=m.pauseClock(r,started+10_000);
  assert.equal(paused.restMs,10_000);assert.equal(paused.restRemainingMs,50_000);
  const resumed=m.resumeClock(paused,started+40_000);
  assert.equal(resumed.pauseMs,30_000);
  const complete=m.stopRestClock(resumed,started+90_000);
  assert.equal(complete.restMs,60_000);assert.equal(complete.activeMs,0);
  assert.equal(m.sessionTotalMs(complete),60_000);
 });
 test('ajustement plus 15 secondes et raccourcissement ne faussent pas la mesure',()=>{
  let r=m.beginRestClock(s,30,started);r=m.adjustRestClock(r,15,started+10_000);
  r=m.adjustRestClock(r,-15,started+20_000);
  assert.equal(m.stopRestClock(r,started+30_000).restMs,30_000);
 });
 test('persistance/reprise et anciennes séances compatibles',()=>{
  const legacy={...s};delete legacy.restMs;
  assert.equal(m.hasMeasuredRest(legacy),false);
  assert.equal(m.advanceClock(legacy,started+10_000).activeMs,10_000);
  const paused=m.pauseClock(m.beginRestClock(s,45,started),started+15_000);
  const saved=JSON.parse(JSON.stringify(paused));
  const restored=m.resumeClock(saved,started+25_000);
  assert.equal(m.stopRestClock(restored,started+55_000).restMs,45_000);
 });
})().catch(err=>{console.error(err);process.exitCode=1});
