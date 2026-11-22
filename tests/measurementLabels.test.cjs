const assert=require('node:assert/strict');const {test}=require('node:test');const {resolve}=require('node:path');const {pathToFileURL}=require('node:url');
(async()=>{const m=await import(pathToFileURL(resolve(__dirname,'../src/measurementLabels.ts')).href);
 test('libellé élastiques / SmartPress',()=>{assert.equal(m.loadLabel(['SmartPress']),'Résistance nominale (kg)');assert.equal(m.loadLabel(['Bandes élastiques']),'Résistance nominale (kg)')});
 test('libellé poids libre / machine et poids du corps',()=>{assert.equal(m.loadLabel(['Haltères']),'Charge (kg)');assert.equal(m.loadLabel(['Poids de corps']),'Charge additionnelle (kg)')});
})().catch(e=>{console.error(e);process.exitCode=1});
