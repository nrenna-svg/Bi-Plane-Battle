type Briefing={sector:string;stage:string;title:string;objective:string;threat:string;tip:string;accent:string;timer:number};

// Canvas coordinates match the flight viewport, so the briefing scales with the game.
export function drawMissionBriefing(c:CanvasRenderingContext2D,b:Briefing){
 c.save();c.textBaseline="alphabetic";c.textAlign="left";
 const label=(s:string,x:number,y:number,size=13,color="#b7d0d9",bold=false)=>{c.font=(bold?"bold ":"")+size+"px "+(size<=13?"monospace":"Arial");c.fillStyle=color;c.fillText(s,x,y)};
 const wrap=(s:string,x:number,y:number,width:number,size:number,color:string,lineHeight:number)=>{c.font=size+"px Arial";const words=s.split(" ");let line="",row=0;for(const word of words){const next=line?line+" "+word:word;if(line&&(c.measureText(next)?.width??next.length*size*.55)>width){label(line,x,y+row*lineHeight,size,color);row++;line=word}else line=next}if(line)label(line,x,y+row*lineHeight,size,color)};
 const line=(x:number,y:number,x2:number,y2:number,color:string)=>{c.strokeStyle=color;c.lineWidth=1;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke()};
 c.fillStyle="#04111c70";c.fillRect(0,0,1200,650);
 c.shadowColor="#0009";c.shadowBlur=30;c.shadowOffsetY=12;
 const panel=c.createLinearGradient(130,125,1070,525);panel.addColorStop(0,"#1e3c4c");panel.addColorStop(.55,"#102533");panel.addColorStop(1,"#0b1b27");c.fillStyle=panel;c.fillRect(130,125,940,400);c.shadowBlur=0;c.shadowOffsetY=0;
 c.strokeStyle="#65808d";c.lineWidth=1;c.strokeRect(130.5,125.5,939,399);c.fillStyle=b.accent;c.fillRect(130,125,5,400);
 // Fine instrument-grid detail, kept away from the text.
 for(let x=151;x<330;x+=22)line(x,174,x,326,"#8cc7cd13");for(let y=174;y<328;y+=22)line(151,y,327,y,"#8cc7cd13");
 label("FLIGHT COMMAND  /  MISSION BRIEF",156,153,12,"#91b1bd",true);c.textAlign="right";label(b.stage,1042,153,12,b.accent,true);c.textAlign="left";line(156,166,1042,166,"#7798a542");
 // Winged roundel and aircraft plan-view make the card read as a flight order.
 c.save();c.translate(244,245);c.strokeStyle=b.accent;c.lineWidth=1.5;
 for(const radius of [53,60]){c.beginPath();c.arc(0,0,radius,0,Math.PI*2);c.stroke()}
 c.fillStyle="#0d2634";c.beginPath();c.arc(0,0,50,0,Math.PI*2);c.fill();
 for(const side of [-1,1])for(let i=0;i<3;i++){c.beginPath();c.moveTo(side*58,-14+i*12);c.lineTo(side*(82-i*6),-14+i*12);c.lineTo(side*(74-i*6),-8+i*12);c.stroke()}
 c.fillStyle="#f2d794";c.beginPath();c.moveTo(0,-36);c.lineTo(5,-26);c.lineTo(6,-6);c.lineTo(35,7);c.lineTo(35,15);c.lineTo(5,8);c.lineTo(3,27);c.lineTo(14,32);c.lineTo(14,37);c.lineTo(0,33);c.lineTo(-14,37);c.lineTo(-14,32);c.lineTo(-3,27);c.lineTo(-5,8);c.lineTo(-35,15);c.lineTo(-35,7);c.lineTo(-6,-6);c.lineTo(-5,-26);c.closePath();c.fill();c.fillStyle="#35566a";c.fillRect(-2,-20,4,18);c.restore();
 label(b.sector.toUpperCase(),354,199,13,b.accent,true);
 label(b.title,354,229,29,"#fff0cb",true);
 label("YOUR OBJECTIVE",354,257,11,"#91b1bd",true);wrap(b.objective,354,283,674,22,"#ffffff",27);
 const card=(x:number,title:string,body:string,color:string)=>{c.fillStyle="#07172288";c.fillRect(x,329,429,105);line(x,329,x+429,329,color);label(title,x+17,354,12,color,true);wrap(body,x+17,379,393,16,"#d2dfe4",21)};
 card(156,"01 / THREAT ASSESSMENT",b.threat,"#e8b079");card(613,"02 / PILOT'S EDGE",b.tip,"#9ad7bf");
 label("FLIGHT CONTROLS",156,461,11,"#91b1bd",true);
 const key=(s:string,x:number,w:number)=>{c.fillStyle="#2a4351";c.fillRect(x,475,w,26);c.strokeStyle="#6d8997";c.strokeRect(x+.5,475.5,w-1,25);label(s,x+9,493,12,"#fff0cb",true)};
 key("SPACE",156,62);label("CLIMB",229,493,12);key("← →",301,53);label("STEER",365,493,12);
 label("CLEARED FOR TAKEOFF",730,476,12,"#eed49a",true);label("Stay sharp. Own the sky.",730,497,13,"#a9c1ca");
 const remaining=Math.max(0,Math.min(1,b.timer/4));c.strokeStyle="#405763";c.lineWidth=4;c.beginPath();c.arc(1005,478,27,0,Math.PI*2);c.stroke();c.strokeStyle="#f3d08a";c.beginPath();c.arc(1005,478,27,-Math.PI/2,-Math.PI/2+remaining*Math.PI*2);c.stroke();c.textAlign="center";label(String(Math.ceil(b.timer)),1005,488,28,"#fff1ca",true);
 c.restore();
}
