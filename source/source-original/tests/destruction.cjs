const assert=require('node:assert/strict'),{load}=require('./load-typescript.cjs');
const {Battle}=load('lib/battle.ts'),{AIRFRAMES}=load('lib/airframes.ts'),{explosionFragments}=load('lib/destruction.ts'),{updateDebris,debrisHits}=load('lib/wreckage.ts'),{drawCarrier}=load('lib/carrier-art.ts'),{drawMines,hitMine}=load('lib/boss-tactics.ts');
const g=new Battle(()=>.5);g.start();
for(const kind of [...Object.keys(AIRFRAMES),'mine','truck','train','fuel','ammo','radar','jet','airship','carrier','transport']){g.debris=[];explosionFragments(g,100,200,'#abcdef',kind);assert.ok(g.debris.length>=24);assert.ok(g.debris.every(d=>d.source===kind&&!d.hazard&&Number.isFinite(d.vx)&&d.size>0));assert.equal(debrisHits(g.debris[0],100,200),false)}
g.debris=[{x:100,y:100,vx:0,vy:0,spin:0,life:4,hazard:true}];for(let i=0;i<30;i++)g.burst(100,200,'#ffaabb',true,'carrier');assert.equal(g.debris.filter(d=>d.hazard).length,1);assert.equal(g.debris.filter(d=>!d.hazard).length,144);assert.ok(g.particles.length<=600);updateDebris(g,5);assert.equal(g.debris.length,0);
g.reducedMotion=true;for(let i=0;i<10;i++)explosionFragments(g,100,200,'#abcdef','carrier');assert.equal(g.debris.length,48);
g.airMines=[{x:100,y:200,arm:0,life:3,phase:0}];hitMine(g,{x:100,y:200});assert.ok(g.debris.some(d=>d.source==='mine'));
const ctx=new Proxy({createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});for(const friendly of [false,true])for(const hp of [1,.3])drawCarrier(ctx,600,300,1,friendly,hp,true);g.airMines=[{x:100,y:200,arm:.5,life:3,phase:0}];drawMines(ctx,g);
console.log('PASS: all airframe/object explosion profiles, hazard preservation, bounded particles/debris, expiry, reduced motion, mine integration and carrier/mine rendering.');
