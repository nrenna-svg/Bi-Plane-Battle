export function drawBlimp(c:CanvasRenderingContext2D,x:number,y:number,time:number,damage:number){
 c.save();c.translate(x,y);c.strokeStyle="#243743";c.lineWidth=1.5;
 const metal=c.createLinearGradient(0,-43,0,43);metal.addColorStop(0,"#eee0bd");metal.addColorStop(.22,"#b5b8a5");metal.addColorStop(.5,"#7e9190");metal.addColorStop(.8,"#445e68");metal.addColorStop(1,"#213948");
 const poly=(p:number[][])=>{c.beginPath();p.forEach(([a,b],i)=>i?c.lineTo(a,b):c.moveTo(a,b));c.closePath();c.fill();c.stroke()};c.fillStyle=metal;
 poly([[-115,-16],[-166,-69],[-182,-66],[-168,-7]]);poly([[-120,13],[-171,63],[-189,52],[-170,3]]);
 c.beginPath();c.ellipse(0,0,174,42,0,0,Math.PI*2);c.fill();c.stroke();
 c.save();c.beginPath();c.ellipse(0,0,173,41,0,0,Math.PI*2);c.clip();
 for(let dx=-150;dx<=150;dx+=25){const h=42*Math.sqrt(1-dx*dx/(174*174));c.strokeStyle="#e7dfbd55";c.beginPath();c.ellipse(dx,0,10,h,0,0,Math.PI*2);c.stroke()}
 for(const yy of [-25,-10,10,27]){c.strokeStyle=yy<0?"#d8d7be66":"#233f4966";c.beginPath();c.moveTo(-173,0);c.quadraticCurveTo(0,yy*2,173,0);c.stroke()}
 c.fillStyle="#384e51";c.font="bold 13px monospace";c.textAlign="center";c.fillText("STORMWARD / 05",22,5);
 for(let i=0;i<Math.floor(damage*9);i++){const dx=-120+i*31;c.fillStyle="#29393d";poly([[dx,8],[dx+7,-1],[dx+14,7],[dx+10,19],[dx+3,15]])}c.restore();
 c.strokeStyle="#a4b6ac";for(const dx of [-39,39]){c.beginPath();c.moveTo(dx,32);c.lineTo(dx*.8,48);c.stroke()}
 c.fillStyle=metal;poly([[-48,42],[38,42],[51,49],[37,61],[-39,61],[-52,51]]);c.fillStyle="#8ec6d1";for(let dx=-36;dx<36;dx+=14){c.fillRect(dx,46,9,6)}
 c.strokeStyle="#b3c4bf88";c.beginPath();c.ellipse(-58,50,3,14,0,0,Math.PI*2);c.stroke();c.restore();
}
export function drawBossEngine(c:CanvasRenderingContext2D,x:number,y:number,hp:number,max:number,time:number,hit:boolean){
 c.save();c.translate(x,y);c.strokeStyle="#273c47";c.lineWidth=2;
 c.beginPath();c.moveTo(-14,8);c.lineTo(-22,28);c.moveTo(12,8);c.lineTo(20,25);c.stroke();
 if(hp>0){c.strokeStyle="#ffe4a455";c.lineWidth=4;c.beginPath();c.ellipse(0,0,26,17,0,0,Math.PI*2);c.stroke()}
 const metal=c.createLinearGradient(0,-13,0,13);metal.addColorStop(0,hit?"#fff3c3":hp>0?"#d9c7a0":"#667372");metal.addColorStop(.4,"#8b9f9f");metal.addColorStop(1,"#283f4e");c.fillStyle=metal;c.strokeStyle="#233643";c.lineWidth=1.5;c.beginPath();c.moveTo(-20,-8);c.quadraticCurveTo(0,-17,21,-7);c.lineTo(23,7);c.quadraticCurveTo(0,17,-20,8);c.closePath();c.fill();c.stroke();
 c.fillStyle="#233843";for(let dx=-12;dx<10;dx+=5)c.fillRect(dx,-5,2,10);
 c.fillStyle="#bed0cb";c.beginPath();c.ellipse(20,0,5,10,0,0,Math.PI*2);c.fill();
 if(hp>0){c.strokeStyle="#d9e7db88";c.lineWidth=2;c.beginPath();c.ellipse(25,0,3,21,0,0,Math.PI*2);c.stroke();c.strokeStyle="#e5d9b9";c.beginPath();c.moveTo(25,-Math.cos(time*(hp<max?17:32))*21);c.lineTo(25,Math.cos(time*(hp<max?17:32))*21);c.stroke()}
 else{c.strokeStyle="#9aa9a6";c.beginPath();c.moveTo(24,0);c.lineTo(30,-9);c.moveTo(24,0);c.lineTo(22,13);c.stroke()}
 if(hp<max){for(let i=0;i<3;i++){c.fillStyle="#353e4277";c.beginPath();c.ellipse(-20-i*9,-8-i*8,6+i*3,7+i*3,0,0,Math.PI*2);c.fill()}if(hp>0){c.fillStyle="#ffb861";c.beginPath();c.moveTo(-18,-5);c.lineTo(-32-Math.sin(time*15)*5,-10);c.lineTo(-19,5);c.fill()}}
 for(let i=0;i<max;i++){c.fillStyle=i<hp?"#caeab7":"#46585d";c.beginPath();c.arc((i-(max-1)/2)*10,-24,3,0,Math.PI*2);c.fill()}
 c.restore();
}
