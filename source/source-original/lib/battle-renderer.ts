import { drawBayBackdrop, drawBayWorld, drawBayAircraft, drawBayHud } from "./kestrel-bay-art";
import { drawIslandSecret } from "./island";
import { drawBlueprint, drawBlueprintFound } from "./blueprints";
import { drawSetpiece } from "./mission-setpieces";
import { drawWeakPoint, drawMissileThreat } from "./gunship";
import { drawMissionBriefing } from "./briefing-renderer";
import { drawVehicle } from "./vehicles";
import { drawBlimp, drawBossEngine } from "./blimp-art";
import { drawCarrier } from "./carrier-art";
import { drawGroundTargets } from "./ground-targets";
import { drawMines } from "./boss-tactics";
import { applyFinaleCamera, drawFinale, drawFinaleOverlay } from "./boss-finale";
import { drawTerrain } from "./terrain-renderer";
import { drawBombing } from "./bombing";
import { drawGroundTruck } from "./ground-renderer";
import { RIVALS } from "./squadrons";
import { drawEncounters } from "./encounter-renderer";
import { drawRealCloud, drawRealBuilding } from "./scenery-art";
import { drawCampaignBackdrop, drawCampaignObjects, drawCampaignWeather } from "./campaign-renderer";
import { abilityFor } from "./abilities";
import { REGIONS } from "./campaign";
import { Battle, CLOUDS, RUNWAY, ROOFS, ENGINE_OFFSETS, bossHealth, type Enemy } from "./battle";
import { wrapDelta, type Aircraft } from "./game-rules";
import { drawScenery, sceneForWave } from "./scenery";
import { drawAirframe } from "./airframes";
import { GAME_VERSION } from "./version";
import { PAINTS } from "./progression";
const COLORS={ace:"#b9a4ff",bomber:"#9eb8aa",pursuer:"#ff7963"};
export function drawBattle(c:CanvasRenderingContext2D,g:Battle){
 const sx=(x:number)=>wrapDelta(x,g.camera)+600;
 const text=(str:string,x:number,y:number,color="#f5e6c3",size=14)=>{c.fillStyle=color;c.font="bold "+size+"px monospace";c.textAlign="center";c.fillText(str,x,y)};
 c.save();
 applyFinaleCamera(c,g);
 if(g.briefingTimer===0&&!g.reducedMotion&&g.shake>0)c.translate(Math.sin(g.time*105)*g.shake,Math.cos(g.time*87)*g.shake*.5);
 c.save();c.scale(1,1-g.cameraY/650);
 if(!g.bay){if(g.campaign)drawCampaignBackdrop(c,g);else drawScenery(c,g.sceneWave,g.camera);}
 drawBayBackdrop(c,g);
 c.restore();c.translate(0,-g.cameraY);
 if(g.bay)drawBayWorld(c,g);else drawTerrain(c,g);
 const scene=sceneForWave(g.sceneWave).kind;
 if(scene==="city")for(const r of ROOFS){const x=sx(r.x),top=608-r.height;if(drawRealBuilding(c,x,top,r.width,r.height)){text("ROOFTOP",x,top-12,"#f7c088",12);continue}const facade=c.createLinearGradient(x-r.width/2,0,x+r.width/2,0);facade.addColorStop(0,"#43515c");facade.addColorStop(.7,"#273b4b");facade.addColorStop(1,"#172b3c");c.fillStyle=facade;c.fillRect(x-r.width/2,top,r.width,r.height);c.fillStyle="#64747a";c.fillRect(x-r.width/2-3,top-5,r.width+6,6);c.fillStyle="#41505b";c.fillRect(x-20,top-18,30,13);c.strokeStyle="#819da7";c.lineWidth=1;c.beginPath();c.moveTo(x+24,top);c.lineTo(x+24,top-33);c.stroke();c.strokeStyle="#ecb570";c.lineWidth=3;c.strokeRect(x-r.width/2,top,r.width,r.height);for(let i=0;i<r.width;i+=22){c.fillStyle="#e2b36d";c.fillRect(x-r.width/2+i,top,11,6)}for(let y=top+23;y<590;y+=25)for(let dx=-r.width/2+13;dx<r.width/2-10;dx+=24){c.fillStyle="#b39b74";c.fillRect(x+dx,y,6,8)}text("ROOFTOP",x,top-12,"#f7c088",12)}
 if(scene==="forest"){
  const x=sx(1600);c.fillStyle="rgba(158,231,192,.08)";c.fillRect(x-160,140,320,405);
  c.strokeStyle="#a4d8bd";c.globalAlpha=.45;c.lineWidth=2;
  for(let i=0;i<16;i++){const xx=x-150+(i*37+g.time*90)%300,y=170+i%8*45;c.beginPath();c.moveTo(xx,y);c.bezierCurveTo(xx+12,y-16,xx+29,y+7,xx+48,y-8);c.stroke()}for(let i=0;i<18;i++){const lx=x-155+((i*47+g.time*75)%310),ly=160+(i*43)%370;c.fillStyle=i%2?"#dfcb84":"#8ebb94";c.beginPath();c.ellipse(lx,ly,4,1.5,g.time+i,0,Math.PI*2);c.fill()}c.globalAlpha=1;text("CROSSWIND",x,135,"#c4efd0");
 }
 if(scene==="desert"){
  const x=sx(2100);const dust=c.createLinearGradient(0,220,0,600);dust.addColorStop(0,"#e4be8520");dust.addColorStop(1,"#cfa274aa");c.fillStyle=dust;c.beginPath();c.moveTo(x-76,235);c.bezierCurveTo(x-20,330,x-48,460,x-10,599);c.lineTo(x+12,599);c.bezierCurveTo(x+45,430,x+25,330,x+80,235);c.closePath();c.fill();for(let i=0;i<34;i++){const yy=240+(i*47+g.time*85)%355,rr=(600-yy)*.18+10,xx=x+Math.sin(g.time*4+i)*rr;c.fillStyle="#eac99888";c.beginPath();c.arc(xx,yy,1+i%3,0,Math.PI*2);c.fill()}c.strokeStyle="#f3c493";c.lineWidth=3;
  for(let i=0;i<16;i++){c.globalAlpha=.3+i*.025;c.beginPath();c.ellipse(x+Math.sin(g.time*3+i*.5)*15,595-i*23,12+i*4,5+i*.4,g.time*.1,0,Math.PI*2);c.stroke()}c.globalAlpha=1;text("DUST DEVIL",x,214,"#ffe3b5");
 }
 if(!g.bay){const runway=sx(RUNWAY.x);c.fillStyle="#414a45";c.fillRect(runway-RUNWAY.width/2,599,RUNWAY.width,17);
 c.fillStyle="#b4c6a3";c.fillRect(runway-RUNWAY.width/2,607,RUNWAY.width,1);
 for(let i=0;i<RUNWAY.width;i+=35){c.fillRect(runway-RUNWAY.width/2+i,600,18,3);c.fillRect(runway-RUNWAY.width/2+i,614,3,4)}
 text(g.landed?("SERVICE / "+Math.max(0,Math.ceil(8-g.runwayTime))+"s LEFT"):"REPAIR RUNWAY / BRAKE ↓",runway,634,"#baffbb",14);}
 for(const s of g.supplies){
  const x=sx(s.x),color=s.kind==="repair"?"#b7f59e":s.kind==="armor"?"#83e5ff":"#ffcb6d";
  const fabric=c.createLinearGradient(x-19,0,x+19,0);fabric.addColorStop(0,color);fabric.addColorStop(.35,"#f5f4da");fabric.addColorStop(1,color);c.fillStyle=fabric;c.beginPath();c.ellipse(x,s.y-16,19,24,0,0,Math.PI*2);c.fill();c.strokeStyle=color;c.lineWidth=1;for(const width of [7,14]){c.beginPath();c.ellipse(x,s.y-16,width,24,0,0,Math.PI*2);c.stroke()}c.strokeStyle="#f6e6c5";c.beginPath();c.moveTo(x-10,s.y+2);c.lineTo(x-7,s.y+19);c.moveTo(x+10,s.y+2);c.lineTo(x+7,s.y+19);c.stroke();c.fillStyle="#334c58";c.fillRect(x-15,s.y+17,30,25);c.fillStyle="#142b36";c.fillRect(x-11,s.y+20,22,19);c.fillStyle="#c6bd99";for(const dx of [-13,11])c.fillRect(x+dx,s.y+17,2,25);c.strokeStyle=color;c.strokeRect(x-13,s.y+17,26,23);text(s.kind==="repair"?"+":s.kind==="armor"?"A":">>",x,s.y+34,color,17);text(s.kind.toUpperCase(),x,s.y-49,color,12);
 }
 for(const p of g.pilots){const x=sx(p.x);c.strokeStyle="#fff0c2";c.fillStyle="#fff0c2";c.beginPath();c.arc(x,p.y,12,Math.PI,0);c.fill();c.beginPath();c.moveTo(x-12,p.y);c.lineTo(x,p.y+19);c.lineTo(x+12,p.y);c.stroke();c.fillStyle="#f8ac67";c.fillRect(x-3,p.y+16,6,9)}
 if(g.boss){
  const b=g.boss,x=sx(b.x);
  const carrier=b.kind==="fortress"&&(!g.campaign||REGIONS[g.campaign.region].boss!=="airship");
  if(carrier)drawCarrier(c,x,b.y,g.reducedMotion?0:g.time,false,b.engines.reduce((n,h)=>n+h,0)/8,(g.campaign?.spawn??3)<1.2);
  else drawBlimp(c,x,b.y,g.reducedMotion?0:g.time,1-b.engines.reduce((n,h)=>n+h,0)/8);
  b.engines.forEach((hp,i)=>{const ex=x+ENGINE_OFFSETS[i],ey=b.y-55;drawBossEngine(c,ex,ey,hp,g.campaign?2:b.kind==="fortress"?3:2,g.reducedMotion?0:g.time,b.cool[i]>0);if(hp>0)text("↓",ex,ey-35,"#ffe3a4",19)});
  if(b.bombTimer<1.1){c.save();c.strokeStyle="#ffc38c99";c.lineWidth=2;c.setLineDash([7,8]);for(const vx of (g.campaign&&b.combatPhase===2?[-160,-80,0,80,160]:b.kind==="fortress"?[-95,0,95]:[0])){c.beginPath();c.moveTo(x,b.y+43);for(let t=.1;t<=1.2;t+=.1)c.lineTo(x+vx*t,b.y+43+80*t+60*t*t);c.stroke()}c.setLineDash([]);text("BOMBS INCOMING",x,b.y+180,"#ffd1a5",13);c.restore()}
  if(b.kind==="fortress"){
   const exposed=b.engines.every(h=>h===0);c.fillStyle=exposed?"#91edff":"#576374";c.beginPath();c.ellipse(x,b.y-55,20,12,0,0,Math.PI*2);c.fill();c.strokeStyle="#cadbd4";c.lineWidth=2;c.stroke();c.fillStyle=exposed?"#e2ffff":"#243945";c.beginPath();c.arc(x,b.y-55,7,0,Math.PI*2);c.fill();text(exposed?"CORE ↓":"CORE LOCKED",x,b.y-81,exposed?"#b5f6ff":"#afb4c5",13);
   if(b.bombTimer<.65)text("↓  BOMB SPREAD  ↓",x,b.y+80,"#ff9478",14);else text(g.campaign?(REGIONS[g.campaign.region].boss==="airship"?"STORM AIRSHIP":"SKY CARRIER"):"FLYING FORTRESS",x,b.y+79,"#c6d9ff",14);
  }else text("IRON GIANT",x,b.y+79,"#ffce92",14);
 }
 drawSetpiece(c,g);drawCampaignObjects(c,g);drawEncounters(c,g);drawFinale(c,g);
 drawGroundTargets(c,g);drawMines(c,g);
 for(const t of g.trucks)drawGroundTruck(c,t,g);
 drawBombing(c,g);drawBlueprint(c,g);drawIslandSecret(c,g);
 for(const b of g.bullets){const x=sx(b.x);c.strokeStyle=b.hostile?"#ff8667":"#ffe9a0";c.lineWidth=b.hostile?5:3;c.beginPath();c.moveTo(x-b.vx*.014,b.y-b.vy*.014);c.lineTo(x,b.y);c.stroke()}
 for(const b of g.bombs){const x=sx(b.x);c.fillStyle="#ff7860";c.fillRect(x-5,b.y-8,10,16);c.fillStyle="#ffd395";c.fillRect(x-7,b.y-12,14,4)}
 if(g.jet){
  const j=g.jet,x=sx(j.x);c.save();c.translate(x,j.y);c.scale(j.dir,1);
  const flame=c.createLinearGradient(-85,0,-33,0);flame.addColorStop(0,"#60caff00");flame.addColorStop(.55,"#67cfff");flame.addColorStop(1,"#fff3c1");c.fillStyle=flame;c.beginPath();c.moveTo(-34,-6);c.lineTo(-80-Math.sin(g.time*50)*8,0);c.lineTo(-34,6);c.fill();
  const metal=c.createLinearGradient(0,-12,0,13);metal.addColorStop(0,"#ecf7fa");metal.addColorStop(.4,"#9fc6d2");metal.addColorStop(1,"#3b586d");c.fillStyle=metal;c.strokeStyle="#233f52";c.lineWidth=1;c.beginPath();c.moveTo(54,0);c.quadraticCurveTo(21,-13,-36,-8);c.lineTo(-40,7);c.quadraticCurveTo(13,13,54,0);c.fill();c.stroke();
  for(const sign of [-1,1]){c.beginPath();c.moveTo(12,sign*3);c.lineTo(-20,sign*30);c.lineTo(-31,sign*29);c.lineTo(-14,sign*4);c.closePath();c.fill();c.stroke()}
  c.beginPath();c.moveTo(-27,-6);c.lineTo(-39,-25);c.lineTo(-46,-25);c.lineTo(-40,-4);c.fill();c.stroke();
  c.fillStyle="#244c6b";c.beginPath();c.ellipse(21,-5,12,5,.1,Math.PI,Math.PI*2);c.fill();c.strokeStyle="#d8f8ff";c.beginPath();c.moveTo(13,-9);c.lineTo(26,-8);c.stroke();c.fillStyle="#ffdb87";c.fillRect(-20,25,4,2);c.restore();text("BONUS JET",x,j.y-39,"#b9f7ff",14);
 }
 const plane=(p:Aircraft,enemy?:Enemy)=>{
  const x=sx(p.x),scale=enemy?.gunship?1.5:enemy?.kind==="bomber"?1.25:enemy?.kind==="ace"?.9:!enemy&&g.activePlane==="armored"?1.18:!enemy&&g.activePlane==="stunt"?.9:1,color=enemy?(enemy.rival!==undefined?RIVALS[enemy.rival].color:COLORS[enemy.kind]):(PAINTS[g.daily?"standard":g.profile.paint].color??g.spec.color);
  c.save();c.translate(Math.round(x),Math.round(p.y));c.scale(p.dir*scale,scale);c.rotate(enemy?Math.max(-.38,Math.min(.38,p.vy/620)):g.bank);if(!enemy&&g.dodgeTimer>0&&!g.reducedMotion)c.scale(1,Math.cos(g.dodgeTimer/.38*Math.PI*2));if(!enemy&&g.abilityTimer>0&&abilityFor(g.activePlane)==="roll")c.scale(1,g.reducedMotion?.5:Math.cos(g.abilityTimer/1.2*Math.PI*2));
  if((enemy?enemy.armor??0:g.armor)>0){c.strokeStyle="#99edff";c.globalAlpha=.65;c.lineWidth=2;c.beginPath();c.ellipse(0,0,43,33,0,0,Math.PI*2);c.stroke();c.globalAlpha=1}
  if((enemy?enemy.boost??0:g.boost)>0){c.fillStyle="#92eaff";c.fillRect(-44,-3,18+Math.sin(g.time*45)*7,7)}
  if(g.bay&&!g.reducedMotion&&!enemy&&g.flightStrain>.5)c.rotate(Math.sin(g.time*45)*g.flightStrain*.012);
  if(enemy?.wingBroken){c.beginPath();c.rect(-60,-6,120,50);c.clip();}
  if(enemy?.vehicle)drawVehicle(c,enemy,g.reducedMotion?0:g.time);else drawAirframe(c,enemy?(enemy.rival!==undefined?RIVALS[enemy.rival].airframe:enemy.kind==="ace"?"hornet":enemy.kind==="bomber"?"vanguard":"kestrel"):g.activePlane,color,g.time*(1+Math.abs(p.vx)/300),enemy?-p.vy/300:g.controlDeflection,1-p.hp/(enemy?.maxHp??g.maxHp));if(p.hp<(enemy?.maxHp??g.maxHp)){c.strokeStyle="#292e35";c.lineWidth=2;c.beginPath();c.moveTo(-17,-14);c.lineTo(-10,-9);c.lineTo(-19,-7);c.moveTo(8,11);c.lineTo(16,15);c.stroke()}if(Math.abs(p.vx)>160){c.fillStyle="#d6edeb30";c.beginPath();c.ellipse(34,0,4,24,0,0,Math.PI*2);c.fill()}if(g.bay)drawBayAircraft(c,1-p.hp/(enemy?.maxHp??g.maxHp),enemy?0:g.flightStrain,g.reducedMotion?0:g.time,Math.abs(p.vx));if(enemy)drawWeakPoint(c,enemy,g.time,g.reducedMotion);c.restore();
  const max=enemy?.maxHp??g.maxHp;c.fillStyle="#081c28";c.fillRect(x-23,p.y-39,46,7);
  c.fillStyle=p.hp<=1?"#ff795f":"#aee59d";c.fillRect(x-21,p.y-37,42*Math.max(0,Math.min(1,p.hp/max)),3);
  if(!enemy&&g.muzzle>0){c.fillStyle="#fff0bd";c.beginPath();c.moveTo(x+p.dir*32,p.y-4);c.lineTo(x+p.dir*56,p.y);c.lineTo(x+p.dir*32,p.y+4);c.fill()}
  if(enemy&&(!g.bay||enemy.rival!==undefined||enemy.vehicle))text(enemy.specialist?(enemy.specialist==="bulwark"?"IRONBACK / TAIL ONLY":enemy.specialist==="charger"?"LANCER / NOSE AFTER CHARGE":"TWIN ENGINE / HIT BOTH"):enemy.gunship?"ATTACK HELICOPTER / EVADE THEN BELLY":enemy.vehicle?(enemy.vehicle==="helicopter"?"HELICOPTER / BELLY ↓":enemy.vehicle==="cargo"?"CARGO / TAIL":"INTERCEPTOR / TAIL"):enemy.rival!==undefined?RIVALS[enemy.rival].name:(enemy.retreat??0)>0?"RETREATING":(enemy.campaignBomber?"TARGET / ":"")+(g.wave>=6&&enemy.kind==="pursuer"?"ARMED ":"")+enemy.kind.toUpperCase(),x,p.y-47,enemy.specialist?"#fff0c8":color,11);
 };
 g.enemies.forEach(e=>plane(e,e));
 if(g.mode==="playing"&&g.briefingTimer===0&&!g.campaign?.transition&&!g.finale)drawMissileThreat(c,g);
 if(g.invulnerable===0||Math.floor(g.time*12)%2===0)plane(g.player);
 for(const wave of g.shockwaves){const progress=1-wave.life/.55;c.save();c.globalAlpha=wave.life/.55*.45;c.strokeStyle="#ffe2ac";c.lineWidth=3*(1-progress)+1;c.beginPath();c.ellipse(sx(wave.x),wave.y,12+progress*65,8+progress*40,0,0,Math.PI*2);c.stroke();c.globalAlpha=wave.life/.55*.12;c.fillStyle="#ffd59b";c.fill();c.restore()}
 for(const p of g.particles){c.globalAlpha=Math.min(1,p.life/p.maxLife)*(p.smoke?.45:1);c.fillStyle=p.color;const size=p.size+(p.smoke?(1-p.life/p.maxLife)*9:0);c.beginPath();c.ellipse(sx(p.x),p.y,size*.55,size*.4,g.time,0,Math.PI*2);c.fill()}c.globalAlpha=1;
 for(const cloud of CLOUDS){
  const x=sx(cloud.x);if(drawRealCloud(c,x,cloud.y,g.hidden)){if(!g.bay)text("CLOUD COVER",x,cloud.y-53,"#d2e6e8",12);continue}c.fillStyle=g.hidden?"rgba(219,237,243,.4)":"rgba(207,229,237,.23)";
  for(const [dx,dy,rx,ry] of [[-65,0,60,27],[-12,-14,68,37],[57,0,65,28],[0,12,113,22]]){c.beginPath();c.ellipse(x+dx,cloud.y+dy,rx,ry,0,0,Math.PI*2);c.fill()}if(!g.bay)text("CLOUD COVER",x,cloud.y-53,"#d2e6e8",12);
 }
 c.restore();
 drawCampaignWeather(c,g);
 text("v"+GAME_VERSION,1150,24,"#e8d7b2",13);
 if(!g.daily){c.fillStyle="#102731";c.fillRect(40,35,160,8);c.fillStyle=g.flightStrain>.78?"#ff9478":"#e5c57d";c.fillRect(40,35,160*g.flightStrain,8);text(g.flightStrain>.78?"LIFT FADING / RELEASE CLIMB":"CLIMB STRAIN",145,59,"#f4dfb4",11);}
 c.fillStyle="rgba(248,175,104,.08)";c.fillRect(0,0,1200,70);text("ALT "+Math.round(600-g.player.y)+"m / CEILING 760m",165,24,"#e4d1a7",12);
 if(g.boss){c.fillStyle="#142330";c.fillRect(380,13,440,36);c.fillStyle="#b9755d";c.fillRect(390,36,420,6);c.fillStyle="#ffcd83";c.fillRect(390,36,420*bossHealth(g.boss)/(g.campaign?(g.campaign.region===4?13:11):(g.boss.kind==="fortress"?15:8)),6);text(g.campaign?"BOSS / PHASE "+((g.boss.combatPhase??0)+1)+((g.boss.combatPhase??0)===2?" / CORE EXPOSED":" / DISABLE ENGINES"):g.boss.kind==="fortress"?"FORTRESS / ENGINES → EXPOSED CORE":"IRON GIANT / DIVE ON THE GLOWING ENGINES",600,28,"#ffe2ae",13)}
 if(!g.finale&&g.rewardTimer>0)text(g.rewardNotice,600,117,"#ffd78d",16);
 drawBlueprintFound(c,g);
 if(!g.finale&&g.noticeTimer>0)text(g.notice,600,91,"#d3f6ef",18);
 if(!g.finale&&g.nextWave>0)text("AIRSPACE CLEAR / NEXT WAVE INBOUND",600,137,"#ffe1a0",20);
 if(g.briefingTimer===0&&!g.reducedMotion&&g.flash>0){c.fillStyle="rgba(255,213,155,"+Math.min(.23,g.flash)+")";c.fillRect(0,0,1200,650)}
 if(g.briefingTimer>0&&g.mission&&!g.campaign){const kind=g.mission.kind;drawMissionBriefing(c,{sector:"ARCADE OPERATIONS",stage:"WAVE "+g.wave,title:kind==="rescue"?"Rescue Patrol":kind==="ground"?"Ground Strike":"Hold the Line",objective:kind==="rescue"?"Rescue 5 pilots":kind==="ground"?"Destroy 3 AA trucks":"Survive 60 seconds",threat:kind==="ground"?"Ground crews return fire. Keep clear of their aim.":"Enemy reinforcements keep the skies contested.",tip:kind==="rescue"?"Defeat aircraft, then catch their falling pilots.":kind==="ground"?"Lead your bombs ahead of moving targets.":"Keep moving and change altitude to evade attackers.",accent:"#9dd1dc",timer:g.briefingTimer})}
 if(g.mode==="playing"){
  const runwayDistance=wrapDelta(RUNWAY.x,g.player.x);
  if(!g.bay)text(g.hidden?"HIDDEN / ENEMIES LOST YOUR TRAIL":g.landed?"ON RUNWAY / KEEP WATCH":"RUNWAY "+(runwayDistance<0?"← ":"→ ")+Math.round(Math.abs(runwayDistance))+"m",600,576,g.hidden?"#b7eddf":"#dddbc4",14);
  // A compact radar keeps pickups, opponents and the boss findable in the scrolling world.
  c.fillStyle="#0c202bd9";c.fillRect(18,542,218,43);c.strokeStyle="#658080";c.strokeRect(18,542,218,43);
  c.fillStyle="#8cd696";c.fillRect(20+RUNWAY.x/3000*214,576,8,3);
  for(const e of g.enemies){c.fillStyle=COLORS[e.kind];c.fillRect(20+e.x/3000*214,548+(e.y+160)/810*26,3,3)}
  for(const s of g.supplies){c.fillStyle="#b3f3cc";c.fillRect(20+s.x/3000*214,548+s.y/650*26,3,3)}
  if(g.boss){c.fillStyle="#ffb478";c.fillRect(20+g.boss.x/3000*214,552,9,4)}
  if(g.campaign){const a=g.campaign;c.fillStyle="#a7e9c5";if(a.phase==="mission"&&(a.region===0||a.region===4)){c.beginPath();c.arc(20+a.transport.x/3000*214,548+a.transport.y/650*26,3,0,Math.PI*2);c.fill()}c.fillStyle="#efbd7c";for(const f of a.flares)if(!f.triggered)c.fillRect(20+f.x/3000*214,573,3,4);for(const t of a.carriages)if(t.hp>0)c.fillRect(20+t.x/3000*214,574,5,3)}
  c.fillStyle="#ffe6a3";c.fillRect(20+g.player.x/3000*214,548+(g.player.y+160)/810*26,4,4);
 }
 if(g.hitCue&&g.hitCue.life>0&&g.mode==="playing"&&!g.finale&&g.briefingTimer===0){const h=g.hitCue,angle=Math.atan2(h.dy,h.dx),x=sx(g.player.x),y=g.player.y-g.cameraY;c.save();c.translate(x,y);c.rotate(angle);c.globalAlpha=Math.min(1,h.life*2);c.strokeStyle="#ffb29a";c.lineWidth=4;c.beginPath();c.arc(0,0,49,-.38,.38);c.stroke();c.fillStyle="#ffe6bb";c.beginPath();c.moveTo(59,0);c.lineTo(69,-5);c.lineTo(69,5);c.closePath();c.fill();c.restore()}
 if(g.mode==="playing"&&!g.finale&&g.briefingTimer===0){
  for(const [i,e] of g.enemies.filter(e=>e.y-g.cameraY<30||e.y-g.cameraY>620).slice(0,4).entries()){const xx=Math.max(45,Math.min(1155,sx(e.x))),above=e.y-g.cameraY<30,yy=above?60+i*16:610-i*16;text((above?"▲ ":"▼ ")+(e.vehicle??e.kind).toUpperCase(),xx,yy,"#ffcc99",11)}
  if(g.boss&&(g.boss.y-g.cameraY<50||g.boss.y-g.cameraY>570))text("▼ BOSS / DESCEND",600,610,"#ffd493",14);
 }
 drawBayHud(c,g);
 drawFinaleOverlay(c,g);
}
