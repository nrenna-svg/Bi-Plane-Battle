const assert=require('node:assert/strict');const {load}=require('./load-typescript.cjs');
const {Battle}=load('lib/battle.ts');const {enterCampaignStage}=load('lib/campaign.ts');const {BLUEPRINTS,blueprintTarget,updateBlueprint,bankBlueprint}=load('lib/blueprints.ts');const {readProfile,paintUnlocked}=load('lib/progression.ts');const {finishMissionReport}=load('lib/mission-rewards.ts');
const g=new Battle();g.mode='playing';
for(let stage=0;stage<35;stage++){
 enterCampaignStage(g,stage);g.briefingTimer=0;const b=blueprintTarget(g);Object.assign(g.player,{x:b.x,y:b.y,vx:0,vy:stage===1?60:-60});if(stage===2)g.stats.rescues=g.stageStartRescues+1;
 g.mode='paused';updateBlueprint(g,.1);assert.equal(g.blueprintPending,false);g.mode='playing';
 updateBlueprint(g,.1);assert.equal(g.blueprintPending,true);assert.equal(g.profile.blueprints.length,stage);
 finishMissionReport(g);assert.equal(g.profile.blueprints.length,stage+1);assert.equal(bankBlueprint(g),false);assert.equal(blueprintTarget(g),null);
}
assert.equal(paintUnlocked('lostSquadron',g.profile),true);g.profile.paint='lostSquadron';assert.equal(readProfile(JSON.stringify(g.profile)).paint,'lostSquadron');
assert.equal(readProfile('{"blueprints":[0,0,1,99,"2"],"paint":"lostSquadron"}').blueprints.join(','),'0,1');assert.equal(readProfile('{}').blueprints.length,0);
const h=new Battle();h.mode='playing';enterCampaignStage(h,0);h.briefingTimer=0;Object.assign(h.player,blueprintTarget(h));updateBlueprint(h,.1);assert.equal(h.blueprintPending,true);h.loseLife();assert.equal(h.blueprintPending,false);assert.equal(bankBlueprint(h),false);
for(let stage of [1,2,3,4]){h.mode='playing';enterCampaignStage(h,stage);h.briefingTimer=0;const b=blueprintTarget(h);Object.assign(h.player,{x:b.x,y:b.y,vx:200,vy:0});updateBlueprint(h,.1);assert.equal(h.blueprintPending,true);assert.ok(h.blueprintFoundTimer>0);assert.ok(!h.sounds.includes("blueprint-ping"));}
console.log('Blueprint challenges, success-only persistence, death, duplicate protection, migration and paint passed');

const r=new Battle();r.mode='playing';r.random=()=>.1;enterCampaignStage(r,34);const first=blueprintTarget(r);assert.equal(first.x,300);assert.equal(first.y,-105);r.random=()=>.9;assert.equal(blueprintTarget(r).x,300);enterCampaignStage(r,34);const second=blueprintTarget(r);assert.equal(second.x,2700);assert.ok(second.y>=-120&&second.y<=30);
assert.equal(readProfile(JSON.stringify({blueprints:[0,4,12,25,34,34,35,-1]})).blueprints.join(','),'0,4,12,25,34');assert.equal(paintUnlocked('lostSquadron',readProfile(JSON.stringify({blueprints:[0,4,12,25,34]}))),true);
console.log('All 35 stages, stable per-attempt random placement, replay reroll and expanded persistence passed');
