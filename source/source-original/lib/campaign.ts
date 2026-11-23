import { updateIsland } from "./island";
import { seedBlueprint } from "./blueprints";
import { updateSetpiece } from "./mission-setpieces";
import { equipSpecialist } from "./combat-parts";
import { STAGE_COUNT, stageInfo, LESSONS } from "./mission-catalog";
import { STAGE_PHASES } from "./campaign-progress";
import { equipVehicle } from "./vehicles";
import { seedTargets } from "./ground-targets";
import { freshMetrics, finishMissionReport } from "./mission-rewards";
import { beginFinale, resetCameraEffects } from "./boss-finale";
import { spawnEscapeWreckage } from "./wreckage";
import { RIVALS } from "./squadrons";
import { STORIES, updateStory, radio } from "./mission-story";
import type { Battle, Enemy } from "./battle";
import { newPlane } from "./battle";
import { wrapDelta } from "./game-rules";
export const REGIONS=[
 {name:"IRON HARBOR",subtitle:"Storm over the harbor",scene:1,color:"#81cbdc",mission:"escort",boss:"carrier"},
 {name:"VERDANT FALLS",subtitle:"Rescue beneath the canopy",scene:3,color:"#a6d29a",mission:"rescue",boss:"airship"},
 {name:"CINDER CITY",subtitle:"Defend the last bridge",scene:2,color:"#e4aa81",mission:"intercept",boss:"train"},
 {name:"DUNE FRONTIER",subtitle:"Stop the armored column",scene:4,color:"#e3c18b",mission:"convoy",boss:"train"},
 {name:"FROST CITADEL",subtitle:"The final mountain assault",scene:1,color:"#b2cfe9",mission:"escort",boss:"carrier"},
] as const;
export type CampaignState={scoreStart:number;killStart:number;vehicleKills:number;repairTimer:number;repairBalloon:{x:number;y:number;life:number}|null;storyEvents:number[];lastStrikes:number;rivalSpawned:boolean;spawnCount:number;flares:{x:number;triggered:boolean}[];stage:number;region:number;phase:"opening"|"specialty"|"mission"|"boss"|"escape";timer:number;elapsed:number;spawn:number;progress:number;target:number;baseline:number;strikes:number;objectiveHp:number;failed:boolean;won:boolean;transition:number;radio:string;radioTimer:number;transport:{x:number;y:number;hp:number};carriages:{x:number;y:number;hp:number;hits:number;cool:number;turretHp?:number;detached?:boolean;separation?:number;aimX?:number;aimY?:number}[]};
export function readCampaignCheckpoint(raw:string|null){const n=Number(raw);return Number.isInteger(n)&&n>=0&&n<STAGE_COUNT?n:0}
export function enterCampaignStage(g:Battle,stage:number){
 g.blueprintPending=false;g.blueprintFoundTimer=0;g.flightStrain=0;resetCameraEffects(g);g.refitPending=false;g.metrics=freshMetrics();g.stageStartRescues=g.stats.rescues;g.stageStartStyle=g.style.nearMisses+g.style.landings+g.style.diveKills;
 stage=Math.max(0,Math.min(STAGE_COUNT-1,Number.isFinite(stage)?Math.floor(stage):0));
 const {region,phase,lesson}=stageInfo(stage),r=REGIONS[region];
 g.playerBombs=[];g.craters=[];g.wave=lesson?stage+1:stage-9;g.spawnWave();g.mission=null;g.boss=null;g.enemies=[];g.trucks=[];g.bullets=[];g.bombs=[];g.pilots=[];g.briefingTimer=4;g.nextWave=0;g.player={...newPlane(),hp:g.maxHp};g.debris=[];g.shockwaves=[];g.diveEnergy=0;g.diving=false;g.dodgeCooldown=0;g.dodgeTimer=0;g.bulletHits=0;g.heat=0;g.overheated=false;g.abilityCooldown=0;g.abilityTimer=0;g.camera=g.player.x;g.invulnerable=4;g.landed=false;g.runwayTime=0;g.runwayCooldown=0;
 const mission=r.mission,target=lesson?.target??(phase==="opening"?(region===2||region===4?3000:4+region):phase==="specialty"?(region===0?1:3):phase==="escape"?18:phase==="boss"?1:mission==="rescue"?5:mission==="intercept"?6:mission==="convoy"?3:40);
 const briefing=lesson?"COMMAND: "+lesson.name+". "+(lesson.kind==="streak"?"Capture 3 pilots without hull damage. Damage resets the streak.":"Complete the objective, then visit your hangar."):phase==="escape"?"COMMAND: Wreckage incoming! Watch the warnings. Brake, turn and change altitude.":phase==="boss"?(r.boss==="train"?"COMMAND: Armored train inbound. Strafe all four carriages.":"COMMAND: Airborne carrier inbound. Dive onto its engines, then the core."):"COMMAND: "+STORIES[region][1];
 g.campaign={scoreStart:g.score,killStart:g.stats.kills,vehicleKills:0,repairTimer:8,repairBalloon:null,storyEvents:[],lastStrikes:0,rivalSpawned:false,spawnCount:0,flares:region===1&&phase==="mission"?[950,1400,1850,2300,2700].map(x=>({x,triggered:false})):[],stage,region,phase,timer:lesson?lesson.time:phase==="opening"&&(region===2||region===4)||phase==="mission"&&mission==="convoy"?90:0,elapsed:0,spawn:2,progress:0,target,baseline:g.stats.rescues,strikes:0,objectiveHp:8,failed:false,won:false,transition:0,radio:briefing,radioTimer:7,transport:{x:1100,y:320,hp:8},carriages:[]};
 if(phase==="boss"){
  if(r.boss==="train")g.campaign.carriages=[0,1,2,3].map(i=>({x:1250+i*130,y:580,hp:3,hits:0,cool:2+i*.7}));
  else g.boss={kind:"fortress",core:region===4?5:3,coreCool:0,phase:0,x:1320,y:245,engines:[2,2,2,2],cool:[0,0,0,0],bombTimer:3};
 }else if(phase==="mission"&&mission==="convoy")g.trucks=[0,1,2].map(i=>({x:1250+i*200,y:585,hp:2,hits:0,timer:3+i}));
 seedBlueprint(g);seedTargets(g);if(lesson)g.groundTargets=[];g.workshopArmor=g.daily?0:g.equipment.armor/3;g.captureStreak=0;g.bestCaptureStreak=0;g.lastCaptureTotal=g.stats.rescues;g.lastDamageTotal=0;g.missionBombs=0;
 g.sounds=g.sounds.filter(s=>s!=="warning");g.announce(r.name+" / "+campaignLabel(g.campaign));g.radioQueue.push(briefing);g.sounds.push("warning");
 if(region===4&&phase==="mission"){g.campaign.radio="COMMAND: Protect the transport. Collect green CARRIER REPAIR balloons to restore 2 hull.";g.radioQueue.push(g.campaign.radio)}
}
export function campaignLabel(c:CampaignState){
 if(LESSONS[c.stage])return LESSONS[c.stage].name.toUpperCase();
 if(c.won)return "CAMPAIGN COMPLETE";
 if(c.failed)return "MISSION FAILED";
 if(c.transition>0)return "OBJECTIVE COMPLETE";
 if(c.phase==="opening")return c.region===2||c.region===4?"SCORE 3,000 IN 90 SECONDS":"CLEAR THE AIRSPACE";
 if(c.phase==="specialty")return "SPECIALIST HUNT / "+(c.region===0?"HELICOPTER":c.region===1?"REAR-ARMOR PATROL":c.region===2?"CHARGERS":c.region===3?"ATTACK HELICOPTERS":"MIXED SQUADRON");
 if(c.phase==="escape")return "ESCAPE THE WRECKAGE";
 if(c.phase==="boss")return REGIONS[c.region].boss==="train"?"DESTROY THE ARMORED TRAIN":REGIONS[c.region].boss==="airship"?"BRING DOWN THE AIRSHIP":"DISABLE THE CARRIER";
 return REGIONS[c.region].mission==="escort"?"ESCORT THE TRANSPORT":REGIONS[c.region].mission==="rescue"?"RESCUE 5 PILOTS":REGIONS[c.region].mission==="intercept"?"INTERCEPT 6 BOMBERS":"STOP THE CONVOY";
}
export function spawnCampaignEnemy(g:Battle,kind:"pursuer"|"ace"|"bomber"="pursuer",guard=false){
 const c=g.campaign;if(!c||g.enemies.length>=4)return;
 const bomber=!guard&&REGIONS[c.region].mission==="intercept"&&c.phase==="mission";
 const e:Enemy={...newPlane(),x:bomber?180:((g.player.x+650)%3000),y:bomber?220+(c.strikes%3)*80:180+g.random()*210,vx:bomber?85:-100,hp:c.stage<5?1:c.stage<10?2:3+Math.floor((c.stage-10)/10),maxHp:c.stage<5?1:c.stage<10?2:3+Math.floor((c.stage-10)/10),kind:bomber?"bomber":kind,targetX:g.player.x,targetY:g.player.y,armor:0,boost:0};
 e.tactic=c.phase==="mission"&&REGIONS[c.region].mission==="escort"?"guardian":c.stage>=3&&c.phase!=="specialty"?(g.enemies.length%2===0?"diver":"flanker"):guard?"guardian":kind==="ace"?"flanker":"pursuer";
 if(bomber){e.dir=1;e.campaignBomber=true;e.route=0}if(c.phase==="boss"&&g.boss){e.x=g.boss.x;e.y=g.boss.y+48;e.vy=100}g.enemies.push(e);
}
function finishStage(g:Battle){
 const c=g.campaign!;if(c.transition>0)return;finishMissionReport(g);
 if(c.phase==="boss"&&REGIONS[c.region].boss==="train"&&c.carriages.length){const first=c.carriages[0];beginFinale(g,"train",(first.x+195)%3000,first.y,c.carriages)}
 if(!g.finale)resetCameraEffects(g);
 c.repairBalloon=null;c.transition=3;c.radio="COMMAND: Objective secured. Stand by for the next assignment.";c.radioTimer=7;g.radioQueue.push(c.radio);g.enemies=[];g.trucks=[];g.bombs=[];g.bullets=[];g.stats.missions++;if(c.phase==="boss"&&REGIONS[c.region].boss==="train"){g.stats.bosses++;g.profile.bosses++;if(g.lives===3)g.stats.flawlessBoss=true}g.addScore(1000,"CAMPAIGN OBJECTIVE COMPLETE",false);if(c.phase!=="boss")g.sounds.push("victory");g.campaignCheckpoint=Math.max(g.campaignCheckpoint,Math.min(STAGE_COUNT-1,c.stage+1));
}
export function campaignAdvance(g:Battle,dt:number){
 const c=g.campaign;if(!c||c.transition<=0)return false;
 if(g.refitPending)return true;
 c.transition=Math.max(0,c.transition-dt);
 if(c.transition===0){if(c.stage===STAGE_COUNT-1){c.won=true;g.mode="over";g.radioQueue.push("COMMAND: All sectors secured. Welcome home, pilot.");}else enterCampaignStage(g,c.stage+1)}
 return true;
}
export function updateCampaign(g:Battle,dt:number){
 if(updateIsland(g,dt))return;
 const c=g.campaign;if(!c||c.failed||c.won||c.transition>0)return;
 c.elapsed+=dt;updateSetpiece(g,dt);c.radioTimer=Math.max(0,c.radioTimer-dt);if(Math.floor(c.elapsed/19)!==Math.floor((c.elapsed-dt)/19)&&c.region===0)g.sounds.push("thunder");c.spawn-=dt;
 const mission=REGIONS[c.region].mission;
 const lesson=LESSONS[c.stage];
 if(lesson){
  const captures=g.stats.rescues-g.lastCaptureTotal;g.lastCaptureTotal=g.stats.rescues;
  if(g.metrics.damage>g.lastDamageTotal){g.captureStreak=0;if(lesson.kind==="streak")g.announce("HIT / RESCUE STREAK RESET TO 0");}else g.captureStreak+=captures;
  g.lastDamageTotal=g.metrics.damage;g.bestCaptureStreak=Math.max(g.bestCaptureStreak,g.captureStreak);
  c.progress=lesson.kind==="kills"?g.stats.kills-c.killStart:lesson.kind==="rescue"?g.stats.rescues-c.baseline:lesson.kind==="streak"?g.captureStreak:lesson.kind==="score"?g.score-c.scoreStart:c.elapsed;
  if(lesson.time){c.timer=Math.max(0,c.timer-dt);if(c.timer===0&&c.progress<c.target)c.failed=true}
  if(c.spawn<=0&&c.progress<c.target){c.spawn=4;if(g.enemies.length<lesson.cap&&(lesson.kind!=="kills"||g.enemies.length<c.target-c.progress))spawnCampaignEnemy(g,"pursuer",true)}
 }else if(c.phase==="opening"||c.phase==="specialty"){
  const scoreAttack=c.phase==="opening"&&(c.region===2||c.region===4);
  c.progress=scoreAttack?g.score-c.scoreStart:c.phase==="specialty"?c.vehicleKills:g.stats.kills-c.killStart;
  if(scoreAttack){c.timer=Math.max(0,c.timer-dt);if(c.timer===0&&c.progress<c.target)c.failed=true}
  const cap=c.phase==="specialty"?(c.region===4&&c.vehicleKills>0?2:1):c.region===4?1:4;
  if(c.spawn<=0){c.spawn=c.phase==="specialty"?5:3.5;if(g.enemies.length<cap){const before=g.enemies.length;spawnCampaignEnemy(g,"pursuer",true);const e=g.enemies[before];if(e&&c.region===4&&c.phase==="opening"){e.kind="bomber";e.wingBroken=true;e.hp=1;e.maxHp=3;e.y=260;e.vx=130;e.dir=1;}if(e&&c.phase==="specialty"){const kind=c.region===0?"helicopter":c.region===1?"cargo":c.region===2?"interceptor":c.region===3?"helicopter":(["helicopter","cargo","interceptor"] as const)[c.spawnCount%3];equipVehicle(g,e,kind);if(c.region===1)equipSpecialist(e,"bulwark");if(c.region===2)equipSpecialist(e,"charger");if(c.region===4)equipSpecialist(e,c.spawnCount===0?"twin":(["bulwark","charger","twin"] as const)[(c.spawnCount-1)%3]);if(c.region===3){e.gunship=true;e.hp=e.maxHp=4;g.announce("ATTACK HELICOPTER / EVADE, THEN STRIKE THE BELLY")}c.spawnCount++}}}
 }else if(c.phase==="mission"){
  if(mission==="escort"){
   c.transport.x=(c.transport.x+35*dt)%3000;c.transport.y=320+Math.sin(c.elapsed*.5)*24;
   // Attackers aim visible, slow rounds at the transport; the player can intercept them.
   for(const e of g.enemies){e.gunTimer=(e.gunTimer??1.5)-dt;const dx=wrapDelta(c.transport.x,e.x),dy=c.transport.y-e.y;
    if(e.gunTimer<=0&&Math.abs(dx)<500&&Math.abs(dy)<160){e.gunTimer=g.radarDisabled?4.5:3;const length=Math.hypot(dx,dy)||1;g.bullets.push({x:e.x,y:e.y,vx:dx/length*180,vy:dy/length*180,life:3,hostile:true});g.sounds.push("gun")}
   }
   if(c.region===4&&c.transport.hp>0){
    c.repairTimer-=dt;
    if(c.repairTimer<=0&&!c.repairBalloon){c.repairTimer=12;c.repairBalloon={x:(c.transport.x+220)%3000,y:220,life:11};g.announce("CARRIER REPAIR BALLOON / COLLECT TO RESTORE 2 HULL")}
    const b=c.repairBalloon;
    if(b){b.x=(b.x-25*dt+3000)%3000;b.life-=dt;
     if(c.transport.hp<8&&Math.hypot(wrapDelta(b.x,g.player.x),b.y+22-g.player.y)<42){c.transport.hp=Math.min(8,c.transport.hp+2);c.repairBalloon=null;g.sounds.push("pickup");g.burst(b.x,b.y,"#8fffc8");g.announce("CARRIER REPAIRED / "+c.transport.hp+" OF 8 HULL")}
     else if(b.life<=0)c.repairBalloon=null;
    }
   }
   c.objectiveHp=c.transport.hp;c.progress=Math.min(c.target,c.elapsed);
  }else if(mission==="rescue")c.progress=g.stats.rescues-c.baseline;
  else if(mission==="convoy"){c.timer-=dt;for(const t of g.trucks)t.x+=12*dt;c.progress=3-g.trucks.length;if(c.timer<=0&&g.trucks.length)c.failed=true}
  if(c.spawn<=0){c.spawn=(mission==="intercept"?4.5:5)*(g.radarDisabled?1.5:1);c.spawnCount++;spawnCampaignEnemy(g,c.region%2?"ace":"pursuer",mission==="intercept"&&c.spawnCount%3===0)}
  if(c.strikes>=3||c.objectiveHp<=0)c.failed=true;
 }else if(c.phase==="boss"){
  const furious=c.carriages.filter(t=>t.hp>0).length<=2;
  for(const t of c.carriages){
   if(t.hp<=0){if(!t.detached){t.detached=true;g.announce("CARRIAGE UNCOUPLED / WATCH THE GUNS");g.sounds.push("artillery")}const convoySpeed=furious?72:45;const separation=t.separation??0;t.x=(t.x+(separation<80?18:convoySpeed)*dt)%3000;t.separation=Math.min(80,separation+(convoySpeed-18)*dt);continue}
   t.x=(t.x+(furious?72:45)*dt)%3000;t.cool-=dt;
   if(t.hp>0&&t.turretHp!==0&&t.cool<1.2&&t.aimX===undefined){t.aimX=g.player.x;t.aimY=g.player.y;g.sounds.push("warning")}
   if(t.hp>0&&t.turretHp!==0&&t.cool<=0){t.cool=furious?3:4;const dx=wrapDelta(t.aimX??g.player.x,t.x),dy=(t.aimY??g.player.y)-t.y,len=Math.hypot(dx,dy)||1;for(const spread of (furious?[-.18,0,.18]:[0])){const angle=Math.atan2(dy,dx)+spread;g.bullets.push({x:t.x,y:t.y-25,vx:Math.cos(angle)*220,vy:Math.min(-70,Math.sin(angle)*220),life:3,hostile:true})}t.aimX=undefined;t.aimY=undefined;g.sounds.push("flak")}
  }
  c.progress=REGIONS[c.region].boss==="train"?(c.carriages.every(t=>t.hp<=0)?1:0):(!g.boss?1:0);
  if(c.spawn<=0){c.spawn=(g.boss&&g.boss.engines.filter(h=>h>0).length<3?3.5:6)*(g.radarDisabled?1.5:1);
   if(REGIONS[c.region].boss==="carrier"){const before=g.enemies.length;spawnCampaignEnemy(g,"pursuer");spawnCampaignEnemy(g,"pursuer");for(const e of g.enemies.slice(before)){e.tactic="flanker";e.gunTimer=.6;e.vx=-160}g.announce("CARRIER / INTERCEPTORS LAUNCHING")}
   else spawnCampaignEnemy(g,"ace")}
 }else{
  c.progress=Math.min(c.target,c.elapsed);
  if(c.spawn<=0)spawnEscapeWreckage(g);
 }
 updateStory(g,dt);
 if(c.phase==="boss"&&c.elapsed>10&&!c.rivalSpawned&&g.enemies.length<4){const before=g.enemies.length;spawnCampaignEnemy(g,"ace",true);const e=g.enemies[before];if(e){c.rivalSpawned=true;e.rival=c.region;e.maxHp=2+Math.floor(c.region/2);e.hp=e.maxHp;radio(g,RIVALS[c.region].taunt)}}
 if(c.failed){if(c.phase==="mission"&&REGIONS[c.region].mission==="escort")g.burst(c.transport.x,c.transport.y,"#b9d4bd",true,"transport");g.mode="over";c.radioTimer=7;c.radio="COMMAND: Objective lost. Regroup and retry this checkpoint.";g.radioQueue.push(c.radio);g.sounds.push("explode");return}
 if(c.progress>=c.target)finishStage(g);
}
