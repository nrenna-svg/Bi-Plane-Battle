import { BattleMusic } from "./battle-music";
// Main adaptive score with distinct patrol, combat and boss arrangements.
export class ReactiveScore extends BattleMusic {
 beat=0;due=0;victoryUntil=0;victoryStep=0;lastState="";
 constructor(private clock:AudioContext,out:AudioNode){super(clock,out)}
 celebrate(){this.victoryUntil=this.clock.currentTime+3.6;this.victoryStep=0;this.due=0}
 drive(playing:boolean,intensity:number,boss:boolean,finale:boolean){
  if(!playing||this.volume<=0){this.stop();this.due=0;return}
  const now=this.clock.currentTime,victory=now<this.victoryUntil,state=victory?"victory":finale?"finale":boss?"boss":intensity>(this.lastState==="combat"?.32:.4)?"combat":"patrol";
  if(state!==this.lastState){this.stop();this.due=now;this.beat=0;this.lastState=state}
  this.bus?.gain.setTargetAtTime(this.volume,now,.15);
  if(this.due<now-.1)this.due=now;
  if(this.due>now+.05)return;
  if(victory){const notes=[60,64,67,72,71,67,69,76];if(this.victoryStep<notes.length){this.note(notes[this.victoryStep++],this.due,.7,.14,"triangle");this.note(48,this.due,.8,.025,"sine")}this.due+=.4}
  else if(state==="patrol"){
   const root=[48,53,57,55][Math.floor(this.beat/8)%4],melody=[12,16,19,23,21,19,16,14];
   this.note(root+melody[this.beat%8],this.due,.65,.095,"triangle");
   if(this.beat%4===0){this.note(root-12,this.due,2,.075,"sine");this.note(root+7,this.due,1.8,.025,"triangle")}
   this.due+=.55;
  }else{
   const tension=state==="boss"||state==="finale",root=(tension?45:48)+[0,5,3,7][Math.floor(this.beat/8)%4];
   const melody=tension?[12,13,19,15,24,19,13,12]:[12,19,24,22,19,15,17,19];
   this.note(root+melody[this.beat%8],this.due,tension?.18:.25,tension?.07:.1,tension?"sawtooth":"triangle");
   this.note(this.beat%2?82:31,this.due,this.beat%2?.04:.15,this.beat%2?.016:.11,this.beat%2?"square":"sine");
   if(this.beat%2===0)this.note(root-12,this.due,.32,.08,"triangle");
   if(this.beat%4===0)this.note(root+7,this.due,.65,.04,"sine");
   this.due+=tension?.22:.3;
  }
  this.beat++;
 }
}
