import type { Battle } from "./battle";
import { wrapDelta } from "./game-rules";
import { sceneForWave } from "./scenery";
export function drawTerrain(c:CanvasRenderingContext2D,g:Battle){
 const kind=g.campaign?.region===4?"snow":sceneForWave(g.sceneWave).kind;
 const tones=kind==="desert"?["#b99168","#876849","#4d4234"]:kind==="snow"?["#aabfc6","#7a9097","#495b65"]:kind==="forest"?["#60705a","#414e3f","#293931"]:["#707674","#515957","#303c40"];
 // Blend the distant art into a continuous near bank at the wheel contact line.
 const bank=c.createLinearGradient(0,557,0,650);bank.addColorStop(0,tones[0]+"00");bank.addColorStop(.4,tones[0]+"b0");bank.addColorStop(.65,tones[1]);bank.addColorStop(1,tones[2]);c.fillStyle=bank;c.fillRect(0,557,1200,93);
 c.fillStyle=tones[1];c.beginPath();c.moveTo(0,650);for(let x=0;x<=1220;x+=20)c.lineTo(x,598+Math.sin((x+g.camera)*.027)*2);c.lineTo(1200,650);c.fill();
 for(let i=0;i<160;i++){const x=wrapDelta(i*19,g.camera)+600;if(x<0||x>1200)continue;const y=603+(i*17)%46;c.fillStyle=i%3?tones[0]+"55":"#17282d55";c.beginPath();c.ellipse(x,y,2+i%5,.6+i%2,.2,0,Math.PI*2);c.fill()}
 if(kind==="forest"){c.strokeStyle="#84916a88";for(let i=0;i<90;i++){const x=wrapDelta(i*37,g.camera)+600;c.beginPath();c.moveTo(x,601);c.lineTo(x-2,593-i%5);c.stroke()}}
 if(g.campaign?.carriages.length){c.strokeStyle="#423e35";c.lineWidth=4;for(let i=0;i<100;i++){const x=wrapDelta(i*32,g.camera)+600;c.beginPath();c.moveTo(x,599);c.lineTo(x+6,609);c.stroke()}c.strokeStyle="#a9b2aa";c.lineWidth=2;for(const y of [600,606]){c.beginPath();c.moveTo(0,y);c.lineTo(1200,y);c.stroke()}}
 for(const scar of g.craters){const x=wrapDelta(scar.x,g.camera)+600;c.save();c.globalAlpha=Math.min(1,scar.life/4);c.fillStyle="#191b19bb";c.beginPath();c.ellipse(x,605,34,7,0,0,Math.PI*2);c.fill();c.strokeStyle=tones[0];c.lineWidth=2;c.beginPath();c.ellipse(x,606,37,8,0,0,Math.PI);c.stroke();c.restore()}
}
