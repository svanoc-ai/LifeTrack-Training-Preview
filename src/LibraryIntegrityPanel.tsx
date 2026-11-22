import {useEffect,useState} from 'react';
import {STANDARD_VARIANTS} from './muscleRegistry';
import {auditLibraryLinks,type RefExercise,type RefTemplate,type RefProgram,type RefPlan,type RefExecution} from './libraryIntegrity';
const read=<T,>(db:IDBDatabase,name:string):Promise<T[]>=>new Promise((resolve,reject)=>{const tx=db.transaction(name,'readonly');const request=tx.objectStore(name).getAll();request.onsuccess=()=>resolve(request.result as T[]);request.onerror=()=>reject(request.error);tx.onabort=()=>reject(tx.error)});
export default function LibraryIntegrityPanel({db,exercises}:{db:IDBDatabase|null;exercises:RefExercise[]}){
 const [open,setOpen]=useState(false),[loading,setLoading]=useState(false),[error,setError]=useState('');
 const [report,setReport]=useState<ReturnType<typeof auditLibraryLinks>|null>(null);
 useEffect(()=>{setReport(null)},[db]);
 const run=async()=>{if(!db)return;setLoading(true);setError('');try{
  const [templates,programs,plans,executions]=await Promise.all([read<RefTemplate>(db,'workoutTemplates'),read<RefProgram>(db,'trainingPrograms'),read<RefPlan>(db,'plannedWorkouts'),read<RefExecution>(db,'executions')]);
  setReport(auditLibraryLinks({exercises,variants:STANDARD_VARIANTS,templates,programs,plans,executions}));
 }catch(e){setError('Audit indisponible : '+String(e))}finally{setLoading(false)}};
 return <section className="panel lt-library-integrity" aria-label="Contrôle des liens de la bibliothèque">
  <div className="panel-heading"><div><h2>Intégrité des données liées</h2><p className="muted small">Bibliothèque → programmes → séances → historique → anatomie. Contrôle local en lecture seule.</p></div><button type="button" className="secondary-button" onClick={()=>setOpen(v=>!v)} aria-expanded={open}>{open?'Masquer':'Contrôler'}</button></div>
  {open&&<><button type="button" className="primary-button" disabled={!db||loading} onClick={()=>void run()}>{loading?'Analyse…':report?'Relancer le contrôle':'Analyser les liens'}</button>
  {error&&<p role="alert" className="storage-error">{error}</p>}
  {report&&<><div className="lt-library-integrity-metrics"><div><strong>{report.stats.exercises}</strong><span>Exercices</span></div><div><strong>{report.stats.templates}</strong><span>Séances types</span></div><div><strong>{report.stats.programs}</strong><span>Programmes</span></div><div><strong>{report.stats.executions}</strong><span>Historiques</span></div><div><strong>{report.stats.snapshots}</strong><span>Instantanés 3D</span></div><div><strong>{report.stats.unclassified}</strong><span>Cibles anciennes non classées</span></div></div>
  <p role="status"><strong>{report.issues.length} point(s) à examiner</strong> · {report.stats.plans} planifications contrôlées.</p>
  {report.stats.unclassified>0&&<p className="muted small">Les cibles historiques sans instantané ne sont pas reclassées automatiquement : leur anatomie reste non attribuée.</p>}
  {report.issues.length===0?<p className="muted small">Aucune référence incohérente détectée parmi les contrôles disponibles. Cela ne garantit pas la justesse biomécanique des fiches.</p>:<div className="lt-library-integrity-issues">{report.issues.slice(0,40).map((issue,i)=><div key={`${issue.area}-${issue.recordId}-${i}`}><strong>{issue.area}</strong><span>{issue.recordId} · {issue.detail}</span></div>)}{report.issues.length>40&&<p className="muted small">40 premières anomalies affichées sur {report.issues.length}.</p>}</div>}
  </>}
  </>}
 </section>;
}
