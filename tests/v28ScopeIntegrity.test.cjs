const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync('src/StatsDashboard.tsx','utf8');
assert.match(source,/selectedSession\?'Non applicable à une séance'/,'Session-only adherence must not imply a global rate');
assert.match(source,/sessionQuery\.trim\(\)\.length>0&&<button/,'Do not offer show-more when showing latest session only');
assert.match(source,/selectedSession\?'—':fmt\(stats\.sessionsPerWeek\)/,'Session-only frequency must be non-applicable');
console.log('PASS V24.8: session-only KPIs and picker pagination');
