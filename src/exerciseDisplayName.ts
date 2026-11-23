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
