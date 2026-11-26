import {loadLabel} from './measurementLabels';
import {useEffect,useState} from 'react';
import type {Execution,SetResult} from './SessionExecution';

type Props={session:Execution;exerciseNames:Record<string,string>;equipmentById:Record<string,string[]>;mode:'edit'|'delete';onSave:(session:Execution)=>Promise<void>;onDelete:(id:string)=>Promise<void>;onClose:()=>void};
const numeric=(value:string,max:number)=>Math.max(0,Math.min(max,Number(value)||0));
function EditableNumber({value,max,onCommit,label,step='1',min=0}:{value:number|null|undefined;max:number;onCommit:(value:number)=>void;label:string;step?:string;min?:number}){
 const [text,setText]=useState(value===null||value===undefined?'':String(value));
 useEffect(()=>setText(value===null||value===undefined?'':String(value)),[value]);
 return <label>{label}<input className="profile-input" type="number" inputMode={step==='1'?'numeric':'decimal'} min={min} max={max} step={step} value={text} onChange={e=>{const next=e.target.value;setText(next);if(next.trim()!==''&&Number.isFinite(Number(next)))onCommit(Math.max(min,numeric(next,max)))}} onBlur={()=>{if(text.trim()==='')setText(value===null||value===undefined?'':String(value));else {const next=Math.max(min,numeric(text,max));setText(String(next));onCommit(next)}}}/></label>
}
export default function HistorySessionEditor({session,exerciseNames,equipmentById,mode,onSave,onDelete,onClose}:Props){
 const [draft,setDraft]=useState<Execution>(()=>structuredClone(session));
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{setDraft(structuredClone(session));setError('')},[session.id]);
 const changeSet=(index:number,setNumber:number,field:keyof SetResult,value:number|boolean|null)=>{
  setDraft(prev=>({...prev,exerciseResults:(prev.exerciseResults||[]).map(r=>r.index!==index?r:{...r,sets:r.sets.map(s=>s.set!==setNumber?s:{...s,[field]:value})})}));
 };
 const save=async()=>{setBusy(true);setError('');try{const hasUncheckedSets=draft.exerciseResults?.some(r=>r.sets.some(s=>s.validated===false))??false;const completedIndexes=draft.targets.map((_,i)=>i).filter(i=>draft.exerciseResults?.find(r=>r.index===i)?.sets.some(s=>s.validated!==false)||draft.cardioResults?.some(r=>r.index===i));await onSave({...draft,completedIndexes,status:hasUncheckedSets||completedIndexes.length<draft.targets.length?'partial':'completed',updatedAt:new Date().toISOString()});onClose()}catch(e){setError(String(e))}finally{setBusy(false)}};
 const remove=async()=>{setBusy(true);setError('');try{await onDelete(session.id);onClose()}catch(e){setError(String(e))}finally{setBusy(false)}};
 const sessionDate=new Date(session.endedAt||session.updatedAt||session.startedAt);
 const dateLabel=Number.isNaN(sessionDate.getTime())?'Date inconnue':new Intl.DateTimeFormat('fr-FR',{dateStyle:'full'}).format(sessionDate);
 if(mode==='delete')return <div className="lt-history-editor lt-history-delete lt-v28-danger-panel" role="region" aria-label="Confirmer la suppression de la séance"><div className="lt-premium-modal-icon" aria-hidden="true">⚠</div>
  <h3>Suppression définitive de la séance</h3>
  <p><strong>{session.name?.trim()||'Séance d’entraînement'}</strong></p>
  <p className="muted">{dateLabel}</p>
  <p className="lt-premium-modal-danger" role="alert">⚠ Cette suppression est irréversible. Elle retire cette séance des statistiques et des recommandations.</p>
  {error&&<p role="alert">{error}</p>}
  <div className="lt-history-editor-actions"><button type="button" className="lt-premium-delete-button" disabled={busy} onClick={()=>void remove()}>{busy?'Suppression…':'Confirmer définitivement la suppression'}</button><button type="button" className="secondary-button" disabled={busy} onClick={onClose}>Conserver la séance</button></div>
 </div>;
 return <div className="lt-history-editor" role="region" aria-label="Modifier la séance enregistrée">
  <h3>Modifier la séance</h3><p className="muted small">Les corrections remplacent les valeurs enregistrées. Les objectifs de la séance type restent inchangés.</p>
  <label className="field-label">Commentaire<textarea className="profile-input" value={draft.comment||''} onChange={e=>setDraft(v=>({...v,comment:e.target.value}))}/></label>
  <div className="lt-history-editor-grid"><EditableNumber label="Forme après séance (1–10)" value={draft.formAfter} min={1} max={10} onCommit={value=>setDraft(v=>({...v,formAfter:value}))}/><EditableNumber label="Difficulté (1–10)" value={draft.difficulty} min={1} max={10} onCommit={value=>setDraft(v=>({...v,difficulty:value}))}/></div>
  {draft.exerciseResults?.map(r=>{const target=draft.targets[r.index];const timed=target?.executionMode==='maintien'||target?.executionMode==='effort-chronometre';const valid=r.sets.filter(s=>s.validated!==false).length;return <details key={r.index} className="lt-history-editor-exercise"><summary><strong>{r.index+1}. {exerciseNames[target?.exerciseId]||target?.exerciseId||'Exercice inconnu'}</strong><span>{valid}/{r.sets.length} séries validées</span></summary><div className="lt-history-editor-series">{r.sets.map(s=><details key={s.set} className="lt-history-editor-set"><summary><strong>Série {s.set}</strong><span>{s.validated===false?'Non réalisée':timed?`${s.durationSeconds??0} s`:`${s.reps} rép. · ${s.loadKg} kg`}</span></summary><div className="lt-history-editor-fields">{timed?<EditableNumber key={`${r.index}-${s.set}-duration`} label="Durée (s)" value={s.durationSeconds} max={86400} onCommit={v=>changeSet(r.index,s.set,'durationSeconds',v)}/>:<><EditableNumber key={`${r.index}-${s.set}-reps`} label="Rép." value={s.reps} max={999} onCommit={v=>changeSet(r.index,s.set,'reps',v)}/><EditableNumber key={`${r.index}-${s.set}-load`} label={loadLabel(equipmentById[target?.exerciseId])} value={s.loadKg} max={2000} step="0.5" onCommit={v=>changeSet(r.index,s.set,'loadKg',v)}/><label>RIR<select className="profile-input" value={s.rir===null?'':s.rir} onChange={e=>changeSet(r.index,s.set,'rir',e.target.value===''?null:Number(e.target.value))}><option value="">—</option>{[0,1,2,3,4,5,6].map(n=><option key={n} value={n}>{n===6?'5+':n}</option>)}</select></label></>}<label className="lt-history-editor-check"><input type="checkbox" checked={s.validated!==false} onChange={e=>changeSet(r.index,s.set,'validated',e.target.checked)}/> Réalisée</label></div></details>)}</div></details>})}
  {error&&<p role="alert">{error}</p>}
  <div className="lt-history-editor-actions"><button className="primary-button" disabled={busy} onClick={()=>void save()}>Enregistrer les corrections</button><button className="secondary-button" disabled={busy} onClick={onClose}>Annuler</button></div>
 </div>
}
