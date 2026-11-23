import { drawAirframe } from "./airframes";
import type { Battle, Enemy, Bullet } from './battle';
import { wrapDelta } from './game-rules';
import { trimDebris } from './wreckage';
export type Specialist='bulwark'|'charger'|'twin';
export function shedPart(g:Battle,x:number,y:number,kind:'wing'|'pod'|'engine'|'turret',vx=0){
 g.debris.push({x,y,vx:vx*.4+55,vy:-75,spin:0,turn:3,life:5,hazard:false,shape:kind==='wing'?0:kind==='engine'?1:2,size:kind==='wing'?.55:.65,source:kind,tint:'#9da99c'});
 trimDebris(g);g.burst(x,y,'#ffc891');g.sounds.push('explode');
}
export function equipSpecialist(e:Enemy,kind:Specialist){
 e.specialist=kind;e.vehicle=kind==='charger'?'interceptor':'cargo';e.hp=e.maxHp=kind==='twin'?4:kind==='bulwark'?4:3;
 e.engineParts=kind==='twin'?[3,3]:undefined;e.vehicleTime=0;
}
export const noseOpen=(e:Enemy)=>(e.vehicleTime??0)%8>=5;
export function specialistWeak(e:Enemy,x:number,y:number){
 const dx=wrapDelta(x,e.x)*e.dir;
 if(e.specialist==='bulwark')return dx< -12;
 if(e.specialist==='charger')return noseOpen(e)&&dx>12;
 if(e.specialist==='twin')return Math.abs(y-e.y)>8;
 return true;
}
export function engineStrike(g:Battle,e:Enemy,y:number,damage:number){
 const parts=e.engineParts!;const i=y<e.y?0:1;if(parts[i]<=0)return;
 parts[i]=Math.max(0,parts[i]-damage);
 if(parts[i]===0){shedPart(g,e.x,e.y+(i?18:-18),'engine',e.vx);g.announce('ENGINE LOST / STRIKE THE OTHER ENGINE');}
 e.hp=parts.filter(h=>h>0).length*2;
}
// Component hit boxes are checked before the hull. Armor never forwards rejected hits.
export function hitAircraftPart(g:Battle,e:Enemy,b:Bullet){
 const dx=wrapDelta(b.x,e.x)*e.dir,dy=b.y-e.y;
 if((e.armor??0)>0)return false;
 if(e.gunship&&(e.podHp??3)>0&&dx> -35&&dx<48&&dy>9&&dy<35){
  e.podHp=Math.max(0,(e.podHp??3)-(b.damage??1));g.metrics.hits++;g.burst(b.x,b.y,'#ffc891');
  if(e.podHp===0){shedPart(g,e.x+e.dir*23,e.y+20,'pod',e.vx);e.attackTime=5;g.announce('MISSILE POD DESTROYED / GUNSHIP DISARMED');}return true;
 }
 if(e.specialist==='twin'&&Math.abs(dx)<34&&Math.abs(dy)>8&&Math.abs(dy)<30){g.metrics.hits++;engineStrike(g,e,b.y,b.damage??1);if(e.hp===0)g.wreck(e,true);return true;}
 if(!e.vehicle&&!e.wingBroken&&Math.abs(dx)<30&&dy< -7&&dy> -29){
  e.wingHits=(e.wingHits??0)+(b.damage??1);g.metrics.hits++;g.burst(b.x,b.y,'#ffcb90');
  if(e.wingHits>=3){e.wingBroken=true;shedPart(g,e.x,e.y-15,'wing',e.vx);g.announce('WING SHEARED / ENEMY HANDLING DAMAGED');}return true;
 }
 return false;
}
export function hitTrainTurret(g:Battle,b:Bullet){
 for(const t of g.campaign?.carriages??[]){if(t.hp<=0||(t.turretHp??3)<=0||Math.abs(wrapDelta(b.x,t.x))>30||Math.abs(b.y-(t.y-36))>16)continue;
  t.turretHp=Math.max(0,(t.turretHp??3)-(b.damage??1));g.metrics.hits++;g.burst(b.x,b.y,'#ffcb90');
  if(t.turretHp===0){t.aimX=undefined;t.aimY=undefined;shedPart(g,t.x,t.y-34,'turret');g.announce('TURRET DISABLED / CARRIAGE STILL MOVING');}return true;
 }return false;
}
export function drawSpecialist(c:CanvasRenderingContext2D,e:Enemy,time:number){
 const kind=e.specialist;if(!kind)return;
 drawAirframe(c,kind==='bulwark'?'armored':kind==='charger'?'racer':'vanguard',kind==='bulwark'?'#87988a':kind==='charger'?'#b77052':'#829db2',time,0,1-e.hp/e.maxHp);
 c.strokeStyle='#253c48';c.lineWidth=1.5;
 if(kind==='bulwark'){c.strokeStyle='#d3d7bc';for(const x of [-18,-3,12]){c.strokeRect(x,-8,12,16);}c.fillStyle='#ffbc77';c.fillRect(-42,-3,8,6);}
 if(kind==='charger'){c.fillStyle=noseOpen(e)?'#ff70c6':'#d7c1a0';c.beginPath();c.arc(39,0,7,-Math.PI/2,Math.PI/2);c.fill();if(!noseOpen(e)){c.fillStyle='#ffb067';c.fillRect(-49,-3,13+Math.sin(time*20)*5,6);}}
 if(kind==='twin')for(let i=0;i<2;i++){const y=i?19:-19;c.fillStyle=(e.engineParts?.[i]??3)>0?'#c6c9b5':'#243036';c.beginPath();c.ellipse(0,y,17,7,0,0,Math.PI*2);c.fill();if((e.engineParts?.[i]??3)>0){c.strokeStyle='#f0e7c7';c.beginPath();c.moveTo(16,y-10);c.lineTo(16,y+10);c.stroke();}}
 c.strokeStyle='#ff70c6';c.lineWidth=3;
 if(kind==='bulwark'){c.beginPath();c.moveTo(-42,-8);c.lineTo(-42,9);c.stroke();}
 if(kind==='twin')for(let i=0;i<2;i++)if((e.engineParts?.[i]??3)>0)c.strokeRect(-17,(i?19:-19)-8,34,16);
}
