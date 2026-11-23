const assert=require('node:assert/strict'),{load}=require('./load-typescript.cjs');
const {Battle}=load('lib/battle.ts'),{updateCampaign,enterCampaignStage}=load('lib/campaign.ts'),{drawBombing}=load('lib/bombing.ts');
const make=()=>{const g=new Battle(()=>.5);g.campaignCheckpoint=34;g.startCampaign(32);g.briefingTimer=0;g.campaign.spawn=999;return g};
let g=make();updateCampaign(g,8);assert.ok(g.campaign.repairBalloon);assert.equal(g.campaign.repairTimer,12);
const b=g.campaign.repairBalloon;g.player.x=b.x;g.player.y=b.y+22;const hp=g.player.hp;updateCampaign(g,0);assert.ok(g.campaign.repairBalloon,'Full carrier must not waste supply');
g.campaign.transport.hp=3;updateCampaign(g,0);assert.equal(g.campaign.transport.hp,5);assert.equal(g.campaign.objectiveHp,5);assert.equal(g.player.hp,hp);assert.equal(g.campaign.repairBalloon,null);updateCampaign(g,0);assert.equal(g.campaign.transport.hp,5);
g.player.x=0;for(let i=0;i<1201;i++)updateCampaign(g,.01);assert.ok(g.campaign.repairBalloon);g.campaign.transport.hp=7.5;g.player.x=g.campaign.repairBalloon.x;g.player.y=242;updateCampaign(g,0);assert.equal(g.campaign.transport.hp,8);
g=make();g.campaign.repairBalloon={x:2998,y:220,life:10};g.player.x=2;g.player.y=242;g.campaign.transport.hp=4;updateCampaign(g,0);assert.equal(g.campaign.transport.hp,6,'World-wrap collection');
g=make();updateCampaign(g,8);g.player.x=0;updateCampaign(g,11);assert.equal(g.campaign.repairBalloon,null,'Missed balloon expires');
g=make();updateCampaign(g,8);const timer=g.campaign.repairTimer;g.pause();g.update(.03,new Set());assert.equal(g.campaign.repairTimer,timer);g.pause();
const ctx=new Proxy({createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});drawBombing(ctx,g);
enterCampaignStage(g,33);assert.equal(g.campaign.repairBalloon,null);enterCampaignStage(g,12);updateCampaign(g,8);assert.equal(g.campaign.repairBalloon,null);
g=make();g.campaign.transport.hp=0;g.campaign.repairBalloon={x:g.player.x,y:g.player.y-22,life:10};updateCampaign(g,0);assert.equal(g.campaign.failed,true,'Cannot revive destroyed carrier');
console.log('PASS carrier repair cadence, collection, cap, expiry, wrap, pause, stage reset, rendering and destroyed carrier');

