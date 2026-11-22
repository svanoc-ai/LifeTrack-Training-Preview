/** Read-only 20-group taxonomy for exercise snapshots.
 * Never mutates 12-group history or infers anatomy from an exercise name.
 * Volumes are model-based training contributions, NOT measured activation.
 */
import type {Execution} from './SessionExecution';
import {MUSCLE_GROUPS,type MuscleId} from './muscleRegistry';
export const GROUPS_20 = [
 'Pectoraux','Grand dorsal','Trapèzes','Rhomboïdes','Lombaires',
 'Deltoïdes antérieurs','Deltoïdes latéraux','Deltoïdes postérieurs',
 'Biceps','Triceps','Avant-bras','Abdominaux','Obliques','Fessiers',
 'Abducteurs','Adducteurs','Quadriceps','Ischio-jambiers','Mollets','Tibial antérieur'
] as const;
export type Group20=(typeof GROUPS_20)[number];
export type Summary20={taxonomyVersion:20;groups:Record<Group20,{primary:number;secondary:number;total:number}>;unknownSets:number;classifiedSets:number;unmappedMuscleIds:string[]};
const groupMap:Partial<Record<MuscleId,Group20>>={
 pectoralis_clavicular:'Pectoraux',pectoralis_sternocostal:'Pectoraux',
 latissimus:'Grand dorsal',teres_major:'Grand dorsal',trapezius:'Trapèzes',rhomboids:'Rhomboïdes',spinal_erectors:'Lombaires',
 deltoid_anterior:'Deltoïdes antérieurs',deltoid_lateral:'Deltoïdes latéraux',deltoid_posterior:'Deltoïdes postérieurs',
 biceps_brachii:'Biceps',brachialis:'Biceps',brachioradialis:'Avant-bras',
 triceps_long:'Triceps',triceps_lateral:'Triceps',triceps_medial:'Triceps',
 rectus_abdominis:'Abdominaux',transversus:'Abdominaux',obliques:'Obliques',quadratus_lumborum:'Lombaires',
 gluteus_maximus:'Fessiers',gluteus_medius:'Fessiers',gluteus_minimus:'Fessiers',
 rectus_femoris:'Quadriceps',vastus_medialis:'Quadriceps',vastus_lateralis:'Quadriceps',vastus_intermedius:'Quadriceps',
 biceps_femoris:'Ischio-jambiers',semitendinosus:'Ischio-jambiers',semimembranosus:'Ischio-jambiers',
 adductor_magnus:'Adducteurs',adductor_longus:'Adducteurs',adductor_brevis:'Adducteurs',gracilis:'Adducteurs',
 tensor_fasciae_latae:'Abducteurs',gastrocnemius:'Mollets',soleus:'Mollets'
};
/** Explicitly visible gaps are safer than guessed mappings (e.g. tibial antérieur). */
export function missingAnatomyIds():string[]{return [...new Set(Object.values(MUSCLE_GROUPS).flat())].filter(m=>!groupMap[m]);}
export function summary20FromSnapshots(sessions:readonly Execution[],start:string,end:string):Summary20{
 const groups=Object.fromEntries(GROUPS_20.map(k=>[k,{primary:0,secondary:0,total:0}])) as Summary20['groups'];
 const unmapped=new Set<string>();let unknownSets=0,classifiedSets=0;
 for(const session of sessions){if(!['completed','partial'].includes(session.status))continue;
  const date=(session.endedAt||session.updatedAt||session.startedAt).slice(0,10);if(date<start||date>end)continue;
  for(const [index,target] of session.targets.entries()){
   const count=(session.exerciseResults?.find(r=>r.index===index)?.sets??[]).filter(s=>s.validated!==false).length;
   if(!count)continue;
   const mapping=target.muscleSnapshot?.mapping;
   if(!mapping||target.muscleSnapshot?.exerciseId!==target.exerciseId||!Array.isArray(mapping.primary)||!Array.isArray(mapping.secondary)){
    unknownSets+=count;continue;
   }
   const primary=new Set<Group20>(),secondary=new Set<Group20>();let invalid=false;
   for(const id of mapping.primary){const group=groupMap[id];if(!group){unmapped.add(id);invalid=true;}else primary.add(group);}
   for(const id of mapping.secondary){const group=groupMap[id];if(!group){unmapped.add(id);invalid=true;}else if(!primary.has(group))secondary.add(group);}
   if(invalid||!primary.size){unknownSets+=count;continue;}
   classifiedSets+=count;
   for(const group of primary){groups[group].primary+=count;groups[group].total+=count;}
   for(const group of secondary){groups[group].secondary+=count*.25;groups[group].total+=count*.25;}
  }
 }
 return {taxonomyVersion:20,groups,unknownSets,classifiedSets,unmappedMuscleIds:[...unmapped].sort()};
}
