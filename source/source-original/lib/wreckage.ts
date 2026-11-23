import type { Battle } from "./battle";
import { wrapDelta } from "./game-rules";
export type Debris={x:number;y:number;vx:number;vy:number;spin:number;life:number;hazard:boolean;shape?:number;size?:number;turn?:number;warning?:number;tint?:string;source?:string;sweep?:number};
const wrap=(x:number)=>(x%3000+3000)%3000;
export const WRECK_SHAPES=[{name:"wing",w:43,h:9},{name:"engine",w:19,h:19},{name:"fuselage",w:31,h:15},{name:"shard",w:12,h:8},{name:"tail",w:25,h:24}];
export function debrisDimensions(d:Debris){const shape=WRECK_SHAPES[d.shape??3],scale=d.size??1;return {w:shape.w*scale,h:shape.h*scale}}
export function debrisHits(d:Debris,x:number,y:number){
 if(!d.hazard||(d.warning??0)>0)return false;
 const dx=wrapDelta(x,d.x),dy=y-d.y,cs=Math.cos(d.spin),sn=Math.sin(d.spin),s=debrisDimensions(d);
 return ((dx*cs+dy*sn)/(s.w+18))**2+((-dx*sn+dy*cs)/(s.h+12))**2<1;
}
export function spawnEscapeWreckage(g:Battle){
 const c=g.campaign!;c.spawnCount++;c.spawn=1.05-c.region*.075;
 // Lock a predicted crossing point now; never steer a released fragment at the player.
 const startY=Math.min(55,g.cameraY+55),warning=.7,gravity=220,vy=230+c.region*20;
 const aimY=Math.max(-90,Math.min(540,g.player.y+g.player.vy*.4));
 const flight=(-vy+Math.sqrt(vy*vy+2*gravity*(aimY-startY)))/gravity;
 const aimX=g.player.x+g.player.vx*(warning+flight);
 for(let i=0;i<2;i++){
  const drift=(g.random()-.5)*230,offset=i===0?0:(c.spawnCount%2?165:-165);
  const shape=(c.spawnCount*2+i)%WRECK_SHAPES.length;
  g.debris.push({x:wrap(aimX+offset-drift*flight),y:startY,vx:drift,vy,spin:g.random()*Math.PI*2,life:4,hazard:true,shape,size:.75+g.random()*.65,turn:(g.random()-.5)*7,warning});
 }
 g.sounds.push("warning");trimDebris(g);
}
export function trimDebris(g:Battle){const hazards=g.debris.filter(d=>d.hazard).slice(-40),visual=g.debris.filter(d=>!d.hazard).slice(-(g.reducedMotion?48:144));g.debris=[...hazards,...visual]}
export function updateDebris(g:Battle,dt:number){
 for(const d of g.debris){
  if((d.warning??0)>0){d.warning=Math.max(0,d.warning!-dt);continue}
  d.x=wrap(d.x+d.vx*dt);d.y+=d.vy*dt;d.vy+=(d.hazard?220:80)*dt;d.spin+=dt*(d.turn??2);d.life-=dt;
  if(debrisHits(d,g.player.x,g.player.y)){g.damage(1);g.burst(d.x,d.y,"#f8bb7b");d.life=0}
  if(d.hazard&&d.y>=605&&d.life>0){g.burst(d.x,600,"#e8a46b");d.life=0}
 }
 g.debris=g.debris.filter(d=>d.life>0&&d.y<610);trimDebris(g);
}
export function drawWreckage(c:CanvasRenderingContext2D,g:Battle){
 const sx=(x:number)=>wrapDelta(x,g.camera)+600;
 for(const d of g.debris){
  const s=debrisDimensions(d),x=sx(d.x),shape=d.shape??3;
  if((d.warning??0)>0){
   c.save();c.strokeStyle="#ffd68a";c.fillStyle="#ffd68a";c.lineWidth=2;c.setLineDash([6,5]);c.beginPath();c.moveTo(x,72);c.lineTo(x+d.vx*.45,185);c.stroke();c.setLineDash([]);
   c.beginPath();c.moveTo(x-8,67);c.lineTo(x,79);c.lineTo(x+8,67);c.stroke();c.font="bold 12px monospace";c.textAlign="center";c.fillText("FALLING",x,48);c.restore();continue;
  }
  c.save();c.globalAlpha=Math.min(1,d.life*2);c.translate(x,d.y);c.rotate(d.spin);
  const metal=c.createLinearGradient(0,-s.h,0,s.h);metal.addColorStop(0,d.tint??(d.hazard?"#dab58b":"#b0bbc0"));metal.addColorStop(.4,"#73858a");metal.addColorStop(1,"#34454e");c.fillStyle=metal;c.strokeStyle="#283a43";c.lineWidth=1.5;
  c.beginPath();
  if(d.source==="pod"){c.rect(-s.w,-s.h*.6,s.w*2,s.h*1.2)}
  else if(d.source==="turret"){c.arc(0,0,s.h,Math.PI,0);c.lineTo(s.w,0);c.lineTo(s.w+22,-5);c.lineTo(s.w+22,3);c.lineTo(-s.w,5);}
  else if(shape===1){c.ellipse(0,0,s.w,s.h,0,0,Math.PI*2)}
  else if(shape===0){c.moveTo(-s.w,-s.h*.6);c.lineTo(s.w*.8+(d.sweep??0),-s.h);c.lineTo(s.w,s.h*.25);c.lineTo(-s.w*.8,s.h)}
  else if(shape===2){c.moveTo(-s.w,-s.h*.5);c.quadraticCurveTo(s.w*.5,-s.h*1.3,s.w,0);c.lineTo(s.w*.7,s.h);c.lineTo(-s.w*.6,s.h*.7)}
  else if(shape===4){c.moveTo(-s.w,s.h*.4);c.lineTo(-s.w*.1,-s.h);c.lineTo(s.w*.3,-s.h*.8);c.lineTo(s.w*.4,s.h*.1);c.lineTo(s.w,s.h*.6);c.lineTo(-s.w*.3,s.h)}
  else{c.moveTo(-s.w,-s.h*.6);c.lineTo(s.w*.3,-s.h);c.lineTo(s.w,s.h*.25);c.lineTo(-s.w*.1,s.h);c.lineTo(-s.w*.8,s.h*.4)}
  c.closePath();c.fill();c.stroke();
  if((d.source==="truck"||d.source==="train")&&shape===1){c.fillStyle="#17262b";c.beginPath();c.ellipse(0,0,s.w*.7,s.h*.7,0,0,Math.PI*2);c.fill()}
  if(d.source==="fuel"&&shape===2){c.strokeStyle="#e4bc73";c.lineWidth=3;c.beginPath();c.moveTo(-s.w*.5,-s.h*.5);c.lineTo(-s.w*.5,s.h*.5);c.moveTo(s.w*.5,-s.h*.5);c.lineTo(s.w*.5,s.h*.5);c.stroke()}
  if(d.source==="airship"&&shape===0){c.strokeStyle="#e2d1ab";c.lineWidth=2;c.beginPath();c.moveTo(-s.w,0);c.lineTo(s.w,0);c.stroke()}
  if(d.source==="radar"){c.strokeStyle="#d6eeee";c.beginPath();c.moveTo(-s.w,0);c.lineTo(s.w,0);c.moveTo(0,-s.h);c.lineTo(0,s.h);c.stroke()}
  if(shape===1){c.strokeStyle="#d0b78e";c.lineWidth=3;for(let i=0;i<6;i++){const a=i*Math.PI/3;c.beginPath();c.moveTo(Math.cos(a)*s.w*.4,Math.sin(a)*s.h*.4);c.lineTo(Math.cos(a)*s.w*.85,Math.sin(a)*s.h*.85);c.stroke()}}
  else{c.strokeStyle="#c0c6b7";c.lineWidth=1;for(let i=-1;i<2;i++){c.beginPath();c.moveTo(i*s.w*.45,-s.h*.5);c.lineTo(i*s.w*.45,s.h*.5);c.stroke()}}
  if(!d.hazard&&d.life>1.2){c.fillStyle="#ffb563";c.beginPath();c.moveTo(-s.w*.3,0);c.lineTo(-s.w*.5-8-Math.sin(g.time*12+d.spin)*5,-7);c.lineTo(-s.w*.3,5);c.fill()}
  c.restore();c.fillStyle=d.hazard?"#d28b5755":"#75808133";c.beginPath();c.ellipse(x-d.vx*.06,d.y-20,s.w*.35,16,0,0,Math.PI*2);c.fill();
 }
}
