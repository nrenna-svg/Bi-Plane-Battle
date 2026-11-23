const assert=require('node:assert/strict'),{load}=require('./load-typescript.cjs');
const {Battle}=load('lib/battle.ts'),{enterCampaignStage}=load('lib/campaign.ts'),{spawnEscapeWreckage,updateDebris,debrisHits}=load('lib/wreckage.ts');
function sim(speed,y,brake=false,region=0){
 const g=new Battle(()=>.5);g.start();enterCampaignStage(g,region*5+4);g.briefingTimer=0;g.invulnerable=0;g.player.x=2950;g.player.y=y;g.player.vx=speed;g.player.vy=0;spawnEscapeWreckage(g);
 let hits=0;g.damage=()=>{hits++;return true};
 for(let i=0;i<180;i++){g.player.x=(g.player.x+(brake?0:speed)/60+3000)%3000;updateDebris(g,1/60)}
 return hits;
}
for(const region of [0,4])for(const speed of [-440,-290,290,440])for(const y of [140,300,520])assert.ok(sim(speed,y,false,region)>0,'straight full-speed flight must intersect warned debris');
assert.equal(sim(440,300,true),0,'braking after the warning provides an escape');
const g=new Battle(()=>.5);g.start();enterCampaignStage(g,14);g.briefingTimer=0;g.invulnerable=0;g.player.vx=300;spawnEscapeWreckage(g);
const d=g.debris[0],x=d.x;updateDebris(g,.3);assert.equal(d.x,x);assert.equal(d.y,55);assert.equal(debrisHits(d,d.x,d.y),false);
g.pause();const warning=d.warning;g.update(.03,new Set());assert.equal(d.warning,warning);g.pause();d.warning=0;const vx=d.vx;g.player.x=2000;updateDebris(g,.02);assert.equal(d.vx,vx,'released fragment does not home');
const wing={x:5,y:300,vx:0,vy:0,spin:0,life:2,hazard:true,shape:0,size:1};assert.equal(debrisHits(wing,2995,300),true);assert.equal(debrisHits(wing,60,300),true);assert.equal(debrisHits({...wing,shape:3},60,300),false);assert.equal(debrisHits(wing,5,360),false);assert.equal(debrisHits({...wing,spin:Math.PI/2},5,350),true);
g.debris=[];for(let i=0;i<50;i++)spawnEscapeWreckage(g);assert.equal(g.debris.length,40);assert.equal(new Set(g.debris.map(d=>d.shape)).size,5);g.start();assert.equal(g.debris.length,0);
console.log('PASS: full-speed paths intercepted in both directions/altitudes/regions, braking escape, warnings, pause, fixed trajectories, wrap-aware size/rotation collision, shape variety, cap and restart.');
