import { specialistWeak, noseOpen, engineStrike, drawSpecialist } from "./combat-parts";
import { updateGunship, bellyOpen } from "./gunship";
import type { Battle, Enemy, Bullet } from "./battle";
import { wrapDelta } from "./game-rules";
export type Vehicle="helicopter"|"interceptor"|"cargo";
export function equipVehicle(g:Battle,e:Enemy,kind:Vehicle){e.vehicle=kind;e.vehicleTime=0;e.homeY=kind==="helicopter"?260:kind==="cargo"?190:140;e.y=e.homeY;e.hp=e.maxHp=kind==="helicopter"?2:kind==="cargo"?3:1;e.vx=kind==="helicopter"?0:kind==="cargo"?95:340;e.dir=1;e.gunTimer=3;e.x=(g.player.x+400)%3000;e.armor=0;g.announce(kind==="helicopter"?"HELICOPTER / ATTACK THE PINK UNDERSIDE":kind==="cargo"?"CARGO PLANE / ATTACK ITS TAIL":"INTERCEPTOR / STRIKE DURING ITS TURN")}
export function flyVehicle(g:Battle,e:Enemy,dt:number){
 updateGunship(g,e,dt);
 e.vehicleTime=(e.vehicleTime??0)+dt;const t=e.vehicleTime;
 if(e.specialist==="charger"){const phase=t%8;if(phase<dt*1.1){g.announce("LANCER LINING UP / MOVE OFF ITS FLIGHT PATH");g.sounds.push("warning")}if(phase<2){e.vx*=Math.pow(.1,dt);e.dir=Math.sign(wrapDelta(g.player.x,e.x))||1;e.vy=(g.player.y-e.y)*.7;}else if(phase<5){e.vx=e.dir*370;e.vy*=Math.pow(.05,dt);}else{e.vx=e.dir*65;e.vy=0;}if(Math.floor(t%8)!==Math.floor((t-dt)%8)&&Math.floor(t%8)===2){g.announce("CHARGER / EVADE THE PASS, THEN STRIKE ITS NOSE");g.sounds.push("warning")}}
 else if(e.vehicle==="helicopter"){e.vx=Math.sin(t*.6)*65;e.vy=((e.homeY??260)+Math.sin(t)*18-e.y)*2;if(Math.floor(t*5)!==Math.floor((t-dt)*5)&&Math.abs(wrapDelta(e.x,g.player.x))<600)g.sounds.push("rotor")}
 else if(e.vehicle==="cargo"){e.vx=e.dir*95;e.vy=((e.homeY??190)+Math.sin(t*.6)*30-e.y)*1.5;if(Math.floor(t)!==Math.floor(t-dt)&&Math.abs(wrapDelta(e.x,g.player.x))<600)g.sounds.push("cargo-engine")}
 else{if(Math.floor(t/7)!==Math.floor((t-dt)/7))e.dir*=-1;const turning=t%7>5.3;if(turning){e.vx*=Math.pow(.2,dt);e.vy=(g.player.y-e.y)*.8;}else{e.vx+=(e.dir*350-e.vx)*Math.min(1,dt*3);e.vy*=Math.pow(.1,dt)}if(Math.floor(t/7)!==Math.floor((t-dt)/7))g.sounds.push("interceptor-pass")}
 if(e.specialist==="twin"&&e.engineParts?.some(h=>h===0)){e.vx*=.65;e.vy+=35;}
}
export function vehicleCollision(g:Battle,e:Enemy){
 const p=g.player;if(p.cool>0||e.cool>0||p.hp<=0||e.hp<=0||Math.abs(wrapDelta(p.x,e.x))>=(e.gunship?67:48)||Math.abs(p.y-e.y)>=(e.gunship?48:36))return false;
 const weak=e.specialist?specialistWeak(e,p.x,p.y):e.vehicle==="helicopter"?bellyOpen(e)&&p.y>e.y+10&&p.vy<0:wrapDelta(p.x,e.x)*e.dir<-12;
 if(weak){if(e.specialist==="twin"){if((e.armor??0)<=0)engineStrike(g,e,p.y,3);}else e.hp=Math.max(0,e.hp-2);p.vy=e.vehicle==="helicopter"?170:-130;g.announce(e.specialist==="twin"?"ENGINE STRIKE":e.specialist==="charger"?"EXPOSED NOSE HIT":e.vehicle==="helicopter"?"UNDERSIDE HIT":"REAR ENGINE HIT")}else{p.hp=Math.max(0,p.hp-1);p.vy=p.y<e.y?-180:180;g.announce(e.specialist==="charger"?"NOSE SEALED / WAIT FOR THE CHARGE TO END":e.specialist==="twin"?"STRIKE BOTH PINK ENGINES":e.vehicle==="helicopter"?"ROTOR ARMOR / ATTACK FROM BELOW":"ARMORED NOSE / ATTACK THE TAIL")}
 p.cool=.8;e.cool=.8;p.vx=-p.dir*140;return true;
}
export function vehicleBulletWeak(e:Enemy,b:Bullet){return e.specialist?e.specialist!=="twin"&&specialistWeak(e,b.x,b.y):!e.vehicle||e.vehicle==="helicopter"?( !e.vehicle||bellyOpen(e)&&b.y>e.y+4&&b.vy<0):wrapDelta(b.x,e.x)*e.dir<-5}
export function drawVehicle(c:CanvasRenderingContext2D,e:Enemy,time:number){
 if(e.specialist){drawSpecialist(c,e,time);return;}
 const metal=c.createLinearGradient(0,-15,0,16);metal.addColorStop(0,e.vehicle==="helicopter"?"#d5dbb8":e.vehicle==="cargo"?"#c9b794":"#acc9df");metal.addColorStop(.45,e.vehicle==="helicopter"?"#7b9884":e.vehicle==="cargo"?"#8e8067":"#5a879e");metal.addColorStop(1,"#263f4e");c.fillStyle=metal;c.strokeStyle="#18323e";c.lineWidth=1.5;
 const poly=(pts:number[][])=>{c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();c.stroke()};
 if(e.vehicle==="helicopter"){
  poly([[-16,-4],[-53,-9],[-57,-21],[-49,-19],[-43,-6],[-16,6]]);c.beginPath();c.ellipse(1,0,25,14,0,0,Math.PI*2);c.fill();c.stroke();c.fillStyle="#92c8d3";poly([[7,-11],[19,-7],[24,2],[6,1]]);
  c.strokeStyle="#b8c5b8";c.lineWidth=2;c.beginPath();c.moveTo(-11,10);c.lineTo(-15,21);c.lineTo(24,21);c.moveTo(13,10);c.lineTo(17,21);c.stroke();c.beginPath();c.moveTo(0,-12);c.lineTo(0,-23);c.stroke();c.strokeStyle="#edb99c";c.lineWidth=3;c.beginPath();c.moveTo(-40,-24);c.lineTo(40,-24);c.stroke();c.strokeStyle="#dce7d299";c.lineWidth=2;c.beginPath();c.ellipse(0,-24,43,4+Math.abs(Math.sin(time*35))*3,0,0,Math.PI*2);c.stroke();c.beginPath();c.moveTo(-52,-18);c.lineTo(-52+Math.cos(time*30)*10,-18+Math.sin(time*30)*10);c.stroke();
  if(e.gunship){c.fillStyle="#263c48";for(const x of ((e.podHp??3)>0?[-17,13]:[])){c.fillRect(x,8,15,9);c.strokeStyle="#afbec6";c.strokeRect(x,8,15,9);c.fillStyle="#ffb385";c.beginPath();c.arc(x+12,12,2,0,Math.PI*2);c.fill();c.fillStyle="#263c48";}c.strokeStyle="#c6d2c5";c.strokeRect(-11,-6,15,9);}
 }else{
  const cargo=e.vehicle==="cargo";poly([[-33,0],[-43,-22],[-32,-21],[-17,-3],[7,-12],[cargo?29:48,-2],[cargo?36:51,3],[15,10],[-30,8]]);c.fillStyle=metal;poly([[-5,-2],[-18,-23],[2,-20],[19,2],[-6,5],[-24,22],[-40,21]]);c.fillStyle="#a0d5de";poly([[8,-9],[21,-5],[27,0],[8,-1]]);
  if(cargo){for(const dx of [-8,17]){c.fillStyle="#657c75";c.beginPath();c.ellipse(dx,9,10,5,0,0,Math.PI*2);c.fill();c.strokeStyle="#e0dfc199";c.beginPath();c.ellipse(dx+10,9,2,12,0,0,Math.PI*2);c.stroke()}c.fillStyle="#dcc591";c.fillRect(-19,0,12,7)}
  else{c.fillStyle="#ffbb77";poly([[-35,0],[-48-Math.sin(time*22)*7,3],[-35,6]])}

 }
}
