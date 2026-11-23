export const AIRFRAMES:Record<string,{length:number;wing:number;sweep:number;tail:number;tiers:number;float?:boolean;twin?:boolean;radial?:boolean}>={
 scout:{length:31,wing:24,sweep:0,tail:12,tiers:2},
 stunt:{length:25,wing:20,sweep:-5,tail:16,tiers:2},
 racer:{length:38,wing:18,sweep:8,tail:10,tiers:1},
 armored:{length:32,wing:28,sweep:0,tail:13,tiers:2,radial:true},
 kestrel:{length:28,wing:17,sweep:4,tail:17,tiers:1,radial:true},
 albatross:{length:36,wing:36,sweep:-3,tail:12,tiers:2},
 hornet:{length:23,wing:19,sweep:3,tail:18,tiers:2,radial:true},
 corsair:{length:34,wing:30,sweep:10,tail:12,tiers:1,radial:true},
 falcon:{length:40,wing:22,sweep:12,tail:14,tiers:1},
 osprey:{length:34,wing:30,sweep:0,tail:16,tiers:2,float:true},
 vanguard:{length:38,wing:34,sweep:3,tail:20,tiers:1,twin:true},
 meteor:{length:42,wing:16,sweep:13,tail:10,tiers:1},
 dragonfly:{length:25,wing:24,sweep:-4,tail:16,tiers:3},
 nightjar:{length:44,wing:29,sweep:7,tail:18,tiers:1,twin:true},
 tempest:{length:35,wing:27,sweep:2,tail:17,tiers:2,radial:true},
 phoenix:{length:39,wing:25,sweep:17,tail:21,tiers:1}
};
export function drawAirframe(c:CanvasRenderingContext2D,id:string,color:string,time:number,control=0,damage=0){
 if(["racer","falcon","meteor","phoenix"].includes(id)){drawSignatureAircraft(c,id,color,time,control,damage);return}
 const f=AIRFRAMES[id]??AIRFRAMES.scout,L=f.length;
 c.lineWidth=1;c.strokeStyle="#192c3b";
 const poly=(pts:number[][],fill:string)=>{c.fillStyle=fill;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();c.stroke()};
 // Fabric wings: distinct span, stagger and sweep for each airframe.
 for(let i=0;i<f.tiers;i++){const y=f.tiers===1?3:-20+i*(f.tiers===3?15:32);
  const bend=damage>.35?damage*8:0;poly([[-f.wing,y+bend],[f.wing-f.sweep,y-3],[f.wing+2,y+2-bend],[-f.wing+f.sweep,y+6+bend]],color);
  c.save();c.translate(-f.wing+7,y+4);c.rotate(control*.18);poly([[0,0],[14,0],[14,3],[0,3]],"#596568");c.restore();
  c.strokeStyle="#ffffff40";for(let x=-f.wing+5;x<f.wing-4;x+=7){c.beginPath();c.moveTo(x,y);c.lineTo(x+2,y+4);c.stroke()}c.strokeStyle="#192c3b";
 }
 if(f.tiers>1){c.strokeStyle="#d7d3b7";for(const x of [-13,15]){c.beginPath();c.moveTo(x,-17);c.lineTo(x+4,14);c.stroke()}c.strokeStyle="#192c3b"}
 poly([[-L+4,0],[-L+5,-f.tail],[-L+13,-f.tail+3],[-L+18,0]],color);
 poly([[-L-3,2],[-L+11,-2],[-L+20,5],[-L+3,9]],color);
 const skin=c.createLinearGradient(0,-10,0,11);skin.addColorStop(0,"#e9eee6");skin.addColorStop(.25,color);skin.addColorStop(1,"#243845");
 c.fillStyle=skin;c.beginPath();c.moveTo(-L,1);c.bezierCurveTo(-L+10,-5,6,-11,L-5,-6);c.quadraticCurveTo(L+6,0,L-5,7);c.bezierCurveTo(5,11,-L+12,5,-L,1);c.fill();c.stroke();
 if(f.radial){c.fillStyle="#43535e";c.fillRect(L-10,-9,9,19);c.fillStyle="#c5c8b5";c.fillRect(L-3,-7,3,15)}
 c.fillStyle="#a4dfea";c.beginPath();c.ellipse(3,-7,8,5,-.12,Math.PI,Math.PI*2);c.fill();c.stroke();
 c.strokeStyle="#e8d9bd";c.beginPath();c.moveTo(-6,-7);c.lineTo(9,-9);c.stroke();
 c.fillStyle="#25323a";for(let x=14;x<L-11;x+=4)c.fillRect(x,-3,2,3);
 c.strokeStyle="#d6d3c5";c.lineWidth=2;
 if(f.float){for(const y of [19,27]){c.beginPath();c.moveTo(-18,8);c.lineTo(-12,y);c.moveTo(15,8);c.lineTo(19,y);c.stroke();poly([[-28,y],[25,y],[20,y+5],[-23,y+5]],"#8babb4")}}
 else{for(const x of [-9,17]){c.beginPath();c.moveTo(x,8);c.lineTo(x+3,18);c.stroke();c.fillStyle="#14212c";c.beginPath();c.arc(x+3,19,4,0,Math.PI*2);c.fill();c.fillStyle="#b5b8af";c.beginPath();c.arc(x+3,19,1.5,0,Math.PI*2);c.fill()}}
 const prop=(x:number,y:number)=>{c.strokeStyle="#e6e4d48a";c.lineWidth=2;c.beginPath();c.ellipse(x,y,2,17,0,0,Math.PI*2);c.stroke();c.fillStyle="#e9d8ba";c.fillRect(x-1,y-11*Math.cos(time*(damage>.5?27:50)),2,22*Math.cos(time*(damage>.5?27:50))*(damage>.5?.65:1));};
 prop(L+2,0);if(f.twin){for(const y of [-14,15]){poly([[5,y-4],[24,y-5],[28,y+3],[4,y+4]],"#617582");prop(29,y)}}
 c.save();c.translate(-L+8,2);c.rotate(control*.35);poly([[-7,0],[9,-2],[13,3],[-7,4]],color);c.restore();
 c.strokeStyle="#0c233445";c.lineWidth=.6;for(let x=-L+12;x<L-7;x+=9){c.beginPath();c.moveTo(x,-5);c.lineTo(x,6);c.stroke();c.fillStyle="#e4e5d680";c.beginPath();c.arc(x,0,.65,0,Math.PI*2);c.fill()}
 if(damage>.5){c.fillStyle="#e99b4c";c.beginPath();c.moveTo(L-7,-4);c.lineTo(L-17-Math.abs(Math.sin(time*17))*13,-10);c.lineTo(L-13,3);c.fill();c.strokeStyle="#3c332c";c.beginPath();c.moveTo(-f.wing,-17);c.lineTo(-f.wing+6,-9);c.lineTo(-f.wing+3,-18);c.stroke()}
 if(damage>0){c.fillStyle="#293440";for(let i=0;i<Math.ceil(damage*5);i++){c.beginPath();c.ellipse(-20+i*8,Math.sin(i*9)*6,2+i%2,1.5,i,0,Math.PI*2);c.fill()}}
 c.fillStyle="#f5e6bc";c.beginPath();c.arc(-13,0,3,0,Math.PI*2);c.fill();c.fillStyle="#485f77";c.beginPath();c.arc(-13,0,1.5,0,Math.PI*2);c.fill();
}

