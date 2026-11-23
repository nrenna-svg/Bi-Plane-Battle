import { configureBay, updateBay } from "./kestrel-bay";
import type { Battle } from "./battle";
import { spawnCampaignEnemy } from "./campaign";
import { equipVehicle } from "./vehicles";
import { wrapDelta } from "./game-rules";
import { ISLAND_TARGETS, fortressDefenses, type IslandTarget } from "./island-progress";
export function configureIsland(g:Battle,id:IslandTarget){
 g.islandMission=id;g.islandResult="";g.islandDiscovery=false;g.blueprintPosition=null;
 const c=g.campaign!;c.phase=id==="fortress"?"boss":"opening";c.target=id==="radar"||id==="fortress"?1:id==="airfield"?6:3;c.timer=id==="fortress"?240:150;c.spawn=3;
 g.boss=null;g.enemies=[];g.trucks=[];g.groundTargets=[];g.radarDisabled=g.profile.island.secured.includes("radar");
 if(id==="radar")g.groundTargets=[{kind:"radar",x:1800,y:566,hp:4,hits:0,burn:0}];
 if(id==="convoy")g.trucks=[0,1,2].map(i=>({x:1300+i*180,y:585,hp:3,hits:0,timer:3+i}));
 if(id==="fortress"){const d=fortressDefenses(g.profile.island);g.boss={kind:"fortress",core:5,coreCool:0,phase:0,x:1320,y:245,engines:[d.engineHull,d.engineHull,d.engineHull,d.engineHull],cool:[0,0,0,0],bombTimer:4};g.armor=d.armor;}
 g.radioQueue=[];if(id==="bay")configureBay(g);
 g.announce("KESTREL ISLAND / "+ISLAND_TARGETS[id].name.toUpperCase());
}
export function updateIsland(g:Battle,dt:number){
 const id=g.islandMission,c=g.campaign;if(!id||!c)return false;
 if(g.mode!=="playing"||c.failed||c.won)return true;
 if(g.bay){updateBay(g,dt);return true;}
 c.elapsed+=dt;c.timer=Math.max(0,c.timer-dt);c.spawn-=dt;
 // A small concealed relay can be found on any outer-island sortie.
 if(id!=="fortress"&&id!=="research"&&!g.profile.island.discovered&&!g.islandDiscovery&&Math.hypot(wrapDelta(g.player.x,2270),g.player.y-110)<40){g.islandDiscovery=true;g.announce("SECRET FACILITY DISCOVERED / COMPLETE THE SORTIE TO SECURE ITS LOCATION");g.sounds.push("pickup");}
 if(c.spawn<=0){const d=fortressDefenses(g.profile.island);c.spawn=id==="fortress"?8:6;const count=id==="fortress"?d.patrolSize:1;
  for(let i=0;i<count;i++){if(g.enemies.length>=(id==="fortress"?3:2))break;const before=g.enemies.length;spawnCampaignEnemy(g,"pursuer",true);const e=g.enemies[before];if(e){e.hp=e.maxHp=2;if(id==="fortress"&&d.missiles&&c.spawnCount%3===0&&i===0){equipVehicle(g,e,"helicopter");e.gunship=true;e.hp=e.maxHp=3;}}}c.spawnCount++;
 }
 for(const t of g.trucks)t.x=(t.x+18*dt)%3000;
 c.progress=id==="radar"?(g.groundTargets.every(t=>t.hp<=0)?1:0):id==="convoy"?3-g.trucks.length:id==="airfield"?g.stats.kills-c.killStart:id==="research"?g.stats.rescues-c.baseline:!g.boss?1:0;
 if(c.progress>=c.target){
  const p=g.profile.island,first=!p.secured.includes(id);if(first){p.secured.push(id);g.workshop.credits+=ISLAND_TARGETS[id].reward;}
  if(g.islandDiscovery)p.discovered=true;
  g.islandResult=(id==="fortress"?"ISLAND LIBERATED":"TARGET SECURED")+" / "+(first?"+"+ISLAND_TARGETS[id].reward+" credits":"Practice sortie complete")+(g.islandDiscovery?" / Station Wraith located":"");
  c.won=true;g.mode="over";g.enemies=[];g.bullets=[];g.bombs=[];g.sounds.push("victory");
 }else if(c.timer===0){c.failed=true;g.mode="over";g.islandResult="SORTIE FAILED / No territory lost. Refit and try again.";}
 return true;
}
export function drawIslandSecret(c:CanvasRenderingContext2D,g:Battle){
 if(g.bay||!g.islandMission||g.islandMission==="fortress"||g.islandMission==="research"||g.profile.island.discovered||g.islandDiscovery)return;
 const x=wrapDelta(2270,g.camera)+600;c.save();c.fillStyle="#a6afb1";c.fillRect(x-5,106,10,8);c.strokeStyle="#e6d3a1";c.strokeRect(x-5,106,10,8);c.restore();
}
