import type { Battle, Enemy } from './battle';
import { wrapDelta } from './game-rules';
export type GuidedMissile={x:number;y:number;angle:number;life:number;trail:{x:number;y:number}[]};
export const bellyOpen=(e:Enemy)=>!e.gunship||e.podHp===0||(e.attackTime??0)>=5;
export function updateGunship(g:Battle,e:Enemy,dt:number){
 if(!e.gunship)return;
 if(e.podHp===0){e.attackTime=5;if(!e.missile)return;}
 const p=g.player,visible=!g.hidden&&Math.hypot(wrapDelta(p.x,e.x),p.y-e.y)<650;
 let t=e.attackTime??0;
 if(t<5&&!visible){e.attackTime=0;return;}
 const next=t+dt;e.attackTime=next;
 if(t<4&&Math.floor(t*3)!==Math.floor(next*3))g.sounds.push('tracking');
 if(t<4&&next>=4){g.sounds.push('locked');g.announce('MISSILE LOCK / TURN OR DODGE');}
 if(e.podHp!==0&&t<5&&next>=5&&!e.missile){
  e.missile={x:e.x,y:e.y+24,angle:Math.atan2(p.y-e.y,wrapDelta(p.x,e.x)),life:4,trail:[]};
  g.sounds.push('missile');g.announce('MISSILE INCOMING / PINK BELLY EXPOSED');
 }
 if(next>=11)e.attackTime=0;
 const m=e.missile;if(!m)return;
 m.life-=dt;
 const wanted=Math.atan2(p.y-m.y,wrapDelta(p.x,m.x));
 const delta=Math.atan2(Math.sin(wanted-m.angle),Math.cos(wanted-m.angle));
 m.angle+=Math.max(-.85*dt,Math.min(.85*dt,delta));
 m.trail.push({x:m.x,y:m.y});if(m.trail.length>22)m.trail.shift();
 m.x=(m.x+Math.cos(m.angle)*300*dt+3000)%3000;m.y+=Math.sin(m.angle)*300*dt;
 if(Math.hypot(wrapDelta(p.x,m.x),p.y-m.y)<24){g.damage(1,m);g.burst(m.x,m.y,'#ffbd80');e.missile=undefined;}
 else if(m.life<=0||m.y>610||m.y< -220){g.burst(m.x,m.y,'#c5b9a2');e.missile=undefined;}
}
export function drawWeakPoint(c:CanvasRenderingContext2D,e:Enemy,time:number,reduced:boolean){
 if(e.specialist)return;
 if((e.armor??0)>0||!bellyOpen(e))return;
 c.save();c.strokeStyle=e.cool>0?'#fff2fa':'#ff70c6';c.fillStyle=c.strokeStyle;
 c.globalAlpha=reduced?.85:.65+.35*Math.sin(time*4)**2;c.lineWidth=3;c.shadowColor='#ff70c6';c.shadowBlur=reduced?0:7;
 const belly=e.vehicle==='helicopter',tail=!!e.vehicle&&!belly;
 c.beginPath();if(tail){c.moveTo(-34,-9);c.lineTo(-34,10);}else{c.ellipse(0,belly?12:-13,22,7,0,belly?0:Math.PI,belly?Math.PI:Math.PI*2);}c.stroke();
 c.beginPath();if(tail){c.moveTo(-45,-5);c.lineTo(-39,0);c.lineTo(-45,5);}else{const y=belly?29:-29,s=belly?-1:1;c.moveTo(-5,y);c.lineTo(0,y+s*6);c.lineTo(5,y);}c.stroke();c.restore();
}
export function drawMissileThreat(c:CanvasRenderingContext2D,g:Battle){
 const sx=(x:number)=>wrapDelta(x,g.camera)+600;
 for(const e of g.enemies){if(!e.gunship)continue;const t=e.attackTime??0;
  if(t>0&&t<5){const x=sx(g.player.x),y=g.player.y,r=38;c.save();c.strokeStyle=t>=4?'#ff705e':'#ffcb78';c.lineWidth=2;
   for(const a of [-1,1])for(const b of [-1,1]){c.beginPath();c.moveTo(x+a*(r-10),y+b*r);c.lineTo(x+a*r,y+b*r);c.lineTo(x+a*r,y+b*(r-10));c.stroke();}
   c.fillStyle=c.strokeStyle;c.font='bold 12px monospace';c.textAlign='center';c.fillText(t>=4?'LOCKED — EVADE':'TRACKING',x,y+58);c.restore();
  }
  const m=e.missile;if(!m)continue;
  c.save();m.trail.forEach((p,i)=>{c.globalAlpha=i/m.trail.length*.45;c.fillStyle='#d4d3ca';c.beginPath();c.arc(sx(p.x),p.y,2+(m.trail.length-i)*.2,0,Math.PI*2);c.fill();});c.globalAlpha=1;
  c.translate(sx(m.x),m.y);c.rotate(m.angle);c.fillStyle='#ffc677';c.beginPath();c.moveTo(-9,-3);c.lineTo(-22,0);c.lineTo(-9,3);c.fill();c.fillStyle='#e8e4cf';c.beginPath();c.moveTo(12,0);c.lineTo(3,-4);c.lineTo(-10,-4);c.lineTo(-10,4);c.lineTo(3,4);c.closePath();c.fill();c.restore();
  const a=Math.atan2(m.y-g.player.y,wrapDelta(m.x,g.player.x));c.save();c.translate(sx(g.player.x),g.player.y);c.rotate(a);c.fillStyle='#ff765f';c.beginPath();c.moveTo(68,0);c.lineTo(55,-6);c.lineTo(55,6);c.fill();c.restore();
 }
}
