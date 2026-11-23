import { updateBayRescue, bayManeuver, bayWreck, type BayState } from "./kestrel-bay";
import { configureIsland } from "./island";
import { ISLAND_TARGETS, type IslandTarget } from "./island-progress";
import { updateBlueprint } from "./blueprints";
import { updateFlightEnvelope } from "./flight-envelope";
import { hitAircraftPart, hitTrainTurret, type Specialist } from "./combat-parts";
import type { GuidedMissile } from "./gunship";
import { STAGE_COUNT, LESSONS } from "./mission-catalog";
import { newWorkshop, buyUpgrade, buyAircraft, workshopSpec, equipment } from "./workshop";
import { equipVehicle, flyVehicle, vehicleCollision, vehicleBulletWeak, type Vehicle } from "./vehicles";
import { explosionFragments } from "./destruction";
import { PAINTS } from "./progression";
import { freshMetrics, selectRefit, type Refit, type MissionResult } from "./mission-rewards";
import { seedTargets, groundBullet, type GroundTarget } from "./ground-targets";
import { updateBossTactics, hitMine, type AirMine } from "./boss-tactics";
import { beginFinale, updateFinale, resetCameraEffects, type BossFinale } from "./boss-finale";
import { updateDebris, type Debris } from "./wreckage";
import { dropBomb, updateBombing } from "./bombing";
import { dodge, updateFlightFeel, nearMiss } from "./flight-feel";
import { chooseTactic, RIVALS } from "./squadrons";
import { enterCampaignStage, updateCampaign, campaignAdvance, type CampaignState, REGIONS } from "./campaign";
import { abilityFor, ABILITIES } from "./abilities";
import { ceiling, collision, perfectJetHit, wrapDelta, type Aircraft } from "./game-rules";
import { sceneForWave } from "./scenery";

import { PLANES, CHALLENGES, challengeValue, newProfile, planeUnlocked, paintUnlocked, type Profile, type PlaneId, type PaintId } from "./progression";
import { seededRandom, utcDay } from "./challenges";
import { GAME_VERSION } from "./version";
export const WORLD=3000;
export type EnemyKind="ace"|"bomber"|"pursuer";
export type Enemy=Aircraft & {bayRole?:"dive"|"bomber"|"ace";bayClock?:number;specialist?:Specialist;engineParts?:number[];podHp?:number;wingHits?:number;wingBroken?:boolean;gunship?:boolean;attackTime?:number;missile?:GuidedMissile;vehicle?:Vehicle;vehicleTime?:number;homeY?:number;tactic?:"pursuer"|"guardian"|"flanker"|"diver";rival?:number;retreat?:number;retreated?:boolean;grazed?:boolean;campaignBomber?:boolean;route?:number;kind:EnemyKind;maxHp:number;bulletHits?:number;gunTimer?:number;armor?:number;boost?:number;targetX:number;targetY:number};
export type Supply={x:number;y:number;kind:"repair"|"armor"|"boost";life:number};
export type Particle={x:number;y:number;vx:number;vy:number;life:number;maxLife:number;size:number;color:string;smoke:boolean};
export type Boss={combatPhase?:number;warning?:boolean;kind?:"zeppelin"|"fortress";core?:number;coreCool?:number;phase?:number;x:number;y:number;engines:number[];cool:number[];bombTimer:number};
export type Mission={kind:"rescue"|"ground"|"survival";progress:number;target:number;complete:boolean};
export type Bullet={x:number;y:number;vx:number;vy:number;life:number;hostile:boolean;damage?:number};
export type Truck={x:number;y:number;hp:number;hits:number;timer:number};
export type SoundEvent="blueprint-ping"|"tracking"|"locked"|"missile"|"rotor"|"cargo-engine"|"interceptor-pass"|"dodge"|"near-miss"|"artillery"|"thunder"|"victory"|"gun"|"flak"|"rear"|"top"|"armor-hit"|"repair"|"armor"|"boost"|"enemy-pickup"|"jet-roar"|"launch"|"hit"|"explode"|"pickup"|"rescue"|"warning"|"jet"|"boss"|"stall";
export const CLOUDS=[{x:920,y:220},{x:1840,y:340},{x:2660,y:185}];
export const RUNWAY={x:600,width:400};
export const ROOFS=[{x:1260,width:140,height:80},{x:1710,width:100,height:140},{x:2250,width:160,height:105}];
export const ENGINE_OFFSETS=[-108,-36,36,108];
const wrap=(n:number)=>(n%WORLD+WORLD)%WORLD;
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
export const newPlane=():Aircraft=>({x:600,y:290,vx:110,vy:0,dir:1,cool:0,hp:3,stall:0});
export const hiddenInCloud=(p:{x:number;y:number})=>CLOUDS.some(c=>(wrapDelta(p.x,c.x)/125)**2+((p.y-c.y)/48)**2<1);
export const onRunway=(p:{x:number})=>Math.abs(wrapDelta(p.x,RUNWAY.x))<RUNWAY.width/2-25;
export const canLand=(p:Aircraft)=>onRunway(p)&&Math.abs(p.vx)<=105&&p.vy>=0&&p.vy<=115;
export const bossHealth=(b:Boss|null)=>b?b.engines.reduce((a,h)=>a+h,0)+(b.core??0):0;
export const defaultStats=()=>({kills:0,rescues:0,jets:0,bosses:0,bestChain:0,duration:0,clutchLandings:0,flawlessBoss:false,trucks:0,missions:0});

export class Battle {
 bay:BayState|null=null;
 islandMission:IslandTarget|null=null;islandResult="";islandDiscovery=false;
 startIsland(id:string){if(!Object.hasOwn(ISLAND_TARGETS,id)||id==="research"&&!this.profile.island.discovered)return false;this.start();enterCampaignStage(this,13);configureIsland(this,id as IslandTarget);return true;}
 blueprintPosition:{x:number;y:number}|null=null;
 blueprintPending=false;blueprintFoundTimer=0;
 flightStrain=0;
 workshop=newWorkshop();workshopArmor=0;missionBombs=0;captureStreak=0;bestCaptureStreak=0;lastCaptureTotal=0;lastDamageTotal=0;
 get inHangar(){return this.mode==="ready"||this.mode==="over"||this.refitPending&&!this.finale}
 purchaseUpgrade(id:string){if(!this.inHangar||!buyUpgrade(this.workshop,id,this.profile.plane))return false;this.player.hp=this.maxHp;return true}
 purchaseAircraft(id:string){return this.inHangar&&buyAircraft(this.workshop,id)}
 replayMission(){if(!this.campaign||this.finale||!this.lastReport||!(this.campaign.transition>0||this.campaign.won))return false;const stage=this.campaign.stage;this.startCampaign(stage);return true}
 continueMission(){if(!this.refitPending||this.finale)return false;this.refitPending=false;this.mode="playing";return true}

