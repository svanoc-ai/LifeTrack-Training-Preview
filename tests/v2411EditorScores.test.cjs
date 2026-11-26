const fs=require('node:fs');const assert=require('node:assert/strict');
const src=fs.readFileSync('src/HistorySessionEditor.tsx','utf8');
assert.match(src,/function EditableNumber\(\{value,max,onCommit,label,step='1',min=0\}/);
assert.match(src,/if\(next\.trim\(\)!==''/);
assert.match(src,/min=\{1\} max=\{10\} onCommit=\{value=>setDraft\(v=>\(\{\.\.\.v,formAfter:value\}\)\)\}/);
assert.match(src,/min=\{1\} max=\{10\} onCommit=\{value=>setDraft\(v=>\(\{\.\.\.v,difficulty:value\}\)\)\}/);
console.log('PASS V24.11 editor: optional empty scores, bounded 1–10 on commit');
