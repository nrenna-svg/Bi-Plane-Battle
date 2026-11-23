import type { Battle, Truck } from "./battle";
import { wrapDelta } from "./game-rules";
export function drawGroundTruck(c:CanvasRenderingContext2D,t:Truck,g:Battle){
 const x=wrapDelta(t.x,g.camera)+600,y=t.y;
 c.save();c.translate(x,y);c.fillStyle="#09141a60";c.beginPath();c.ellipse(0,17,39,5,0,0,Math.PI*2);c.fill();
 const skin=c.createLinearGradient(0,-25,0,14);skin.addColorStop(0,"#c3c2a0");skin.addColorStop(.35,"#738773");skin.addColorStop(1,"#2c4945");
 c.fillStyle=skin;c.strokeStyle="#1b3035";c.lineWidth=1;c.beginPath();c.moveTo(-33,7);c.lineTo(-33,-16);c.quadraticCurveTo(-20,-21,10,-17);c.lineTo(15,-24);c.lineTo(28,-24);c.quadraticCurveTo(33,-15,34,7);c.closePath();c.fill();c.stroke();
 c.fillStyle="#203a4c";c.beginPath();c.moveTo(17,-21);c.lineTo(25,-21);c.lineTo(29,-11);c.lineTo(17,-11);c.closePath();c.fill();c.strokeStyle="#ccd9cf";c.beginPath();c.moveTo(18,-19);c.lineTo(25,-13);c.stroke();
 for(const wx of [-23,-7,23]){c.fillStyle="#142529";c.beginPath();c.arc(wx,9,8,0,Math.PI*2);c.fill();c.fillStyle="#768780";c.beginPath();c.arc(wx,9,4,0,Math.PI*2);c.fill();c.strokeStyle="#a8b3a2";c.beginPath();c.moveTo(wx-3,9);c.lineTo(wx+3,9);c.stroke()}
 c.fillStyle="#7c9181";c.beginPath();c.ellipse(-7,-18,14,7,0,0,Math.PI*2);c.fill();
 c.save();c.translate(-7,-20);c.rotate(Math.atan2(g.player.y-y,wrapDelta(g.player.x,t.x)));c.fillStyle=t.timer<.7?"#c9ba8e":"#889d8e";c.fillRect(0,-3,26,6);c.fillStyle="#243b3b";c.fillRect(24,-4,5,8);if(t.timer>3.05){c.fillStyle="#ffdf98";c.beginPath();c.moveTo(29,-4);c.lineTo(41,0);c.lineTo(29,4);c.fill()}c.restore();
 c.strokeStyle="#374d48";for(let i=-28;i<10;i+=7){c.beginPath();c.moveTo(i,-11);c.lineTo(i,1);c.stroke()}c.fillStyle="#c5ceb7";for(const dx of [-27,-14,0,13]){c.beginPath();c.arc(dx,3,1,0,Math.PI*2);c.fill()}
 c.strokeStyle="#b9c0a077";c.lineWidth=1;for(const yy of [-14,-5]){c.beginPath();c.moveTo(-31,yy);c.lineTo(9,yy);c.stroke()}
 c.fillStyle="#293d38";for(let i=0;i<4;i++)c.fillRect(28,-7+i*3,5,1);
 c.strokeStyle="#b5bda4";c.beginPath();c.moveTo(18,-8);c.lineTo(18,4);c.lineTo(28,4);c.stroke();
 c.strokeStyle="#344539";c.lineWidth=2;c.beginPath();c.moveTo(-29,-18);c.lineTo(-32,-43);c.stroke();
 if(t.hp<2){c.fillStyle="#202a29";c.beginPath();c.ellipse(-15,-7,10,6,.4,0,Math.PI*2);c.fill();for(let i=0;i<4;i++){c.fillStyle="#363c3b77";c.beginPath();c.ellipse(-18+Math.sin(g.time+i)*5,-25-i*12,6+i*3,8+i*3,0,0,Math.PI*2);c.fill()}}
 c.fillStyle="#efd39a";c.beginPath();c.ellipse(32,-5,2,3,0,0,Math.PI*2);c.fill();c.restore();
 c.textAlign="center";c.font="12px monospace";c.fillStyle="#ffdda5";c.fillText(t.timer<.7?"AA / FIRING":"AA TRUCK",x,y-50);
 for(let i=0;i<2;i++){c.fillStyle=i<t.hp?"#b8e89b":"#38443b";c.fillRect(x-16+i*18,y-42,14,4)}
}
