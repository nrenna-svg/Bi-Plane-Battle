import { PLANES,CHALLENGES,planeProgress,planeUnlocked,challengeValue,type Profile,type PlaneId } from "./progression";
export function flightReport(p:Profile,stats:Record<string,number|boolean>,lives:number,start:string[]){
 const aircraft=(Object.keys(PLANES) as PlaneId[]).filter(id=>!planeUnlocked(id,p)).map(id=>{const [value,target]=planeProgress(id,p);return{id,name:PLANES[id].name,value,target,detail:PLANES[id].requirement}}).sort((a,b)=>b.value/b.target-a.value/a.target).slice(0,3);
 const nearly=CHALLENGES.filter(c=>!p.completed.includes(c.id)).map(c=>{
  const original:Record<string,[number,number]>={"first-flight":[p.kills,20],"rescue-flight":[Number(stats.rescues),12],"clutch-landing":[Number(stats.clutchLandings),3],"flawless-boss":[lives===3?Number(stats.bosses):0,2]};
  const [value,target]=original[c.id]??[challengeValue(c,p,stats),c.target??1];return{id:c.id,name:c.name,value:Math.min(value,target),target,detail:c.detail};
 }).filter(c=>c.value>0).sort((a,b)=>b.value/b.target-a.value/a.target).slice(0,3);
 return{aircraft,nearly,earned:CHALLENGES.filter(c=>p.completed.includes(c.id)&&!start.includes(c.id)).map(c=>c.name)};
}
