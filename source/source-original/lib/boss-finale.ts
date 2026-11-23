import type { Battle } from "./battle";
import { wrapDelta } from "./game-rules";
import { updateDebris, trimDebris } from "./wreckage";
export type BossFinale={kind:"train"|"airship"|"carrier";x:number;y:number;time:number;burst:number;originCamera:number;cars:{x:number;y:number}[]};
const wrap=(x:number)=>(x%3000+3000)%3000;
export function beginFinale(g:Battle,kind:BossFinale["kind"],x:number,y:number,cars:{x:number;y:number}[]=[]){
 if(g.finale)return;
 g.finale={kind,x,y,time:0,burst:0,originCamera:g.camera,cars:cars.map(c=>({x:c.x,y:c.y}))};
 g.cameraY=0;g.airMines=[];g.bullets=[];g.bombs=[];g.playerBombs=[];g.enemies=[];g.hitStop=0;g.slowMotion=0;
 for(const d of g.debris)d.hazard=false;
 g.announce(kind==="train"?"ARMORED TRAIN / CHAIN REACTION":kind==="airship"?"AIRSHIP / HULL RUPTURE":"CARRIER / REACTOR BREACH");
}
export function resetCameraEffects(g:Battle){g.cameraY=0;g.hitCue=null;g.shake=0;g.flash=0;g.hitStop=0;g.slowMotion=0;g.finale=null;g.shockwaves=[];g.particles=[];g.debris=[]}
export function updateFinale(g:Battle,dt:number){
 const f=g.finale;if(!f)return false;
 f.time+=dt;g.time+=dt;g.shake=Math.max(0,g.shake-dt*22);g.flash=Math.max(0,g.flash-dt);
 const blend=f.time<.9?f.time/.9:f.time>3.5?Math.max(0,(4.8-f.time)/1.3):1;
 if(!g.reducedMotion)g.camera=wrap(f.originCamera+wrapDelta(f.x,f.originCamera)*blend);
 for(const p of g.particles){p.x=wrap(p.x+p.vx*dt);p.y+=p.vy*dt;if(!p.smoke)p.vy+=150*dt;p.life-=dt}
 g.particles=g.particles.filter(p=>p.life>0);g.shockwaves=g.shockwaves.filter(w=>{w.life-=dt;return w.life>0});updateDebris(g,dt);
 const schedule=[.25,.5,.75,1,1.25,1.5,1.8,2.1,2.4,2.7,3];
 while(f.burst<schedule.length&&f.time>=schedule[f.burst]){
  const i=f.burst++,car=f.cars[i%Math.max(1,f.cars.length)];
  const x=car?car.x+(i%3-1)*22:wrap(f.x+Math.sin(i*2.4)*145),y=car?car.y-15:f.y+Math.cos(i*1.7)*24;
  g.burst(x,y,i%2?"#ffbf67":"#ffe3a1",true,f.kind);g.sounds.push(i===10?"boss":"explode");
  if(i===10){g.sounds.push("victory");g.burst(f.x,f.y,"#fff1bd",true,f.kind);g.shake=16;for(let j=0;j<15;j++)g.debris.push({x:wrap(f.x+(j-7)*20),y:f.y,vx:(j-7)*32,vy:-130-g.random()*140,spin:j,life:3,hazard:false,shape:j%5,size:.8+g.random()*.7,turn:(g.random()-.5)*6});trimDebris(g)}
 }
 if(f.time>=4.8){g.camera=f.originCamera;resetCameraEffects(g);g.noticeTimer=0;g.invulnerable=Math.max(g.invulnerable,2)}
 return true;
}
export function applyFinaleCamera(c:CanvasRenderingContext2D,g:Battle){
 const f=g.finale;if(!f||g.reducedMotion)return;
 const blend=Math.min(1,f.time/.9,Math.max(0,(4.8-f.time)/1.3)),zoom=1+.32*blend;
 const ty=Math.max(650-650*zoom,Math.min(0,325-f.y*zoom));
 c.translate(600*(1-zoom),ty*blend);c.scale(zoom,zoom);
}
export function drawFinale(c:CanvasRenderingContext2D,g:Battle){
 const f=g.finale;if(!f)return;const sx=(x:number)=>wrapDelta(x,g.camera)+600;
 const split=Math.max(0,f.time-1.5),fade=Math.max(0,1-Math.max(0,f.time-3)/1.3);
 c.save();c.globalAlpha=fade;
 if(f.kind!=="train"){
  for(let side=-1;side<=1;side+=2){c.save();c.translate(sx(f.x)+side*split*22,f.y+split*split*9);c.rotate(side*split*.08);
   const hull=c.createLinearGradient(0,-42,0,42);hull.addColorStop(0,"#d1c0a0");hull.addColorStop(.4,"#718087");hull.addColorStop(1,"#273c49");c.fillStyle=hull;c.strokeStyle="#edb47c";c.lineWidth=2;
   c.beginPath();c.moveTo(0,-38);c.bezierCurveTo(side*210,-45,side*210,40,0,38);c.lineTo(side*12,20);c.lineTo(-side*8,5);c.lineTo(side*14,-14);c.closePath();c.fill();c.stroke();
   c.strokeStyle="#333c42";for(let j=1;j<4;j++){c.beginPath();c.moveTo(side*j*35,-29);c.lineTo(side*j*35,29);c.stroke()}
   if(f.kind==="carrier"){c.fillStyle="#546774";c.fillRect(side<0?-185:0,31,185,16)}
   c.fillStyle="#fbc482";c.beginPath();c.ellipse(0,0,12+split*4,26,0,0,Math.PI*2);c.fill();c.restore()}
 }
 // Fireballs remain visible with motion effects disabled, without zoom or flashing.
 for(let i=0;i<7;i++){const age=f.time-(.3+i*.38);if(age<0||age>1.4)continue;const car=f.cars[i%Math.max(1,f.cars.length)],x=sx(car?.x??wrap(f.x+Math.sin(i*2.4)*140)),y=car?car.y-25:f.y;
  c.globalAlpha=fade*Math.max(0,1-age/1.4);c.fillStyle="#bc492b";c.beginPath();c.ellipse(x,y-age*18,22+age*36,20+age*42,0,0,Math.PI*2);c.fill();c.fillStyle="#ffbc56";c.beginPath();c.ellipse(x-6,y-age*22,14+age*24,15+age*27,0,0,Math.PI*2);c.fill();c.fillStyle="#fff0b8";c.beginPath();c.ellipse(x-9,y-age*24,8+age*9,10+age*11,0,0,Math.PI*2);c.fill()}
 c.restore();
}
export function drawFinaleOverlay(c:CanvasRenderingContext2D,g:Battle){
 const f=g.finale;if(!f)return;c.fillStyle="#081723";c.fillRect(0,0,1200,40);c.fillRect(0,610,1200,40);c.fillStyle="#ffe1aa";c.font="bold 18px monospace";c.textAlign="center";c.fillText(f.time<3?"BOSS DESTROYED / CHAIN REACTION":g.islandMission?"FORTRESS DESTROYED / RETURN TO THE RESOLUTE":g.campaign?"WRECKAGE AHEAD / PREPARE TO ESCAPE":"AIRSPACE CLEAR / NEXT WAVE INBOUND",600,635);
}
