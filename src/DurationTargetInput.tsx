export default function DurationTargetInput({seconds,onChange,invalid}:{seconds:number|undefined;onChange:(value:number|undefined)=>void;invalid:boolean}) {
 return <label className={`target-field lt-premium-seconds${invalid?' lt-v17-field-invalid':''}`}>Maintien cible
  <span className="lt-premium-seconds-wrap"><input aria-label="Durée cible en secondes" aria-invalid={invalid} type="number" inputMode="numeric" min="1" max="14400" step="1" value={seconds??''} onFocus={e=>e.currentTarget.select()} onChange={e=>{const raw=e.target.value;onChange(raw===''?undefined:Math.min(14400,Math.max(0,Number(raw))))}}/><span>s</span></span>
 </label>;
}
