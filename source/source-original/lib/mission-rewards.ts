import { bankBlueprint } from "./blueprints";
import { STAGE_COUNT } from "./mission-catalog";
import { rewardMission } from "./workshop";
import type { Battle } from "./battle";
export const REFITS={
 hull:{name:"Reinforced hull",detail:"+1 hull; 5% lower top speed."},
 cooling:{name:"Cooling ducts",detail:"35% faster gun cooling; 5% less climb lift."},
 handling:{name:"Agile rigging",detail:"20% more steering acceleration; -1 hull (minimum 2)."},
 bombs:{name:"Bomb rack",detail:"Carry 4 bombs; 7% lower top speed. No free ammunition."}
} as const;
export type Refit=keyof typeof REFITS;
export type StageMetrics={shots:number;hits:number;damage:number;rescues:number;style:number;ground:number};
export type MissionResult={reward?:ReturnType<typeof rewardMission>;stage:number;grade:"S"|"A"|"B"|"C";points:number;accuracy:number|null;medals:string[]};
export const freshMetrics=():StageMetrics=>({shots:0,hits:0,damage:0,rescues:0,style:0,ground:0});
export function gradeMission(stage:number,m:StageMetrics):MissionResult{
 const accuracy=m.shots>=5?Math.min(1,m.hits/m.shots):null;
 const medals:string[]=[];if(m.damage===0)medals.push("Untouched");if(accuracy!==null&&accuracy>=.5)medals.push("Sharpshooter");if(m.rescues>=3)medals.push("Rescue Wings");if(m.style>=2)medals.push("Flight Artist");if(m.ground>=2)medals.push("Groundbreaker");
 const points=Math.max(0,Math.min(100,75-m.damage*12+(accuracy===null?0:accuracy*15)+Math.min(10,m.rescues*2)+Math.min(10,m.style*3)+Math.min(10,m.ground*3)));
 return {stage,points,accuracy,medals,grade:points>=90?"S":points>=75?"A":points>=55?"B":"C"};
}
export function finishMissionReport(g:Battle){
 if(!g.campaign)return;g.metrics.rescues=g.stats.rescues-g.stageStartRescues;
 g.metrics.style=g.style.nearMisses+g.style.landings+g.style.diveKills-g.stageStartStyle;
 const result=gradeMission(g.campaign.stage,g.metrics);result.reward=rewardMission(g.workshop,g.campaign.stage,{elapsed:g.campaign.elapsed,damage:g.metrics.damage,rescues:g.metrics.rescues,score:g.score-g.campaign.scoreStart,shots:g.metrics.shots,bombs:g.missionBombs,plane:g.activePlane});const recovered=bankBlueprint(g);if(recovered){result.medals.push("Blueprint recovered");if(g.profile.blueprints.length===5)result.medals.push("Lost Squadron paint unlocked");}g.lastReport=result;
 const prior=g.stageRecords[result.stage];if(!prior||result.points>prior.points)g.stageRecords[result.stage]=result;
 g.refitPending=g.campaign.stage<STAGE_COUNT-1;
}
export function selectRefit(g:Battle,id:string){
 if(!g.refitPending||g.finale||g.mode!=="playing"||!Object.hasOwn(REFITS,id))return false;
 g.refit=id as Refit;g.refitPending=false;g.player.hp=Math.min(g.player.hp,g.maxHp);g.bombAmmo=Math.min(g.bombAmmo,g.bombCapacity);g.sounds.push("pickup");return true;
}
export function readStageRecords(raw:string|null):Record<number,MissionResult>{
 const records:Record<number,MissionResult>={};
 try{const value=JSON.parse(raw??"{}");if(!value||typeof value!=="object")return records;for(let i=0;i<STAGE_COUNT;i++){const r=value[i];if(r&&r.stage===i&&["S","A","B","C"].includes(r.grade)&&Number.isFinite(r.points)&&r.points>=0&&r.points<=100){records[i]={stage:i,grade:r.grade,points:r.points,accuracy:typeof r.accuracy==="number"&&r.accuracy>=0&&r.accuracy<=1?r.accuracy:null,medals:Array.isArray(r.medals)?r.medals.filter((s:unknown)=>typeof s==="string"&&["Untouched","Sharpshooter","Rescue Wings","Flight Artist","Groundbreaker","Blueprint recovered","Lost Squadron paint unlocked"].includes(s)):[]}}}}catch{}
 return records;
}
