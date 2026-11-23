export type MusicTheme="flight"|"mission"|"boss";
export class BattleMusic{
 bus:GainNode|null=null;voices=new Set<OscillatorNode>();next=0;step=0;theme:MusicTheme="flight";volume=.3;
 constructor(private context:AudioContext,private output:AudioNode){this.bus=context.createGain();this.bus.gain.value=0;this.bus.connect(output)}
 stop(){for(const voice of this.voices){try{voice.stop()}catch{}}this.voices.clear();this.bus?.gain.setValueAtTime(0,this.context.currentTime);this.next=0;}
 note(midi:number,time:number,length:number,level:number,type:OscillatorType){
  if(this.voices.size>=16||!this.bus)return;
  const a=this.context,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(440*2**((midi-69)/12),time);
  g.gain.setValueAtTime(.0001,time);g.gain.linearRampToValueAtTime(level,time+.018);g.gain.exponentialRampToValueAtTime(.0001,time+length);
  o.connect(g);g.connect(this.bus);this.voices.add(o);o.onended=()=>{this.voices.delete(o);o.disconnect();g.disconnect()};o.start(time);o.stop(time+length+.025);
 }
 update(playing:boolean,theme:MusicTheme,intensity:number){
  if(!playing||this.volume<=0){this.stop();return}
  const a=this.context;if(theme!==this.theme){this.stop();this.theme=theme;this.step=0}
  this.bus?.gain.setTargetAtTime(this.volume,a.currentTime,.12);
  if(this.next<a.currentTime-.1)this.next=a.currentTime+.02;
  const minor=theme!=="flight",root=theme==="boss"?45:48;
  const melody=minor?[0,7,12,10,7,3,5,7,0,3,7,10,12,7,5,3]:[0,4,7,12,11,7,9,7,4,7,12,14,12,9,7,4];
  const beat=60/(theme==="boss"?132:theme==="mission"?120:108)/2;
  while(this.next<a.currentTime+.12){
   const i=this.step%32,chord=[0,minor?8:5,minor?3:9,7][Math.floor(i/8)];
   this.note(root+12+melody[i%16],this.next,beat*.83,.032,"triangle");
   if(i%2===0)this.note(root+chord-12,this.next,beat*1.65,.03,"sine");
   if(i%4===0){this.note(root+chord,this.next,beat*2,.012,"triangle");this.note(root+chord+7,this.next,beat*2,.009,"triangle")}
   if(theme!=="flight"||intensity>=5){if(i%2===0)this.note(31,this.next,.09,.04,"sine");else this.note(84,this.next,.035,.006,"square")}
   this.next+=beat;this.step++;
  }
 }
}
