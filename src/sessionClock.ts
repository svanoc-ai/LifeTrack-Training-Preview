/** V23 - Horloge de séance : temps actif, récupération et interruption séparés.
 * Les anciennes exécutions ne possèdent pas restMs : elles sont lisibles mais
 * leur répartition historique actif/repos n'est pas reconstructible.
 */
export type RestRecord = {kind:'series'|'exercise'|'round';plannedSeconds:number;actualMs:number;startedAt:string;endedAt?:string|null};
export type ClockState = {
 status:'active'|'paused'|'completed'|'partial'|'abandoned';
 activeMs:number; pauseMs:number; restMs?:number;
 lastTick:string; updatedAt:string;
 restUntil?:string|null; restStartedAt?:string|null; restRemainingMs?:number;
 restDurationSeconds?:number; restKind?:'series'|'exercise'|'round'; restRecords?:RestRecord[];
 completionPending?:boolean;
};
const at=(value:string|undefined|null):number=>value?Date.parse(value):NaN;
const valid=(n:number)=>Number.isFinite(n)?n:0;
const iso=(time:number)=>new Date(time).toISOString();
export function advanceClock<T extends ClockState>(state:T, now=Date.now()):T {
 const previous=at(state.lastTick);
 const delta=state.completionPending?0:Math.max(0,Math.min(86_400_000,now-valid(previous)));
 let recovery=0;
 if(delta&&state.status==='active'&&state.restUntil&&state.restStartedAt){
  const start=at(state.restStartedAt),end=at(state.restUntil);
  if(Number.isFinite(start)&&Number.isFinite(end)){
   recovery=Math.max(0,Math.min(now,end)-Math.max(previous,start));
   recovery=Math.min(delta,recovery);
  }
 }
 const records=recovery>0&&state.restRecords?.length?state.restRecords.map((record,i)=>
  i===state.restRecords!.length-1&&record.endedAt==null?{...record,actualMs:record.actualMs+recovery}:record):state.restRecords;
 return {...state,restRecords:records,activeMs:state.activeMs+(state.status==='active'?delta-recovery:0),
  restMs:state.restMs===undefined&&recovery===0?undefined:(state.restMs??0)+recovery,
  pauseMs:state.pauseMs+(state.status==='paused'?delta:0),lastTick:iso(now),updatedAt:iso(now)};
}
export function beginRestClock<T extends ClockState>(state:T, seconds:number, now=Date.now(),kind:'series'|'exercise'|'round'='series'):T {
 const saved=advanceClock(state,now);
 const time=Math.max(0,Math.min(3600,Math.round(seconds)))*1000;
 return {...saved,restMs:saved.restMs??0,restKind:kind,restRecords:time?[...(saved.restRecords??[]),{kind,plannedSeconds:time/1000,actualMs:0,startedAt:iso(now),endedAt:null}]:saved.restRecords,restStartedAt:time?iso(now):null,
  restUntil:time?iso(now+time):null,restRemainingMs:0,restDurationSeconds:time/1000};
}
export function stopRestClock<T extends ClockState>(state:T, now=Date.now()):T {
 const saved=advanceClock(state,now);
 const records=saved.restRecords?.map((record,i)=>i===saved.restRecords!.length-1&&record.endedAt==null?{...record,endedAt:iso(Math.min(now,Number.isFinite(at(saved.restUntil))?at(saved.restUntil):now))}:record);
 return {...saved,restRecords:records,restUntil:null,restStartedAt:null,restRemainingMs:0,restDurationSeconds:0};
}
export function pauseClock<T extends ClockState>(state:T, now=Date.now()):T {
 const saved=advanceClock(state,now);
 return {...saved,status:'paused',restRemainingMs:saved.restUntil?Math.max(0,at(saved.restUntil)-now):saved.restRemainingMs??0,
  restUntil:null,restStartedAt:null};
}
export function resumeClock<T extends ClockState>(state:T, now=Date.now()):T {
 const saved=advanceClock(state,now),remaining=Math.max(0,saved.restRemainingMs??0);
 return {...saved,status:'active',restUntil:remaining?iso(now+remaining):null,
  restStartedAt:remaining?iso(now):null,restRemainingMs:0};
}
export function adjustRestClock<T extends ClockState>(state:T, seconds:number, now=Date.now(),kind:'series'|'exercise'|'round'='series'):T {
 const saved=advanceClock(state,now);
 if(!saved.restUntil)return saved;
 const next=Math.max(now,at(saved.restUntil)+seconds*1000);
 return {...saved,restUntil:iso(next),restDurationSeconds:Math.max(0,(saved.restDurationSeconds??0)+seconds)};
}
export function sessionTotalMs(s:ClockState):number{return s.activeMs+(s.restMs??0)}
export function hasMeasuredRest(s:ClockState):boolean{return Number.isFinite(s.restMs)}
