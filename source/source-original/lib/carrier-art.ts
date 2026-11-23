// Side-on silhouettes retain the existing collision footprint and engine targets.
export function drawCarrier(c:CanvasRenderingContext2D,x:number,y:number,time:number,friendly=false,health=1,launch=false){
 c.save();c.translate(x,y);if(friendly)c.scale(.29,.53);
 const poly=(points:number[][],fill:string|CanvasGradient)=>{c.fillStyle=fill;c.beginPath();points.forEach(([px,py],i)=>i?c.lineTo(px,py):c.moveTo(px,py));c.closePath();c.fill();c.stroke()};
 c.strokeStyle="#172d3b";c.lineWidth=1.5;
 const steel=c.createLinearGradient(0,-40,0,43);steel.addColorStop(0,friendly?"#d1daca":"#b8c8d0");steel.addColorStop(.25,friendly?"#779889":"#728c9d");steel.addColorStop(.62,"#354f60");steel.addColorStop(1,"#152a39");
 // Swept support wings and twin tail fins behind the armored hull.
 poly([[-145,-8],[-203,-48],[-176,-51],[-107,-18]],steel);
 poly([[-170,7],[-213,40],[-179,36],[-114,11]],steel);
 poly([[-151,-13],[-161,-63],[-139,-57],[-112,-15]],steel);
 poly([[-110,-9],[-125,-45],[-106,-42],[-78,-12]],steel);
 c.fillStyle=steel;c.beginPath();c.moveTo(-182,-15);c.bezierCurveTo(-120,-46,108,-45,169,-15);c.quadraticCurveTo(204,0,170,19);c.bezierCurveTo(70,45,-128,40,-184,12);c.closePath();c.fill();c.stroke();
 // Faceted underside, inset hangars and illuminated launch rails.
 poly([[-166,15],[157,20],[130,34],[-126,34]],"#203747");
 for(let dx=-132;dx<130;dx+=52){c.fillStyle="#0e202d";c.fillRect(dx,14,38,16);c.fillStyle=launch?"#d5b176":"#657c86";c.fillRect(dx+1,15,36,launch?3:13);c.fillStyle=friendly?"#94efc5":"#e4b467";c.fillRect(dx+2,29,32,2)}
 c.strokeStyle="#b9ced0";c.lineWidth=1;c.beginPath();c.moveTo(-156,4);c.quadraticCurveTo(0,11,165,3);c.stroke();
 for(let dx=-130;dx<=130;dx+=26){c.strokeStyle="#293f50";c.beginPath();c.moveTo(dx,-23);c.lineTo(dx+8,6);c.stroke();c.fillStyle="#bfd0ce";for(const yy of [-20,3]){c.beginPath();c.arc(dx+3,yy,1.1,0,Math.PI*2);c.fill()}}
 // Raised bridge with angled glass, antenna and dorsal navigation lights.
 poly([[47,-29],[57,-45],[106,-43],[123,-26]],steel);
 poly([[62,-41],[100,-39],[111,-29],[60,-30]],"#7cc0ce");
 c.strokeStyle="#334c5b";for(let dx=72;dx<106;dx+=11){c.beginPath();c.moveTo(dx,-39);c.lineTo(dx+3,-29);c.stroke()}
 c.strokeStyle="#9eb7be";c.beginPath();c.moveTo(34,-31);c.lineTo(34,-52);c.moveTo(22,-48);c.lineTo(46,-48);c.stroke();
 for(const dx of [-164,151]){c.fillStyle=friendly?"#91efbe":"#ffc278";c.beginPath();c.arc(dx,0,2,0,Math.PI*2);c.fill()}
 // Turbine nacelles and spinning propeller discs.
 for(const dx of [-116,112]){c.fillStyle=steel;c.beginPath();c.ellipse(dx,8,20,9,0,0,Math.PI*2);c.fill();c.stroke();c.strokeStyle="#d5e4dd88";c.lineWidth=3;c.beginPath();c.ellipse(dx+19,8,3,15,0,0,Math.PI*2);c.stroke();c.strokeStyle="#bbcdd0";c.lineWidth=1;c.beginPath();c.moveTo(dx+19,8-Math.cos(time*30)*14);c.lineTo(dx+19,8+Math.cos(time*30)*14);c.stroke()}
 c.fillStyle=friendly?"#b9f6d6":"#d1dde0";c.font="bold 10px monospace";c.textAlign="center";c.fillText(friendly?"RESCUE / 13":"CV-09",-30,-9);
 if(health<.6){for(let i=0;i<4;i++){c.fillStyle="#28313877";c.beginPath();c.ellipse(-70+Math.sin(time+i)*9,-27-i*13,10+i*5,9+i*5,0,0,Math.PI*2);c.fill()}poly([[-80,-15],[-73,-25],[-64,-17],[-69,-5]],"#14242f")}
 c.restore();
}
