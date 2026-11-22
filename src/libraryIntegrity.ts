/** Audit en lecture seule des liens du référentiel. Ne modifie jamais les archives. */
export type RefExercise={id:string;name:string;archived?:boolean};
export type RefTemplate={id:string;name:string;targets:{exerciseId:string;variantId?:string}[]};
export type RefProgram={id:string;name:string;templateIds:string[]};
export type RefPlan={id:string;templateId:string;programId?:string|null};
export type RefExecution={id:string;templateId?:string;plannedId?:string|null;targets:{exerciseId:string;variantId?:string;muscleSnapshot?:{exerciseId:string;variantId:string;mapping?:unknown}|null}[];status:string};
export type IntegrityIssue={area:'Bibliothèque'|'Programmes'|'Calendrier'|'Historique'|'Anatomie';recordId:string;detail:string};
export function auditLibraryLinks(input:{exercises:RefExercise[];variants:readonly {id:string;exerciseId:string}[];templates:RefTemplate[];programs:RefProgram[];plans:RefPlan[];executions:RefExecution[]}):{issues:IntegrityIssue[];stats:{exercises:number;templates:number;programs:number;plans:number;executions:number;snapshots:number;unclassified:number}}{
 const {exercises,variants,templates,programs,plans,executions}=input;
 const ids=new Set(exercises.map(x=>x.id)),variantMap=new Map(variants.map(v=>[v.id,v.exerciseId]));
 const templateIds=new Set(templates.map(x=>x.id)),programIds=new Set(programs.map(x=>x.id)),planIds=new Set(plans.map(x=>x.id));
 const issues:IntegrityIssue[]=[];let snapshots=0,unclassified=0;
 const add=(area:IntegrityIssue['area'],recordId:string,detail:string)=>issues.push({area,recordId,detail});
 for(const v of variants)if(!ids.has(v.exerciseId))add('Bibliothèque',v.id,`Variante sans exercice : ${v.exerciseId}`);
 for(const t of templates)for(const x of t.targets||[]){if(!ids.has(x.exerciseId))add('Bibliothèque',t.name||t.id,`Exercice absent : ${x.exerciseId}`);if(x.variantId&&variantMap.has(x.variantId)&&variantMap.get(x.variantId)!==x.exerciseId)add('Bibliothèque',t.name||t.id,`Variante liée à un autre exercice : ${x.variantId}`);if(x.variantId&&!variantMap.has(x.variantId))add('Bibliothèque',t.name||t.id,`Variante non reconnue : ${x.variantId}`);}
 for(const p of programs)for(const id of p.templateIds||[])if(!templateIds.has(id))add('Programmes',p.name||p.id,`Séance type absente : ${id}`);
 for(const p of plans){if(!templateIds.has(p.templateId))add('Calendrier',p.id,`Séance type absente : ${p.templateId}`);if(p.programId&&!programIds.has(p.programId))add('Calendrier',p.id,`Programme absent : ${p.programId}`);}
 for(const e of executions){
  // Les séances exécutées conservent une copie des cibles ; une séance type supprimée n'est pas une corruption historique.
  if(e.plannedId&&!planIds.has(e.plannedId))add('Historique',e.id,`Planification d'origine absente : ${e.plannedId}`);
  for(const x of e.targets||[]){
   if(!ids.has(x.exerciseId))add('Historique',e.id,`Exercice absent du référentiel actuel : ${x.exerciseId} (historique conservé)`);
   if(x.muscleSnapshot){snapshots++;if(x.muscleSnapshot.exerciseId!==x.exerciseId||x.variantId&&x.muscleSnapshot.variantId!==x.variantId)add('Anatomie',e.id,`Instantané anatomique incohérent : ${x.exerciseId}`);}
   else if(e.status==='completed'||e.status==='partial')unclassified++;
  }
 }
 return {issues,stats:{exercises:exercises.length,templates:templates.length,programs:programs.length,plans:plans.length,executions:executions.length,snapshots,unclassified}};
}
