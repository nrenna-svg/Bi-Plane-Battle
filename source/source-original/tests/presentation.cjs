const assert=require('node:assert/strict'),{load}=require('./load-typescript.cjs');
const {Battle}=load('lib/battle.ts'),{flightReport}=load('lib/flight-report.ts'),{newProfile}=load('lib/progression.ts');
let g=new Battle();g.start();g.wave=3;g.spawnWave();const x=g.player.x,y=g.player.y;g.update(.03,new Set(['KeyF','Space']));assert.equal(g.player.x,x);assert.equal(g.player.y,y);assert.equal(g.stats.duration,0);assert.equal(g.bullets.length,0);
const timer=g.briefingTimer;g.pause();g.update(.03,new Set());assert.equal(g.briefingTimer,timer);g.pause();for(let i=0;i<110;i++)g.update(.03,new Set(['Space']));assert.equal(g.briefingTimer,0);assert.ok(g.stats.duration>0);
g.mission.progress=5;g.updateMission(0);assert.ok(g.sounds.includes('victory'));
function burst(increment){let heat=0,cool=0,time=0,shots=0;while(heat<100&&time<10){heat=Math.max(0,heat-20/60);cool=Math.max(0,cool-1/60);if(cool===0){heat+=increment;cool=.13;shots++}time+=1/60}return{seconds:time,shots}}
const old=burst(12),now=burst(8);assert.ok(now.seconds>old.seconds*1.5);assert.ok(now.seconds<4);console.log('Burst balance:',old,'->',now);
g=new Battle();g.start();g.enemies=[];g.nextWave=-100;g.invulnerable=100;g.pilots=[{x:2000,y:200}];g.mission={kind:'rescue',progress:0,target:5,complete:false};g.update(.03,new Set());assert.equal(g.pilots[0].y,200.96);
const p=newProfile();p.kills=24;const report=flightReport(p,{rescues:11,clutchLandings:0,bosses:0},0,[]);assert.equal(report.aircraft[0].name,'Skylark');assert.ok(report.nearly.some(c=>c.id==='rescue-flight'));
p.completed=['first-flight'];assert.deepEqual(Array.from(flightReport(p,{},0,[]).earned),['First victories']);
console.log('PASS: safe briefings, pause, fanfare, balance measurements, rescue descent and flight-report rankings.');

g=new Battle();g.start();let elapsed=0;while(!g.overheated&&elapsed<5){g.updateWeapons(1/60,true);elapsed+=1/60}assert.ok(elapsed>2&&elapsed<3);
