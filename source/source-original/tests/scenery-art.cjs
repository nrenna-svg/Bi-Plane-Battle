const assert=require('node:assert/strict'),fs=require('node:fs'),{load}=require('./load-typescript.cjs');
const created=[];class ImageMock{constructor(){this.complete=false;this.naturalWidth=0;created.push(this)}}
const art=load('lib/scenery-art.ts',{Image:ImageMock});
art.preloadScenery();assert.equal(created.length,7);art.preloadScenery();assert.equal(created.length,7);
const draws=[];const ctx=new Proxy({drawImage:(...a)=>draws.push(a),createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
assert.equal(art.drawSceneryArt(ctx,'harbor',600),false);created.forEach(i=>{i.complete=true;i.naturalWidth=1774});
for(const key of art.SCENERY_KEYS){assert.ok(fs.statSync('public/scenery/'+key+'-v1.webp').size>10000);assert.equal(art.drawSceneryArt(ctx,key,600),true)}
const before=art.backgroundTravel(2999),after=art.backgroundTravel(1);assert.equal(after-before,2);
assert.equal(art.drawRealBuilding(ctx,300,500,140,108),true);assert.equal(art.drawRealCloud(ctx,300,200,false),true);
assert.ok(draws.length>5);created[0].naturalWidth=0;assert.equal(art.drawSceneryArt(ctx,'harbor',1),false);
console.log('PASS: scenery assets, single cached load, decode failure fallback, world-wrap continuity, all five environments and foreground textures.');
