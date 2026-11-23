const assert=require('node:assert/strict'),{load}=require('./load-typescript.cjs'),{Battle}=load('lib/battle.ts');
const fresh=wave=>{const g=new Battle(()=>.5);g.start();g.wave=wave;g.spawnWave();g.briefingTimer=0;return g};
for(const [wave,kind] of [[3,'rescue'],[6,'ground'],[8,'survival'],[13,'rescue'],[16,'ground'],[18,'survival']])assert.equal(fresh(wave).mission.kind,kind);
assert.equal(fresh(5).mission,null);assert.ok(fresh(10).boss);
let g=fresh(3);g.enemies=[];g.updateMission(3);assert.equal(g.enemies.length,1);assert.equal(g.mission.complete,false);
for(let i=0;i<20;i++)g.updateMission(3);assert.equal(g.enemies.length,4);
g.mission.progress=4;g.loseLife();assert.equal(g.mission.progress,4);g.pause();g.update(.03,new Set());assert.equal(g.mission.progress,4);g.pause();
g.pilots=[{x:g.player.x,y:g.player.y-12}];g.update(0,new Set());assert.equal(g.mission.progress,5);assert.equal(g.mission.complete,true);assert.equal(g.enemies.length,0);
const lives=g.lives;for(let i=0;i<200;i++)g.update(1/60,new Set());assert.equal(g.wave,4);assert.equal(g.lives,lives);
g=fresh(6);g.trucks=[];g.updateMission(3);assert.equal(g.trucks.length,1);g.updateMission(3);assert.equal(g.trucks.length,2);g.updateMission(3);assert.equal(g.trucks.length,2);
for(let k=0;k<3;k++){if(!g.trucks.length)g.updateMission(3);const t=g.trucks[0];for(let i=0;i<6;i++){g.bullets=[{x:t.x,y:t.y,vx:0,vy:0,life:1,hostile:false}];g.updateWeapons(0,false)}}
assert.equal(g.mission.progress,3);g.updateMission(0);assert.ok(g.mission.complete);assert.equal(g.trucks.length,0);
g=fresh(8);g.mission.progress=59.99;g.pause();g.update(.03,new Set());assert.equal(g.mission.progress,59.99);g.pause();g.update(.02,new Set());assert.ok(g.mission.complete);
g.start();assert.equal(g.mission,null);assert.equal(g.wave,1);
console.log('PASS: mission schedule, capped reinforcements, rescue collection, retained progress, truck replacements, survival pause, safe completion and restart.');
