import type { Battle } from "./battle";
import { AIRFRAMES } from "./airframes";
import { trimDebris } from "./wreckage";
export type ExplosionKind="blast"|"mine"|"truck"|"train"|"fuel"|"ammo"|"radar"|"jet"|"airship"|"carrier"|"transport";
export function explosionFragments(g:Battle,x:number,y:number,color:string,kind:string){
 const f=AIRFRAMES[kind==="cargo"?"vanguard":kind==="interceptor"?"meteor":kind==="helicopter"?"dragonfly":kind];
 const shapes=f?[0,0,4,2,1,...(f.twin?[1]:[]),...(f.float?[2,2]:[]),...(f.tiers>1?[0,0]:[])]:kind==="mine"?[3,3,3,1]:kind==="truck"||kind==="train"?[1,1,2,3,3]:kind==="radar"?[4,3,2]:kind==="airship"?[0,0,2,4]:kind==="jet"?[4,4,2,1]:kind==="carrier"||kind==="transport"?[0,2,2,1,4]:kind==="ammo"?[3,3,2,1]:kind==="fuel"?[2,2,1]:[3,3,1];
 const count=g.reducedMotion?12:kind==="carrier"||kind==="airship"?32:24;
 for(let i=0;i<count;i++){
  const shape=shapes[i%shapes.length],a=i*2.399963+Math.random()*.4,speed=90+Math.random()*230;
  const material=kind==="fuel"?"#bfa575":kind==="radar"||kind==="jet"?"#c7dfdf":kind==="truck"||kind==="train"||kind==="ammo"?"#86937b":kind==="mine"?"#617b87":kind==="carrier"?"#9aadb5":kind==="airship"?"#d5bea0":color;
  g.debris.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed-100,spin:a,life:1.8+Math.random()*1.6,hazard:false,shape,size:(.22+Math.random()*.5)*(f?(shape===0?f.wing/24:shape===2?f.length/31:shape===4?f.tail/12:1):kind==="carrier"?1.5:kind==="mine"?.5:1),turn:(Math.random()-.5)*12,tint:material,source:kind,sweep:f?.sweep??0});
 }
 trimDebris(g);
}
