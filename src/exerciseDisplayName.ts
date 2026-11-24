/** Editorial labels only: never rewrite exercise IDs, user records or historical snapshots. */
const approved:Record<string,string>={
 'developpe debout':'Développé debout',
 'développé debout':'Développé debout',
 'tirage horizontal':'Tirage horizontal',
 'curl biceps':'Curl biceps',
 'gainage lateral':'Gainage latéral',
 'gainage latéral':'Gainage latéral',
};
export function exerciseDisplayName(name:string):string{
 const key=name.trim().toLocaleLowerCase('fr-FR');
 return approved[key]??name;
}

/** Convert internal variant keys to readable UI labels without modifying persisted IDs. */
export function variantDisplayName(variantId:string|null|undefined):string{
 if(!variantId)return 'Variante non renseignée';
 const raw=variantId.replace(/^variant:/,'').replace(/^std:/,'').replace(/^custom:/,'');
 const parts=raw.split(':').filter(Boolean);
 const label=parts.map(part=>part.replace(/[-_]+/g,' ').trim()).join(' · ');
 if(!label)return 'Variante non renseignée';
 return label.charAt(0).toLocaleUpperCase('fr-FR')+label.slice(1);
}
