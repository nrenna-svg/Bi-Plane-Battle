import { ReactiveScore } from "./reactive-score";
import { PLANES } from "./progression";
import { RecordedScore } from "./recorded-score";
import { BattleMusic, type MusicTheme } from "./battle-music";
import { wrapDelta } from "./game-rules";
import type { Battle, SoundEvent } from "./battle";
export class BattleAudio{
 harmonic:OscillatorNode|null=null;harmonicGain:GainNode|null=null;ambienceDue=7;heardMissiles=new WeakSet<object>();
 noiseBuffer:AudioBuffer|null=null;noiseVoices=new Set<AudioBufferSourceNode>();mix=.65;lastPulse=0;
 recorded=new RecordedScore();radioEnabled=false;pan=0;
 reactive:ReactiveScore|null=null;music:BattleMusic|null=null;musicVolume=.3;
 context:AudioContext|null=null;engine:OscillatorNode|null=null;gain:GainNode|null=null;master:GainNode|null=null;
 wind:OscillatorNode|null=null;windGain:GainNode|null=null;enabled=true;effectsVolume=.65;engineVolume=.45;
 air:AudioBufferSourceNode|null=null;airGain:GainNode|null=null;
 active=new Set<OscillatorNode>();last=new Map<string,number>();
 unlock(){
  if(!this.enabled)return;this.recorded.unlock();
  try{
   this.context??=new AudioContext();void this.context.resume().catch(()=>{});
   if(!this.engine){
    const a=this.context;this.master=a.createGain();this.master.connect(a.destination);this.music=new BattleMusic(a,this.master);this.reactive=new ReactiveScore(a,this.master);
    this.engine=a.createOscillator();this.engine.type="sawtooth";this.gain=a.createGain();this.gain.gain.value=0;this.engine.connect(this.gain);this.gain.connect(this.master);this.engine.start();
    this.harmonic=a.createOscillator();this.harmonic.type="triangle";this.harmonicGain=a.createGain();this.harmonicGain.gain.value=0;this.harmonic.connect(this.harmonicGain);this.harmonicGain.connect(this.master);this.harmonic.start();
    this.wind=a.createOscillator();this.wind.type="triangle";this.windGain=a.createGain();this.windGain.gain.value=0;this.wind.connect(this.windGain);this.windGain.connect(this.master);this.wind.start();
    this.noiseBuffer=a.createBuffer(1,a.sampleRate,a.sampleRate);const noise=this.noiseBuffer.getChannelData(0);for(let i=0;i<noise.length;i++)noise[i]=Math.random()*2-1;
    const buffer=a.createBuffer(1,a.sampleRate*2,a.sampleRate),data=buffer.getChannelData(0);let previous=0;
    for(let i=0;i<data.length;i++){previous=(previous+Math.random()*.04-.02)/1.02;data[i]=previous*3.5;}
    this.air=a.createBufferSource();this.air.buffer=buffer;this.air.loop=true;this.airGain=a.createGain();this.airGain.gain.value=0;this.air.connect(this.airGain);this.airGain.connect(this.master);this.air.start();
   }
   this.master?.gain.setValueAtTime(1,this.context.currentTime);
  }catch{}
 }
 tone(frequency:number,duration=.18,volume=.05,type:OscillatorType="square",delay=0,end=frequency*.55){
  const a=this.context;if(!a||!this.master||!this.enabled||this.effectsVolume===0||this.active.size>=24)return;
  const o=a.createOscillator(),g=a.createGain(),t=a.currentTime+delay;o.type=type;
  o.frequency.setValueAtTime(frequency,t);o.frequency.exponentialRampToValueAtTime(Math.max(25,end),t+duration);
  g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(volume*this.effectsVolume,t+.008);g.gain.exponentialRampToValueAtTime(.001,t+duration);
  o.connect(g);const p=typeof a.createStereoPanner==="function"?a.createStereoPanner():null;if(p){p.pan.value=this.pan;g.connect(p);p.connect(this.master)}else g.connect(this.master);this.active.add(o);o.onended=()=>{this.active.delete(o);o.disconnect();g.disconnect();p?.disconnect()};o.start(t);o.stop(t+duration+.02);
 }
 noise(duration:number,volume:number,cutoff:number,sweep=false){
  const a=this.context;if(!a||!this.master||!this.noiseBuffer||!this.enabled||this.effectsVolume===0||this.noiseVoices.size>=12)return;
  const source=a.createBufferSource(),gain=a.createGain(),t=a.currentTime;source.buffer=this.noiseBuffer;
  const filter=typeof a.createBiquadFilter==="function"?a.createBiquadFilter():null;
  if(filter){filter.type="lowpass";filter.frequency.value=cutoff;source.connect(filter);filter.connect(gain)}else source.connect(gain);
  gain.gain.setValueAtTime(.0001,t);gain.gain.linearRampToValueAtTime(volume*this.effectsVolume,t+.004);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
  const pan=typeof a.createStereoPanner==="function"?a.createStereoPanner():null;if(pan){pan.pan.value=this.pan;if(sweep){pan.pan.setValueAtTime(this.pan,t);pan.pan.linearRampToValueAtTime(-this.pan,t+duration)}gain.connect(pan);pan.connect(this.master)}else gain.connect(this.master);
  this.noiseVoices.add(source);source.onended=()=>{this.noiseVoices.delete(source);source.disconnect?.();gain.disconnect();filter?.disconnect();pan?.disconnect()};source.start(t);if(typeof source.stop==="function")source.stop(t+duration+.02);
 }
 play(event:SoundEvent){
  if(!this.context||!this.enabled)return;
  const t=this.context.currentTime;if(t-(this.last.get(event)??-10)<.06)return;this.last.set(event,t);
  if(event==="blueprint-ping"){this.tone(980,.12,.018,"sine",0,1300);return}
  if(event==="tracking"){this.tone(650,.12,.025,"sine",0,950);return}
  if(event==="locked"){this.tone(1100,.5,.04,"square",0,1400);return}
  if(event==="missile"){this.noise(.55,.09,1600);this.tone(130,.4,.04,"sawtooth",0,450);return}
  if(event==="rotor"){this.tone(55,.1,.016,"triangle",0,38);this.noise(.07,.013,280);return}
  if(event==="cargo-engine"){this.tone(65,.4,.015,"sawtooth",0,62);return}
  if(event==="interceptor-pass"){this.noise(.5,.045,1800);this.tone(180,.5,.022,"sawtooth",0,60);return}
  if(event==="dodge"||event==="near-miss"){this.noise(.22,.07,2500);this.tone(event==="dodge"?260:680,.15,.022,"sine",0,event==="dodge"?90:1100);return}
  if(event==="thunder"||event==="artillery"){this.noise(event==="thunder"?.85:.35,.1,event==="thunder"?160:500);this.tone(48,.6,.065,"sine",.04,25);return}
  if(event==="victory"){this.reactive?.celebrate();return}
  if(event==="gun"||event==="flak"){this.noise(event==="gun"?.07:.18,event==="gun"?.065:.12,event==="gun"?3800:950);this.tone(event==="gun"?150:70,.09,event==="gun"?.024:.045,"sawtooth");return}
  if(event==="explode"||event==="boss"){this.noise(.18,.06,5500);this.tone(1250,.32,.018,"triangle",.05,170);this.tone(1760,.23,.012,"square",.12,280);const big=event==="boss";this.noise(big?.85:.4,big?.23:.14,big?420:800);this.tone(80,big?1:.45,.11,"sawtooth");this.tone(43,.7,.07,"triangle",.05);this.tone(170,.25,.045,"square",.09);return}
  if(event==="rear"||event==="top"||event==="armor-hit"){this.noise(.09,.035,4200);this.tone(event==="armor-hit"?950:event==="top"?100:320,.2,.065,"triangle");this.tone(event==="armor-hit"?1470:620,.09,.025,"square",.025);return}
  if(event==="repair"||event==="armor"||event==="boost"||event==="enemy-pickup"){const base=event==="repair"?520:event==="armor"?740:event==="boost"?360:440,volume=event==="enemy-pickup"?.018:.045;[1,1.25,1.5].forEach((n,i)=>this.tone(base*n,.14,volume,"sine",i*.07,base*n*1.05));return}
  if(event==="jet-roar"){this.tone(80,.8,.065,"sawtooth",0,420);this.tone(210,.65,.025,"triangle",.1,70);return}
  const notes={launch:440,hit:180,pickup:780,rescue:1040,warning:600,jet:1450,stall:115};
  this.tone(notes[event as keyof typeof notes]??180,event==="stall"?.3:.18,.045);
  if(event==="rescue"||event==="jet")this.tone(1300,.25,.035,"sine",.12,1800);
 }
 update(playing:boolean,speed:number,climb:boolean,boost:boolean,hull=1,dust=false,boss=false,jet=false,aircraft="scout",dive=0){
  if(!this.context||!this.gain||!this.engine)return;
  const t=this.context.currentTime,damaged=hull<.5,sputter=damaged?(.3+.7*Math.abs(Math.sin(t*29))):1;
  this.master?.gain.setTargetAtTime(this.enabled?1:0,t,.025);
  this.gain.gain.setTargetAtTime(this.enabled&&playing?.035*this.engineVolume*sputter*(.88+.12*Math.abs(Math.sin(t*45))):0,t,.04);
  const voice=Math.max(0,Object.keys(PLANES).indexOf(aircraft));this.engine.type=voice%3===0?"triangle":"sawtooth";
  this.engine.frequency.setTargetAtTime(48+voice*2+Math.abs(speed)*.16+(climb?30:0)+(boost?40:0)-(damaged?12:0),t,.08);
  const heavy=["armored","vanguard","tempest","albatross"].includes(aircraft),fast=["racer","falcon","meteor","phoenix"].includes(aircraft);
  this.harmonic?.frequency.setTargetAtTime((heavy?38:fast?105:72)+Math.abs(speed)*(heavy?.1:.22)+(climb?24:0),t,.12);
  if(this.harmonic)this.harmonic.type=heavy?"sine":fast?"sawtooth":"triangle";
  this.harmonicGain?.gain.setTargetAtTime(this.enabled&&playing?this.engineVolume*(heavy?.023:fast?.009:.014)*sputter*(.7+.3*Math.sin(t*(heavy?17:27))**2):0,t,.06);
  this.wind?.frequency.setTargetAtTime(boss?38:dust?110+Math.sin(t*7)*35:jet?240:155+Math.abs(speed)*.1,t,.1);
  this.windGain?.gain.setTargetAtTime(this.enabled&&playing?this.engineVolume*(boss?.02:jet?.025:0):0,t,.1);
  this.airGain?.gain.setTargetAtTime(this.enabled&&playing?this.engineVolume*(dive*.1+(dust?.13+Math.sin(t*5)*.04:.025+Math.min(400,Math.abs(speed))*.00012)):0,t,.1);
 }
 soundscape(g:Battle,dt:number){
  if(!this.context||!this.enabled||g.mode!=="playing"||g.briefingTimer>0||g.refitPending||g.finale||g.campaign?.transition||g.mission?.complete)return;
  const previous=this.pan;
  for(const e of g.enemies){const m=e.missile;if(!m||this.heardMissiles.has(m))continue;
   const dx=wrapDelta(m.x,g.player.x);if(Math.hypot(dx,m.y-g.player.y)>170)continue;
   this.heardMissiles.add(m);this.pan=Math.max(-.9,Math.min(.9,dx/170));this.noise(.48,.075,3800,true);this.tone(680,.42,.022,"sawtooth",0,120);
  }
  this.ambienceDue-=Math.max(0,Math.min(.1,dt));
  if(this.ambienceDue<=0){this.ambienceDue=9+(g.wave%4)*1.7;
   if(g.trucks.length||g.groundTargets.length||g.boss||g.campaign?.phase==="boss"){
    this.pan=Math.sin(g.time*.37)*.8;this.noise(1.3,.022,220);this.tone(44,.95,.015,"sine",.12,28);
   }
  }
  this.pan=previous;
 }
 score(playing:boolean,theme:MusicTheme,wave:number,intensity=.65,finale=false){
 this.mix+=(Math.max(.12,Math.min(1,intensity))-this.mix)*.04;const victory=!!this.reactive&&!!this.context&&this.context.currentTime<this.reactive.victoryUntil;const volume=this.musicVolume*(.25+this.mix*.65)*(victory?.22:1);
 if(this.reactive){this.recorded.stop();this.music?.stop();this.reactive.volume=this.musicVolume;this.reactive.drive(playing&&this.enabled,this.mix,theme==="boss",finale);return}
 const recorded=this.recorded.update(playing&&this.enabled,theme,volume);
 if(this.music){this.music.volume=volume;this.music.update(playing&&this.enabled&&!recorded,theme,wave)}
}
 radio(line:string){if(!this.enabled||!this.radioEnabled||typeof speechSynthesis==="undefined")return;this.stopRadio();const utterance=new SpeechSynthesisUtterance(line.replace(/^[A-Z]+: /,""));utterance.rate=1.05;utterance.pitch=.85;utterance.volume=this.effectsVolume;speechSynthesis.speak(utterance)}
 stopRadio(){if(typeof speechSynthesis!=="undefined")speechSynthesis.cancel()}
 mute(){this.reactive?.stop();for(const n of this.noiseVoices){try{n.stop?.()}catch{}}this.noiseVoices.clear();this.recorded.stop();this.stopRadio();this.music?.stop();if(this.context){this.master?.gain.setValueAtTime(0,this.context.currentTime);this.gain?.gain.setValueAtTime(0,this.context.currentTime);this.harmonicGain?.gain.setValueAtTime(0,this.context.currentTime);this.windGain?.gain.setValueAtTime(0,this.context.currentTime);this.airGain?.gain.setValueAtTime(0,this.context.currentTime);for(const o of this.active){try{o.stop()}catch{}}this.active.clear()}}
 close(){this.mute();this.recorded.close();void this.context?.close()}
}
