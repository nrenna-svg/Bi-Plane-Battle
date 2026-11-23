const assert=require('node:assert/strict'),{load}=require('./load-typescript.cjs');
const {Battle}=load('lib/battle.ts'),{drawBattle}=load('lib/battle-renderer.ts');
const fresh=()=>{const g=new Battle(()=>.5);g.start();g.invulnerable=0;return g};
for(const wave of [1,3,4,6,7,9,10,15,16,99]){
 const g=fresh();g.wave=wave;g.spawnWave();assert.ok(g.enemies.filter(e=>!e.vehicle).every(e=>e.hp===Math.min(6,1+Math.floor((wave-1)/3))&&e.maxHp===e.hp));
}
for(const kind of ['repair','armor','boost']){
 const g=fresh(),e=g.enemies[0],other=g.enemies[1];e.x=1000;e.y=300;e.maxHp=4;e.hp=1;g.player.hp=1;
 g.supplies=[{x:1000,y:300,kind,life:20}];g.updateSupplies(0);
 assert.equal(g.supplies.length,0);assert.equal(g.player.hp,1);assert.equal(g.armor,0);assert.equal(g.boost,0);
 assert.equal(e.hp,kind==='repair'?3:1);assert.equal(e.armor,kind==='armor'?12:0);assert.equal(e.boost,kind==='boost'?12:0);
 assert.equal(other.armor,0);assert.equal(other.boost,0);
}
let g=fresh();g.enemies[0].x=g.player.x+20;g.enemies[0].y=g.player.y;
g.supplies=[{x:g.player.x,y:g.player.y,kind:'armor',life:20}];g.updateSupplies(0);
assert.equal(g.armor,12);assert.equal(g.enemies[0].armor,0);assert.equal(g.supplies.length,0);
g=fresh();let e=g.enemies[0];e.x=1000;e.y=300;e.armor=12;g.player.x=1000;g.player.y=280;g.updateEnemies(0);
assert.equal(e.hp,1,'enemy armor absorbs lethal top strike');assert.equal(g.stats.kills,0);
e.armor=0;e.cool=0;g.player.cool=0;g.player.x=e.x;g.player.y=e.y-20;g.updateEnemies(0);assert.equal(g.stats.kills,1);
g=fresh();e=g.enemies[0];e.armor=12;e.boost=12;g.invulnerable=100;
g.updateEnemies(1);assert.equal(e.armor,11);assert.equal(e.boost,11);
g.pause();g.update(.02,new Set());assert.equal(e.armor,11);
g=fresh();g.wave=2;g.spawnWave();const boosted=g.enemies.find(e=>e.kind==='bomber');boosted.boost=12;boosted.vx=100;boosted.dir=1;g.invulnerable=100;g.updateEnemies(.1);assert.ok(boosted.vx>100);
const ellipses=[],labels=[];const ctx=new Proxy({createLinearGradient:()=>({addColorStop(){}}),ellipse(...args){ellipses.push(args)},fillText(t){labels.push(t)}},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
g=fresh();g.invulnerable=0;g.armor=12;drawBattle(ctx,g);
assert.equal(ellipses.filter(a=>a[2]===43&&a[3]===33).length,1,'only player shield drawn');assert.ok(labels.includes('PURSUER'));assert.ok(labels.includes('ACE'));
ellipses.length=0;g.enemies[0].armor=12;drawBattle(ctx,g);assert.equal(ellipses.filter(a=>a[2]===43&&a[3]===33).length,2);
console.log('PASS: progressive hull, single-collector ownership, enemy repair/armor/boost, expiry, pause, speed and independent rendering.');
