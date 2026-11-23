import type { Battle } from "./battle";
export type FlightFrame={src:string;seconds:number;caption:string};
// A small, in-memory album; never touches career storage or uploads images.
export class MissionFilm {
 private campaign:Battle["campaign"]=null;
 private frames:FlightFrame[]=[];
 private last=-Infinity;
 private kills=0;
 private rescues=0;
 private published=false;
 private thumbnail:HTMLCanvasElement|null=null;
 update(g:Battle,source:HTMLCanvasElement):FlightFrame[]|null{
  let changed=false;
  if(g.campaign!==this.campaign){this.campaign=g.campaign;this.frames=[];this.last=-Infinity;this.kills=g.stats.kills;this.rescues=g.stats.rescues;this.published=false;changed=true}
  const a=g.campaign;if(!a)return changed?[]:null;
  const complete=!!(a.transition||a.won)&&!!g.lastReport;
  const event=g.stats.kills!==this.kills||g.stats.rescues!==this.rescues;
  if(!this.published&&g.mode==="playing"&&g.briefingTimer===0&&(!complete||!this.frames.length)&&(a.elapsed-this.last>=4||event&&a.elapsed-this.last>=.8)){
   const caption=g.stats.rescues>this.rescues?"Pilot rescue":g.stats.kills>this.kills?"Air combat":g.finale?"Boss defeated":this.frames.length?"On patrol":"Into the action";
   this.last=a.elapsed;this.kills=g.stats.kills;this.rescues=g.stats.rescues;
   try{const target=this.thumbnail??=document.createElement("canvas");target.width=640;target.height=347;const ctx=target.getContext("2d");if(ctx){ctx.drawImage(source,0,0,640,347);const src=target.toDataURL("image/jpeg",.78);if(src.startsWith("data:image/")){this.frames.push({src,seconds:Math.floor(a.elapsed),caption});if(this.frames.length>6)this.frames.splice(1,1)}}}catch{/* Capture failure must never interrupt gameplay. */}
  }
  if(complete&&!g.finale&&!this.published){this.published=true;return [...this.frames]}
  return changed?[]:null;
 }
}
