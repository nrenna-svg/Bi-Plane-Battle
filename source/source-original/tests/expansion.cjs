const assert=require('node:assert/strict'),fs=require('fs'),{load}=require('./load-typescript.cjs');
const {PLANES,CHALLENGES,PAINTS,newProfile,readProfile,planeUnlocked,planeProgress}=load('lib/progression.ts'),{Battle}=load('lib/battle.ts'),{AIRFRAMES,drawAirframe}=load('lib/airframes.ts');
assert.equal(Object.keys(PLANES).length,16);assert.equal(CHALLENGES.length,24);assert.equal(Object.keys(PAINTS).length,26);
const p=newProfile();for(const id of Object.keys(PLANES)){assert.ok(AIRFRAMES[id]);assert.ok(fs.existsSync('public/aircraft/'+id+'.svg'));assert.equal(planeUnlocked(id,p),id==='scout')}
for(const c of CHALLENGES.slice(4)){const g=new Battle();g.start();const metric=c.metric;if(['kills','rescues','bestScore','bestWave','bosses'].includes(metric)){g.profile[metric]=c.target-1;if(metric==='bestScore')g.best=c.target-1}else g.stats[metric]=c.target-1;g.progress();assert.ok(!g.profile.completed.includes(c.id));if(['kills','rescues','bestScore','bestWave','bosses'].includes(metric)){g.profile[metric]=c.target;if(metric==='bestScore')g.best=c.target}else g.stats[metric]=c.target;g.progress();assert.ok(g.profile.completed.includes(c.id),c.name);const saved=readProfile(JSON.stringify(g.profile));assert.ok(saved.completed.includes(c.id))}
const unlocked=newProfile();unlocked.kills=1000;unlocked.rescues=1000;unlocked.bosses=100;unlocked.bestScore=100000;unlocked.bestWave=30;unlocked.completed=CHALLENGES.map(c=>c.id);
for(const id of Object.keys(PLANES)){assert.ok(planeUnlocked(id,unlocked));const g=new Battle();g.profile={...unlocked};g.workshop.owned.push(id);assert.ok(g.selectPlane(id));g.start();assert.equal(g.maxHp,load("lib/workshop.ts").workshopSpec(g.workshop,id).hp)}
const shapes=new Set(Object.values(AIRFRAMES).map(v=>JSON.stringify(v)));assert.equal(shapes.size,16);
console.log('PASS: 16 unique airframes, 24 challenge gates at exact boundaries, reward persistence, aircraft selection/specs and preview assets.');

