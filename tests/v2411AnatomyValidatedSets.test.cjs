const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
function load(file,imports={}){
 const exports={};
 const js=ts.transpileModule(fs.readFileSync('src/'+file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(js,{exports,require:id=>{if(!(id in imports))throw Error('Missing import '+id);return imports[id]},Object,Array,Set,Map,Number,Math,Date,String});
 return exports;
}
const registry=load('muscleRegistry.ts');
const {calculateMuscleStats}=load('muscleStats.ts',{'./muscleRegistry':registry});
const group=Object.keys(registry.MUSCLE_GROUPS)[0];
const muscle=Object.keys(registry.MUSCLE_GROUPS[group])[0];
// Use a real registry muscle ID, with a saved mapping as the app does.
const mapping={primary:['biceps_brachii'],secondary:[]};
const session={status:'partial',startedAt:'2026-11-26T10:00:00',endedAt:'2026-11-26T10:20:00',targets:[{exerciseId:'test-curl',muscleSnapshot:{exerciseId:'test-curl',mapping}}],exerciseResults:[{index:0,sets:[{set:1,reps:10,loadKg:20,validated:true},{set:2,reps:10,loadKg:20,validated:false}]}]};
const period={start:'2026-11-01',end:'2026-11-30'};
const partial=calculateMuscleStats([session],period);
assert.equal(partial.classifiedSets,1,'only the validated set is classified');
assert.equal(partial.unknownSets,0);
const none=calculateMuscleStats([{...session,exerciseResults:[{index:0,sets:session.exerciseResults[0].sets.map(s=>({...s,validated:false}))}]}],period);
assert.equal(none.classifiedSets,0,'unchecked exercise must contribute zero classified sets');
assert.equal(none.unknownSets,0);
assert.ok(Object.values(none.groups).every(g=>g.total===0),'unchecked exercise must contribute no weighted muscle volume');
assert.equal(Object.values(none.anatomy).reduce((a,b)=>a+b,0),0,'unchecked exercise must not color the anatomical model');
const legacy=calculateMuscleStats([{...session,exerciseResults:[{index:0,sets:[{set:1,reps:10,loadKg:20}]}]}],period);
assert.equal(legacy.classifiedSets,1,'legacy sets without validated flag remain included');
console.log('PASS V24.11 anatomy: unchecked sets excluded, legacy records preserved');
