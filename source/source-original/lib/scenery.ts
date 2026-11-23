import { drawSceneryArt } from "./scenery-art";
export const SCENES=[
 {name:"AMBER COAST",sky:["#0e263c","#275566","#df9871"],sun:"#f1c992",cloud:"#497080",layers:["#355664","#254551","#173744"],ground:"#112a34",edge:"#d5ac72",kind:"coast"},
 {name:"MIDNIGHT CITY",sky:["#100e32","#342752","#b25881"],sun:"#d9defa",cloud:"#484468",layers:["#43345c","#302b4b","#20253c"],ground:"#161b30",edge:"#9b94cb",kind:"city"},
 {name:"EMERALD FOREST",sky:["#103e50","#3b7a80","#c4d79b"],sun:"#f2ecc0",cloud:"#709c9c",layers:["#527e6b","#2e6056","#163f3d"],ground:"#102f30",edge:"#8cb580",kind:"forest"},
 {name:"CRIMSON DESERT",sky:["#44223f","#b55c58","#f6c27e"],sun:"#ffe4a0",cloud:"#be7980",layers:["#bf775d","#985744","#6d3f39"],ground:"#4c3030",edge:"#edb67c",kind:"desert"},
] as const;
export const sceneForWave=(wave:number)=>SCENES[(Math.max(1,Math.floor(wave))-1)%SCENES.length];
export function drawScenery(ctx:CanvasRenderingContext2D,wave:number,camera:number){
 if(drawSceneryArt(ctx,(["harbor","city","forest","desert"] as const)[(Math.max(1,Math.floor(wave))-1)%4],camera))return;
 const s=sceneForWave(wave),W=1200,H=650;
 const gradient=ctx.createLinearGradient(0,0,0,H);s.sky.forEach((c,i)=>gradient.addColorStop([0,.7,1][i],c));ctx.fillStyle=gradient;ctx.fillRect(0,0,W,H);
 const glow=ctx.createLinearGradient(0,60,0,410);glow.addColorStop(0,"#ffffff00");glow.addColorStop(.5,s.sun+"22");glow.addColorStop(1,"#ffffff00");ctx.fillStyle=glow;ctx.fillRect(0,60,W,350);
 ctx.fillStyle=s.sun;ctx.beginPath();ctx.arc(925-camera*.035,s.kind==="city"?145:215,s.kind==="desert"?76:55,0,Math.PI*2);ctx.fill();
 if(s.kind==="city"){ctx.fillStyle="#e5e4ff";for(let i=0;i<65;i++){ctx.globalAlpha=.25+(i%5)*.13;ctx.beginPath();ctx.arc((i*137+73)%1200,25+(i*53)%220,i%3===0?1.2:.65,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1}
 for(let i=0;i<12;i++){const x=((i*247-camera*.18)%1500+1500)%1500-130,y=75+(i*71)%240;ctx.fillStyle=s.cloud;ctx.globalAlpha=.26;for(const [dx,dy,rx,ry] of [[0,0,75,18],[32,-12,52,25],[-35,-6,45,19]]){ctx.beginPath();ctx.ellipse(x+dx,y+dy,rx,ry,0,0,Math.PI*2);ctx.fill()}}ctx.globalAlpha=1;
 // Distant ridgelines and haze establish depth beyond the playfield.
 ctx.fillStyle=s.layers[0];ctx.globalAlpha=.45;ctx.beginPath();ctx.moveTo(0,550);
 for(let x=0;x<=1240;x+=40){ctx.lineTo(x,350-Math.sin((x+camera*.05)*.008)*48-Math.cos(x*.017)*25)}ctx.lineTo(1200,620);ctx.lineTo(0,620);ctx.fill();ctx.globalAlpha=1;
 for(let layer=0;layer<3;layer++){
 ctx.fillStyle=s.layers[layer];const offset=camera*(.1+layer*.12),base=535+layer*25;
 if(s.kind==="city"){
 for(let i=-2;i<20;i++){const x=i*90-((offset%90)+90)%90,h=65+((i+30)*47+layer*61)%160;ctx.fillStyle=s.layers[layer];ctx.fillRect(x,base-h,76,h+100);ctx.fillRect(x+18,base-h-12,40,12);if(i%3===0)ctx.fillRect(x+37,base-h-35,3,24);ctx.fillStyle=layer===2?"#ba9970":"#88748c";for(let row=0;row<h-12;row+=22)for(let col=0;col<4;col++)if((row+col+i)%3!==0)ctx.fillRect(x+10+col*16,base-h+12+row,5,7)}
 }else if(s.kind==="forest"){
 ctx.fillRect(0,base,1200,120);for(let i=-2;i<25;i++){const x=i*62-((offset%62)+62)%62,h=70+((i+30)*31+layer*29)%105;ctx.fillRect(x-3,base-h,7,h+20);for(let tier=0;tier<3;tier++){const y=base-h+tier*h*.23,r=17+tier*12;ctx.beginPath();ctx.moveTo(x,y-30);ctx.lineTo(x-r*.45,y+h*.1);ctx.lineTo(x-r*.3,y+h*.13);ctx.lineTo(x-r*.8,y+h*.3);ctx.lineTo(x-r*.55,y+h*.32);ctx.lineTo(x-r,y+h*.5);ctx.lineTo(x+r,y+h*.5);ctx.lineTo(x+r*.6,y+h*.3);ctx.lineTo(x+r*.85,y+h*.3);ctx.lineTo(x+r*.35,y+h*.12);ctx.closePath();ctx.fill()}}
 }else{
 ctx.beginPath();ctx.moveTo(0,H);for(let x=0;x<=W+20;x+=20){const world=x+offset,y=s.kind==="desert"?base-Math.sin(world*.004+layer*1.3)*42-Math.sin(world*.009+layer)*12:base-Math.sin(world*.006+layer)*35-Math.sin(world*.017)*14;ctx.lineTo(x,y)}ctx.lineTo(W,H);ctx.fill();
 if(s.kind==="desert"&&layer===2){for(let i=0;i<7;i++){const x=((i*257-offset)%1500+1500)%1500-100,y=560;ctx.fillRect(x,y-50,9,57);ctx.fillRect(x-19,y-30,22,7);ctx.fillRect(x-19,y-47,7,23);ctx.fillRect(x+6,y-18,21,7);ctx.fillRect(x+20,y-39,7,28)}}
 }
 }
 if(s.kind==="coast"){const water=ctx.createLinearGradient(0,540,0,609);water.addColorStop(0,"#4a8a9a");water.addColorStop(1,"#153744");ctx.fillStyle=water;ctx.fillRect(0,553,1200,56);ctx.strokeStyle="#d7caa958";ctx.lineWidth=1;for(let i=0;i<45;i++){const x=((i*83-camera*.3)%1250+1250)%1250;ctx.beginPath();ctx.moveTo(x,559+i%8*6);ctx.lineTo(x+15+i%7*6,559+i%8*6);ctx.stroke()}}
 if(s.kind==="forest"){const mist=ctx.createLinearGradient(0,400,0,600);mist.addColorStop(0,"#cae4ca00");mist.addColorStop(.55,"#cae4ca22");mist.addColorStop(1,"#cae4ca00");ctx.fillStyle=mist;ctx.fillRect(0,400,1200,200)}
 if(s.kind==="desert"){ctx.strokeStyle="#f2c89335";for(let i=0;i<18;i++){ctx.beginPath();for(let x=0;x<=1200;x+=30){const y=550+i*3+Math.sin((x+camera*.25)*.01+i*.25)*7;if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.stroke()}}
 ctx.fillStyle=s.ground;ctx.fillRect(0,609,W,41);ctx.fillStyle=s.edge;ctx.fillRect(0,608,W,3);ctx.globalAlpha=.35;for(let i=0;i<12;i++)ctx.fillRect(((i*140-camera)%1680+1680)%1680,628,60,3);ctx.globalAlpha=1;
}
