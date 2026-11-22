/** Durées cibles : les secondes sont l'unique unité de persistance. */
export const MAX_TARGET_SECONDS=14_400; // 4 h, couvre les exercices longs sans modifier le schéma JSON.
export function formatTargetDuration(seconds:number|undefined):string {
 if(seconds===undefined||!Number.isFinite(seconds))return '';
 const total=Math.max(0,Math.floor(seconds)),s=String(total%60).padStart(2,'0');
 if(total<3600)return `${String(Math.floor(total/60)).padStart(2,'0')}:${s}`;
 return `${Math.floor(total/3600)}:${String(Math.floor(total%3600/60)).padStart(2,'0')}:${s}`;
}
/** undefined = vide, null = syntaxe invalide, nombre = secondes valides. */
export function parseTargetDuration(text:string):number|null|undefined {
 const raw=text.trim();if(!raw)return undefined;
 if(!/^\d+(?::\d{1,2}){0,2}$/.test(raw))return null;
 const a=raw.split(':').map(Number);
 let total:number;
 if(a.length===1)total=a[0];
 else if(a.length===2){if(a[1]>59)return null;total=a[0]*60+a[1];}
 else {if(a[1]>59||a[2]>59)return null;total=a[0]*3600+a[1]*60+a[2];}
 return Number.isInteger(total)&&total>=1&&total<=MAX_TARGET_SECONDS?total:null;
}
