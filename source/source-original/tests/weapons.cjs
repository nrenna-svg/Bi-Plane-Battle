const assert=require('node:assert/strict'),{load}=require('./load-typescript.cjs');
const {Battle}=load('lib/battle.ts');
const fresh=()=>{const g=new Battle();g.start();g.invulnerable=0;return g};
let g=fresh();g.updateWeapons(.016,true);assert.equal(g.bullets.length,1);assert.ok(g.heat>0);assert.equal(g.bullets[0].hostile,false);
for(let i=0;i<300&&!g.overheated;i++)g.updateWeapons(1/60,true);assert.ok(g.overheated);const heat=g.heat;
g.updateWeapons(.1,true);assert.ok(g.heat<heat);for(let i=0;i<240;i++)g.updateWeapons(1/60,false);assert.equal(g.overheated,false);
g=fresh();const e=g.enemies[0];e.x=1000;e.y=300;e.hp=2;e.maxHp=2;
const hit=()=>{g.bullets=[{x:e.x,y:e.y,vx:0,vy:0,life:1,hostile:false}];g.updateWeapons(0,false)};
hit();hit();assert.equal(e.hp,2);hit();assert.equal(e.hp,1);e.armor=12;hit();hit();hit();assert.equal(e.hp,1);e.armor=0;hit();hit();hit();assert.equal(g.stats.kills,1);
g=fresh();g.wave=4;g.spawnWave();assert.equal(g.trucks.length,1);let t=g.trucks[0];g.player.x=t.x;g.player.y=300;t.timer=0;g.updateWeapons(0,false);assert.ok(g.bullets.some(b=>b.hostile&&b.vy<0));
for(let i=0;i<6;i++){g.bullets=[{x:t.x,y:t.y,vx:0,vy:0,life:1,hostile:false}];g.updateWeapons(0,false)}
assert.equal(g.trucks.length,0);assert.equal(g.score,400);
g=fresh();for(let i=0;i<3;i++){g.bullets=[{x:g.player.x,y:g.player.y,vx:0,vy:0,life:1,hostile:true}];g.updateWeapons(0,false)}assert.equal(g.player.hp,2);
g=fresh();g.wave=4;g.spawnWave();g.trucks[0].timer=0;g.updateWeapons(0,false);assert.equal(g.bullets.length,0,'truck does not target runway');
g=fresh();g.heat=50;g.pause();g.update(.03,new Set(['KeyF']));assert.equal(g.heat,50);assert.equal(g.bullets.length,0);
g.start();assert.equal(g.heat,0);assert.equal(g.trucks.length,0);g.wave=6;g.spawnWave();const p=g.enemies.find(e=>e.kind==='pursuer');p.x=1000;p.y=300;p.dir=1;p.gunTimer=0;g.player.x=1250;g.player.y=300;g.updateWeapons(0,false);assert.ok(g.bullets.some(b=>b.hostile));
console.log('PASS: firing, overheat/recovery, three-hit damage, shields, truck spawn/fire/destruction, runway exclusion, pause/reset and armed enemies.');
