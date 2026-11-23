import type { MusicTheme } from "./battle-music";
// Original offline-rendered synthesis; the live synth remains a fallback.
export class RecordedScore {
 tracks:Partial<Record<MusicTheme,HTMLAudioElement>>={};current:MusicTheme|null=null;failed=false;pending=false;playing=false;generation=0;
 unlock(){
  if(typeof Audio==="undefined")return;
  for(const theme of ["flight","mission","boss"] as MusicTheme[]){
   if(this.tracks[theme])continue;
   const a=new Audio("/audio/"+theme+".wav");a.loop=true;a.preload="auto";a.volume=0;a.addEventListener("error",()=>{this.failed=true;this.stop()});this.tracks[theme]=a;
  }
 }
 update(playing:boolean,theme:MusicTheme,volume:number){
  if(!playing||volume===0){this.stop();return false}
  if(this.failed||!this.tracks[theme])return false;
  if(this.current!==theme){this.stop();this.current=theme}
  const a=this.tracks[theme]!;a.volume=Math.max(0,Math.min(1,volume))*.55;
  if(a.paused&&!this.pending){this.pending=true;const generation=this.generation;void a.play().then(()=>{this.pending=false;if(generation!==this.generation){a.pause();return}this.playing=true},()=>{this.pending=false;if(generation===this.generation)this.failed=true})}
  return this.playing&&!a.paused;
 }
 stop(){this.generation++;for(const a of Object.values(this.tracks))a.pause();this.playing=false}
 close(){this.stop();for(const a of Object.values(this.tracks)){a.removeAttribute("src");a.load()}this.tracks={}}
}
