import {useEffect,useState} from 'react';

const TEST_STORES = ['workoutTemplates','trainingPrograms','plannedWorkouts','executions'] as const;
type Counts = Record<(typeof TEST_STORES)[number],number>;
const EMPTY:Counts = {workoutTemplates:0,trainingPrograms:0,plannedWorkouts:0,executions:0};

/** An atomic, scoped reset: never touches profiles, settings, customExercises or metadata. */
export function clearFictionalTrainingData(db:IDBDatabase):Promise<void>{
 return new Promise((resolve,reject)=>{
  let tx:IDBTransaction;
  try { tx=db.transaction([...TEST_STORES],'readwrite');
   for(const name of TEST_STORES)tx.objectStore(name).clear();
  }catch(e){reject(e);return;}
  tx.oncomplete=()=>resolve();
  tx.onerror=()=>reject(tx.error||new Error('Transaction de nettoyage interrompue'));
  tx.onabort=()=>reject(tx.error||new Error('Transaction de nettoyage annulée'));
 });
}
const countData=(db:IDBDatabase):Promise<Counts>=>new Promise((resolve,reject)=>{
 const counts={...EMPTY};
 let tx:IDBTransaction;
 try{tx=db.transaction([...TEST_STORES],'readonly');
  for(const name of TEST_STORES){const request=tx.objectStore(name).count();request.onsuccess=()=>{counts[name]=request.result};}
 }catch(e){reject(e);return;}
 tx.oncomplete=()=>resolve(counts);
 tx.onerror=()=>reject(tx.error||new Error('Lecture impossible'));
 tx.onabort=()=>reject(tx.error||new Error('Lecture interrompue'));
});
export default function TestDataCleanup({db}:{db:IDBDatabase|null}){
 const [counts,setCounts]=useState<Counts|null>(null);
 const [ack,setAck]=useState(false),[phrase,setPhrase]=useState(''),[busy,setBusy]=useState(false);
 const [message,setMessage]=useState(''),[error,setError]=useState('');
 useEffect(()=>{setCounts(null);setAck(false);setPhrase('')},[db]);
 const inspect=async()=>{if(!db||busy)return;setBusy(true);setError('');setMessage('');try{setCounts(await countData(db));setAck(false);setPhrase('')}catch(e){setError(String(e))}finally{setBusy(false)}};
 const clear=async()=>{
  if(!db||busy||!counts||!ack||phrase!=='EFFACER TESTS')return;
  // Confirm one last time; the exact stores and number of records are shown beforehand.
  if(!window.confirm('Supprimer définitivement les séances types, programmes, planifications et historiques de test de CET environnement ?\n\nLes exercices standards et personnalisés, le profil et les préférences seront conservés.\n\nCette opération est irréversible sans sauvegarde JSON.'))return;
  setBusy(true);setError('');setMessage('');
  try{await clearFictionalTrainingData(db);const remaining=await countData(db);
   if(Object.values(remaining).some(n=>n!==0))throw new Error('Des données de test subsistent : recharge et relance le contrôle.');
   setCounts(remaining);setAck(false);setPhrase('');setMessage('Nettoyage terminé. Les quatre collections de test sont vides. Recharge l’application puis relance l’audit de la bibliothèque.');
  }catch(e){setError('Nettoyage non confirmé : '+String(e))}finally{setBusy(false)}
 };
 return <section className="panel lt-test-cleanup" aria-label="Nettoyage sélectif des données de test">
  <h2>Nettoyage des données fictives</h2>
  <p className="muted small">Uniquement dans cet environnement Safari ou PWA. Les exercices standards, les exercices personnalisés (dont Gainage latéral), le profil, le matériel enregistré dans les préférences et les réglages sont conservés.</p>
  <p className="muted small"><strong>Avant de continuer :</strong> utilise « Exporter JSON » ci-dessus et vérifie que le fichier est bien enregistré dans Fichiers.</p>
  <button type="button" className="secondary-button" disabled={!db||busy} onClick={()=>void inspect()}>{busy?'Traitement…':'Examiner les données à supprimer'}</button>
  {counts&&<div>
   <div className="lt-library-integrity-metrics">
    <div><strong>{counts.workoutTemplates}</strong><span>Séances types</span></div>
    <div><strong>{counts.trainingPrograms}</strong><span>Programmes</span></div>
    <div><strong>{counts.plannedWorkouts}</strong><span>Planifications</span></div>
    <div><strong>{counts.executions}</strong><span>Historiques et instantanés associés</span></div>
   </div>
   {Object.values(counts).some(n=>n>0)&&<>
    <label className="lt-cleanup-confirm"><input type="checkbox" checked={ack} onChange={e=>setAck(e.target.checked)}/> J’ai enregistré et vérifié ma sauvegarde JSON. Je confirme que toutes ces données sont fictives.</label>
    <label className="field-label">Pour confirmer, saisir EFFACER TESTS<input className="profile-input" autoComplete="off" value={phrase} onChange={e=>setPhrase(e.target.value)} /></label>
    <button type="button" className="secondary-button" disabled={busy||!ack||phrase!=='EFFACER TESTS'} onClick={()=>void clear()}>Supprimer uniquement ces données de test</button>
   </>}
  </div>}
  {message&&<p role="status" className="muted small">{message}</p>}
  {error&&<p role="alert" className="storage-error">{error}</p>}
 </section>;
}
