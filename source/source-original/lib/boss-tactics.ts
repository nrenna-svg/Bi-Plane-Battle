import type { Battle } from "./battle";
import { wrapDelta } from "./game-rules";
export type AirMine={x:number;y:number;life:number;arm:number;phase:number};
export function updateBossTactics(g:Battle,dt:number){
 if(g.boss&&(g.campaign?.region===1||!g.campaign&&g.boss.kind!=="fortress")){
  g.mineTimer-=dt;if(g.mineTimer<=0){g.mineTimer=3.4;for(const offset of [-90,90])g.airMines.push({x:(g.boss.x+offset+3000)%3000,y:g.boss.y+55,life:8,arm:1,phase:g.random()*6});g.airMines=g.airMines.slice(-12);g.announce("AIRSHIP MINES / SHOOT THEM OR FLY CLEAR");g.sounds.push("warning")}
 }
 g.airMines=g.airMines.filter(m=>{m.life-=dt;m.arm=Math.max(0,m.arm-dt);m.y+=22*dt;
  if(m.arm===0&&Math.hypot(wrapDelta(m.x,g.player.x),m.y-g.player.y)<34){g.damage(1,m);g.burst(m.x,m.y,"#ffb76b",true,"mine");g.sounds.push("explode");return false}
  return m.life>0&&m.y<585});
}
export function hitMine(g:Battle,b:{x:number;y:number}){
 const i=g.airMines.findIndex(m=>Math.hypot(wrapDelta(m.x,b.x),m.y-b.y)<20);if(i<0)return false;const m=g.airMines.splice(i,1)[0];g.metrics.hits++;g.burst(m.x,m.y,"#ffca81",true,"mine");g.addScore(75,"MINE CLEARED",false);g.sounds.push("explode");return true;
}
export function drawMines(c:CanvasRenderingContext2D,g:Battle){
 for(const m of g.airMines){const x=wrapDelta(m.x,g.camera)+600,y=m.y,t=g.reducedMotion?0:g.time;c.save();c.translate(x,y);
 const metal=c.createLinearGradient(-12,-14,12,14);metal.addColorStop(0,"#b9d1d7");metal.addColorStop(.35,"#5e7a87");metal.addColorStop(1,"#172d3b");c.fillStyle=metal;c.strokeStyle="#122735";c.lineWidth=1.5;
 for(let i=0;i<8;i++){const a=i*Math.PI/4+m.phase*.1;c.save();c.rotate(a);c.beginPath();c.moveTo(9,-3);c.lineTo(17,-2);c.lineTo(19,0);c.lineTo(17,2);c.lineTo(9,3);c.fill();c.stroke();c.restore()}
 c.beginPath();c.arc(0,0,12,0,Math.PI*2);c.fill();c.stroke();c.strokeStyle="#b6c9cb";c.beginPath();c.ellipse(0,0,11,4,-.35,0,Math.PI*2);c.stroke();for(let i=0;i<5;i++){const a=i*Math.PI*2/5;c.fillStyle="#d4dcca";c.beginPath();c.arc(Math.cos(a)*8,Math.sin(a)*8,1,0,Math.PI*2);c.fill()}
 const hot=m.arm<=0;c.fillStyle=hot?"#ff765b":"#ffdb88";c.globalAlpha=g.reducedMotion?1:.65+Math.sin(t*9+m.phase)*.25;c.beginPath();c.arc(0,0,hot?4:3,0,Math.PI*2);c.fill();c.globalAlpha=1;c.strokeStyle=hot?"#ff977b88":"#ffdc9177";c.beginPath();c.arc(0,0,22,0,Math.PI*2*(hot?1:Math.max(0,1-m.arm)));c.stroke();c.font="bold 10px monospace";c.textAlign="center";c.fillText(hot?"ARMED":"ARMING",0,-29);c.restore()}
}
