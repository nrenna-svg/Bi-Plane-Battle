import type { Battle, Enemy } from "./battle";
import { wrapDelta } from "./game-rules";
export function dodge(g:Battle){
 if(g.mode!=="playing"||g.finale||g.briefingTimer>0||g.campaign?.transition||g.mission?.complete||g.landed||g.dodgeCooldown>0)return false;
 g.dodgeCooldown=5;g.dodgeTimer=.38;g.invulnerable=Math.max(g.invulnerable,.32);g.player.vy=Math.max(-220,g.player.vy-120);g.sounds.push("dodge");return true;
}
export function updateFlightFeel(g:Battle,dt:number,keys:Set<string>){
 g.dodgeCooldown=Math.max(0,g.dodgeCooldown-dt);g.dodgeTimer=Math.max(0,g.dodgeTimer-dt);g.grazeCooldown=Math.max(0,g.grazeCooldown-dt);
 const held=keys.has("ShiftLeft")||keys.has("ShiftRight");
 if(held&&!g.dodgeHeld)dodge(g);g.dodgeHeld=held;
 g.diving=keys.has("KeyR")&&!keys.has("ArrowDown")&&!keys.has("KeyS")&&!g.landed&&g.player.stall===0;
 g.diveEnergy=Math.max(0,Math.min(1,g.diveEnergy+(g.diving?.65:-.35)*dt));
 const target=Math.max(-.45,Math.min(.55,g.player.vy/500));
 g.bank+=(target-g.bank)*Math.min(1,dt*9);
 g.controlDeflection+=((keys.has("Space")||keys.has("ArrowUp")||keys.has("KeyW")?-1:g.diving?1:0)-g.controlDeflection)*Math.min(1,dt*12);
}
export function nearMiss(g:Battle,e:Enemy){
 if(e.grazed||g.invulnerable>0||g.player.cool>0||g.grazeCooldown>0)return;
 const dx=Math.abs(wrapDelta(g.player.x,e.x)),dy=Math.abs(g.player.y-e.y);
 if(dx<55&&dy>40&&dy<66&&Math.abs(g.player.vx-e.vx)>140){e.grazed=true;g.grazeCooldown=2;g.style.nearMisses++;g.addScore(75,"CLOSE CALL",false);g.sounds.push("near-miss")}
}
