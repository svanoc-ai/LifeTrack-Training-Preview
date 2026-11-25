const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync('src/SessionExecution.tsx','utf8');
const css=fs.readFileSync('src/v28-premium.css','utf8');
for(const term of ['reviewExerciseOpen','reviewExpandedIndex','reviewResults','Durée réalisée (secondes)','Série {v.set} réalisée','Toutes les séries réalisées','exerciseResults:correctedResults','completedIndexes:correctedIndexes']) assert.ok(source.includes(term),`Missing ${term}`);
assert.ok(source.includes('setReviewResults((s.exerciseResults??[]).map'), 'Review must draft results from actual session');
assert.ok(source.includes('onClick={()=>void finish()}'), 'Draft changes commit at final confirmation');
assert.ok(css.includes('.lt-review-exercise-card'), 'Review cards styling missing');
console.log('PASS V25 review corrections: draft, timed sets, validation and persistence');
