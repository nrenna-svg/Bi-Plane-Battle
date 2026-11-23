import { STAGE_COUNT } from "./mission-catalog";
import type { Battle } from "./battle";
import { wrapDelta } from "./game-rules";
const PARTS=["Wing geometry","Experimental engine","Airframe structure","Flight controls","Landing assembly"];
export const BLUEPRINTS=Array.from({length:STAGE_COUNT},(_,stage)=>({name:PARTS[stage%5]+" / sheet "+(Math.floor(stage/5)+1)}));
// Roll only at mission entry: drawing, pausing and losing a life never move the secret.
export function seedBlueprint(g:Battle){
 g.blueprintPosition={x:g.random()*3000,y:-120+g.random()*150};
}
export function blueprintTarget(g:Battle){
 const stage=g.campaign?.stage;if(g.islandMission||stage===undefined||g.daily||!BLUEPRINTS[stage]||g.blueprintPending||g.profile.blueprints.includes(stage))return null;
 const b=BLUEPRINTS[stage];if(!g.blueprintPosition)return null;return {...b,stage,...g.blueprintPosition};
}
export function updateBlueprint(g:Battle,dt:number){
 if(g.mode!=="playing"||g.briefingTimer>0||g.refitPending||g.campaign?.won||g.campaign?.failed)return;
 const b=blueprintTarget(g);if(!b)return;
 const distance=Math.hypot(wrapDelta(g.player.x,b.x),g.player.y-b.y);
 if(distance<25){g.blueprintPending=true;g.blueprintFoundTimer=4.5;g.sounds.push("pickup");}

}
export function bankBlueprint(g:Battle){
 const stage=g.campaign?.stage;if(g.daily||g.campaign?.failed||!g.blueprintPending||stage===undefined||!BLUEPRINTS[stage]||g.profile.blueprints.includes(stage))return false;
 g.profile.blueprints.push(stage);g.blueprintPending=false;return true;
}
export function drawBlueprint(c:CanvasRenderingContext2D,g:Battle){
 const b=blueprintTarget(g);if(!b)return;const x=wrapDelta(b.x,g.camera)+600;if(x< -10||x>1210)return;
 c.save();c.translate(x,b.y);c.rotate(-.18);c.fillStyle="#849da8";c.fillRect(-4,-3,8,6);c.strokeStyle="#e1d1a2";c.lineWidth=.8;c.strokeRect(-4.5,-3.5,9,7);
 c.strokeStyle="#c3d1ce";c.lineWidth=.6;c.beginPath();c.moveTo(-2,-1);c.lineTo(2,-1);c.moveTo(0,-2);c.lineTo(0,2);c.stroke();c.restore();
}
export function drawBlueprintFound(c:CanvasRenderingContext2D,g:Battle){
 if(g.blueprintFoundTimer<=0||!g.blueprintPending)return;
 const b=BLUEPRINTS[g.campaign?.stage??-1];if(!b)return;
 c.save();c.fillStyle="#102731ef";c.fillRect(340,112,520,92);c.strokeStyle="#d3b973";c.lineWidth=1;c.strokeRect(340.5,112.5,519,91);
 c.textAlign="center";c.fillStyle="#ffe8ae";c.font="bold 22px Arial";c.fillText("Found the secret blueprint!",600,144);
 c.font="14px Arial";c.fillStyle="#c5dfdf";c.fillText("PROJECT WRAITH / "+b.name.toUpperCase(),600,169);
 c.font="12px Arial";c.fillText("Complete this mission to secure the plans.",600,190);c.restore();
}
