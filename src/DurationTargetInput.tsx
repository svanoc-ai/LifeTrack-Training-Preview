import {useEffect,useRef,useState} from 'react';
import {formatTargetDuration,parseTargetDuration} from './targetDuration';
export default function DurationTargetInput({seconds,onChange,invalid}:{seconds:number|undefined;onChange:(value:number|undefined)=>void;invalid:boolean}) {
 const [text,setText]=useState(()=>formatTargetDuration(seconds));
 const [malformed,setMalformed]=useState(false);
 const editing=useRef(false);
 // Ne pas reformater pendant la frappe : iOS doit pouvoir saisir 1:02:00
 // sans que le champ ne redevienne 00:01 après le premier caractère.
 useEffect(()=>{if(!editing.current)setText(formatTargetDuration(seconds))},[seconds]);
 const change=(raw:string)=>{
  setText(raw);
  const result=parseTargetDuration(raw);
  setMalformed(result===null);
  if(result!==null)onChange(result);
 };
 return <label className={`target-field${invalid||malformed?' lt-v17-field-invalid':''}`}>
  Durée cible par série (min:s ou h:min:s)
  <input className={`profile-input${invalid||malformed?' lt-v18-invalid-input':''}`} aria-invalid={invalid||malformed} type="text" inputMode="text" autoComplete="off" placeholder="00:30 ou 1:02:00" value={text}
   onFocus={e=>{editing.current=true;e.currentTarget.select()}} onChange={e=>change(e.target.value)}
   onBlur={()=>{editing.current=false;const parsed=parseTargetDuration(text);if(parsed===null){setMalformed(true);onChange(undefined)}else{setMalformed(false);setText(formatTargetDuration(parsed))}}}/>
  <small className="muted">Valeur stockée en secondes · maximum 4 h</small>
 </label>;
}
