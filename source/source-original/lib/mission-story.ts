import type { Battle } from "./battle";
import { wrapDelta } from "./game-rules";
export const STORIES=[
 ["IRON HARBOR / LANTERN CONVOY","Escort the evacuation transport through the storm. Keep its eight hull points intact.","Transport: Families aboard. Keep those fighters off our tail.","Harbor control: Halfway home. Their carrier is launching reinforcements."],
 ["VERDANT FALLS / BROKEN WINGS","Recover five pilots from a lost squadron. Fly near signal flares to locate survivors.","Rescue: Orange flares mark our position beneath the cloud bank.","Rescue: Keep searching. The squadron is counting on you."],
 ["CINDER CITY / LAST BRIDGE","Intercept six marked bombers. Each escape damages the city's evacuation bridge.","City watch: Bombers approaching the river. Follow the TARGET markers.","City watch: The bridge is our only way out. Hold them back."],
 ["DUNE FRONTIER / BORDER RUN","Destroy all three convoy trucks before they cross the border in ninety seconds.","Recon: The convoy is accelerating. Aim low and watch the AA fire.","Recon: Every truck destroyed removes a gun from the battle."],
 ["FROST CITADEL / HOMEWARD","Guide the medical transport over the marked mountain ridges.","Transport: Icing on the wings. Watch the rock faces ahead.","Citadel control: Almost through the pass. White Talon is waiting."]
] as const;
export const PASS_RIDGES=[{x:1400,width:170,top:440},{x:2150,width:210,top:420}];
export function radio(g:Battle,line:string){if(!g.campaign)return;g.campaign.radio=line;g.campaign.radioTimer=7;g.radioQueue.push(line)}
export function updateStory(g:Battle,dt:number){
 const c=g.campaign;if(!c||c.phase!=="mission"||c.failed||c.transition>0)return;
 for(const [i,at] of [10,25].entries())if(c.elapsed>=at&&!c.storyEvents.includes(i)){c.storyEvents.push(i);radio(g,STORIES[c.region][i+2])}
 if(c.region===1)for(const flare of c.flares)if(!flare.triggered&&Math.abs(wrapDelta(g.player.x,flare.x))<320){flare.triggered=true;g.pilots.push({x:flare.x,y:250});g.sounds.push("rescue");radio(g,"Rescue: Survivor spotted above the flare!")}
 if(c.region===4)for(const ridge of PASS_RIDGES)if(Math.abs(wrapDelta(g.player.x,ridge.x))<ridge.width/2+20&&g.player.y>ridge.top-22){g.damage(1);g.player.y=ridge.top-25;g.player.vy=-170}
 if(c.strikes>c.lastStrikes){c.lastStrikes=c.strikes;g.burst(1900,560,"#ecaa63",true);g.sounds.push("artillery");radio(g,"City watch: Direct hit on the bridge! "+(3-c.strikes)+" sections remain.")}
}
