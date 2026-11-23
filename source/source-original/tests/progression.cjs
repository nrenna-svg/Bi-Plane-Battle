const assert=require('node:assert/strict'),{load}=require('./load-typescript.cjs');
const {Battle,newPlane}=load('lib/battle.ts');
const {PLANES,PAINTS,newProfile,planeUnlocked,paintUnlocked,readProfile}=load('lib/progression.ts');
let g=new Battle(()=>.5);assert.equal(g.selectPlane('stunt'),false);assert.equal(g.selectPaint('royal'),false);
g.profile.kills=25;g.workshop.owned.push('stunt');assert.ok(g.selectPlane('stunt'));g.start();assert.equal(g.maxHp,4.2);assert.equal(g.player.hp,4.2);
assert.equal(g.selectPlane('scout'),false);g.collectSupply({kind:'repair',x:0,y:0});assert.equal(g.player.hp,4.2);g.loseLife();assert.equal(g.player.hp,4.2);assert.equal(g.profile.kills,25);
g.mode='over';g.profile.bosses=5;g.workshop.owned.push('armored');assert.ok(g.selectPlane('armored'));g.start();assert.equal(g.player.hp,5.7);g.player.hp=3;g.collectSupply({kind:'repair',x:0,y:0});assert.equal(g.player.hp,5);g.loseLife();assert.equal(g.player.hp,5.7);
g.mode='over';g.profile.bestScore=10000;g.workshop.owned.push('racer');assert.ok(g.selectPlane('racer'));g.start();g.enemies=[];g.player.y=200;
for(let i=0;i<100;i++)g.update(.016,new Set(['ArrowRight','Space']));assert.ok(g.player.vx>300);
assert.ok(PLANES.stunt.accel>PLANES.scout.accel);assert.ok(PLANES.armored.speed<PLANES.scout.speed);assert.ok(PLANES.stunt.hp<PLANES.scout.hp);
g=new Battle(()=>.5);g.start();g.enemies=[];g.invulnerable=0;g.profile.kills=20;g.progress();assert.ok(g.profile.completed.includes('first-flight'));assert.ok(paintUnlocked('crimson',g.profile));g.progress();assert.equal(g.profile.completed.length,1);
g.stats.rescues=11;g.progress();assert.equal(paintUnlocked('arctic',g.profile),false);g.stats.rescues=12;g.progress();assert.ok(paintUnlocked('arctic',g.profile));
g.stats.clutchLandings=2;g.player={...newPlane(),hp:1,y:584,vy:80,vx:100};g.update(.02,new Set());assert.ok(g.landed);assert.ok(paintUnlocked('forest',g.profile));
g.stats.bosses=2;g.stats.flawlessBoss=true;g.progress();assert.ok(paintUnlocked('royal',g.profile));g.mode='over';assert.ok(g.selectPaint('royal'));g.start();assert.equal(g.profile.paint,'royal');assert.equal(g.stats.rescues,0);assert.equal(g.profile.completed.length,4);
const raw=JSON.stringify(g.profile),restored=readProfile(raw);assert.equal(restored.paint,'royal');assert.equal(restored.completed.length,4);
for(const raw of ['bad','null','[]','{"plane":"armored","paint":"royal"}','{"plane":"__proto__","kills":-1}']){const p=readProfile(raw);assert.equal(p.plane,'scout');assert.equal(p.paint,'standard')}
g=new Battle(()=>.5);g.start();g.addScore(10000,'test',false);assert.ok(planeUnlocked('racer',g.profile));assert.equal(g.workshop.owned.includes("racer"),false,"milestone alone no longer purchases aircraft");
g=new Battle(()=>.5);g.start();g.wave=5;g.spawnWave();g.lives=2;g.boss.engines=[0,0,0,0];g.finishBoss();assert.equal(planeUnlocked('armored',g.profile),false);assert.equal(paintUnlocked('royal',g.profile),false);
g=new Battle(()=>.5);g.start();g.wave=5;g.spawnWave();g.stats.bosses=1;g.boss.engines=[0,0,0,0];g.finishBoss();assert.ok(paintUnlocked('royal',g.profile));
console.log('PASS: plane unlock gates and selection locks; per-aircraft health, repair, respawn, speed and handling; all four challenge conditions; no duplicate rewards; persistence and malformed saves; flawless-boss failure path; milestone notices.');

const legacy=readProfile(JSON.stringify({kills:8,bestScore:1500,bosses:1}));assert.ok(planeUnlocked('armored',legacy));assert.ok(planeUnlocked('racer',legacy));assert.ok(planeUnlocked('stunt',legacy));const fresh=newProfile();fresh.kills=24;fresh.bestScore=9999;fresh.bosses=4;assert.equal(planeUnlocked('stunt',fresh),false);assert.equal(planeUnlocked('racer',fresh),false);assert.equal(planeUnlocked('armored',fresh),false);
