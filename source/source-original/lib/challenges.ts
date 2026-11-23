export function utcDay(date=new Date()){return date.toISOString().slice(0,10)}
export function seededRandom(seed:string){
 let n=2166136261;for(const char of seed)n=Math.imul(n^char.charCodeAt(0),16777619);
 return ()=>{n+=0x6D2B79F5;let t=n;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296};
}
export function flightMedals(score:number,rescues:number,duration:number){
 const grade=(value:number,limits:number[])=>value>=limits[2]?"gold":value>=limits[1]?"silver":value>=limits[0]?"bronze":"unranked";
 return [{name:"Score",grade:grade(score,[1000,3000,8000]),value:score},{name:"Rescue",grade:grade(rescues,[1,3,5]),value:rescues},{name:"Survival",grade:grade(duration,[45,90,180]),value:Math.floor(duration)}];
}
export function readDailyRecord(raw:string|null){try{const r=JSON.parse(raw??"null");if(r&&/^\d{4}-\d{2}-\d{2}$/.test(r.day)&&Number.isFinite(r.score)&&r.score>=0&&r.score<1e12)return {day:String(r.day),score:Math.floor(r.score)}}catch{}return {day:"",score:0}}
