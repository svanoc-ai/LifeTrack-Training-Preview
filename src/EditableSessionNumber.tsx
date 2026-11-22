import {useEffect,useState} from 'react';

/** Keep a numeric input editable while blank; commit only a complete valid number. */
export default function EditableSessionNumber({value,onCommit,max,step='1',disabled=false,label}:{value:number;onCommit:(value:number)=>void;max:number;step?:string;disabled?:boolean;label:string}){
 const [draft,setDraft]=useState(String(value));
 const [focused,setFocused]=useState(false);
 useEffect(()=>{if(!focused)setDraft(String(value))},[value,focused]);
 const commit=()=>{
  setFocused(false);
  const raw=draft.trim().replace(',','.');
  if(raw===''){setDraft(String(value));return;}
  const parsed=Number(raw);
  if(!Number.isFinite(parsed)||parsed<0||parsed>max){setDraft(String(value));return;}
  const next=step==='1'?Math.round(parsed):parsed;
  setDraft(String(next));
  if(next!==value)onCommit(next);
 };
 return <input aria-label={label} type="number" min="0" max={max} step={step} inputMode={step==='1'?'numeric':'decimal'} className="profile-input" value={draft} disabled={disabled} onFocus={e=>{setFocused(true);e.currentTarget.select()}} onChange={e=>setDraft(e.target.value)} onBlur={commit} onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.blur()}}/>;
}
