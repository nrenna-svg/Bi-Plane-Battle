import { readStageRecords, type MissionResult } from "./mission-rewards";
export const STAGE_PHASES=["opening","specialty","mission","boss","escape"] as const;
import { STAGE_IDS, STAGE_COUNT } from "./mission-catalog";
export { STAGE_IDS };
export const legacyStage=(n:number)=>10+Math.floor(n/3)*5+[2,3,4][n%3];
export function loadCampaignProgress(raw:string|null,checkpoint:string|null,grades:string|null){
 if(raw){try{const v=JSON.parse(raw);if(v.revision===2&&typeof v.checkpoint==="string"&&STAGE_IDS.includes(v.checkpoint)){const mapped:Record<number,unknown>={};for(let i=0;i<STAGE_COUNT;i++){const r=v.records?.[STAGE_IDS[i]];if(r)mapped[i]={...r,stage:i}}return {checkpoint:STAGE_IDS.indexOf(v.checkpoint),records:readStageRecords(JSON.stringify(mapped))}}}catch{}}
 const n=Number(checkpoint),valid=checkpoint!==null&&checkpoint.trim()!==""&&Number.isInteger(n)&&n>=0&&n<15;
 const old=readStageRecords(grades),records:Record<number,MissionResult>={};for(const r of Object.values(old))if(r.stage<15){const stage=legacyStage(r.stage);records[stage]={...r,stage}}
 return {checkpoint:valid?legacyStage(n):0,records};
}
export function saveCampaignProgress(checkpoint:number,records:Record<number,MissionResult>){return JSON.stringify({revision:2,checkpoint:STAGE_IDS[Math.max(0,Math.min(STAGE_COUNT-1,checkpoint))],records:Object.fromEntries(Object.values(records).filter(r=>STAGE_IDS[r.stage]).map(r=>[STAGE_IDS[r.stage],r]))})}
