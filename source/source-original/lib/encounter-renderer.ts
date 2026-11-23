import type { Battle } from "./battle";
import { wrapDelta } from "./game-rules";
import { PASS_RIDGES } from "./mission-story";
export function drawEncounters(c:CanvasRenderingContext2D,g:Battle){
 const a=g.campaign;if(!a)return;const sx=(x:number)=>wrapDelta(x,g.camera)+600;
 const text=(s:string,x:number,y:number)=>{c.font="bold 12px monospace";c.textAlign="center";c.fillStyle="#f5d9a3";c.fillText(s,x,y)};
 if(a.phase==="mission"&&a.region===1)for(const f of a.flares){const x=sx(f.x);c.save();c.globalAlpha=f.triggered?.25:.75;c.strokeStyle="#e2a068";c.lineWidth=3;c.beginPath();for(let i=0;i<7;i++){const y=590-i*12,xx=x+Math.sin(g.time+i)*6;if(i===0)c.moveTo(xx,y);else c.lineTo(xx,y)}c.stroke();c.fillStyle="#db8d51";c.beginPath();c.ellipse(x,595,16,4,0,0,Math.PI*2);c.fill();c.restore();if(!f.triggered)text("SURVIVOR SIGNAL",x,497)}
 if(a.region===2&&a.phase==="mission"){
  const x=sx(1900);c.strokeStyle="#65747a";c.lineWidth=9;c.beginPath();c.moveTo(x-150,550);c.lineTo(x+150,550);c.stroke();
  for(let i=0;i<3;i++){const xx=x-100+i*100;c.strokeStyle="#89918b";c.lineWidth=7;c.beginPath();if(i<a.strikes){c.moveTo(xx-45,552);c.lineTo(xx-25,578);c.moveTo(xx+25,578);c.lineTo(xx+45,552)}else c.arc(xx,605,48,Math.PI,0);c.stroke();if(i<a.strikes){c.fillStyle="#b7afa74d";c.beginPath();c.ellipse(xx,530-Math.sin(g.time+i)*12,18,28,0,0,Math.PI*2);c.fill()}}
  text("EVACUATION BRIDGE / "+Math.max(0,3-a.strikes)+" SECTIONS",x,532);
 }
 if(a.region===4&&(a.phase==="mission"||a.phase==="opening"))for(const ridge of PASS_RIDGES){
  const x=sx(ridge.x),w=ridge.width,y=ridge.top,rock=c.createLinearGradient(x-w/2,y,x+w/2,610);rock.addColorStop(0,"#c3d0d0");rock.addColorStop(.2,"#617581");rock.addColorStop(1,"#263e52");c.fillStyle=rock;c.beginPath();c.moveTo(x-w/2,610);c.lineTo(x-w/2,y+22);c.lineTo(x-w*.3,y);c.lineTo(x+w*.2,y+3);c.lineTo(x+w/2,y+18);c.lineTo(x+w/2,610);c.closePath();c.fill();
  c.strokeStyle="#d9e7e6";c.lineWidth=4;c.beginPath();c.moveTo(x-w/2,y+22);c.lineTo(x-w*.3,y);c.lineTo(x+w*.2,y+3);c.lineTo(x+w/2,y+18);c.stroke();
  c.strokeStyle="#283f5088";c.lineWidth=2;for(let i=0;i<9;i++){c.beginPath();c.moveTo(x-w/2+i*w/9,y+24);c.lineTo(x-w/2+i*w/9+12,610);c.stroke()}text("ROCK FACE / CLIMB",x,y-20);
 }
 for(const t of a.carriages)if(t.hp>0&&t.aimX!==undefined){c.save();c.strokeStyle="#f1be7c99";c.lineWidth=2;c.setLineDash([5,7]);c.beginPath();c.moveTo(sx(t.x),t.y-35);c.lineTo(sx(t.x)+wrapDelta(t.aimX,t.x),t.aimY??250);c.stroke();c.restore();text("LOCKED SHOT",sx(t.x),t.y-80)}
 const objective=a.phase==="mission"&&a.region===0||a.phase==="mission"&&a.region===4?a.transport:null;
 if(objective&&objective.hp<4){c.fillStyle="#55565c88";for(let i=0;i<4;i++){c.beginPath();c.ellipse(sx(objective.x)-60-i*14,objective.y-10-i*5,8+i*3,7+i*2,0,0,Math.PI*2);c.fill()}}
}
