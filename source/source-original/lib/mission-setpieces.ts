import type { Battle } from './battle';
import { wrapDelta } from './game-rules';
import { PASS_RIDGES } from './mission-story';
export const FIRE_LANES=[1450,1800,2200];
export function updateSetpiece(g:Battle,dt:number){
 const c=g.campaign;if(!c||c.transition||c.failed||c.won||g.finale||g.briefingTimer>0)return;
 const t=c.elapsed;
 if(c.phase==='mission'&&c.region===3){
  const cycle=t%10;
  if(cycle<2&&Math.floor(t/10)!==Math.floor((t-dt)/10)){g.announce('FUEL VENTS / KEEP ABOVE THE AMBER MARKERS');g.sounds.push('warning');}
  if(cycle>=2&&cycle-dt<2){g.sounds.push("artillery");if(!g.reducedMotion)g.shake=Math.max(g.shake,2);}
  if(cycle>=2&&cycle<5)for(const x of FIRE_LANES)if(Math.abs(wrapDelta(g.player.x,x))<45&&g.player.y>475)g.damage(1,{x,y:560});
 }
 if(c.phase==='mission'&&c.region===0){
  const cycle=t%12;
  if(cycle<2&&Math.floor(t/12)!==Math.floor((t-dt)/12)){g.announce('STORM FRONT / CROSSWIND INCOMING');g.sounds.push('thunder');}
  if(cycle>=2&&cycle<4){g.player.vx+=Math.sin(Math.floor(t/12)+1)*90*dt;}
 }
 if(c.region===4&&c.phase==='opening'){
  for(const r of PASS_RIDGES)if(Math.abs(wrapDelta(g.player.x,r.x))<r.width/2+20&&g.player.y>r.top-22){g.damage(1,{x:r.x,y:r.top});g.player.y=r.top-25;g.player.vy=-170;}
  if(t<dt*2)g.announce('MOUNTAIN PURSUIT / CHASE THE SMOKING BOMBERS ABOVE THE RIDGES');
 }
}
export function drawSetpiece(c:CanvasRenderingContext2D,g:Battle){
 const a=g.campaign;if(!a||a.transition||g.briefingTimer>0)return;const t=a.elapsed,sx=(x:number)=>wrapDelta(x,g.camera)+600;
 c.save();c.font='bold 12px monospace';c.textAlign='center';
 if(a.region===3&&a.phase==='mission')for(const x of FIRE_LANES){
  const xx=sx(x),phase=t%10;c.fillStyle='#273631';c.fillRect(xx-26,580,52,20);
  c.strokeStyle='#f7c56b';c.setLineDash([5,5]);c.strokeRect(xx-45,475,90,125);c.setLineDash([]);
  c.fillStyle='#ffda88';c.fillText(phase<2?'FUEL VENT / CLIMB':phase<5?'FIRE COLUMN':'HOT WRECKAGE',xx,462);
  if(phase>=2&&phase<5){for(let i=0;i<5;i++){const dx=(i-2)*12,h=65+(g.reducedMotion?20:Math.sin(t*9+i)*25);c.fillStyle=i%2?'#ffb853bb':'#ed794477';c.beginPath();c.moveTo(xx+dx-13,594);c.quadraticCurveTo(xx+dx+15,560,xx+dx,594-h);c.quadraticCurveTo(xx+dx-20,560,xx+dx+15,594);c.fill();}}
  for(let i=0;i<4;i++){c.fillStyle='#41434233';c.beginPath();c.ellipse(xx+i*7,550-i*27,16+i*5,19+i*7,0,0,Math.PI*2);c.fill();}
 }
 if(a.region===0&&a.phase==='mission'&&t%12<4){
  c.fillStyle='#ffe3a8';c.fillText(t%12<2?'STORM FRONT / GUST APPROACHING':'CROSSWIND / CORRECT YOUR COURSE',600,95+g.cameraY);
  if(t%12>=2){c.strokeStyle='#bce3ec55';c.lineWidth=2;for(let i=0;i<16;i++){const x=(i*97+(g.reducedMotion?0:t*220))%1200,y=130+i*24+g.cameraY;c.beginPath();c.moveTo(x,y);c.lineTo(x+45,y-8);c.stroke();}}
 }
 c.restore();
}
