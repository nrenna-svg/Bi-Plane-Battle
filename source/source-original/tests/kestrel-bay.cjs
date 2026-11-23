const assert=require('node:assert/strict'),{load}=require('./load-typescript.cjs');
const {Battle}=load('lib/battle.ts'),{updateBay,bayManeuver,BAY_LIMIT}=load('lib/kestrel-bay.ts'),{drawBattle}=load('lib/battle-renderer.ts'),{hitTarget}=load('lib/ground-targets.ts'),{readProfile}=load('lib/progression.ts');
function launch(){const g=new Battle();g.startIsland('bay');g.briefingTimer=0;return g}
function coast(g){g.player.y=300;updateBay(g,8);assert.equal(g.bay.phase,'approach');assert.equal(g.trucks.length,0);g.player.x=1100;updateBay(g,.1);assert.equal(g.bay.phase,'convoy');assert.equal(g.trucks.length,3)}
function harbor(g){g.trucks=[];updateBay(g,.1);assert.equal(g.bay.phase,'harbor');assert.equal(g.bay.wrecks.filter(w=>w.kind==='truck').length,3);assert.equal(g.bay.bridge,3);assert.equal(g.bay.harbor.length,3);g.enemies=[];g.player.x=2450;}
function clearHarbor(g){for(const t of g.bay.harbor)hitTarget(g,t,3);for(let i=0;i<3;i++){updateBay(g,.1);assert.ok(g.bay.warning>0);updateBay(g,3);assert.equal(g.enemies.length,g.radarDisabled?1:2);g.enemies=[];}updateBay(g,.1);assert.equal(g.bay.phase,'ace');updateBay(g,4.1);assert.equal(g.bay.ace.hp,6);}
const g=launch(),b=g.bay;assert.equal(g.bombAmmo,3);coast(g);b.variant=0;
updateBay(g,5);assert.ok(b.warning>0);assert.equal(g.enemies.length,0);updateBay(g,3);assert.equal(g.enemies.length,2);
const e=g.enemies[0],old=e.bayClock;bayManeuver(g,e,.1);assert.ok(e.bayClock>old);
hitTarget(g,b.radar,3);assert.equal(g.radarDisabled,true);harbor(g);clearHarbor(g);assert.equal(g.enemies.length,1);assert.equal(b.escort,false);
b.ace.hp=0;updateBay(g,.1);assert.equal(b.phase,'return');g.landed=true;g.player.x=1900;updateBay(g,3);assert.equal(g.mode,'playing','Landing anywhere other than carrier cannot win');
g.player.x=1100;updateBay(g,.1);g.player.x=600;g.stats.rescues=2;const credits=g.workshop.credits;updateBay(g,2.1);assert.equal(g.mode,'over');assert.equal(g.workshop.credits,credits+250);assert.equal(b.stars.filter(Boolean).length,5);assert.equal(g.profile.island.bayStars.length,5);
assert.equal(readProfile(JSON.stringify(g.profile)).island.bayStars.length,5);updateBay(g,5);assert.equal(g.workshop.credits,credits+250);
g.startIsland('bay');assert.equal(g.bay.wrecks.length,0);g.bay.phase='return';g.bay.homeward=true;g.player.x=600;g.landed=true;updateBay(g,2.1);assert.equal(g.workshop.credits,credits+250,'No repeat reward farming');
const h=launch();coast(h);harbor(h);clearHarbor(h);assert.equal(h.bay.escort,true);assert.equal(h.enemies.length,2,'Skipping radar keeps escort');
const paused=launch();paused.mode='paused';updateBay(paused,10);assert.equal(paused.bay.elapsed,0);paused.mode='playing';updateBay(paused,BAY_LIMIT+1);assert.equal(paused.mode,'over');assert.equal(paused.campaign.failed,true);assert.ok(!paused.profile.island.secured.includes('bay'));
const gradient={addColorStop(){}};const c=new Proxy({createLinearGradient:()=>gradient,createRadialGradient:()=>gradient,measureText:s=>({width:s.length*8})},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
for(const phase of ['launch','approach','convoy','harbor','ace','return']){const r=launch();r.bay.phase=phase;r.bay.wrecks=[{x:1500,y:585,age:40,kind:'truck'}];r.bay.bridge=3;drawBattle(c,r);r.reducedMotion=true;drawBattle(c,r);}
const deck=launch();for(let i=0;i<240;i++)deck.update(1/60,new Set());assert.equal(deck.lives,3);assert.equal(deck.landed,true);deck.update(1/60,new Set(['Space']));assert.equal(deck.landed,false);assert.ok(deck.player.vy<0);
g.start();assert.equal(g.bay,null);assert.equal(g.islandMission,null);
console.log('PASS expanded Kestrel Bay: route gates, optional radar branches, patrols, harbor damage, ace escort, carrier-only return, mastery persistence, reward caps, timeout, safe takeoff, rendering and isolation');

const {dropBomb,detonate}=load('lib/bombing.ts');
const friendly=launch();friendly.landed=false;friendly.player.x=600;friendly.player.y=250;friendly.player.vx=0;const ammo=friendly.bombAmmo;
assert.equal(dropBomb(friendly),false);assert.equal(friendly.bombAmmo,ammo);assert.equal(friendly.playerBombs.length,0);
friendly.player.x=1000;friendly.player.vx=-220;assert.equal(dropBomb(friendly),false,'A bomb projected onto the friendly deck is inhibited');
const craters=friendly.craters.length,particles=friendly.particles.length;detonate(friendly,600,590);assert.equal(friendly.craters.length,craters);assert.equal(friendly.particles.length,particles,'No misleading friendly-deck fireball');
friendly.player.x=1750;friendly.player.vx=0;assert.equal(dropBomb(friendly),true);assert.equal(friendly.bombAmmo,ammo-1);
friendly.bombCooldown=0;friendly.player.x=2500;assert.equal(dropBomb(friendly),true,'Harbor bombing remains available');
const classic=new Battle();classic.start();classic.briefingTimer=0;classic.player.x=600;classic.player.y=250;classic.landed=false;assert.equal(dropBomb(classic),true,'Protection is scoped to Kestrel Bay');
console.log('PASS friendly carrier: release inhibition, predicted deck impact, no friendly blast/crater, enemy bombing and classic isolation');

const {updateBayRescue}=load('lib/kestrel-bay.ts');
const rescue=launch();coast(rescue);rescue.bay.phaseTime=13;rescue.bay.variant=0;updateBayRescue(rescue,.1);assert.equal(rescue.bay.rescue.status,'active');assert.equal(rescue.bay.rescue.x,850);
const r=rescue.bay.rescue;rescue.player.x=r.x;rescue.player.y=r.y+12;const oldCredits=rescue.workshop.credits;updateBayRescue(rescue,.01);assert.equal(r.status,'aboard');assert.equal(rescue.stats.rescues,1);assert.equal(rescue.workshop.credits,oldCredits,'Pickup alone pays no credits');
rescue.bay.phase='return';rescue.bay.homeward=true;rescue.player.x=600;rescue.landed=true;updateBay(rescue,2.1);assert.equal(r.status,'delivered');assert.equal(rescue.profile.island.bayRescue,true);assert.equal(rescue.workshop.credits,oldCredits+250);assert.equal(readProfile(JSON.stringify(rescue.profile)).island.bayRescue,true);
const paid=rescue.workshop.credits;rescue.startIsland('bay');rescue.bay.phase='return';rescue.bay.homeward=true;rescue.bay.rescue.status='aboard';rescue.bay.rescue.lives=rescue.lives;rescue.player.x=600;rescue.landed=true;updateBay(rescue,2.1);assert.equal(rescue.workshop.credits,paid,'Already earned commendation does not pay again');
const lost=launch();coast(lost);lost.bay.phaseTime=13;lost.bay.variant=1;updateBayRescue(lost,.1);assert.equal(lost.bay.rescue.x,2950);lost.bay.rescue.status='aboard';lost.lives--;updateBayRescue(lost,.01);assert.equal(lost.bay.rescue.status,'lost');assert.ok(!lost.profile.island.bayRescue);
const missed=launch();coast(missed);missed.bay.phaseTime=13;updateBayRescue(missed,.1);missed.bay.rescue.time=.01;updateBayRescue(missed,.1);assert.equal(missed.bay.rescue.status,'missed');assert.equal(missed.campaign.failed,false,'Missing the diversion never fails the main mission');
console.log('PASS optional rescue: both locations, capture, delivery-only reward, persistence, no farming, lost delivery and optional expiry');

const winch=launch();winch.bay.rescue={status:'active',x:800,y:200,time:30,lives:3};winch.profile.plane='osprey';winch.landed=false;winch.player.x=700;winch.player.y=210;assert.equal(winch.useAbility(),true);assert.equal(winch.bay.rescue.status,'aboard','Existing rescue winch collects the ally');
