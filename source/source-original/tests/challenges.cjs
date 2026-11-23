const assert=require('node:assert/strict'),{load}=require('./load-typescript.cjs');
const {Battle,bossHealth}=load('lib/battle.ts');
const {seededRandom,flightMedals,readDailyRecord}=load('lib/challenges.ts');
const {GAME_VERSION}=load('lib/version.ts');
assert.match(GAME_VERSION,/^\d+\.\d{2}$/);
const a=seededRandom('day-a'),b=seededRandom('day-a'),c=seededRandom('day-b');
const seq=fn=>Array.from({length:20},fn);
assert.deepEqual(seq(a),seq(b));assert.notDeepEqual(seq(seededRandom('day-a')),seq(c));
const g=new Battle();g.profile.plane='armored';g.profile.bosses=5;g.start(true,'2026-09-10');
assert.equal(g.maxHp,3);assert.equal(g.activePlane,'scout');assert.equal(g.profile.plane,'armored');
g.addScore(100,'daily',false);g.start(true,'2026-09-10');assert.equal(g.dailyRecord.score,100);
g.addScore(50,'daily',false);assert.equal(g.dailyRecord.score,100);
g.start(true,'2026-09-11');g.addScore(25,'daily',false);assert.equal(g.dailyRecord.score,25);
g.start();assert.equal(g.activePlane,'armored');assert.equal(g.maxHp,5.7);
assert.equal(readDailyRecord('{"day":"2026-09-10","score":-1}').score,0);
assert.equal(readDailyRecord('broken').day,'');
assert.equal(readDailyRecord('{"day":"2026-09-10","score":123}').score,123);
for(const [score,rescues,time,grade] of [[999,0,44,'unranked'],[1000,1,45,'bronze'],[3000,3,90,'silver'],[8000,5,180,'gold']]){
 assert.ok(flightMedals(score,rescues,time).every(m=>m.grade===grade));
}
const x=new Battle(),y=new Battle();x.start(true,'2026-09-10');y.start(true,'2026-09-10');
x.burst(0,0,'red',true);
for(let i=0;i<600;i++){const keys=new Set(i%100<50?['Space','ArrowRight']:['ArrowLeft']);x.update(1/60,keys);y.update(1/60,keys)}
const state=g=>JSON.stringify({player:g.player,enemies:g.enemies,jet:g.jet,supplies:g.supplies,score:g.score,wave:g.wave,lives:g.lives});
assert.equal(state(x),state(y),'identical daily inputs give identical gameplay despite cosmetic particles');
g.start();g.wave=10;g.spawnWave();assert.equal(g.boss.kind,'fortress');assert.equal(bossHealth(g.boss),15);
g.invulnerable=0;g.player.x=g.boss.x;g.player.y=175;g.player.vy=100;g.updateBoss(0);assert.equal(g.boss.core,3,'core locked before engines down');
g.boss.engines=[0,0,0,0];g.boss.bombTimer=0;g.player.x=0;g.updateBoss(.01);assert.equal(g.bombs.length,3);assert.equal(new Set(g.bombs.map(b=>b.vx)).size,3);
g.finishBoss();assert.ok(g.boss,'core keeps wave gated');
for(let i=0;i<3;i++){g.boss.coreCool=0;g.player.x=g.boss.x;g.player.y=175;g.player.vy=100;g.updateBoss(0)}
assert.equal(g.boss,null);assert.equal(g.stats.bosses,1);assert.ok(g.score>=3500);
console.log('PASS: daily seed reproducibility, Scout normalization, records, medal boundaries, fortress phases, spread volleys and defeat.');