// Unique silhouettes shared by the hangar artwork, flight renderer and wreckage profiles.
function drawSignatureAircraft(c:CanvasRenderingContext2D,id:string,color:string,time:number,control:number,damage:number){
 c.strokeStyle="#142c39";c.lineWidth=1;
 const poly=(pts:number[][],fill:string)=>{c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();c.stroke()};
 const ellipse=(x:number,y:number,rx:number,ry:number,fill:string)=>{c.fillStyle=fill;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();c.stroke()};
 const prop=(x:number,y:number,size:number)=>{c.strokeStyle="#eee8cc99";c.lineWidth=2;c.beginPath();c.ellipse(x,y,2,size,0,0,Math.PI*2);c.stroke();c.strokeStyle="#142c39";ellipse(x-2,y,3,3,"#e9d19a")};
 const metal=c.createLinearGradient(0,-15,0,15);metal.addColorStop(0,"#e3e8df");metal.addColorStop(.3,color);metal.addColorStop(1,"#304958");
 if(id==="racer"){
  // Comet: long inline engine, oval racing wings and a single rounded fin.
  ellipse(-3,5,32,8,color);poly([[-42,2],[-39,-16],[-32,-19],[-25,-3]],color);
  c.fillStyle=metal;c.beginPath();c.moveTo(-44,3);c.bezierCurveTo(-18,-6,24,-10,43,-4);c.quadraticCurveTo(51,0,44,6);c.bezierCurveTo(18,12,-16,8,-44,3);c.fill();c.stroke();
  ellipse(-7,-6,10,6,"#9ed1dc");poly([[5,-6],[40,-4],[40,2],[7,1]],"#bdc8bf");for(let x=10;x<39;x+=5)poly([[x,-2],[x+2,-2],[x+2,1],[x,1]],"#273c46");prop(48,1,18);
  for(const x of [-10,17]){poly([[x,10],[x+3,20],[x+6,20],[x+3,9]],"#819496");ellipse(x+5,22,4,4,"#172b36")}
 }else if(id==="falcon"){
  // Falcon: unmistakable twin booms, raised tails and a rear pusher propeller.
  poly([[-32,-20],[-23,-21],[20,0],[-33,5],[-42,-2]],color);poly([[-34,16],[-25,15],[22,4],[-27,26],[-44,24]],color);
  for(const y of [-12,17]){poly([[-43,y],[-40,y-13],[-32,y-12],[-27,y],[11,y+1],[8,y+6],[-42,y+4]],"#7798a5")}
  prop(-25,3,18);ellipse(4,3,25,10,String(metal));poly([[7,-7],[23,-6],[34,2],[11,4]],"#a7dee5");poly([[-9,-4],[-19,-8],[-16,9],[-5,10]],color);ellipse(9,20,5,4,"#182d36");
 }else if(id==="meteor"){
  // Meteor: broad barrel nose, clipped gull wings and exposed radial engine.
  poly([[-31,-16],[-13,-10],[4,-19],[21,-14],[5,-4],[-18,-2]],color);poly([[-35,23],[-17,10],[3,6],[24,14],[9,23],[-12,17]],color);
  poly([[-37,4],[-39,-20],[-28,-22],[-19,0]],color);ellipse(-3,2,31,12,String(metal));ellipse(24,1,10,14,"#697c7c");ellipse(30,1,5,11,"#233d47");
  for(let i=0;i<8;i++){const a=i*Math.PI/4;ellipse(25+Math.cos(a)*5,1+Math.sin(a)*10,2,3,"#b7beb0")};prop(36,1,22);ellipse(-11,-10,10,6,"#acdce0");poly([[-9,11],[-13,22],[-2,24],[3,12]],color);ellipse(-7,24,5,4,"#182d36");
 }else{
  // Phoenix: broad delta planform, forward canards and two rear nacelles.
  poly([[-46,26],[-15,-5],[19,-2],[29,7],[-2,14]],color);poly([[-42,-22],[-16,-10],[20,-2],[-8,2]],color);
  for(const y of [-13,15]){poly([[-38,y-4],[-4,y-5],[5,y],[-4,y+5],[-39,y+4]],"#7e8b91");prop(-41,y,11)}
  poly([[-32,4],[-20,-6],[25,-6],[49,1],[22,9],[-24,11]],String(metal));poly([[14,-6],[22,-15],[32,-13],[35,-5]],"#b3e5e9");poly([[18,4],[31,15],[39,14],[31,4]],color);
  poly([[-30,-3],[-31,-28],[-20,-25],[-9,-3]],color);poly([[-25,8],[-34,24],[-23,25],[-7,8]],color);ellipse(5,16,4,3,"#182d36");
 }
 c.strokeStyle="#e4dcc366";c.lineWidth=.7;for(let x=-21;x<20;x+=7){c.beginPath();c.moveTo(x,-2);c.lineTo(x+2,7);c.stroke()}
 poly([[-30,4+control*2],[-16,3],[-11,7+control*2],[-28,8]],color);
 if(damage>0){for(let i=0;i<Math.ceil(damage*5);i++)ellipse(-16+i*7,Math.sin(i*4)*5,2,1.5,"#1c2e35");if(damage>.5)poly([[17,-4],[4-Math.abs(Math.sin(time*17))*12,-12],[8,2]],"#edaa57")}
}
