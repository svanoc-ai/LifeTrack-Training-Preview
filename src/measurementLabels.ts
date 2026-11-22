/** V23 : la nature de la charge dépend de l'équipement, pas du nom du mouvement. */
export type LoadNature='nominal-band'|'external-load'|'added-bodyweight';
export function loadNature(equipment:readonly string[]|undefined):LoadNature {
 const items=(equipment??[]).map(x=>x.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase());
 if(items.some(x=>/elastique|smartworkout|smartpress|bande|resistance elastique/.test(x)))return 'nominal-band';
 if(items.some(x=>/poids du corps|poids de corps|sans materiel/.test(x)))return 'added-bodyweight';
 return 'external-load';
}
export function loadLabel(equipment:readonly string[]|undefined):string {
 const nature=loadNature(equipment);
 return nature==='nominal-band'?'Résistance nominale (kg)':nature==='added-bodyweight'?'Charge additionnelle (kg)':'Charge (kg)';
}
export function loadHelp(equipment:readonly string[]|undefined):string|null {
 return loadNature(equipment)==='nominal-band'?'Valeur nominale des élastiques / du système SmartWorkout : elle ne correspond pas à une force mécanique constante.':null;
}
