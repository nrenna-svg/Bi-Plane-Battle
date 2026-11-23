const assert=require('node:assert/strict'),{load}=require('./load-typescript.cjs');
const {Battle}=load('lib/battle.ts'),{updateIsland}=load('lib/island.ts'),{fortressDefenses,readIsland}=load('lib/island-progress.ts'),{readProfile}=load('lib/progression.ts');
const g=new Battle();const checkpoint=g.campaignCheckpoint,credits=g.workshop.credits;
assert.equal(g.startIsland('bad'),false);assert.equal(g.startIsland('research'),false);
for(const id of ['radar','convoy','airfield']){
 assert.equal(g.startIsland(id),true);assert.equal(g.campaignCheckpoint,checkpoint);g.briefingTimer=0;
 if(id==='radar'){g.player.x=2270;g.player.y=110;updateIsland(g,.01);assert.equal(g.islandDiscovery,true);assert.equal(g.profile.island.discovered,false);g.groundTargets[0].hp=0;}
 if(id==='convoy')g.trucks=[];if(id==='airfield')g.stats.kills=g.campaign.killStart+6;
 updateIsland(g,.01);assert.equal(g.mode,'over');assert.ok(g.profile.island.secured.includes(id));assert.equal(g.campaignCheckpoint,checkpoint);assert.equal(g.lastReport,null);
 const earned=g.workshop.credits;updateIsland(g,1);assert.equal(g.workshop.credits,earned);
}
assert.equal(g.profile.island.discovered,true);assert.equal(g.startIsland('research'),true);g.stats.rescues=g.campaign.baseline+3;updateIsland(g,.01);assert.ok(g.profile.island.secured.includes('research'));
g.startIsland('fortress');assert.equal(g.boss.engines.join(','),'2,2,2,2');assert.equal(g.armor,15);assert.equal(g.radarDisabled,true);g.boss=null;updateIsland(g,.01);assert.ok(g.profile.island.secured.includes('fortress'));
const bank=g.workshop.credits;g.startIsland('fortress');g.boss=null;updateIsland(g,.01);assert.equal(g.workshop.credits,bank);
const loaded=readProfile(JSON.stringify(g.profile));assert.equal(loaded.island.secured.length,5);assert.equal(loaded.island.discovered,true);
const h=new Battle();h.startIsland('fortress');assert.equal(h.boss.engines.join(','),'4,4,4,4');assert.equal(h.radarDisabled,false);h.campaign.spawn=0;updateIsland(h,.01);assert.equal(h.enemies.length,2);assert.ok(h.enemies.some(e=>e.gunship));h.campaign.timer=0;updateIsland(h,.01);assert.equal(h.mode,'over');assert.equal(h.profile.island.secured.length,0);
h.startIsland('radar');h.islandDiscovery=true;h.campaign.timer=0;updateIsland(h,.01);assert.equal(h.profile.island.discovered,false);
h.start();assert.equal(h.islandMission,null);assert.equal(h.profile.island.secured.length,0);assert.equal(readIsland({secured:['bad','radar','radar'],discovered:'yes'}).secured.join(','),'radar');
console.log('PASS island: branching missions, fortress consequences, secret discovery, win-only rewards, no repeat rewards, failure, save migration and classic campaign isolation');
