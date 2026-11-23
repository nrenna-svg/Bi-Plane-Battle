const assert=require('node:assert/strict'),{load}=require('./load-typescript.cjs');
const {Battle,newPlane}=load('lib/battle.ts'),{nearMiss}=load('lib/flight-feel.ts'),{chooseTactic,RIVALS}=load('lib/squadrons.ts'),{updateCampaign,enterCampaignStage}=load('lib/campaign.ts'),{updateStory}=load('lib/mission-story.ts'),{drawBattle}=load('lib/battle-renderer.ts');
const enemy=(more={})=>({...newPlane(),x:1200,y:260,kind:'pursuer',maxHp:3,hp:3,targetX:0,targetY:0,...more});
const make=()=>{const g=new Battle(()=>.5);g.start();g.enemies=[];g.invulnerable=0;g.jetTimer=999;g.supplyTimer=999;g.nextWave=-999;return g};
let g=make();assert.equal(g.dodge(),true);assert.equal(g.dodge(),false);assert.equal(g.dodgeCooldown,5);assert.ok(g.invulnerable>0);g.pause();g.update(.03,new Set());assert.equal(g.dodgeCooldown,5);g.pause();g.start();assert.equal(g.dodgeCooldown,0);
g.briefingTimer=1;assert.equal(g.dodge(),false);g.briefingTimer=0;g.landed=true;assert.equal(g.dodge(),false);
const dive=make(),normal=make();for(const p of [dive.player,normal.player]){p.x=1000;p.y=140;p.vx=200}
for(let i=0;i<25;i++){dive.update(.02,new Set(['KeyR','ArrowRight']));normal.update(.02,new Set(['ArrowRight']))}
assert.ok(dive.player.vx>normal.player.vx);assert.ok(dive.player.y>normal.player.y);assert.ok(dive.diveEnergy>0);const energy=dive.diveEnergy;dive.pause();dive.update(.03,new Set());assert.equal(dive.diveEnergy,energy);
g=make();const close=enemy({x:g.player.x,y:g.player.y+55,vx:-200});nearMiss(g,close);assert.equal(g.style.nearMisses,1);assert.equal(g.score,75);nearMiss(g,close);assert.equal(g.score,75);
g=make();g.player.x=600;g.player.y=584.8;g.player.vx=45;g.player.vy=30;g.update(.02,new Set(['ArrowDown']));assert.equal(g.style.landings,1);assert.equal(g.landed,true);const score=g.score;g.landed=false;g.player.y=584.8;g.player.vx=45;g.player.vy=30;g.update(.02,new Set(['ArrowDown']));assert.equal(g.score,score);
g=make();const bomber=enemy({kind:'bomber',x:2000}),guard=enemy({tactic:'guardian'});g.enemies=[bomber,guard];chooseTactic(g,guard);assert.equal(guard.targetX,1900);
const flank=enemy({tactic:'flanker'});g.player.vx=200;chooseTactic(g,flank);assert.equal(flank.targetX,g.player.x+170);
g.hidden=true;const hiddenAce=enemy({rival:0,targetX:123,targetY:222});chooseTactic(g,hiddenAce);assert.equal(hiddenAce.targetX,123);g.hidden=false;
const hurt=enemy({hp:1});chooseTactic(g,hurt);assert.equal(hurt.retreat,3.5);assert.equal(hurt.retreated,true);hurt.retreat=0;chooseTactic(g,hurt);assert.equal(hurt.retreat,0);
g=make();g.campaignCheckpoint=34;g.startCampaign(13);g.briefingTimer=0;g.campaign.elapsed=10;g.campaign.spawn=999;updateCampaign(g,.02);assert.equal(g.enemies.filter(e=>e.rival!==undefined).length,1);updateCampaign(g,.02);assert.equal(g.enemies.filter(e=>e.rival!==undefined).length,1);
const ace=g.enemies.find(e=>e.rival!==undefined);g.wreck(ace,true);assert.equal(g.style.rivals,1);assert.ok(g.score>=750);assert.equal(RIVALS.length,5);
g=make();g.campaignCheckpoint=34;g.startCampaign(13);g.briefingTimer=0;g.boss.engines=[0,0,2,2];g.updateBoss(.01);assert.equal(g.boss.combatPhase,1);g.boss.engines=[0,0,0,0];g.boss.bombTimer=.005;g.updateBoss(.01);assert.equal(g.boss.combatPhase,2);assert.equal(g.bombs.length,5);
enterCampaignStage(g,23);g.briefingTimer=0;const carriage=g.campaign.carriages[0];carriage.cool=1.1;g.campaign.spawn=999;updateCampaign(g,.01);const lock=carriage.aimX;assert.equal(lock,g.player.x);g.player.x+=300;updateCampaign(g,.01);assert.equal(carriage.aimX,lock);carriage.hp=0;carriage.cool=0;g.bullets=[];updateCampaign(g,.01);assert.equal(g.bullets.length,0);
enterCampaignStage(g,17);g.briefingTimer=0;g.player.x=950;updateStory(g,.02);assert.ok(g.pilots.length>0);const pilots=g.pilots.length;updateStory(g,.02);assert.equal(g.pilots.length,pilots);
enterCampaignStage(g,22);g.campaign.strikes=1;updateStory(g,.02);assert.equal(g.campaign.lastStrikes,1);assert.ok(g.shockwaves.length>0);
enterCampaignStage(g,32);g.invulnerable=0;g.player.x=1400;g.player.y=500;const hp=g.player.hp;updateStory(g,.02);assert.ok(g.player.hp<hp);assert.equal(g.player.y,415);
const ctx=new Proxy({createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
for(let stage=0;stage<15;stage++){enterCampaignStage(g,stage);g.briefingTimer=0;g.enemies.push(enemy({rival:Math.floor(stage/3)}));if(g.boss)g.boss.bombTimer=.5;drawBattle(ctx,g);g.briefingTimer=2;drawBattle(ctx,g)}
console.log('PASS: dodge safety/reset/pause, dive energy, anti-farming skill rewards, escort/flanking/retreat AI, regional aces, boss phases, train aim locks, survivor signals, bridge consequences, mountain collisions and encounter rendering.');
