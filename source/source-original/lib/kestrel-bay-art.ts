import { sceneryImage, backgroundTravel } from "./scenery-art";
import type { Battle } from "./battle";
import { wrapDelta } from "./game-rules";
import { drawAirframe } from "./airframes";
import { bayObjective, bayWaypoint, overResolute } from "./kestrel-bay";
const TAU=Math.PI*2;
function fire(c:CanvasRenderingContext2D,x:number,y:number,t:number,size=1){
 c.save();c.translate(x,y);c.scale(size,size);
 const glow=c.createRadialGradient(0,-12,1,0,-12,65);glow.addColorStop(0,"#ff9a3944");glow.addColorStop(1,"#ff6c1400");c.fillStyle=glow;c.fillRect(-65,-77,130,130);
 for(let i=0;i<7;i++){const age=(t*.24+i*.16)%1;const px=age*48+Math.sin(i*5)*9,py=-24-age*140,r=18+age*30;const smoke=c.createRadialGradient(px,py,0,px,py,r);smoke.addColorStop(0,`rgba(29,32,34,${.38*(1-age)})`);smoke.addColorStop(1,"#272d3100");c.fillStyle=smoke;c.fillRect(px-r,py-r,r*2,r*2);}
 for(let i=0;i<5;i++){c.fillStyle=i%2?"#ffc16c":"#e97533";c.beginPath();c.moveTo(-17+i*7,0);c.quadraticCurveTo(-20+i*7,-17, -13+i*7+Math.sin(t*9+i)*5,-25-(i%3)*9);c.quadraticCurveTo(5+i*4,-10,-7+i*6,0);c.fill();}c.restore();
}
export function drawBayBackdrop(c:CanvasRenderingContext2D,g:Battle){
 if(!g.bay)return;const t=g.reducedMotion?0:g.time;
 const fallback=c.createLinearGradient(0,0,0,650);fallback.addColorStop(0,"#233e53");fallback.addColorStop(.68,"#a6a99b");fallback.addColorStop(.7,"#456a7b");fallback.addColorStop(1,"#152f42");c.fillStyle=fallback;c.fillRect(0,0,1200,650);
 const img=sceneryImage("kestrel-bay");if(img){const width=1300,offset=((backgroundTravel(g.camera)*.18)%2600+2600)%2600;for(let i=-1;i<4;i++){const x=i*width-offset;if(x>1200||x+width<0)continue;c.save();c.translate(x+(i%2!==0?width:0),0);if(i%2!==0)c.scale(-1,1);c.drawImage(img,0,0,width,650);c.restore();}}
 for(let i=0;i<65;i++){const y=466+(i*29)%180,x=((i*113-g.camera*.17+t*7)%1300+1300)%1300-50;c.strokeStyle=i%4?"#bed4cd16":"#f3dec02a";c.lineWidth=.7;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+10,y-2,x+22,y);c.stroke();}
 // Distant ships stay below the aircraft's combat silhouette.
 for(let j=0;j<3;j++){const x=((j*570+160-g.camera*.23)%1700+1700)%1700-220,y=471+j*16;c.save();c.translate(x,y);const hull=c.createLinearGradient(0,-10,0,10);hull.addColorStop(0,"#73878c");hull.addColorStop(.25,"#405863");hull.addColorStop(1,"#1b3342");c.fillStyle=hull;c.beginPath();c.moveTo(-64,-9);c.lineTo(68,-9);c.lineTo(45,8);c.lineTo(-45,8);c.closePath();c.fill();c.fillRect(-18,-25,28,16);c.fillRect(-6,-37,7,14);c.fillStyle="#c6c4a6";for(let k=0;k<9;k++)c.fillRect(-40+k*9,-4,3,2);c.strokeStyle="#7b939b";c.lineWidth=1;c.beginPath();c.moveTo(20,-10);c.lineTo(20,-46);c.lineTo(42,-31);c.stroke();c.restore();}
 for(let i=0;i<5;i++){const x=((i*210+t*19-g.camera*.09)%1400+1400)%1400-100,y=160+i%3*34;c.strokeStyle="#243d4a66";c.lineWidth=2;c.beginPath();c.moveTo(x-8,y+2);c.lineTo(x,y);c.lineTo(x+8,y+2);c.moveTo(x,y-3);c.lineTo(x,y+5);c.stroke();}
}
export function drawBayWorld(c:CanvasRenderingContext2D,g:Battle){
 const b=g.bay;if(!b)return;const sx=(x:number)=>wrapDelta(x,g.camera)+600,t=g.reducedMotion?0:g.time;
 // Fixed landmarks turn the coast into a readable route, not a repeating backdrop.
 const lighthouse=sx(1030);c.save();c.translate(lighthouse,596);
 const stone=c.createLinearGradient(-22,0,22,0);stone.addColorStop(0,"#53666b");stone.addColorStop(.5,"#c2c6af");stone.addColorStop(1,"#65757b");c.fillStyle=stone;c.beginPath();c.moveTo(-24,0);c.lineTo(-14,-112);c.lineTo(14,-112);c.lineTo(24,0);c.fill();
 c.fillStyle="#874f40";c.fillRect(-17,-83,34,13);c.fillStyle="#263f4b";c.fillRect(-19,-126,38,15);c.fillStyle="#f1d697";c.fillRect(-13,-124,26,10);c.beginPath();c.moveTo(-25,-127);c.lineTo(0,-145);c.lineTo(25,-127);c.fill();c.restore();
 for(let j=0;j<3;j++){const x=sx(2290+j*245),burned=b.harbor[j]?.hp===0;c.save();c.translate(x,596);
 const steel=c.createLinearGradient(-8,-130,12,0);steel.addColorStop(0,"#b1b6a5");steel.addColorStop(1,"#3a535a");c.strokeStyle=steel;c.lineWidth=5;c.beginPath();c.moveTo(-28,0);c.lineTo(0,-(burned?80:135));c.lineTo(28,0);c.moveTo(0,-(burned?80:135));c.lineTo(burned?45:88,burned?-36:-112);c.stroke();c.lineWidth=1;c.strokeStyle="#b4bfad88";c.beginPath();c.moveTo(8,-120);c.lineTo(70,-104);c.lineTo(70,-42);c.stroke();
 c.fillStyle="#394f56";c.beginPath();c.moveTo(-60,0);c.lineTo(-60,-28);c.lineTo(-20,-42);c.lineTo(35,-28);c.lineTo(35,0);c.fill();c.fillStyle=burned?"#292e30":"#aaa994";for(let k=0;k<5;k++)c.fillRect(-50+k*15,-22,9,5);c.strokeStyle="#9ba9a1";c.lineWidth=1.5;c.beginPath();c.moveTo(40,0);c.lineTo(40,-62);c.stroke();c.fillStyle=burned?"#65473f":"#b9473d";c.beginPath();c.moveTo(40,-62);c.lineTo(68,-56);c.lineTo(40,-48);c.fill();c.fillStyle="#f4d0a7";c.font="bold 10px monospace";c.textAlign="center";c.fillText(burned?"ENEMY DEPOT / RUIN":"ENEMY SHORE DEPOT",0,-155);c.restore();if(burned)fire(c,x,589,t,.9);}
 // Sculpted coastal bank and foaming water meet exactly at the gameplay surface.
 const rock=c.createLinearGradient(0,592,0,660);rock.addColorStop(0,"#9b9980");rock.addColorStop(.12,"#697565");rock.addColorStop(.25,"#5b6762");rock.addColorStop(1,"#263d48");c.fillStyle=rock;c.fillRect(0,598,1200,90);
 for(let i=0;i<78;i++){const x=sx(i*41);c.strokeStyle=i%2?"#d1c1a140":"#122b3c66";c.lineWidth=1+i%3;c.beginPath();c.moveTo(x,603);c.lineTo(x-8,618+i%5*7);c.lineTo(x+11,660);c.stroke();}
 c.fillStyle="#343f43";c.fillRect(0,596,1200,8);c.fillStyle="#c4b48c";for(let wx=1350;wx<2150;wx+=47){const x=sx(wx);c.fillRect(x,598,15,1);}
 // Open-water section between the harbor and home; retain the physical deck.
 for(let i=0;i<120;i++){const wx=i*25;if(wx>=980&&wx<=2910)continue;const x=sx(wx);const sea=c.createLinearGradient(0,596,0,650);sea.addColorStop(0,"#426776");sea.addColorStop(1,"#1c394c");c.fillStyle=sea;c.fillRect(x-13,596,27,54);}
 for(let wx=2160;wx<2910;wx+=38){const x=sx(wx);c.fillStyle="#a18d73";c.fillRect(x,597,36,8);c.strokeStyle="#716450";c.lineWidth=1;for(let row=0;row<3;row++)c.strokeRect(x-(row%2)*18,608+row*14,36,13);}
 const bx=sx(1760);for(let i=-3;i<4;i++){const x=bx+i*65,broken=i< -3+b.bridge;c.fillStyle=broken?"#1b3643":"#657a78";if(broken){c.beginPath();c.moveTo(x,610);c.lineTo(x+22,635);c.lineTo(x+42,620);c.lineTo(x+48,649);c.lineTo(x,650);c.fill();}else{c.fillRect(x,606,12,58);c.strokeStyle="#80918b";c.lineWidth=3;c.beginPath();c.moveTo(x,614);c.lineTo(x+60,650);c.moveTo(x+60,614);c.lineTo(x,650);c.stroke();}}c.fillStyle="#a8aaa0";c.fillRect(bx-210,604,460,5);
 // Friendly deck: blue stripe, marked runway, parked aircraft and green approach lights.
 const home=sx(600);c.save();c.translate(home,0);
 const hull=c.createLinearGradient(0,596,0,648);hull.addColorStop(0,"#abbabe");hull.addColorStop(.2,"#617e8e");hull.addColorStop(.26,"#275f82");hull.addColorStop(.5,"#31566c");hull.addColorStop(1,"#152c3c");c.fillStyle=hull;c.beginPath();c.moveTo(-220,598);c.lineTo(220,598);c.lineTo(180,646);c.lineTo(-185,646);c.closePath();c.fill();
 c.fillStyle="#e2dfc6";c.fillRect(-215,594,430,7);c.fillStyle="#435966";c.fillRect(-205,586,410,8);
 c.strokeStyle="#f4edcf";c.lineWidth=1.5;c.strokeRect(-170,587,340,5);c.fillStyle="#e9e5c7";for(let x=-145;x<170;x+=35)c.fillRect(x,589,18,1.5);
 for(let i=0;i<12;i++){c.fillStyle="#142c3b";c.fillRect(-170+i*29,622,13,6);}
 c.fillStyle="#c2c9be";c.fillRect(-153,548,52,37);c.fillStyle="#40687a";c.fillRect(-146,555,38,9);c.fillStyle="#edf1d6";c.fillRect(-148,546,44,3);
 c.strokeStyle="#b5c9c8";c.lineWidth=2;c.beginPath();c.moveTo(-126,548);c.lineTo(-126,507);c.moveTo(-144,522);c.lineTo(-108,522);c.stroke();c.fillStyle="#4da4d7";c.fillRect(-124,509,25,13);c.fillStyle="#e9f4e9";c.fillRect(-114,511,3,9);c.fillRect(-118,514,11,3);
 for(const x of [-176,-96]){c.save();c.translate(x,580);c.scale(.38,.38);drawAirframe(c,"scout","#8ac7e5",0,0,0);c.restore();}
 c.fillStyle="#edf0dc";c.textAlign="center";c.font="bold 14px monospace";c.fillText("CV-01  RESOLUTE",30,621);c.fillStyle="#a8e4dc";c.font="10px monospace";c.fillText("FRIENDLY HOME CARRIER",30,637);
 const returning=b.phase==="return";for(let x=-195;x<=195;x+=30){c.fillStyle=returning?"#a0ffbc":"#8ad6e5";c.beginPath();c.arc(x,586,returning?2.8:1.8,0,TAU);c.fill();}
 if(returning){c.strokeStyle="#9aefbd88";c.setLineDash([8,8]);c.beginPath();c.moveTo(-320,544);c.lineTo(-200,580);c.moveTo(320,544);c.lineTo(200,580);c.stroke();c.setLineDash([]);}
 c.fillStyle="#0a2836e8";c.fillRect(-147,463,294,34);c.fillStyle="#b3f0df";c.font="bold 12px monospace";c.fillText(returning?"RESOLUTE / CLEARED TO LAND":"RESOLUTE / FRIENDLY — DO NOT ATTACK",0,478);c.font="10px monospace";c.fillText(returning?"GREEN LIGHTS · BRAKE ↓ · TOUCH DOWN GENTLY":"HOME BASE · BOMBS SAFED OVER DECK",0,491);
 c.restore();
 for(let i=0;i<28;i++){const x=sx(i*111),y=638+Math.sin(t*1.3+i)*3;c.strokeStyle="#d4e8df77";c.lineWidth=2;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+13,y-6,x+30,y-1);c.stroke();}
 for(const w of b.wrecks){const x=sx(w.x),age=w.age,y=Math.min(591,w.y+age*age*70);c.save();c.translate(x,y);c.rotate(w.kind==="truck"?Math.min(1.2,age*1.6):Math.min(1.7,age*.9));c.fillStyle="#29383b";c.strokeStyle="#b58a61";c.lineWidth=1.2;c.beginPath();c.moveTo(-27,-7);c.lineTo(-12,-15);c.lineTo(2,-3);c.lineTo(23,-10);c.lineTo(28,6);c.lineTo(-23,9);c.closePath();c.fill();c.stroke();if(w.kind==="plane"){c.fillStyle="#71817b";c.fillRect(-23,-17,32,5);}c.restore();if(y>570&&!overResolute(w.x))fire(c,x,590,t+w.x,.7);if(w.kind==="truck"){for(const dir of [-1,1]){const wx=x+dir*Math.min(60,age*28),wy=age<2?591-Math.abs(Math.sin(age*5))*18:593;c.fillStyle="#142632";c.beginPath();c.arc(wx,wy,6,0,TAU);c.fill();c.strokeStyle="#859188";c.stroke();}}}
 if(b.bridge>0)fire(c,bx+20,607,t,.6);
 if(b.rescue.status==="active"){
  const r=b.rescue,x=sx(r.x),y=r.y;c.save();c.translate(x,y);
  const fabric=c.createLinearGradient(-30,-25,30,0);fabric.addColorStop(0,"#276a65");fabric.addColorStop(.45,"#bdf0c9");fabric.addColorStop(1,"#408c78");c.fillStyle=fabric;c.beginPath();c.arc(0,0,29,Math.PI,TAU);c.quadraticCurveTo(17,-8,10,0);c.quadraticCurveTo(0,-8,-10,0);c.quadraticCurveTo(-20,-8,-29,0);c.fill();c.strokeStyle="#dce6c8";c.lineWidth=1;for(const dx of [-27,-10,10,27]){c.beginPath();c.moveTo(dx,0);c.lineTo(dx*.1,22);c.stroke();}
  c.fillStyle="#ecc6a0";c.beginPath();c.arc(0,13,4,0,TAU);c.fill();c.fillStyle="#83b6c9";c.fillRect(-4,17,8,12);c.strokeStyle="#bed7d2";c.lineWidth=2;c.beginPath();c.moveTo(-3,28);c.lineTo(-6,34);c.moveTo(3,28);c.lineTo(6,34);c.stroke();
  c.fillStyle="#0c2a39e8";c.fillRect(-76,-61,152,23);c.fillStyle="#c6f5d3";c.font="bold 11px monospace";c.textAlign="center";c.fillText("BLUE TWO / FRIENDLY",0,-46);c.restore();
 }
}
export function drawBayAircraft(c:CanvasRenderingContext2D,damage:number,strain:number,t:number,speed:number){
 c.save();c.lineWidth=.7;c.strokeStyle="#e9eee988";c.beginPath();c.moveTo(-20,-16);c.lineTo(18,-19);c.moveTo(-12,11);c.lineTo(23,9);c.stroke();
 const exhaust=c.createLinearGradient(-30,0,-85,0);exhaust.addColorStop(0,damage>.4?"#e79c5266":"#d6dfc72f");exhaust.addColorStop(1,"#c7d4cd00");c.fillStyle=exhaust;c.beginPath();c.moveTo(-29,-2);c.bezierCurveTo(-45,-5,-66,7,-85,2);c.lineTo(-85,8);c.bezierCurveTo(-61,12,-45,2,-29,3);c.fill();
 if(speed>150){c.strokeStyle="#e4f1e92c";for(const y of [-20,16]){c.beginPath();c.moveTo(-18,y);c.bezierCurveTo(-45,y-2,-78,y+4,-108,y+8);c.stroke();}}
 if(damage>.2){c.fillStyle="#182c33";for(let i=0;i<Math.ceil(damage*7);i++){c.beginPath();c.ellipse(-18+i*6,Math.sin(i*9)*9,1.8,1.1,i,0,TAU);c.fill();}}
 if(damage>.5){c.fillStyle="#bdba9b";c.beginPath();c.moveTo(-17,-17);c.lineTo(-30-Math.sin(t*18)*4,-13);c.lineTo(-21,-10);c.lineTo(-11,-15);c.fill();}
 if(strain>.65){c.strokeStyle="#ece6b46b";c.beginPath();c.moveTo(-28,-18);c.lineTo(-33,-20);c.moveTo(25,-18);c.lineTo(30,-20);c.stroke();}c.restore();
}
export function drawBayHud(c:CanvasRenderingContext2D,g:Battle){
 const b=g.bay;if(!b||g.briefingTimer>0||g.mode!=="playing")return;
 c.save();c.textAlign="center";c.fillStyle="#0c2436dd";c.fillRect(285,7,630,48);c.fillStyle="#f5d793";c.font="bold 12px monospace";c.fillText("FIRE OVER KESTREL BAY / "+b.phase.toUpperCase(),600,25);c.fillStyle="#d5e5e8";c.font="13px Arial";c.fillText(bayObjective(b),600,44);
 const waypoint=bayWaypoint(g),dx=wrapDelta(waypoint,g.player.x);
 const district=g.player.x<920?"RESOLUTE / OPEN WATER":g.player.x<1350?"NEEDLE POINT":g.player.x<2150?"COAST ROAD":"ENEMY HARBOR";
 c.fillStyle="#092331dd";c.fillRect(932,135,250,64);c.fillStyle="#ebd29b";c.font="bold 11px monospace";c.fillText(district,1057,153);c.fillText("NEXT "+(dx<0?"← ":"→ ")+Math.round(Math.abs(dx))+"m",1057,170);
 c.fillStyle="#59727b";c.fillRect(949,185,214,3);for(const x of [600,1100,1750,2500]){c.fillStyle="#ddc591";c.fillRect(949+x/3000*214,182,3,8);}c.fillStyle="#b8f0d0";c.beginPath();c.arc(949+g.player.x/3000*214,186,4,0,TAU);c.fill();
 if(b.phase!=="launch"&&b.phase!=="return"){c.textAlign="left";c.fillStyle="#0c2436dd";c.fillRect(18,135,250,48);c.fillStyle=g.radarDisabled?"#bce7c4":"#edcc8a";c.font="bold 11px monospace";c.fillText(g.radarDisabled?"RADAR SILENCED / LIGHTER DEFENSES":"OPTIONAL / RADAR AT NEEDLE POINT",28,154);c.font="11px Arial";c.fillText(g.radarDisabled?"Fewer patrols. Scarlet Finch flies alone.":"Destroy it to remove the ace’s escort.",28,171);c.textAlign="center";}
 if(b.rescue.status==="active"||b.rescue.status==="aboard"){
  const r=b.rescue,delta=wrapDelta(r.x,g.player.x);c.fillStyle="#0b293de8";c.fillRect(18,207,250,53);c.textAlign="left";c.fillStyle="#b7f3cf";c.font="bold 11px monospace";
  c.fillText(r.status==="active"?"OPTIONAL RESCUE / "+Math.ceil(r.time)+"s":"BLUE TWO ABOARD / GET HOME SAFELY",28,226);c.font="11px Arial";
  c.fillText(r.status==="active"?"Green parachute "+(delta<0?"← ":"→ ")+Math.round(Math.abs(delta))+"m · fly into pilot":"Finish the mission. Land without losing a life.",28,246);c.textAlign="center";
 }
 if(b.phase==="harbor"){c.fillStyle="#dbe6d3";c.font="12px monospace";c.fillText("DEPOTS "+b.harbor.filter(t=>t.hp<=0).length+"/3  ·  PATROLS "+b.harborWave+"/3",600,73);}
 if(b.phase==="return"){c.fillStyle="#bce7c4";c.font="13px monospace";c.fillText((b.homeward?"RESOLUTE ":"RETURN VIA NEEDLE POINT ")+(dx<0?"← ":"→ ")+Math.round(Math.abs(dx))+"m"+(b.homeward?" · HOLD ↓ TO BRAKE · "+b.landing.toFixed(1)+"/2s ON DECK":" · FOLLOW THE COAST HOME"),600,81);}
 if(b.warning>0){c.fillStyle="#412d2beb";c.fillRect(310,145,580,35);c.fillStyle="#ffcf90";c.font="bold 15px monospace";c.fillText(b.warningText,600,168);}
 if(b.phase==="convoy"&&g.trucks.length){const target=[...g.trucks].sort((a,z)=>Math.abs(wrapDelta(a.x,g.player.x))-Math.abs(wrapDelta(z.x,g.player.x)))[0],dx=wrapDelta(target.x,g.player.x);c.fillStyle="#102531d9";c.fillRect(455,477,290,27);c.fillStyle="#ffe2a3";c.font="bold 13px monospace";c.fillText("CONVOY "+(dx<0?"← ":"→ ")+Math.round(Math.abs(dx))+"m / "+g.trucks.length+" REMAIN",600,495);}
 c.restore();
}
