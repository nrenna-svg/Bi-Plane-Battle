import type { GroundTarget } from "./ground-targets";
import type { Battle, Enemy, Truck } from "./battle";
import { wrapDelta } from "./game-rules";
import { equipVehicle } from "./vehicles";
export type BayPhase="launch"|"approach"|"convoy"|"harbor"|"ace"|"return";
export type BayRescue={status:"waiting"|"active"|"aboard"|"lost"|"missed"|"delivered";x:number;y:number;time:number;lives:number};
export type BayState={phase:BayPhase;rescue:BayRescue;homeward:boolean;variant:number;radar:GroundTarget|null;harbor:GroundTarget[];harborWave:number;escort:boolean;stars:boolean[];elapsed:number;phaseTime:number;wave:number;warning:number;warningText:string;ace:Enemy|null;landing:number;wrecks:{x:number;y:number;age:number;kind:"truck"|"plane"}[];trucks:Truck[];bridge:number;helicopter:boolean};
export const BAY_LIMIT=480;
export const overResolute=(x:number)=>Math.abs(wrapDelta(x,600))<250;
export const BAY_STAR_LABELS=["Return to the carrier","Disable the optional radar","Keep all three lives","Rescue two pilots","Finish within six minutes"];
export const bayObjective=(b:Pick<BayState,"phase">)=>b.phase==="launch"?"Launch from the Resolute — climb above 250m":b.phase==="approach"?"Reach Needle Point at 1100m — radar strike optional":b.phase==="convoy"?"Destroy the 3 coastal supply trucks":b.phase==="harbor"?"Destroy 3 harbor depots and defeat the harbor patrol":b.phase==="ace"?"Defeat Scarlet Finch — watch the diving attack":"Return to the Resolute — brake and land for 2 seconds";
export function bayWaypoint(g:Battle){const b=g.bay!;return b.phase==="launch"?600:b.phase==="return"?(b.homeward?600:1100):b.phase==="approach"?1100:b.phase==="convoy"?(g.trucks[0]?.x??1750):b.phase==="harbor"?(b.harbor.find(t=>t.hp>0)?.x??2450):b.ace?.x??2450;}
export function configureBay(g:Battle){
 g.bay={phase:"launch",rescue:{status:"waiting",x:0,y:190,time:65,lives:3},homeward:false,variant:Math.floor(g.random()*2),radar:null,harbor:[],harborWave:0,escort:false,stars:[],elapsed:0,phaseTime:0,wave:0,warning:0,warningText:"",ace:null,landing:0,wrecks:[],trucks:[],bridge:0,helicopter:false};
 g.campaign!.timer=BAY_LIMIT;g.campaign!.target=6;g.campaign!.progress=0;g.bombAmmo=3;g.player.y=585;g.player.vx=0;g.player.vy=0;g.landed=true;g.jet=null;g.jetTimer=999;g.supplyTimer=12;
 g.radarDisabled=false;g.bay.radar={kind:"radar",x:1160,y:566,hp:3,hits:0,burn:0};g.groundTargets=[g.bay.radar];
 g.radioQueue.push("Resolute to leader: Resolute is your friendly home carrier. Cross the water to the enemy coastline. Needle Point radar is optional. Strike the convoy and harbor, then get home alive.");
}
const wrap=(v:number)=>(v+6000)%3000;
function spawn(g:Battle,role:"dive"|"bomber"|"ace",offset=0){
 const e:Enemy={x:wrap(g.player.x+530+offset),y:role==="bomber"?150+offset*.2:40-offset*.1,vx:-160,vy:30,dir:-1,cool:0,hp:role==="ace"?6:2,stall:0,maxHp:role==="ace"?6:2,kind:role==="bomber"?"bomber":role==="ace"?"ace":"pursuer",targetX:g.player.x,targetY:g.player.y,bayRole:role,bayClock:offset*.002,gunTimer:2};
 if(role==="ace")e.rival=0;g.enemies.push(e);return e;
}
export function bayManeuver(g:Battle,e:Enemy,dt:number){
 if(!g.bay||!e.bayRole)return false;e.bayClock=(e.bayClock??0)+dt;const t=e.bayClock;
 if(e.bayRole==="bomber"){e.vx=-145;e.vy=Math.sin(t)*14;if(Math.floor(t/3)!==Math.floor((t-dt)/3)&&g.bombs.length<8){g.bombs.push({x:e.x,y:e.y+18,vx:-35,vy:80});g.sounds.push("flak");}}
 else{const cycle=t%7,dx=wrapDelta(g.player.x,e.x);e.vx+=(Math.sign(dx)*(e.bayRole==="ace"?255:210)-e.vx)*dt*1.3;const target=cycle<2?Math.min(g.player.y-140,120):cycle<4.8?g.player.y+90:30;e.vy+=(Math.max(-160,Math.min(220,(target-e.y)*1.6))-e.vy)*dt*2;}
 return true;
}
export function updateBayRescue(g:Battle,dt:number,reach=48){
 const b=g.bay;if(!b)return;const r=b.rescue;
 if(r.status==="waiting"&&(b.phase==="convoy"&&b.phaseTime>=12||b.phase==="harbor")){
  r.status="active";r.x=b.variant===0?850:2950;r.y=190;r.time=65;
  g.announce("MAYDAY / ALLIED PILOT OVER THE WATER / OPTIONAL RESCUE");
  g.radioQueue.push("Mayday! This is Blue Two. I have bailed out over the water. Catch my green parachute if you can. Your main mission comes first.");g.sounds.push("warning");
 }
 if(r.status==="active"){
  r.time=Math.max(0,r.time-dt);r.y=Math.min(510,r.y+6*dt);
  if(r.time===0){r.status="missed";g.announce("RESCUE WINDOW CLOSED / CONTINUE THE OPERATION");}
  else if(Math.hypot(wrapDelta(g.player.x,r.x),g.player.y-r.y-12)<reach){
   r.status="aboard";r.lives=g.lives;g.stats.rescues++;g.profile.rescues++;g.addScore(250,"BLUE TWO ABOARD / RETURN SAFELY",false);g.sounds.push("rescue");
   g.radioQueue.push("Blue Two aboard. Finish the operation and bring us both back to the Resolute.");
  }
 }
 if(r.status==="aboard"&&g.lives<r.lives){r.status="lost";g.announce("RESCUE DELIVERY LOST / NO RESCUE BONUS THIS SORTIE");}
}
export function bayWreck(g:Battle,e:Enemy){if(g.bay){g.bay.wrecks.push({x:e.x,y:e.y,age:0,kind:"plane"});g.bay.wrecks=g.bay.wrecks.slice(-18);}}
export function updateBay(g:Battle,dt:number){
 const b=g.bay,c=g.campaign;if(!b||!c||g.mode!=="playing"||c.won||c.failed)return;
 updateBayRescue(g,dt);
 b.elapsed+=dt;b.phaseTime+=dt;c.elapsed=b.elapsed;c.timer=Math.max(0,BAY_LIMIT-b.elapsed);b.wrecks.forEach(w=>w.age+=dt);for(const t of g.groundTargets)if(t.hp<=0)t.burn=Math.max(t.burn,2);
 for(const old of b.trucks)if(!g.trucks.includes(old)){b.wrecks.push({x:old.x,y:old.y,age:0,kind:"truck"});b.bridge=Math.min(3,b.bridge+1);g.sounds.push("artillery");}
 b.trucks=[...g.trucks];for(const t of g.trucks)t.x=Math.min(2020+b.trucks.indexOf(t)*85,t.x+6*dt);b.wrecks=b.wrecks.slice(-18);
 const advance=(phase:BayPhase)=>{b.phase=phase;b.phaseTime=0;g.announce(bayObjective(b));g.radioQueue.push(bayObjective(b));g.sounds.push("warning");};
 if(b.phase==="launch"&&b.phaseTime>=7&&g.player.y<350){
  advance("approach");c.progress=1;
 }
 if(b.phase==="approach"&&Math.abs(wrapDelta(g.player.x,1100))<170){
  advance("convoy");g.trucks=[0,1,2].map(i=>({x:1450+i*190,y:585,hp:2,hits:0,timer:3+i}));b.trucks=[...g.trucks];c.progress=2;
 }
 if(b.phase==="convoy"){
  if(b.warning>0){b.warning=Math.max(0,b.warning-dt);if(b.warning===0&&g.enemies.length<3){const role=(b.wave+b.variant)%2?"bomber":"dive";spawn(g,role);spawn(g,role,110);b.wave++;}}
  else if(b.phaseTime>4+b.wave*(g.radarDisabled?30:20)&&g.enemies.length<3){b.warning=2.5;b.warningText=(b.wave+b.variant)%2?"BOMBER PAIR / HIGH APPROACH →":"FIGHTERS DIVING OUT OF CLOUD / →";g.announce(b.warningText);g.sounds.push("warning");}
  if(b.phaseTime>36&&!b.helicopter&&g.enemies.length<4){b.helicopter=true;const e=spawn(g,"dive");e.bayRole=undefined;equipVehicle(g,e,"helicopter");e.y=500;e.homeY=330;e.gunship=false;g.announce("ROTOR CONTACT / CLIMB INTO ITS BELLY");}
  if(g.trucks.length===0){advance("harbor");c.progress=3;b.warning=0;b.harbor=[0,1,2].map(i=>({kind:i===1?"ammo":"fuel",x:2240+i*260,y:575,hp:3,hits:0,burn:0}));g.groundTargets.push(...b.harbor);g.supplies.push({x:2180,y:300,kind:"repair",life:60});g.bombBalloons.push({x:2250,y:320,life:80});}
 }else if(b.phase==="harbor"){
  if(Math.abs(wrapDelta(g.player.x,2500))<500){
   if(b.harborWave<3&&b.warning===0&&g.enemies.length===0){b.warning=3;b.warningText="HARBOR PATROL "+(b.harborWave+1)+" / CONTACTS INBOUND";g.announce(b.warningText);}
   if(b.warning>0){b.warning=Math.max(0,b.warning-dt);if(b.warning===0){const role=(b.harborWave+b.variant)%2?"bomber":"dive";spawn(g,role);if(!g.radarDisabled)spawn(g,role,110);b.harborWave++;}}
  }
  if(b.harbor.every(t=>t.hp<=0)&&b.harborWave===3&&g.enemies.length===0){advance("ace");b.warning=4;b.warningText="SCARLET FINCH / ACE APPROACHING";c.progress=4;g.supplies.push({x:wrap(g.player.x+200),y:300,kind:"repair",life:40});}
 }
 else if(b.phase==="ace"){
  if(!b.ace){b.warning=Math.max(0,b.warning-dt);if(b.warning===0){b.ace=spawn(g,"ace");if(!g.radarDisabled){spawn(g,"dive",150);b.escort=true;}g.radioQueue.push("Scarlet Finch: You burned my convoy. Now try to make it home.");}}
  else if(b.ace.hp<=0){advance("return");c.progress=5;g.enemies=[];g.bullets=[];g.bombs=[];g.supplies.push({x:wrap(g.player.x+180),y:380,kind:"repair",life:30});}
 }
 else if(b.phase==="return"){
  if(Math.abs(wrapDelta(g.player.x,1100))<170&&!b.homeward){b.homeward=true;g.announce("RESOLUTE: FRIENDLY DECK AHEAD / FOLLOW THE GREEN LANDING LIGHTS");}
  b.landing=b.homeward&&g.landed&&Math.abs(wrapDelta(g.player.x,600))<210?b.landing+dt:0;
  if(b.landing>=2){const first=!g.profile.island.secured.includes("bay");if(first)g.profile.island.secured.push("bay");
   b.stars=[true,!!b.radar&&b.radar.hp<=0,g.lives===3,g.stats.rescues>=2,b.elapsed<=360];
   const previous=g.profile.island.bayStars??[];const fresh=b.stars.filter((earned,i)=>earned&&!previous.includes(i)).length;
   g.profile.island.bayStars=[0,1,2,3,4].filter(i=>b.stars[i]||previous.includes(i));const delivery=b.rescue.status==="aboard",rescueBonus=delivery&&!g.profile.island.bayRescue?20:0;
   if(delivery){b.rescue.status="delivered";g.profile.island.bayRescue=true;}
   const reward=(first?200:0)+fresh*10+rescueBonus;g.workshop.credits+=reward;
   c.progress=6;c.won=true;g.mode="over";g.islandResult="BACK ABOARD THE RESOLUTE / "+b.stars.filter(Boolean).length+"/5 stars / +"+reward+" credits / "+Math.ceil(b.elapsed)+" seconds"+(delivery?" / BLUE TWO HOME"+(rescueBonus?" · Rescue commendation +20":""):"");g.sounds.push("victory");}
 }
 if(c.timer===0&&!c.won){c.failed=true;g.mode="over";g.islandResult="MISSION WINDOW CLOSED / Return to command and fly again.";}
}
