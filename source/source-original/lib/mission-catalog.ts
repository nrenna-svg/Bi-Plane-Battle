export type StarRule={id:string;label:string;kind:"complete"|"time"|"clean"|"rescues"|"score"|"noGuns"|"noBombs"|"starter";target?:number};
export type Lesson={name:string;kind:"kills"|"rescue"|"streak"|"score"|"survive";target:number;cap:number;time:number;stars:StarRule[]};
const complete:StarRule={id:"clear",label:"Complete the objective",kind:"complete"};
const clean:StarRule={id:"clean",label:"Take no hull damage",kind:"clean"};
const fast=(n:number):StarRule=>({id:"time",label:"Finish within "+n+" seconds",kind:"time",target:n});
const rescue=(n:number):StarRule=>({id:"rescue",label:"Capture "+n+(n===1?" pilot":" pilots"),kind:"rescues",target:n});
const score=(n:number):StarRule=>({id:"score",label:"Earn "+n+" mission points",kind:"score",target:n});
const noGuns:StarRule={id:"no-guns",label:"Use no guns or cannon",kind:"noGuns"};
const noBombs:StarRule={id:"no-bombs",label:"Use no bombs",kind:"noBombs"};
const starter:StarRule={id:"scout",label:"Fly the Scout",kind:"starter"};
export const LESSONS:Lesson[]=[
 {name:"First Flight",kind:"kills",target:1,cap:1,time:0,stars:[complete,fast(45),clean,noGuns,starter]},
 {name:"Double Trouble",kind:"kills",target:2,cap:1,time:0,stars:[complete,fast(70),clean,rescue(1),noGuns]},
 {name:"Helping Hands",kind:"rescue",target:2,cap:1,time:0,stars:[complete,fast(100),clean,score(1200),starter]},
 {name:"Three's a Crowd",kind:"kills",target:3,cap:2,time:0,stars:[complete,fast(90),clean,rescue(1),noBombs]},
 {name:"Point Patrol",kind:"score",target:1800,cap:2,time:0,stars:[complete,fast(100),clean,rescue(2),noGuns]},
 {name:"Five to Clear",kind:"kills",target:5,cap:3,time:0,stars:[complete,fast(140),clean,rescue(2),starter]},
 {name:"Steady Hands",kind:"streak",target:3,cap:3,time:0,stars:[complete,fast(150),clean,score(3000),noBombs]},
 {name:"Hold Your Nerve",kind:"survive",target:60,cap:3,time:0,stars:[complete,clean,rescue(2),score(2500),noGuns]},
 {name:"Ten to Win",kind:"kills",target:10,cap:4,time:0,stars:[complete,fast(210),clean,rescue(3),noBombs]},
 {name:"Harbor High Score",kind:"score",target:4000,cap:4,time:120,stars:[complete,fast(90),clean,rescue(3),starter]},
];
export const OLD_PHASES=["opening","specialty","mission","boss","escape"] as const;
export const STAGE_COUNT=35;
export function stageInfo(stage:number){return stage<10?{region:0,phase:"opening" as const,lesson:LESSONS[stage]}:{region:Math.floor((stage-10)/5),phase:OLD_PHASES[(stage-10)%5],lesson:undefined}}
export const STAGE_IDS=Array.from({length:STAGE_COUNT},(_,i)=>i<10?"rookie-"+i:["harbor","forest","city","desert","citadel"][Math.floor((i-10)/5)]+"-"+OLD_PHASES[(i-10)%5]);
export function missionName(stage:number){const s=stageInfo(stage);return s.lesson?.name??({opening:"Airspace Patrol",specialty:"Specialist Hunt",mission:["Transport Escort","Rescue Patrol","Bomber Intercept","Ground Convoy","Carrier Defense"][s.region],boss:"Sector Boss",escape:"Escape the Wreckage"}[s.phase])}
export function starRules(stage:number):StarRule[]{const s=stageInfo(stage);if(s.lesson)return s.lesson.stars;
 if(s.phase==="boss")return [complete,fast(150+s.region*20),clean,noBombs,starter];
 if(s.phase==="escape")return [complete,clean,noGuns,noBombs,starter];
 if(s.phase==="specialty")return [complete,fast(100+s.region*20),clean,s.region===0?starter:rescue(1),noBombs];
 if(s.phase==="mission"&&s.region===1)return [complete,fast(150),clean,score(3000),noGuns];
 if(s.phase==="mission"&&(s.region===2||s.region===3))return [complete,fast(80),clean,noBombs,starter];
 return [complete,clean,rescue(1),score(2000),noBombs];}
