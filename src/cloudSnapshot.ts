// Compare snapshots independently of JSON object key order.
export function snapshotKey(value:any):string{
 if(Array.isArray(value))return '['+value.map(snapshotKey).join(',')+']';
 if(value&&typeof value==='object')return '{'+Object.keys(value).sort().filter(k=>value[k]!==undefined).map(k=>JSON.stringify(k)+':'+snapshotKey(value[k])).join(',')+'}';
 return JSON.stringify(value)??'null';
}
export function preserveLocalChanges(local:any,lastCloud:any,sameOwner:boolean){return sameOwner&&!!lastCloud&&snapshotKey(local)!==snapshotKey(lastCloud)}
