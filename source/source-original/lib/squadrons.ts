import type { Battle, Enemy } from "./battle";
import { wrapDelta } from "./game-rules";
export const RIVALS=[
 {name:"SCARLET FINCH",airframe:"hornet",color:"#c75b4b",style:"diver",taunt:"Scarlet Finch: This harbor belongs to my squadron."},
 {name:"THE WREN",airframe:"dragonfly",color:"#d3bf79",style:"flanker",taunt:"The Wren: Follow me into the mist, if you can."},
 {name:"NIGHT HERON",airframe:"nightjar",color:"#8195bd",style:"guardian",taunt:"Night Heron: Those bombers are under my protection."},
 {name:"COPPER KITE",airframe:"corsair",color:"#c79158",style:"flanker",taunt:"Copper Kite: You will not stop this convoy."},
 {name:"WHITE TALON",airframe:"tempest",color:"#d8e0dd",style:"diver",taunt:"White Talon: One last flight through my mountains."}
] as const;
export function chooseTactic(g:Battle,e:Enemy){
 if(e.campaignBomber||e.kind==="bomber")return;
 if(!e.tactic)e.tactic=e.kind==="ace"?"flanker":g.wave>=3?"guardian":"pursuer";
 if(e.maxHp>=3&&e.hp<=e.maxHp*.35&&!e.retreated){e.retreat=3.5;e.retreated=true}
 if((e.retreat??0)>0){e.targetX=(e.x-Math.sign(wrapDelta(g.player.x,e.x))*500+3000)%3000;e.targetY=160;return}
 if(g.hidden)return;
 const tactic=e.rival!==undefined?RIVALS[e.rival].style:e.tactic;
 if(tactic==="guardian"){
  const bomber=g.enemies.find(b=>b.kind==="bomber"&&b.hp>0);
  if(bomber){const threat=Math.abs(wrapDelta(g.player.x,bomber.x))<370;e.targetX=threat?g.player.x:(bomber.x-100+3000)%3000;e.targetY=threat?g.player.y:bomber.y-65}
 }else if(tactic==="flanker"){e.targetX=(g.player.x+g.player.vx*.85+3000)%3000;e.targetY=g.player.y+(Math.sin(g.time*.7)>0?-105:45)}
 else if(tactic==="diver"){const attacking=g.time%7>4.5;e.targetX=(g.player.x+(attacking?g.player.vx*.3:160)+3000)%3000;e.targetY=attacking?g.player.y+70:Math.max(120,g.player.y-155)}
}
