const assert=require('node:assert/strict'),{load}=require('./load-typescript.cjs');
const {Battle,newPlane}=load('lib/battle.ts'),{REGIONS,enterCampaignStage,updateCampaign,campaignAdvance,spawnCampaignEnemy,readCampaignCheckpoint}=load('lib/campaign.ts'),{drawBattle}=load('lib/battle-renderer.ts');
const make=(stage=0)=>{const g=new Battle(()=>.5);g.campaignCheckpoint=34;g.startCampaign(10+Math.floor(stage/3)*5+[2,3,4][stage%3]);g.briefingTimer=0;return g};
for(const raw of [null,'','-1','35','2.5','NaN','{}'])assert.equal(readCampaignCheckpoint(raw),0);
assert.equal(readCampaignCheckpoint('11'),11);
let g=new Battle();g.startCampaign(14);assert.equal(g.campaign.stage,0);g.startCampaign(NaN);assert.equal(g.campaign.stage,0);
g=make();const clock=g.campaign.elapsed;g.pause();g.update(.03,new Set());assert.equal(g.campaign.elapsed,clock);g.pause();
g.campaign.spawn=999;g.campaign.elapsed=39.99;updateCampaign(g,.02);assert.equal(g.campaign.transition,3);assert.equal(g.stats.missions,1);
g=make();spawnCampaignEnemy(g);const enemy=g.enemies[0];enemy.x=g.campaign.transport.x;enemy.y=g.campaign.transport.y;g.updateEnemies(.01);assert.equal(enemy.targetX,g.campaign.transport.x);enemy.gunTimer=0;updateCampaign(g,.01);assert.ok(g.bullets.some(b=>b.hostile));g.bullets=[{x:g.campaign.transport.x,y:g.campaign.transport.y,vx:0,vy:0,life:1,hostile:true}];g.updateWeapons(.01,false);assert.equal(g.campaign.transport.hp,7.5);
g.campaign.transport.hp=.01;enemy.x=g.campaign.transport.x;enemy.y=g.campaign.transport.y;g.bullets=[{x:g.campaign.transport.x,y:g.campaign.transport.y,vx:0,vy:0,life:1,hostile:true}];g.updateWeapons(.01,false);updateCampaign(g,.01);assert.equal(g.mode,'over');assert.equal(g.campaign.failed,true);
g=make(3);g.stats.rescues=5;updateCampaign(g,.01);assert.equal(g.campaign.transition,3);
g=make(6);spawnCampaignEnemy(g);assert.equal(g.enemies[0].campaignBomber,true);g.enemies[0].hp=0;g.wreck(g.enemies[0],true);assert.equal(g.campaign.progress,1);
g.enemies=[];for(let i=0;i<3;i++){spawnCampaignEnemy(g);g.enemies[0].route=1799;g.updateEnemies(.03)}updateCampaign(g,.01);assert.equal(g.campaign.failed,true);
g=make(6);g.campaign.progress=6;updateCampaign(g,.01);assert.equal(g.campaign.transition,3);
g=make(9);g.campaign.timer=.01;updateCampaign(g,.02);assert.equal(g.campaign.failed,true);
g=make(9);g.trucks=[];updateCampaign(g,.01);assert.equal(g.campaign.transition,3);
g=make(7);g.enemies=[];const train=g.campaign.carriages[0];g.bullets=[{x:train.x,y:train.y,vx:0,vy:0,life:1,hostile:false,damage:6}];g.updateWeapons(.01,false);assert.equal(train.hp,1);assert.equal(g.campaign.transition,0);for(const t of g.campaign.carriages)t.hp=0;updateCampaign(g,.01);assert.equal(g.stats.bosses,1);assert.equal(g.profile.bosses,1);assert.equal(g.campaign.transition,3);
g=make(1);spawnCampaignEnemy(g);assert.equal(g.enemies[0].x,g.boss.x);g.boss.engines=[0,0,0,0];g.finishBoss();assert.ok(g.boss,'Core must still be destroyed');g.boss.core=0;g.finishBoss();updateCampaign(g,.01);assert.equal(g.stats.bosses,1);assert.equal(g.campaign.transition,3);
g=make(2);g.campaign.spawn=0;updateCampaign(g,.01);assert.ok(g.debris.some(d=>d.hazard));g.campaign.elapsed=17.99;updateCampaign(g,.02);assert.equal(g.campaign.transition,3);
g=make(14);g.campaign.elapsed=18;updateCampaign(g,.01);campaignAdvance(g,3.01);assert.equal(g.mode,'over');assert.equal(g.campaign.won,true);
const ctx=new Proxy({createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
for(let stage=0;stage<15;stage++){g=make(stage);assert.equal(g.campaign.region,Math.floor(stage/3));drawBattle(ctx,g);g.briefingTimer=4;drawBattle(ctx,g)}
g=make();g.jet={x:750,y:300,dir:1,life:2.5};const jet=g.jet;g.campaign.elapsed=40;updateCampaign(g,.01);assert.equal(g.refitPending,true);g.chooseRefit("hull");campaignAdvance(g,3.1);assert.equal(g.campaign.stage,13);assert.equal(g.jet,jet);assert.equal(g.jet.life,2.5);
g=make();g.campaignCheckpoint=5;g.start();assert.equal(g.campaign,null);assert.equal(g.campaignCheckpoint,5);
for(const id of ['scout','stunt','osprey','armored']){
 g=make();g.profile.plane=id;g.player.hp=g.maxHp;g.abilityCooldown=0;g.invulnerable=0;g.pilots=[{x:g.player.x+120,y:g.player.y}];assert.equal(g.useAbility(),true);assert.equal(g.useAbility(),false);
 if(id==='scout')assert.equal(g.boost,3);
 if(id==='stunt'){assert.equal(g.invulnerable,1.2);g.updateWeapons(.01,true);assert.equal(g.bullets.length,0)}
 if(id==='osprey'){assert.equal(g.pilots.length,0);assert.equal(g.stats.rescues,1);assert.equal(g.profile.rescues,1)}
 if(id==='armored'){assert.equal(g.bullets[0].damage,6);assert.equal(g.heat,35)}
 const cooldown=g.abilityCooldown;g.pause();g.update(.03,new Set());assert.equal(g.abilityCooldown,cooldown);g.pause();g.start();assert.equal(g.abilityCooldown,0);
}
g=make();g.briefingTimer=2;assert.equal(g.useAbility(),false);g.briefingTimer=0;g.overheated=true;assert.equal(g.useAbility(),false);
console.log('PASS: all 15 retained campaign missions render; checkpoint bounds, objective wins/failures, enemy escorts, bomber escape limits, train/core gating, boss credit, escape victory, persistent jets, abilities/cooldowns and Classic reset.');
