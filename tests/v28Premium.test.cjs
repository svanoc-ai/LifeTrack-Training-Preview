const fs=require('node:fs');const assert=require('node:assert/strict');const read=n=>fs.readFileSync('src/'+n,'utf8');
const a=read('AnatomyPrototype.tsx');assert.match(a,/lt-v28-anatomy-help/);assert.match(a,/anatomyHelp&&/);assert.match(a,/lt-v28-muscle-picker/);assert.match(a,/<details className="lt-v28-muscle-detail"/);assert.match(a,/CC BY-SA 4.0/);
const p=read('StatsProgression.tsx');assert.match(p,/maxPoints=32/);assert.match(p,/sampled\.map/);assert.match(p,/lt-v28-progression-advice/);
const s=read('StatsDashboard.tsx');assert.match(s,/sessionQuery\.trim\(\)\?sessionLimit:1/);
assert.match(read('main.tsx'),/v28-premium\.css/);assert.match(read('version.ts'),/2-G\.0\.13/);assert.match(fs.readFileSync('public/sw.js','utf8'),/2-G\.0\.13/);
console.log('PASS V24.8 premium anatomy, progression and session picker');
