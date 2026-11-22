const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const editor=read('src/WorkoutEditor.tsx');
assert.match(editor, /<details className="lt-premium-exercise">/);
assert.match(editor, /lt-premium-brief/);
assert.match(editor, /01 — Organisation/);
assert.match(editor, /02 — Performance/);
assert.match(editor, /03 — Récupération/);
assert.match(editor, /04 — Paramètres complémentaires/);
assert.match(editor, /Mode de réalisation<\/span>/);
assert.match(editor, /input\('RIR',t.rir/);
assert.match(editor, /input\(loadLabel\(ex\?\.equipment\),t.loadKg/);
assert.match(editor, /Plage min\. \(rép\.\)/);
for(const p of ['index.html','public/manifest.webmanifest','src/index.html','src/vite.config.ts']) {
 assert.doesNotMatch(read(p),/LifeTrack-Training-Test\//,p+' contains wrong Test deployment path');
}
assert.match(read('public/manifest.webmanifest'), /"start_url": "\/LifeTrack-Training-Preview\/"/);
assert.match(read('src/version.ts'),/2-G\.0\.3/);
assert.match(read('public/sw.js'),/2-G\.0\.3/);
console.log('PASS V24.2 carte Premium et URL de lancement PWA Preview');
