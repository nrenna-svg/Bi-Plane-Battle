import { overResolute } from "./kestrel-bay";
import { hitTarget } from "./ground-targets";
import type { Battle } from "./battle";
import { wrapDelta } from "./game-rules";
const wrap=(x:number)=>(x%3000+3000)%3000;
export function dropBomb(g:Battle){
 if(g.mode!=="playing"||g.finale||g.briefingTimer>0||g.campaign?.transition||g.mission?.complete||g.landed||g.bombAmmo<=0||g.bombCooldown>0)return false;
 // Reject friendly-deck releases before spending ammunition.
 const vy=Math.max(45,g.player.vy),flight=(-vy+Math.sqrt(vy*vy+520*Math.max(0,600-g.player.y-18)))/260;
 if(g.bay&&(overResolute(g.player.x)||overResolute(wrap(g.player.x+g.player.vx*flight)))){g.announce("FRIENDLY CARRIER / BOMB RELEASE INHIBITED");return false;}
 g.missionBombs++;g.bombAmmo--;g.bombCooldown=.8;g.playerBombs.push({x:g.player.x,y:g.player.y+18,vx:g.player.vx,vy:Math.max(45,g.player.vy)});
 g.sounds.push("flak");return true;
}
export function detonate(g:Battle,x:number,y:number){
 if(g.bay&&overResolute(x)){g.announce("RESOLUTE PROTECTED / FRIENDLY ORDNANCE SAFED");return;}
 for(const target of g.groundTargets){const d=Math.hypot(wrapDelta(target.x,x),target.y-y);if(d<85)hitTarget(g,target,d<48?2:1)}
 g.burst(x,y,"#ffc777",true);g.sounds.push("boss");
 g.craters.push({x,life:25});g.craters=g.craters.slice(-12);
 for(const t of g.trucks){const d=Math.hypot(wrapDelta(t.x,x),t.y-y);if(t.hp<=0||d>85)continue;t.hp=Math.max(0,t.hp-(d<48?2:1));if(t.hp===0){g.metrics.ground++;g.stats.trucks++;if(g.mission?.kind==="ground")g.mission.progress++;g.addScore(400,"AA TRUCK BOMBED");g.burst(t.x,t.y,"#ffab61",true,"truck")}}
 g.trucks=g.trucks.filter(t=>t.hp>0);
 if(g.campaign?.phase==="boss")for(const t of g.campaign.carriages){const d=Math.hypot(wrapDelta(t.x,x),t.y-y);if(t.hp<=0||d>85)continue;t.hp=Math.max(0,t.hp-(d<48?2:1));if(t.hp===0){g.metrics.ground++;g.addScore(600,"CARRIAGE BOMBED");g.burst(t.x,t.y,"#ffab61",true,"train")}}
}
export function updateBombing(g:Battle,dt:number,keys:Set<string>){
 g.bombCooldown=Math.max(0,g.bombCooldown-dt);
 if(keys.has("KeyB")&&!g.bombHeld)dropBomb(g);g.bombHeld=keys.has("KeyB");
 g.playerBombs=g.playerBombs.filter(b=>{b.vy+=260*dt;b.x=wrap(b.x+b.vx*dt);b.y+=b.vy*dt;
 const hit=g.groundTargets.some(t=>t.hp>0&&Math.abs(wrapDelta(b.x,t.x))<30&&b.y>=t.y-20)||g.trucks.some(t=>t.hp>0&&Math.abs(wrapDelta(b.x,t.x))<34&&b.y>=t.y-20)||g.campaign?.carriages.some(t=>t.hp>0&&Math.abs(wrapDelta(b.x,t.x))<54&&b.y>=t.y-28);
 if(hit||b.y>=600){detonate(g,b.x,Math.min(600,b.y));return false}return true});
 g.bombBalloonTimer-=dt;
 if(g.bombBalloonTimer<=0){g.bombBalloonTimer=25+g.random()*15;if(g.bombBalloons.length<2)g.bombBalloons.push({x:wrap(g.player.x+g.player.dir*650),y:190+g.random()*200,life:26})}
 g.bombBalloons=g.bombBalloons.filter(b=>{b.x=wrap(b.x-35*dt);b.life-=dt;if(g.bombAmmo<g.bombCapacity&&Math.hypot(wrapDelta(b.x,g.player.x),b.y+22-g.player.y)<42){g.bombAmmo++;g.sounds.push("pickup");g.announce("BOMB RESUPPLY / +1 / "+g.bombAmmo+" OF "+g.bombCapacity);return false}return b.life>0});
 g.craters=g.craters.filter(c=>{c.life-=dt;return c.life>0});
}
export function drawBombing(c:CanvasRenderingContext2D,g:Battle){
 const sx=(x:number)=>wrapDelta(x,g.camera)+600;
 const repair=g.campaign?.repairBalloon;
 if(repair){c.save();c.translate(sx(repair.x),repair.y);const fabric=c.createLinearGradient(-23,0,23,0);fabric.addColorStop(0,"#146b60");fabric.addColorStop(.4,"#a0ffdb");fabric.addColorStop(1,"#20947e");c.fillStyle=fabric;c.beginPath();c.ellipse(0,-10,23,29,0,0,Math.PI*2);c.fill();c.strokeStyle="#baffdf";for(const dx of [-15,15]){c.beginPath();c.moveTo(dx,9);c.lineTo(dx*.4,29);c.stroke()}c.fillStyle="#184b43";c.fillRect(-15,27,30,20);c.fillStyle="#e0fff1";c.fillRect(-2,30,4,14);c.fillRect(-7,35,14,4);c.font="bold 12px monospace";c.textAlign="center";c.fillText("CARRIER REPAIR +2",0,-49);c.fillText(g.campaign!.transport.hp>=8?"HULL FULL":"FLY INTO TO COLLECT",0,65);c.restore()}
 for(const b of g.bombBalloons){const x=sx(b.x),y=b.y;c.save();c.translate(x,y);const fabric=c.createLinearGradient(-22,0,22,0);fabric.addColorStop(0,"#8e492d");fabric.addColorStop(.4,"#ffe0a0");fabric.addColorStop(1,"#bf7347");c.fillStyle=fabric;c.beginPath();c.ellipse(0,-10,23,29,0,0,Math.PI*2);c.fill();c.strokeStyle="#efce98";for(const dx of [-15,15]){c.beginPath();c.moveTo(dx,9);c.lineTo(dx*.4,29);c.stroke()}c.fillStyle="#293e46";c.fillRect(-12,27,24,18);c.fillStyle="#ffe0a0";c.font="bold 12px monospace";c.textAlign="center";c.fillText("+1",0,40);c.fillText(g.bombAmmo===g.bombCapacity?"BOMBS FULL":"BOMB RESUPPLY",0,-48);c.restore()}
 for(const b of g.playerBombs){c.save();c.translate(sx(b.x),b.y);c.rotate(-Math.atan2(b.vx,b.vy));const metal=c.createLinearGradient(-6,0,6,0);metal.addColorStop(0,"#233943");metal.addColorStop(.4,"#a7b5a2");metal.addColorStop(1,"#405148");c.fillStyle=metal;c.beginPath();c.ellipse(0,0,6,13,0,0,Math.PI*2);c.fill();c.fillStyle="#d9b65f";c.fillRect(-6,-2,12,3);c.beginPath();c.moveTo(0,-8);c.lineTo(-10,-17);c.lineTo(10,-17);c.closePath();c.fill();c.restore()}
}