 refit:Refit|null=null;refitPending=false;lastReport:MissionResult|null=null;stageRecords:Record<number,MissionResult>={};metrics=freshMetrics();stageStartRescues=0;stageStartStyle=0;
 groundTargets:GroundTarget[]=[];radarDisabled=false;airMines:AirMine[]=[];mineTimer=2;
 get bombCapacity(){return this.refit==="bombs"?4:3}
 chooseRefit(id:string){return selectRefit(this,id)}

 finale:BossFinale|null=null;
 bombAmmo=2;bombCooldown=0;bombHeld=false;bombBalloonTimer=16;playerBombs:{x:number;y:number;vx:number;vy:number}[]=[];bombBalloons:{x:number;y:number;life:number}[]=[];craters:{x:number;life:number}[]=[];
 dropBomb(){return dropBomb(this)}
 shockwaves:{x:number;y:number;life:number}[]=[];
 bank=0;controlDeflection=0;diving=false;diveEnergy=0;dodgeCooldown=0;dodgeTimer=0;dodgeHeld=false;grazeCooldown=0;precisionLanded=false;style={nearMisses:0,landings:0,diveKills:0,rivals:0};
 dodge(){return dodge(this)}
 campaign:CampaignState|null=null;campaignCheckpoint=0;abilityCooldown=0;abilityTimer=0;abilityHeld=false;slowMotion=0;
 radioQueue:string[]=[];soundX=600;debris:Debris[]=[];
 get sceneWave(){return this.campaign?REGIONS[this.campaign.region].scene:this.wave}
 startCampaign(stage=0){const checkpoint=this.campaignCheckpoint;stage=Number.isFinite(stage)?stage:0;this.start();this.campaignCheckpoint=checkpoint;enterCampaignStage(this,Math.max(0,Math.min(STAGE_COUNT-1,checkpoint,Math.floor(stage))))}
 useAbility(){
  if(this.mode!=="playing"||this.finale||this.briefingTimer>0||this.campaign?.transition||this.abilityCooldown>0||this.landed||this.overheated)return false;
  const kind=abilityFor(this.activePlane);this.abilityCooldown=ABILITIES[kind].cooldown;this.abilityTimer=kind==="roll"?1.2:3;
  if(kind==="winch"){updateBayRescue(this,0,170);this.pilots=this.pilots.filter(p=>{if(Math.hypot(wrapDelta(p.x,this.player.x),p.y-this.player.y)<170){this.stats.rescues++;this.profile.rescues++;if(this.mission?.kind==="rescue")this.mission.progress++;this.addScore(250,"WINCH RESCUE");return false}return true});}
  else if(kind==="roll")this.invulnerable=Math.max(this.invulnerable,1.2);
  else if(kind==="cannon"){this.metrics.shots++;this.heat=Math.min(100,this.heat+35);const angle=Math.max(-.65,Math.min(.65,this.player.vy/420));this.bullets.push({x:(this.player.x+this.player.dir*40+3000)%3000,y:this.player.y,vx:this.player.dir*Math.cos(angle)*650,vy:Math.sin(angle)*650,life:1.5,hostile:false,damage:6});}
  else{this.boost=Math.max(this.boost,3);this.heat=Math.min(100,this.heat+20)}
  if(this.heat>=100)this.overheated=true;this.sounds.push(kind==="cannon"?"flak":"boost");return true;
 }
 profile:Profile=newProfile();rewardNotice="";rewardTimer=0;
 daily=false;dailyDay="";dailyRecord={day:"",score:0};
 get activePlane(){return this.daily?"scout":this.profile.plane}
 get equipment(){return this.daily?newWorkshop().ranks:equipment(this.workshop,this.activePlane)}
 get spec(){const p=this.daily?PLANES.scout:workshopSpec(this.workshop,this.activePlane);return {...p,hp:Math.max(2,p.hp+(this.refit==="hull"?1:this.refit==="handling"?-1:0)),speed:p.speed*(this.refit==="hull"?.95:this.refit==="bombs"?.93:1),lift:p.lift*(this.refit==="cooling"?.95:1),accel:p.accel*(this.refit==="handling"?1.2:1)}}
 get maxHp(){return this.spec.hp}
 selectPlane(id:PlaneId){if(!this.inHangar||!Object.hasOwn(PLANES,id)||!this.workshop.owned.includes(id))return false;this.profile.plane=id;this.player.hp=this.maxHp;return true}
 selectPaint(id:PaintId){if(!this.inHangar||!paintUnlocked(id,this.profile))return false;this.profile.paint=id;return true}
 progress(){
  const before=Object.keys(PLANES).filter(id=>planeUnlocked(id as PlaneId,this.profile));
  this.profile.bestScore=Math.max(this.profile.bestScore,this.best);this.profile.bestWave=Math.max(this.profile.bestWave,this.wave);
  const met=[this.profile.kills>=20,this.stats.rescues>=12,this.stats.clutchLandings>=3,this.stats.flawlessBoss&&this.stats.bosses>=2&&this.lives===3];
  const messages:string[]=[];
  CHALLENGES.forEach((c,i)=>{if((i<4?met[i]:challengeValue(c,this.profile,this.stats)>=(c.target??Infinity))&&!this.profile.completed.includes(c.id)){this.profile.completed.push(c.id);messages.push(c.name+" complete / "+c.paint.toUpperCase()+" PAINT")}})

  if(messages.length){this.rewardNotice=messages.join(" · ");this.rewardTimer=6;this.sounds.push("pickup")}
 }
 mode:"ready"|"playing"|"paused"|"over"="ready";
 briefingTimer=0;runStartCompleted:string[]=[];
 mission:Mission|null=null;reinforcementTimer=0;
 heat=0;overheated=false;gunTimer=0;bulletHits=0;muzzle=0;bullets:Bullet[]=[];trucks:Truck[]=[];
 player=newPlane();enemies:Enemy[]=[];pilots:{x:number;y:number}[]=[];
 supplies:Supply[]=[];particles:Particle[]=[];bombs:{x:number;y:number;vy:number;vx?:number}[]=[];
 boss:Boss|null=null;jet:{x:number;y:number;dir:number;life:number}|null=null;
 score=0;best=0;previousBest=0;lives=3;wave=1;time=0;camera=600;cameraY=0;
 invulnerable=0;armor=0;boost=0;landed=false;repairTimer=0;runwayTime=0;runwayCooldown=0;hidden=false;
 chain=0;chainTimer=0;multiplier=1;stats=defaultStats();nextWave=0;
 jetTimer=10;supplyTimer=7;supplyIndex=0;notice="";noticeTimer=0;
 hitCue:{dx:number;dy:number;life:number}|null=null;
 shake=0;flash=0;hitStop=0;trailTimer=0;lastKill=-99;
 sounds:SoundEvent[]=[];reducedMotion=false;
 constructor(public random:()=>number=Math.random){}
 start(daily=false,day=utcDay()){const workshop=this.workshop;const records=this.stageRecords;const best=this.best,motion=this.reducedMotion,profile=this.profile,record=this.dailyRecord,checkpoint=this.campaignCheckpoint,random=this.daily?Math.random:this.random;Object.assign(this,new Battle(daily?seededRandom("BI-PLANE-"+GAME_VERSION+"-"+day):random));this.workshop=workshop;this.stageRecords=records;this.campaignCheckpoint=checkpoint;this.daily=daily;this.dailyDay=daily?day:"";this.dailyRecord=record;this.profile=profile;this.workshopArmor=daily?0:this.equipment.armor/3;this.runStartCompleted=[...profile.completed];this.player.hp=this.maxHp;this.best=best;this.previousBest=best;this.reducedMotion=motion;this.mode="playing";this.invulnerable=3;this.spawnWave();this.sounds.push("launch")}
 pause(){if(this.mode==="playing")this.mode="paused";else if(this.mode==="paused")this.mode="playing"}
 announce(text:string){this.notice=text;this.noticeTimer=3}
 spawnWave(){
  resetCameraEffects(this);this.airMines=[];this.mineTimer=2;
  const kind=this.wave%10===3?"rescue":this.wave%10===6?"ground":this.wave%10===8?"survival":null;
  this.mission=kind?{kind,progress:0,target:kind==="rescue"?5:kind==="ground"?3:60,complete:false}:null;
  this.reinforcementTimer=2;this.pilots=[];this.briefingTimer=this.mission?3:0;

  this.playerBombs=[];this.nextWave=0;this.bullets=[];this.trucks=this.wave>=4?[{x:1100,y:585,hp:2,hits:0,timer:2.5},...(this.wave>=7?[{x:2700,y:585,hp:2,hits:0,timer:4}]:[])]:[];this.bombs=[];this.supplies=[];this.supplyTimer=5; // Bonus jet and its schedule belong to the flight, not the wave.
  const fortress=this.wave%10===0;
  this.boss=this.wave%5===0?{kind:fortress?"fortress":"zeppelin",core:fortress?3:0,coreCool:0,phase:0,x:wrap(this.player.x+720),y:245,engines:fortress?[3,3,3,3]:[2,2,2,2],cool:[0,0,0,0],bombTimer:3}:null;
  const count=this.boss?2:this.mission?3:Math.min(2+Math.floor(this.wave*.8),8);
  this.enemies=Array.from({length:count},(_,i)=>{
   const kind:EnemyKind=(["pursuer","ace","bomber"] as const)[i%3];
   const hp=Math.min(6,1+Math.floor((this.wave-1)/3));
   return {...newPlane(),x:wrap(this.player.x+650+i*330+(this.daily?this.random()*100:0)),y:160+i%3*110+(this.daily?this.random()*30:0),vx:i%2?80:-80,hp,maxHp:hp,armor:0,boost:0,kind,targetX:this.player.x,targetY:this.player.y};
  });
  if(!this.campaign&&this.wave>=7&&!this.boss&&this.enemies[0])equipVehicle(this,this.enemies[0],(["helicopter","cargo","interceptor"] as const)[Math.floor((this.wave-7)/2)%3]);
  seedTargets(this);
  this.progress();
  if(this.mission)this.announce(this.mission.kind==="rescue"?"RESCUE PATROL / CATCH 5 PILOTS":this.mission.kind==="ground"?"GROUND ASSAULT / DESTROY 3 AA TRUCKS":"HOLD THE LINE / SURVIVE 60 SECONDS");
  else if(this.boss){this.announce(fortress?"FLYING FORTRESS / ENGINES FIRST, THEN THE CORE":"ZEPPELIN INBOUND / DIVE ON THE FOUR GLOWING ENGINES");this.sounds.push("warning")}
  else this.announce("WAVE "+this.wave+" / "+sceneForWave(this.wave).name+(this.wave===2?" / WATCH THE ROOFTOPS":this.wave===3?" / WIND GUSTS AHEAD":this.wave===4?" / DUST DEVILS AHEAD":""));
 }
 addScore(base:number,label:string,combo=true){
  if(combo){this.chain=this.chainTimer>0?this.chain+1:1;this.chainTimer=5;this.multiplier=Math.min(5,1+Math.floor((this.chain-1)/3));this.stats.bestChain=Math.max(this.stats.bestChain,this.chain)}
  const points=base*(combo?this.multiplier:1);this.score+=points;this.best=Math.max(this.best,this.score);if(this.daily){if(this.dailyRecord.day!==this.dailyDay)this.dailyRecord={day:this.dailyDay,score:0};this.dailyRecord.score=Math.max(this.dailyRecord.score,this.score)}this.progress();
  this.announce(label+" / +"+points+(combo&&this.multiplier>1?" / "+this.multiplier+"×":""));
 }
 breakCombo(){this.chain=0;this.chainTimer=0;this.multiplier=1}
 burst(x:number,y:number,color:string,big=false,kind="blast"){this.soundX=x;
  if(big)this.shockwaves.push({x,y,life:.55});this.shockwaves=this.shockwaves.slice(-16);
  if(big){
   explosionFragments(this,x,y,color,kind);
   for(let i=0;i<12;i++){const life=1.3+Math.random();this.particles.push({x,y,vx:(Math.random()-.5)*80,vy:-25-Math.random()*45,life,maxLife:life,size:16+Math.random()*16,color:i%3?"#4b4946":"#ef8d41",smoke:true})}
  }
  const count=big?48:18;
  for(let i=0;i<count;i++){const life=.4+Math.random()*.6;this.particles.push({x,y,vx:(Math.random()-.5)*(big?360:210),vy:(Math.random()-.5)*280,life,maxLife:life,size:big?5:3,color,smoke:false})}
  this.shake=Math.max(this.shake,big?10:4);if(big)this.flash=.12;
  this.particles=this.particles.slice(-600);
 }
 damage(amount:number,source?:{x:number;y:number}){
  if(this.invulnerable>0||this.player.cool>0||this.mode!=="playing")return false;
  this.player.cool=.9;this.burst(this.player.x,this.player.y,this.armor>0?"#9cf4ff":"#ffd699");
  this.sounds.push(this.armor>0?"armor-hit":"hit");if(this.armor>0){this.announce("ARMOR ABSORBED THE HIT");return true}
  if(this.workshopArmor>0){const absorbed=Math.min(amount,this.workshopArmor);this.workshopArmor-=absorbed;amount-=absorbed;this.sounds.push("armor-hit");this.announce("WORKSHOP ARMOR / "+Math.round(this.workshopArmor*10)+" PROTECTION LEFT");if(amount<=0)return true}
  this.hitCue={dx:source?wrapDelta(source.x,this.player.x):0,dy:source?source.y-this.player.y:1,life:.8};
  this.metrics.damage+=Math.min(amount,this.player.hp);this.player.hp=Math.max(0,this.player.hp-amount);this.breakCombo();
  if(this.player.hp===0)this.loseLife();return true;
 }
 loseLife(){
  if(this.mode!=="playing")return;
  for(const e of this.enemies){e.missile=undefined;e.attackTime=0;}
  this.blueprintPending=false;this.blueprintFoundTimer=0;this.flightStrain=0;
  this.metrics.damage+=this.player.hp;this.burst(this.player.x,this.player.y,PAINTS[this.daily?"standard":this.profile.paint].color??this.spec.color,true,this.activePlane);this.sounds.push("explode");this.lives--;this.breakCombo();
  this.diving=false;this.diveEnergy=0;this.dodgeTimer=0;this.armor=0;this.boost=0;this.bulletHits=0;this.heat=0;this.overheated=false;this.bullets=this.bullets.filter(b=>!b.hostile);this.landed=false;this.repairTimer=0;
  if(this.lives<=0){this.player.hp=0;this.mode="over";return}
  this.player={...newPlane(),x:this.player.x,hp:this.maxHp};this.invulnerable=3;this.announce("BACK IN THE AIR / "+this.lives+" LIVES LEFT");
 }
 wreck(e:Enemy,credited:boolean){
  bayWreck(this,e);
  this.debris.push({x:e.x,y:e.y,vx:e.vx*.35,vy:60,spin:0,life:4,hazard:false});
  if(credited&&e.vehicle&&this.campaign?.phase==="specialty")this.campaign.vehicleKills++;
  if(e.vehicle==="cargo")this.supplies.push({x:e.x,y:e.y,kind:"repair",life:20});
  if(credited&&e.campaignBomber&&this.campaign)this.campaign.progress++;
  this.burst(e.x,e.y,e.rival!==undefined?RIVALS[e.rival].color:e.kind==="ace"?"#b9a4ff":e.kind==="bomber"?"#9eb8aa":"#ff7963",true,e.vehicle??(e.rival!==undefined?RIVALS[e.rival].airframe:e.kind==="ace"?"hornet":e.kind==="bomber"?"vanguard":"kestrel"));this.pilots.push({x:e.x,y:e.y});this.sounds.push("explode");
  if(credited&&e.rival!==undefined){this.style.rivals++;this.addScore(750,RIVALS[e.rival].name+" DEFEATED",false);this.radioQueue.push("Command: Enemy ace down. The sky is yours.")}
  if(credited&&this.diveEnergy>.45){this.style.diveKills++;this.addScore(50,"DIVING STRIKE",false)}
  if(credited){const unlock= !planeUnlocked("stunt",this.profile);this.stats.kills++;this.profile.kills++;if(unlock&&planeUnlocked("stunt",this.profile)){this.rewardNotice="SKYLARK UNLOCKED / SELECT IT IN THE HANGAR";this.rewardTimer=6;}const double=this.time-this.lastKill<1.5;this.lastKill=this.time;this.addScore(e.kind==="bomber"?200:100,double?"DOUBLE TAKEDOWN":e.kind.toUpperCase()+" DOWN")}
 }
 collectSupply(s:Supply,enemy?:Enemy){
  if(enemy){
   if(s.kind==="repair")enemy.hp=Math.min(enemy.maxHp,enemy.hp+2);
   if(s.kind==="armor")enemy.armor=12;
   if(s.kind==="boost")enemy.boost=12;
   this.announce(enemy.kind.toUpperCase()+" COLLECTED "+s.kind.toUpperCase());this.sounds.push("enemy-pickup");this.burst(s.x,s.y,"#baffac");return;
  }
  if(s.kind==="repair"){this.player.hp=Math.min(this.maxHp,this.player.hp+2);this.announce("REPAIR KIT / HULL RESTORED")}
  if(s.kind==="armor"){this.armor=12;this.announce("ARMOR / 12 SECONDS OF IMPACT PROTECTION")}
  if(s.kind==="boost"){this.boost=12;this.announce("SUPERCHARGER / 12 SECONDS OF EXTRA SPEED")}
  this.sounds.push(s.kind);this.burst(s.x,s.y,"#baffac");
 }
 update(dt:number,keys:Set<string>){
  dt=clamp(dt,0,.035);
  if(this.mode==="paused"||this.mode==="over")return;
  if(updateFinale(this,dt))return;
  if(this.slowMotion>0){this.slowMotion=Math.max(0,this.slowMotion-dt);dt*=.35}
  this.time+=dt;
  if(this.mode==="ready"){this.player.y=290+Math.sin(this.time*1.5)*20;return}
  if(this.briefingTimer>0){this.briefingTimer=Math.max(0,this.briefingTimer-dt);return}
  if(campaignAdvance(this,dt))return;
  if(this.mission?.complete){this.nextWave+=dt;if(this.nextWave>3){this.wave++;this.spawnWave()}return}
  updateFlightFeel(this,dt,keys);
  updateBombing(this,dt,keys);
  this.abilityCooldown=Math.max(0,this.abilityCooldown-dt);this.abilityTimer=Math.max(0,this.abilityTimer-dt);
  if(keys.has("KeyQ")&&!this.abilityHeld)this.useAbility();this.abilityHeld=keys.has("KeyQ");
  updateDebris(this,dt);
  if(this.mode!=="playing")return;
  this.stats.duration+=dt;
  if(this.mission?.kind==="survival")this.mission.progress=Math.min(60,this.mission.progress+dt);
  this.rewardTimer=Math.max(0,this.rewardTimer-dt);
  if(this.hitCue){this.hitCue.life-=dt;if(this.hitCue.life<=0)this.hitCue=null}
  this.blueprintFoundTimer=Math.max(0,this.blueprintFoundTimer-dt);
  this.noticeTimer=Math.max(0,this.noticeTimer-dt);this.shake=Math.max(0,this.shake-dt*30);this.flash=Math.max(0,this.flash-dt);
  for(const p of this.particles){p.x=wrap(p.x+p.vx*dt);p.y+=p.vy*dt;if(!p.smoke)p.vy+=200*dt;p.life-=dt}
  this.shockwaves=this.shockwaves.filter(w=>{w.life-=dt;return w.life>0});
  this.particles=this.particles.filter(p=>p.life>0);
  if(this.hitStop>0){this.hitStop-=dt;return}
  this.invulnerable=Math.max(0,this.invulnerable-dt);this.armor=Math.max(0,this.armor-dt);this.boost=Math.max(0,this.boost-dt);
  this.chainTimer=Math.max(0,this.chainTimer-dt);if(this.chainTimer===0)this.breakCombo();
  this.runwayCooldown=Math.max(0,this.runwayCooldown-dt);
  if(this.runwayCooldown===0&&Math.abs(wrapDelta(this.player.x,RUNWAY.x))>300&&this.player.y<450){this.runwayTime=0;this.precisionLanded=false}
  const p=this.player,climb=keys.has("Space")||keys.has("KeyW")||keys.has("ArrowUp"),brake=keys.has("ArrowDown")||keys.has("KeyS");
  const left=keys.has("ArrowLeft")||keys.has("KeyA"),right=keys.has("ArrowRight")||keys.has("KeyD");
  const liftFade=updateFlightEnvelope(this,dt,climb);
  p.cool=Math.max(0,p.cool-dt);p.stall=Math.max(0,p.stall-dt);
  if(this.landed){
   p.vx*=Math.pow(.005,dt);p.vy=0;p.y=585;this.repairTimer+=dt;this.runwayTime+=dt;
   if(this.repairTimer>=1.4/(1+(this.equipment.gear)*.04)){this.repairTimer=0;if(p.hp<this.maxHp){p.hp=Math.min(this.maxHp,p.hp+1);this.sounds.push("pickup");this.announce("RUNWAY REPAIR / HULL "+Math.round(p.hp*10)+"/"+Math.round(this.maxHp*10))}}
   if(this.runwayTime>=8){this.landed=false;this.runwayCooldown=10;p.y=570;p.vy=-200;p.vx=p.dir*220;this.repairTimer=0;this.announce("RUNWAY LIMIT / TAKE OFF / RETURN AFTER A FLIGHT CIRCUIT");this.sounds.push("warning")}
   else if(climb){this.landed=false;p.y=580;p.vy=-130;this.repairTimer=0}
  }else{
   p.vx+=(Number(right)-Number(left))*(this.spec.accel*(this.boost>0?1.45:1))*dt;p.vx*=Math.pow(brake?.025:.65,dt);
   p.vx=clamp(p.vx,-this.spec.speed*Math.max(this.boost>0?1.4:1,1+this.diveEnergy*.35),this.spec.speed*Math.max(this.boost>0?1.4:1,1+this.diveEnergy*.35));
   p.vy+=(p.stall>0?160:climb?-this.spec.lift*(1-liftFade)+240*liftFade:brake?180:350)*dt;p.vy=clamp(p.vy,-this.spec.climb,brake?85:this.diving?370:300);
   if(this.diving){p.vy=Math.min(370,p.vy+240*dt);p.vx+=p.dir*190*dt}else if(climb&&this.diveEnergy>.1)p.vy-=this.diveEnergy*100*dt;
  }
  if(Math.abs(p.vx)>12)p.dir=p.vx>0?1:-1;
  const scene=sceneForWave(this.sceneWave).kind;
  if(!this.landed){
   if(scene==="forest"&&Math.abs(wrapDelta(p.x,1600))<160&&p.y>140&&p.y<545){p.vx+=Math.sin(this.time*1.5)*220*dt;p.vy-=75*dt}
   if(scene==="desert"&&Math.abs(wrapDelta(p.x,2100))<95&&p.y>220){p.vy-=500*dt;p.vx+=Math.sin(this.time*4)*150*dt}
   p.x=wrap(p.x+p.vx*dt);p.y+=p.vy*dt;
   if(ceiling(p,-160)){this.sounds.push("stall");this.announce("CEILING STALL / DROP BACK INTO THE FIGHT")}
   if(scene==="city")for(const roof of ROOFS){if(Math.abs(wrapDelta(p.x,roof.x))<roof.width/2+22&&p.y>608-roof.height-24){this.damage(1);if(this.player!==p)break;p.y=608-roof.height-28;p.vy=-150}}
   if(this.player===p&&p.y>=585){if(canLand({...p,vx:p.vx/(1+(this.equipment.gear)*5/105),vy:p.vy/(1+(this.equipment.gear)*5/115)})&&(this.runwayCooldown>0||this.runwayTime>=8)){p.y=570;p.vy=-200;p.vx=p.dir*220;this.announce("RUNWAY CLOSED / FLY CLEAR BEFORE RETURNING")}else if(canLand({...p,vx:p.vx/(1+(this.equipment.gear)*5/105),vy:p.vy/(1+(this.equipment.gear)*5/115)})){if(!this.precisionLanded&&Math.abs(p.vx)<80&&p.vy<55){this.precisionLanded=true;this.style.landings++;this.addScore(100,"PRECISION LANDING",false)}this.landed=true;if(p.hp===1){this.stats.clutchLandings++;this.progress()}p.y=585;p.vy=0;this.repairTimer=0;this.announce("LANDED / REPAIRING / HOLD CLIMB TO TAKE OFF")}else this.loseLife()}
  }
  if(this.mode!=="playing")return;
  this.hidden=hiddenInCloud(this.player)&&!this.landed;
  for(const t of this.groundTargets)t.burn=Math.max(0,t.burn-dt);
  updateBossTactics(this,dt);
  if(this.mode!=="playing")return;
  this.updateEnemies(dt);
  this.updateBoss(dt);
  if(this.finale)return;
  if(this.mode!=="playing")return;
  this.updateWeapons(dt,keys.has("KeyF"));
  if(this.finale)return;
  if(this.mode!=="playing")return;
  this.updateSupplies(dt);
  this.updateJet(dt);
  this.pilots=this.pilots.filter(pilot=>{pilot.y+=((this.mission?.kind==="rescue"||this.campaign&&REGIONS[this.campaign.region].mission==="rescue")?32:45)*dt;
   if(Math.abs(wrapDelta(pilot.x,this.player.x))<34&&Math.abs(pilot.y+12-this.player.y)<38){this.stats.rescues++;this.profile.rescues++;if(this.mission?.kind==="rescue")this.mission.progress++;this.addScore(250,"PILOT RESCUED");this.sounds.push("rescue");return false}return pilot.y<598;
  });
  updateBlueprint(this,dt);
  updateCampaign(this,dt);
  this.updateMission(dt);
  if(Math.floor(this.stats.duration)!==Math.floor(this.stats.duration-dt))this.progress();
  if(!this.campaign&&!this.mission&&this.enemies.length===0&&!this.boss){this.nextWave+=dt;if(this.nextWave>3){this.wave++;this.spawnWave()}}
  this.cameraY+=(Math.max(-220,Math.min(0,this.player.y-240))-this.cameraY)*Math.min(1,dt*4);
  this.camera=wrap(this.camera+wrapDelta(this.player.x,this.camera)*Math.min(1,dt*4));
  this.trailTimer-=dt;
  if(this.trailTimer<=0){this.trailTimer=.065;for(const a of [this.player,...this.enemies]){
   const damaged=a.hp<("maxHp" in a ? Number(a.maxHp) : this.maxHp);
   if(!damaged&&a!==this.player)continue;
   if(damaged)this.particles.push({x:wrap(a.x-a.dir*13),y:a.y+7,vx:-a.vx*.3,vy:40,life:.7,maxLife:.7,size:3,color:"#252b29",smoke:false});
   const life=damaged?1.3:.65;this.particles.push({x:wrap(a.x-a.dir*29),y:a.y,vx:-a.vx*.18,vy:damaged?-22:3,life,maxLife:life,size:damaged?10:4,color:damaged?"#827e83":this.boost>0&&a===this.player?"#8deeff":"#e1decd",smoke:true});
  }this.particles=this.particles.slice(-600)}
 }
 updateEnemies(dt:number){
  for(const e of this.enemies){
   if(e.campaignBomber){e.route=(e.route??0)+85*dt;e.vx=85;e.x=(e.x+85*dt)%3000;if(e.route>=1800&&this.campaign){this.campaign.strikes++;e.hp=0;continue}}
   e.armor=Math.max(0,(e.armor??0)-dt);e.boost=Math.max(0,(e.boost??0)-dt);
   e.cool=Math.max(0,e.cool-dt);e.stall=Math.max(0,e.stall-dt);
   if(this.campaign?.phase==="mission"&&REGIONS[this.campaign.region].mission==="escort"&&e.kind!=="ace"){e.targetX=this.campaign.transport.x;e.targetY=this.campaign.transport.y}else if(!this.hidden){e.targetX=this.player.x;e.targetY=this.player.y}
   if(!e.vehicle){
   e.retreat=Math.max(0,(e.retreat??0)-dt);chooseTactic(this,e);nearMiss(this,e);
   }
   const chase=wrapDelta(e.targetX,e.x),boost=(e.boost??0)>0;
   if(bayManeuver(this,e,dt)){}
   else if(e.vehicle)flyVehicle(this,e,dt);
   else if(e.campaignBomber){e.vy=0}
   else if(e.kind==="bomber"){e.vx+=(e.dir*100*(boost?1.4:1)-e.vx)*dt;e.vy+=(Math.sin(this.time+e.x*.002)*35-e.vy)*dt}
   else{
    const ramp=Math.min(1,.72+this.wave*.055),speed=(e.kind==="ace"?205:235)*ramp*(boost?1.4:1),acc=(e.kind==="ace"?150:215)*ramp*(boost?1.45:1);
    e.vx+=(Math.sign(chase)*acc-e.vx*.55)*dt;e.vx=clamp(e.vx,-speed,speed);
    const target=clamp(e.targetY+(e.kind==="ace"?-85:0)+Math.sin(this.time*1.3+e.x*.003)*(e.kind==="ace"?45:20),-100,578);
    e.vy+=(e.stall>0?160:e.y>target?-280:240)*dt;
   }
   if(e.wingBroken){e.vx*=Math.pow(.65,dt);e.vy+=65*dt;}
   if(e.vehicle!=="interceptor")e.dir=e.vx>=0?1:-1;e.vy=clamp(e.vy,-180,250);if(!e.campaignBomber)e.x=wrap(e.x+e.vx*dt);e.y+=e.vy*dt;
   ceiling(e,-160);if(e.y>582){e.y=582;e.vy=-110}
   if(this.invulnerable===0){
    const oldHp=this.player.hp,enemyHp=e.hp,above=this.player.y<e.y-10;
    if(e.vehicle?vehicleCollision(this,e):collision(this.player,e)){
     if(this.armor>0)this.player.hp=oldHp;else if(this.player.hp<oldHp&&this.workshopArmor>0){const absorbed=Math.min(oldHp-this.player.hp,this.workshopArmor);this.workshopArmor-=absorbed;this.player.hp+=absorbed;this.sounds.push("armor-hit")}
     if((e.armor??0)>0)e.hp=enemyHp;
     if(this.player.hp<oldHp){this.metrics.damage+=oldHp-this.player.hp;this.breakCombo();this.hitCue={dx:wrapDelta(e.x,this.player.x),dy:e.y-this.player.y,life:.8}}
     this.sounds.push(this.armor>0||(e.armor??0)>0?"armor-hit":Math.abs(this.player.y-e.y)>10?"top":"rear");this.burst(e.x,e.y,"#ffdfab");this.hitStop=.035;
     if(e.hp===0){this.wreck(e,true)}
     else if(e.hp<enemyHp)this.addScore(15,above?"TOP STRIKE":"TAIL STRIKE");
     if(this.player.hp===0){this.loseLife();if(this.mode!=="playing")break}
    }
   }
  }
  // Separate opponents without letting them farm each other's health or score.
  for(let i=0;i<this.enemies.length;i++)for(let j=i+1;j<this.enemies.length;j++){
   const a=this.enemies[i],b=this.enemies[j];if(Math.abs(wrapDelta(a.x,b.x))<48&&Math.abs(a.y-b.y)<30){a.vy-=25*dt;b.vy+=25*dt}
  }
  this.enemies=this.enemies.filter(e=>e.hp>0);
 }
 updateMission(dt:number){
  const m=this.mission;if(!m||m.complete||this.mode!=="playing")return;
  if(m.progress>=m.target){
   m.progress=m.target;m.complete=true;this.stats.missions++;this.progress();this.nextWave=.001;
   this.enemies=[];this.trucks=[];this.bullets=[];this.bombs=[];this.pilots=[];
   this.announce("MISSION COMPLETE / NEXT WAVE INBOUND");this.sounds.push("victory");return;
  }
  this.reinforcementTimer-=dt;if(this.reinforcementTimer>0)return;
  this.reinforcementTimer=2.5;
  const cap=m.kind==="ground"?3:4;
  if(this.enemies.length<cap){
   const hp=Math.min(6,1+Math.floor((this.wave-1)/3)),x=wrap(this.player.x+700+this.random()*150);
   this.enemies.push({...newPlane(),x,y:180+this.random()*220,vx:-100,hp,maxHp:hp,armor:0,boost:0,kind:"pursuer",targetX:this.player.x,targetY:this.player.y});
  }
  if(m.kind==="ground"&&this.trucks.length<2){
   const x=this.trucks.some(t=>t.x===1100)?2700:1100;
   this.trucks.push({x,y:585,hp:2,hits:0,timer:2.5});
  }
 }
 updateWeapons(dt:number,fire:boolean){
  this.gunTimer=Math.max(0,this.gunTimer-dt);this.muzzle=Math.max(0,this.muzzle-dt);
  this.heat=Math.max(0,this.heat-dt*(this.overheated?28:20)*(this.refit==="cooling"?1.35:1)*(1+(this.equipment.guns)*.04));
  if(this.overheated&&this.heat<=20)this.overheated=false;
  if(fire&&!(this.abilityTimer>0&&abilityFor(this.activePlane)==="roll")&&!this.landed&&!this.overheated&&this.gunTimer===0){
   const p=this.player,angle=clamp(p.vy/420,-.65,.65);
   this.bullets.push({x:wrap(p.x+p.dir*34),y:p.y,vx:p.dir*Math.cos(angle)*720,vy:Math.sin(angle)*720,life:1.3,hostile:false});
   this.metrics.shots++;this.gunTimer=.13;this.muzzle=.07;this.heat=Math.min(100,this.heat+8);this.sounds.push("gun");
   if(this.heat>=100){this.overheated=true;this.announce("GUN OVERHEATED / COOLING")}
  }
  // Enemy fighters join the gunfight gradually; their shots are slower than yours.
  if(!(this.campaign&&LESSONS[this.campaign.stage]&&this.campaign.stage<5)&&(this.wave>=6||this.campaign?.phase==="boss"&&REGIONS[this.campaign.region].boss==="carrier")&&!(this.campaign?.phase==="mission"&&REGIONS[this.campaign.region].mission==="escort"))for(const e of this.enemies){
   if(e.specialist||e.gunship||e.kind!=="pursuer"||e.vehicle==="cargo"||this.campaign?.phase==="specialty"&&this.campaign.region===0)continue;e.gunTimer=(e.gunTimer??2)-dt;
   if(e.gunTimer<=0&&!this.hidden){const dx=wrapDelta(this.player.x,e.x),dy=this.player.y-e.y;
    if(Math.abs(dx)<650&&Math.abs(dy)<65&&Math.sign(dx)===e.dir){this.bullets.push({x:wrap(e.x+e.dir*34),y:e.y,vx:e.dir*300,vy:0,life:2,hostile:true});e.gunTimer=this.radarDisabled?4:2.5}
   }
  }
  for(const t of this.trucks){
   t.timer-=dt;
   if(t.timer<=0){t.timer=this.radarDisabled?5:3.2;const dx=wrapDelta(this.player.x,t.x),dy=this.player.y-t.y;
    if(Math.abs(dx)<750&&!onRunway(this.player)){const length=Math.hypot(dx,dy)||1;this.bullets.push({x:t.x,y:t.y-28,vx:dx/length*210,vy:Math.min(-65,dy/length*210),life:3.5,hostile:true});this.sounds.push("flak")}
   }
  }
  this.bullets=this.bullets.filter(b=>{
   b.life-=dt;b.x=wrap(b.x+b.vx*dt);b.y+=b.vy*dt;
   if(b.life<=0||b.y<-180||b.y>610)return false;
   if(b.hostile){
    const escort=this.campaign?.phase==="mission"&&REGIONS[this.campaign.region].mission==="escort"?this.campaign.transport:null;
    if(escort&&Math.abs(wrapDelta(b.x,escort.x))<52&&Math.abs(b.y-escort.y)<25){escort.hp=Math.max(0,escort.hp-.5);this.burst(b.x,b.y,"#b8dcb8");this.sounds.push("hit");return false}
    if(Math.abs(wrapDelta(b.x,this.player.x))<25&&Math.abs(b.y-this.player.y)<19){
     if(this.invulnerable===0&&this.player.cool===0){
      if(this.armor>0)this.sounds.push("armor-hit");
      else{this.bulletHits++;this.burst(b.x,b.y,"#ffbb80");if(this.bulletHits>=3){this.bulletHits=0;this.damage(1,{x:wrap(b.x-b.vx),y:b.y-b.vy})}}
     }return false;
    }
   }else{
    if(hitTrainTurret(this,b)||hitMine(this,b)||groundBullet(this,b))return false;
    if(this.campaign?.phase==="boss")for(const t of this.campaign.carriages)if(t.hp>0&&Math.abs(wrapDelta(b.x,t.x))<56&&Math.abs(b.y-t.y)<32){this.metrics.hits++;t.hits+=(b.damage??1);if(t.hits>=3){t.hp=Math.max(0,t.hp-Math.floor(t.hits/3));t.hits%=3;if(t.hp===0){this.metrics.ground++;this.burst(t.x,t.y,"#ffbe78",true,"train");this.addScore(600,"CARRIAGE DESTROYED")}}return false}
    for(const e of this.enemies)if(e.hp>0&&hitAircraftPart(this,e,b))return false;
    for(const e of this.enemies)if(e.hp>0&&Math.abs(wrapDelta(b.x,e.x))<28&&Math.abs(b.y-e.y)<22){
     if(!vehicleBulletWeak(e,b)){this.sounds.push("armor-hit");return false}
     this.metrics.hits++;if((e.armor??0)>0)this.sounds.push("armor-hit");
     else{e.bulletHits=(e.bulletHits??0)+(b.damage??1);this.burst(b.x,b.y,"#ffdba0");if(e.bulletHits>=3){e.hp=Math.max(0,e.hp-Math.floor(e.bulletHits/3));e.bulletHits%=3;if(e.hp===0)this.wreck(e,true)}}
     return false;
    }
    for(const t of this.trucks)if(t.hp>0&&Math.abs(wrapDelta(b.x,t.x))<35&&Math.abs(b.y-t.y)<28){
     this.metrics.hits++;t.hits+=(b.damage??1);this.burst(b.x,b.y,"#ffdba0");if(t.hits>=3){t.hp=Math.max(0,t.hp-Math.floor(t.hits/3));t.hits%=3;if(t.hp===0){this.metrics.ground++;this.stats.trucks++;if(this.mission?.kind==="ground")this.mission.progress++;this.addScore(400,"AA TRUCK DESTROYED");this.burst(t.x,t.y,"#ffaf75",true,"truck");this.sounds.push("explode")}}return false;
    }
   }
   return true;
  }).slice(-120);
  this.enemies=this.enemies.filter(e=>e.hp>0);this.trucks=this.trucks.filter(t=>t.hp>0);
 }
 updateSupplies(dt:number){
  this.supplyTimer-=dt;
  if(this.supplyTimer<=0){this.supplies.push({x:wrap(this.player.x+this.player.dir*340),y:175+this.random()*200,kind:(["repair","armor","boost"] as const)[this.supplyIndex++%3],life:30});this.supplyTimer=13+this.random()*6;this.announce("SUPPLY BALLOON / FLY INTO IT TO COLLECT")}
  this.supplies=this.supplies.filter(s=>{
   s.y+=8*dt;s.life-=dt;if(s.life<=0||s.y>=550)return false;
   // Resolve one collector per balloon, using nearest contact if planes overlap it.
   const touching=[this.player,...this.enemies.filter(e=>e.hp>0)].filter(p=>Math.abs(wrapDelta(s.x,p.x))<45&&Math.abs(s.y-p.y)<50);
   touching.sort((a,b)=>(wrapDelta(s.x,a.x)**2+(s.y-a.y)**2)-(wrapDelta(s.x,b.x)**2+(s.y-b.y)**2));
   if(touching.length){const winner=touching[0];this.collectSupply(s,winner===this.player?undefined:winner as Enemy);return false}return true;
  });
 }
 updateJet(dt:number){
  if(this.campaign&&this.campaign.stage<10)return;
  this.jetTimer-=dt;
  if(!this.jet&&this.jetTimer<=2&&this.jetTimer+dt>2){this.announce("BONUS JET INBOUND / DIVE ON IT FROM ABOVE");this.sounds.push("warning")}
  if(!this.jet&&this.jetTimer<=0){const dir=this.random()<.5?1:-1;this.sounds.push("jet-roar");this.jet={x:wrap(this.camera-dir*680),y:185+this.random()*230,dir,life:3.2};this.jetTimer=16+this.random()*12}
  const j=this.jet;if(!j)return;j.x=wrap(j.x+j.dir*640*dt);j.life-=dt;
  if(this.invulnerable===0&&Math.abs(wrapDelta(this.player.x,j.x))<52&&Math.abs(this.player.y-j.y)<44){
   const perfect=perfectJetHit(this.player,j);this.stats.jets++;
   if(perfect){if(!this.reducedMotion)this.slowMotion=.5;for(const e of this.enemies){e.hp=0;this.wreck(e,true)}this.enemies=[];
    if(this.boss){this.boss.engines=this.boss.engines.map(h=>Math.max(0,h-1));this.finishBoss()}
   }
   this.addScore(perfect?1000:250,perfect?"PERFECT INTERCEPT / SKY CLEARED":"JET INTERCEPT");
   this.burst(j.x,j.y,"#a8f4ff",true,"jet");this.sounds.push("jet");this.player.vy=-160;this.jet=null;
  }else if(j.life<=0)this.jet=null;
 }
 finishBoss(){
  if(!this.boss||bossHealth(this.boss)>0)return;
  beginFinale(this,this.campaign?.region===1||this.boss.kind!=="fortress"?"airship":"carrier",this.boss.x,this.boss.y);
  for(let i=0;i<8;i++)this.debris.push({x:wrap(this.boss.x-140+i*40),y:this.boss.y,vx:(i-3.5)*24,vy:20+i%3*15,spin:i,life:6,hazard:false});
  const fortress=this.boss.kind==="fortress";this.boss=null;this.bombs=[];this.stats.bosses++;this.profile.bosses++;if(this.lives===3)this.stats.flawlessBoss=true;if(this.profile.bosses===5&&!this.profile.legacyPlanes?.includes("armored")){this.rewardNotice="BULWARK UNLOCKED / SELECT IT IN THE HANGAR";this.rewardTimer=6;}this.sounds.push("boss");this.addScore(fortress?3500:2000,fortress?"FLYING FORTRESS DESTROYED":"ZEPPELIN DESTROYED");
 }
 updateBoss(dt:number){
  const b=this.boss;if(!b)return;
  if(this.campaign){const alive=b.engines.filter(h=>h>0).length,phase=alive===0?2:alive<=2?1:0;if(b.combatPhase!==phase){b.combatPhase=phase;this.announce(phase===2?"CORE EXPOSED / FINAL STRIKES":phase===1?"BOSS ENRAGED / WIDER VOLLEYS":"DISABLE THE ENGINES");this.sounds.push("warning")}if(b.bombTimer<1.1&&!b.warning){b.warning=true;this.sounds.push("artillery")}}
  const fortress=b.kind==="fortress";b.phase=(b.phase??0)+dt;b.x=wrap(b.x+(fortress?75*Math.sin(b.phase*.35):55)*dt);b.y=245+Math.sin(this.time*(fortress?.9:.6))*(fortress?50:35);
  b.engines.forEach((hp,i)=>{
   b.cool[i]=Math.max(0,b.cool[i]-dt);if(hp<=0||b.cool[i]>0||this.invulnerable>0)return;
   const x=wrap(b.x+ENGINE_OFFSETS[i]),y=b.y-55,p=this.player;
   if(Math.abs(wrapDelta(p.x,x))<30&&Math.abs(p.y-y)<35&&p.y<y+5&&p.vy>20){
    b.engines[i]--;if(b.engines[i]===0)explosionFragments(this,x,y,"#c3cbb7","mine");b.cool[i]=.8;p.vy=-195;this.burst(x,y,"#ffe0a4");this.sounds.push("hit");this.addScore(100,"ENGINE HIT");this.hitStop=.05;
   }
  });
  if(fortress&&b.engines.every(h=>h===0)&&(b.core??0)>0){
   b.coreCool=Math.max(0,(b.coreCool??0)-dt);
   if(b.coreCool===0&&this.invulnerable===0&&Math.abs(wrapDelta(this.player.x,b.x))<35&&this.player.y<b.y-45&&this.player.y>b.y-90&&this.player.vy>20){
    b.core=Math.max(0,(b.core??0)-1);b.coreCool=.8;this.player.vy=-195;this.burst(b.x,b.y-55,"#aaf2ff",true);this.addScore(200,"FORTRESS CORE HIT");this.sounds.push("hit");
   }
  }
  if(Math.abs(wrapDelta(this.player.x,b.x))<167&&Math.abs(this.player.y-b.y)<48){
   this.damage(1,b);this.player.vy=this.player.y<b.y?-190:170;
  }
  b.bombTimer-=dt;if(b.bombTimer<=0){for(const vx of (this.campaign&&b.combatPhase===2?[-160,-80,0,80,160]:fortress?[-95,0,95]:[0]))this.bombs.push({x:b.x,y:b.y+43,vy:80,vx});b.bombTimer=this.campaign?(b.combatPhase===2?3:b.combatPhase===1?3.5:4.2):fortress?2.2:2.7;b.warning=false}
  this.bombs=this.bombs.filter(bomb=>{bomb.vy+=120*dt;bomb.y+=bomb.vy*dt;bomb.x=wrap(bomb.x+(bomb.vx??0)*dt);
   if(Math.abs(wrapDelta(this.player.x,bomb.x))<27&&Math.abs(this.player.y-bomb.y)<26){this.damage(1,bomb);return false}
   if(bomb.y>=605){this.burst(bomb.x,600,"#ffba70",true);this.sounds.push("explode");return false}return true;
  });
  this.finishBoss();
 }
}
