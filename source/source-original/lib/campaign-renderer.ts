import { ISLAND_TARGETS } from "./island-progress";
import { drawMissionBriefing } from "./briefing-renderer";
import { missionName, STAGE_COUNT } from "./mission-catalog";
import { missionBrief } from "./briefings";
import { drawCarrier } from "./carrier-art";
import { drawWreckage } from "./wreckage";
import { STORIES } from "./mission-story";
import { drawSceneryArt } from "./scenery-art";
import type { Battle } from "./battle";
import { wrapDelta } from "./game-rules";
import { REGIONS, campaignLabel } from "./campaign";
export function drawCampaignBackdrop(c:CanvasRenderingContext2D,g:Battle){
 const a=g.campaign;if(!a)return;const r=a.region,t=g.time;
 if(drawSceneryArt(c,(["harbor","forest","city","desert","mountain"] as const)[r],g.camera))return;
 const sky=c.createLinearGradient(0,0,0,600);
 const colors=[["#10293f","#61838c"],["#23546a","#bed3a7"],["#372f4b","#e6a17a"],["#715068","#edc089"],["#1a3553","#adcddc"]][r];
 sky.addColorStop(0,colors[0]);sky.addColorStop(1,colors[1]);c.fillStyle=sky;c.fillRect(0,0,1200,600);
 // Layers scroll at different rates so the battlefield has depth.
 for(let layer=0;layer<3;layer++){const par=.12+layer*.12;c.fillStyle=["#334d6077","#365465aa","#263d4e"][layer];
  for(let i=-2;i<12;i++){const x=i*170-((g.camera*par)%170),base=550+layer*20,h=100+Math.sin(i*9+layer)*60;
   if(r===0){c.fillRect(x,base-h*.5,125,h*.5);c.strokeStyle="#91b3b780";c.lineWidth=4;c.beginPath();c.moveTo(x+60,base);c.lineTo(x+60,base-h-75);c.lineTo(x+135,base-h-50);c.moveTo(x+60,base-h-75);c.lineTo(x-25,base-h-50);c.moveTo(x+128,base-h-50);c.lineTo(x+128,base-45);c.stroke();}
   else if(r===2){c.fillRect(x,base-h,130,h);c.fillRect(x+18,base-h-55,17,60);c.fillRect(x+55,base-h-30,24,35);for(let j=0;j<5;j++){c.fillStyle="#ffd39166";c.fillRect(x+12+j*22,base-h+18,6,8)}c.fillStyle=["#334d6077","#365465aa","#263d4e"][layer];for(let j=0;j<3;j++){c.beginPath();c.ellipse(x+25+j*15+Math.sin(t*.3)*15,base-h-65-j*17,15+j*8,9+j*4,0,0,Math.PI*2);c.fill()}}
   else{c.beginPath();c.moveTo(x-45,base);c.lineTo(x+70,base-h-(r===4?130:0));c.lineTo(x+210,base);c.fill();if(r===4){c.fillStyle="#d9e5e7aa";c.beginPath();c.moveTo(x+70,base-h-130);c.lineTo(x+39,base-h-70);c.lineTo(x+73,base-h-86);c.lineTo(x+105,base-h-66);c.fill();c.fillStyle=["#334d6077","#365465aa","#263d4e"][layer]}}
  }
 }
 if(r===1){for(let i=0;i<22;i++){const x=i*65-((g.camera*.45)%65),y=480+(i%4)*17;c.fillStyle="#174b43";c.fillRect(x-4,y,8,115);for(let j=0;j<3;j++){c.beginPath();c.ellipse(x,y-j*18,28-j*4,26,0,0,Math.PI*2);c.fill()}}
  const x=670-(g.camera*.18)%400;const water=c.createLinearGradient(x,0,x+90,0);water.addColorStop(0,"#8bc6d060");water.addColorStop(.5,"#e3f6eaaa");water.addColorStop(1,"#8bc6d030");c.fillStyle=water;c.fillRect(x,375,90,225);c.strokeStyle="#e2ffff99";for(let i=0;i<14;i++){const y=390+(i*23+t*95)%210;c.beginPath();c.moveTo(x+10+i%4*20,y);c.lineTo(x+10+i%4*20,y+30);c.stroke()}}
 if(r===2){c.strokeStyle="#253f50";c.lineWidth=8;c.beginPath();c.moveTo(0,560);c.lineTo(1200,560);c.stroke();for(let x=0;x<1200;x+=160){c.beginPath();c.arc(x,600,65,Math.PI,0);c.stroke()}}
 if(r===4){const x=850-(g.camera*.25)%600;c.fillStyle="#374b61";c.fillRect(x,425,220,150);for(let i=0;i<5;i++){c.fillRect(x+i*48,398,25,40);c.fillStyle="#bcd4df";c.fillRect(x+i*48,395,25,5);c.fillStyle="#374b61"}}
 c.fillStyle=r===0?"#24495a":r===4?"#a8c4ce":r===3?"#a27b5b":"#304c44";c.fillRect(0,600,1200,50);
 if(r===0){c.strokeStyle="#8db7bd66";for(let i=0;i<35;i++){const x=(i*117+t*12)%1200,y=605+i%6*7;c.beginPath();c.moveTo(x,y);c.lineTo(x+30+i%4*15,y);c.stroke()}}
}
export function drawCampaignObjects(c:CanvasRenderingContext2D,g:Battle){
 const a=g.campaign,sx=(x:number)=>wrapDelta(x,g.camera)+600;
 if(a&&a.phase==="mission"&&REGIONS[a.region].mission==="escort"){
  const p=a.transport,x=sx(p.x);drawCarrier(c,x,p.y,g.reducedMotion?0:g.time,true,p.hp/8);
  c.fillStyle="#152e40";c.fillRect(x-55,p.y-60,110,8);c.fillStyle="#9eebbd";c.fillRect(x-55,p.y-60,110*p.hp/8,8);c.font="12px monospace";c.textAlign="center";c.fillText("FRIENDLY TRANSPORT",x,p.y-68);
 }
 if(a)for(const [i,t] of a.carriages.entries()){
  const x=sx(t.x),y=t.y;c.save();c.translate(x,y);
 c.fillStyle="#12202788";c.beginPath();c.ellipse(0,23,61,5,0,0,Math.PI*2);c.fill();
 const armor=c.createLinearGradient(0,-34,0,16);armor.addColorStop(0,t.hp>0?"#a0ac98":"#555a54");armor.addColorStop(.35,t.hp>0?"#65786b":"#343e3c");armor.addColorStop(1,"#253833");
 c.fillStyle=armor;c.strokeStyle="#233730";c.lineWidth=2;c.beginPath();c.moveTo(-56,11);c.lineTo(-54,-19);c.lineTo(-43,-29);c.lineTo(43,-29);c.lineTo(55,-16);c.lineTo(56,11);c.closePath();c.fill();c.stroke();
 for(const w of [-38,-14,14,38]){c.fillStyle="#15232a";c.beginPath();c.arc(w,14,9,0,Math.PI*2);c.fill();c.fillStyle="#889288";c.beginPath();c.arc(w,14,6,0,Math.PI*2);c.fill();c.strokeStyle="#354844";for(let k=0;k<4;k++){const angle=k*Math.PI/2+g.time*2;c.beginPath();c.moveTo(w,14);c.lineTo(w+Math.cos(angle)*6,14+Math.sin(angle)*6);c.stroke()}}
 c.strokeStyle="#9aab9d";c.lineWidth=3;c.beginPath();c.moveTo(-40,14);c.lineTo(39,14);c.stroke();
 c.strokeStyle="#293e38";c.lineWidth=1;for(const dx of [-36,-12,12,36]){c.beginPath();c.moveTo(dx,-25);c.lineTo(dx,5);c.stroke();c.fillStyle="#b8bc9c";for(const yy of [-22,1]){c.beginPath();c.arc(dx+3,yy,1,0,Math.PI*2);c.fill()}}
 c.fillStyle=t.turretHp===0?"#172729":armor;c.beginPath();c.ellipse(0,-29,t.turretHp===0?12:23,t.turretHp===0?4:11,0,0,Math.PI*2);c.fill();c.stroke();
 if(t.hp>0&&t.turretHp!==0){c.save();c.translate(0,-34);c.rotate(Math.atan2(g.player.y-t.y,wrapDelta(g.player.x,t.x)));c.fillStyle="#819589";c.fillRect(0,-4,34,8);c.fillStyle="#263b36";c.fillRect(32,-5,8,10);c.restore()}
 if(i===0){c.fillStyle="#344941";c.fillRect(28,-47,15,20);c.fillStyle="#9cafac";c.fillRect(30,-44,11,8);c.strokeStyle="#c4c9ae";c.beginPath();c.moveTo(27,-48);c.lineTo(45,-48);c.stroke()}
 c.fillStyle="#263630";c.fillRect(-66,3,11,4);
 if(t.hp<3){c.fillStyle="#1b2523";c.beginPath();c.ellipse(23,-9,8+(3-t.hp)*3,7,.3,0,Math.PI*2);c.fill();for(let n=0;n<5;n++){c.fillStyle="#333b3977";c.beginPath();c.ellipse(18+Math.sin(g.time+n)*6,-32-n*10,8+n*3,10+n*2,0,0,Math.PI*2);c.fill()}if(t.hp===0){c.fillStyle="#efa757";c.beginPath();c.moveTo(-13,-20);c.lineTo(-7,-40-Math.sin(g.time*12)*6);c.lineTo(2,-21);c.fill()}}
 c.fillStyle="#ffcc88";for(let n=0;n<t.hp;n++)c.fillRect(-24+n*18,-58,14,4);c.restore();
 }
 if(a&&g.boss&&REGIONS[a.region].boss==="carrier"){
  const x=sx(g.boss.x),y=g.boss.y;
  if(a.spawn<1.2){c.fillStyle="#f5d09c";c.font="bold 12px monospace";c.textAlign="center";c.fillText("HANGARS OPEN / FIGHTERS LAUNCHING",x,y+58)}
 }
 drawWreckage(c,g);
}
export function drawCampaignWeather(c:CanvasRenderingContext2D,g:Battle){
 const a=g.campaign;if(!a)return;const t=g.reducedMotion?0:g.time,r=a.region;
 if(r===0||r===4||r===1&&a.phase==="mission"){c.strokeStyle="#c6e7f344";c.fillStyle="#e9f4f6aa";c.lineWidth=1;for(let i=0;i<85;i++){const x=(i*137+t*(r!==4?60:18))%1200,y=(i*79+t*(r!==4?400:35))%600;if(r!==4){c.beginPath();c.moveTo(x,y);c.lineTo(x-5,y+16);c.stroke()}else{c.beginPath();c.arc(x,y,1+i%2,0,Math.PI*2);c.fill()}}}
 if(r===0&&!g.reducedMotion&&g.time%19>.04&&g.time%19<.11){c.fillStyle="#d4efff16";c.fillRect(0,0,1200,600)}
 if(g.briefingTimer>0&&g.islandMission){const t=ISLAND_TARGETS[g.islandMission];drawMissionBriefing(c,{sector:"KESTREL ISLAND",stage:"OPERATION BREAKWATER",title:t.name,objective:t.objective,threat:"Enemy patrols defend this target. Complete the sortie before time runs out.",tip:t.effect,accent:"#81cbdc",timer:g.briefingTimer})}
 else if(g.briefingTimer>0){const brief=missionBrief(a);drawMissionBriefing(c,{...brief,sector:REGIONS[r].name,stage:"STAGE "+String(a.stage+1).padStart(2,"0")+" / "+STAGE_COUNT,title:missionName(a.stage),accent:REGIONS[r].color,timer:g.briefingTimer})}
}
