import type { Battle } from "./battle";
import { wrapDelta } from "./game-rules";
export type GroundTarget={kind:"fuel"|"radar"|"ammo";x:number;y:number;hp:number;hits:number;burn:number};
const wrap=(x:number)=>(x%3000+3000)%3000;
export function seedTargets(g:Battle){
 g.groundTargets=[];g.radarDisabled=false;
 if(g.campaign?.phase==="escape"||(!g.campaign&&g.wave<4))return;
 const base=g.trucks[0]?.x??2100;
 g.groundTargets=[{kind:"fuel",x:wrap(base+105),y:575,hp:2,hits:0,burn:0},{kind:"ammo",x:wrap(base+260),y:582,hp:2,hits:0,burn:0},{kind:"radar",x:wrap(base+700),y:566,hp:2,hits:0,burn:0}];
}
export function hitTarget(g:Battle,t:GroundTarget,damage:number){
 if(t.hp<=0)return;t.hp=Math.max(0,t.hp-damage);g.burst(t.x,t.y,"#ffd17d");
 if(t.hp>0)return;t.burn=14;g.metrics.ground++;g.addScore(t.kind==="radar"?450:300,t.kind.toUpperCase()+" DESTROYED");g.burst(t.x,t.y,"#ffad59",true,t.kind);g.sounds.push("explode");
 if(t.kind==="radar"){g.radarDisabled=true;g.announce("RADAR DOWN / SLOWER ENEMY FIRE & REINFORCEMENTS");return}
 const radius=t.kind==="fuel"?190:230;
 // Mark destroyed before recursion; every target can explode only once.
 for(const other of g.groundTargets)if(other!==t&&Math.abs(wrapDelta(other.x,t.x))<radius)hitTarget(g,other,2);
 for(const truck of g.trucks)if(truck.hp>0&&Math.abs(wrapDelta(truck.x,t.x))<radius){truck.hp=0;g.stats.trucks++;if(g.mission?.kind==="ground")g.mission.progress++;g.metrics.ground++;g.addScore(400,"CHAIN REACTION / AA TRUCK");g.burst(truck.x,truck.y,"#ffb15d",true,"truck")}
 g.trucks=g.trucks.filter(t=>t.hp>0);
 for(const car of g.campaign?.carriages??[])if(car.hp>0&&Math.abs(wrapDelta(car.x,t.x))<radius){car.hp=Math.max(0,car.hp-2);g.burst(car.x,car.y,"#ffb15d",true,"train");if(car.hp===0){g.metrics.ground++;g.addScore(600,"CHAIN REACTION / CARRIAGE")}}
 if(Math.hypot(wrapDelta(g.player.x,t.x),g.player.y-t.y)<110)g.damage(1);
 if(t.kind==="ammo")g.bombBalloons.push({x:t.x,y:430,life:22});
}
export function groundBullet(g:Battle,b:{x:number;y:number;damage?:number}){
 for(const t of g.groundTargets)if(t.hp>0&&Math.abs(wrapDelta(b.x,t.x))<32&&Math.abs(b.y-t.y)<30){g.metrics.hits++;t.hits+=b.damage??1;g.burst(b.x,b.y,"#ffd699");if(t.hits>=3){const hits=Math.floor(t.hits/3);t.hits%=3;hitTarget(g,t,hits)}return true}return false;
}
export function drawGroundTargets(c:CanvasRenderingContext2D,g:Battle){
 for(const t of g.groundTargets){const x=wrapDelta(t.x,g.camera)+600;c.save();c.translate(x,t.y);
 c.fillStyle="#14211d66";c.beginPath();c.ellipse(0,600-t.y,38,5,0,0,Math.PI*2);c.fill();
 const metal=c.createLinearGradient(-30,0,30,0);metal.addColorStop(0,"#354c47");metal.addColorStop(.4,t.hp>0?"#b4b49a":"#5a6254");metal.addColorStop(1,"#435448");c.fillStyle=metal;c.strokeStyle="#203a37";c.lineWidth=2;
 if(t.kind==="fuel"){c.fillRect(-28,-18,56,35);c.beginPath();c.ellipse(0,-18,28,8,0,0,Math.PI*2);c.fill();c.stroke();c.beginPath();c.ellipse(0,17,28,8,0,0,Math.PI);c.stroke();c.fillStyle="#d5b579";c.fillRect(-28,-2,56,7);c.fillStyle="#334844";c.font="bold 12px monospace";c.textAlign="center";c.fillText("FUEL",0,4);c.strokeStyle="#cad0b0";for(let yy=-12;yy<18;yy+=6){c.beginPath();c.moveTo(18,yy);c.lineTo(25,yy);c.stroke()}}
 else if(t.kind==="radar"){c.fillRect(-23,18,46,16);c.strokeStyle="#99aca3";c.lineWidth=4;c.beginPath();c.moveTo(-13,25);c.lineTo(0,-15);c.lineTo(13,25);c.moveTo(-8,8);c.lineTo(8,8);c.stroke();c.save();c.translate(0,-18);c.rotate(t.hp>0?Math.sin(g.time)*.5:.9);c.fillStyle=metal;c.beginPath();c.ellipse(0,0,29,10,-.3,0,Math.PI);c.fill();c.stroke();c.restore();if(t.hp>0){c.strokeStyle="#a5d99455";for(let r=12;r<40;r+=12){c.beginPath();c.arc(4,-24,r,-1.7,-.6);c.stroke()}}}
 else{c.fillRect(-31,-11,62,24);for(const wx of [-21,21]){c.fillStyle="#1a2b2e";c.beginPath();c.arc(wx,13,7,0,Math.PI*2);c.fill()}for(const dx of [-22,0,22]){c.fillStyle="#8e9671";c.fillRect(dx-9,-24,18,18);c.strokeStyle="#c1b689";c.strokeRect(dx-9,-24,18,18);c.beginPath();c.moveTo(dx-8,-23);c.lineTo(dx+8,-7);c.stroke()}}
 if(t.hp===0){c.fillStyle="#1c2827";c.beginPath();c.ellipse(0,0,22,12,.3,0,Math.PI*2);c.fill();if(t.burn>0){for(let i=0;i<4;i++){c.fillStyle="#40403c77";c.beginPath();c.ellipse(Math.sin(g.time+i)*7,-20-i*16,10+i*4,13+i*4,0,0,Math.PI*2);c.fill()}c.fillStyle="#ffba65";c.beginPath();c.moveTo(-8,0);c.lineTo(-2,-25-Math.sin(g.time*11)*6);c.lineTo(9,0);c.fill()}}
 c.font="bold 11px monospace";c.textAlign="center";c.fillStyle=t.hp>0?"#f5d796":"#a0ad9a";c.fillText((g.bay?"ENEMY ":"")+t.kind.toUpperCase()+(t.hp<=0?" / DISABLED":""),0,-53);for(let i=0;i<t.hp;i++)c.fillRect(-13+i*15,-45,11,3);c.restore()}
}
