const assert=require('node:assert/strict'),{load}=require('./load-typescript.cjs');
const param=()=>({value:0,setValueAtTime(v){this.value=v},linearRampToValueAtTime(v){this.peak=v},exponentialRampToValueAtTime(v){this.end=v},setTargetAtTime(v){this.value=v}});
class Context{
 currentTime=1;sampleRate=8000;destination={};nodes=[];gains=[];
 resume(){return Promise.resolve()}close(){return Promise.resolve()}
 createGain(){const g={gain:param(),connect(){},disconnect(){}};this.gains.push(g);return g}
 createOscillator(){const n={frequency:param(),connect(){},disconnect(){},start(){},stop(){this.stopped=true}};this.nodes.push(n);return n}
 createBuffer(n,l){return{getChannelData:()=>new Float32Array(l)}}
 createBufferSource(){return{connect(){},start(){}}}
}
const {BattleAudio}=load('lib/battle-audio.ts',{AudioContext:Context});
const a=new BattleAudio();a.play('explode');assert.equal(a.context,null);a.unlock();const c=a.context;
for(const event of ['dodge','near-miss','thunder','artillery','rear','top','armor-hit','repair','armor','boost','enemy-pickup','jet-roar','explode','boss','warning','rescue','launch','jet','stall']){
 c.currentTime++;const before=c.nodes.length;a.play(event);assert.ok(c.nodes.length>before,event+' produces audio');
 for(const n of a.active)n.onended();assert.equal(a.active.size,0);
}
a.effectsVolume=0;const count=c.nodes.length;a.play('hit');assert.equal(c.nodes.length,count);
a.effectsVolume=.65;a.engineVolume=0;a.update(true,200,true,true);assert.equal(a.gain.gain.value,0);assert.equal(a.airGain.gain.value,0);
a.engineVolume=.45;a.update(true,200,true,true,.3,true);assert.ok(a.gain.gain.value>0);assert.ok(a.airGain.gain.value>0);
a.update(false,200,false,false);assert.equal(a.gain.gain.value,0);assert.equal(a.airGain.gain.value,0);
a.play('boss');a.mute();assert.equal(a.master.gain.value,0);assert.equal(a.active.size,0);
assert.equal(a.noiseVoices.size,0);
a.enabled=false;c.currentTime++;const before=c.nodes.length;a.play('repair');assert.equal(c.nodes.length,before);
console.log('PASS: distinct audio events, bounded voices, gain controls, mute, pause and cleanup.');
const {BattleMusic}=load('lib/battle-music.ts');
const mc=new Context(),music=new BattleMusic(mc,mc.destination);music.volume=.3;music.update(true,'flight',1);assert.ok(music.voices.size>0);assert.equal(music.theme,'flight');music.update(true,'boss',5);assert.equal(music.theme,'boss');assert.ok(music.voices.size<=16);music.update(false,'boss',5);assert.equal(music.voices.size,0);assert.equal(music.bus.gain.value,0);music.volume=0;music.update(true,'mission',6);assert.equal(music.voices.size,0);
console.log('PASS: adaptive music scheduling, theme changes, voice cap, independent volume and pause.');

const {ReactiveScore}=load('lib/reactive-score.ts');const rc=new Context(),reactive=new ReactiveScore(rc,rc.destination);
reactive.volume=.4;reactive.drive(true,.2,false,false);assert.equal(reactive.lastState,'patrol');assert.ok(reactive.voices.size>0);
rc.currentTime++;reactive.drive(true,.8,false,false);assert.equal(reactive.lastState,'combat');rc.currentTime++;reactive.drive(true,1,true,false);assert.equal(reactive.lastState,'boss');
reactive.celebrate();reactive.drive(true,1,true,true);assert.equal(reactive.lastState,'victory');assert.equal(reactive.victoryStep,1);
reactive.drive(false,1,true,true);assert.equal(reactive.voices.size,0);reactive.volume=0;reactive.drive(true,1,true,true);assert.equal(reactive.voices.size,0);
a.enabled=true;a.musicVolume=.4;a.effectsVolume=0;c.currentTime+=10;a.play('victory');a.score(true,'boss',5,1,true);assert.equal(a.reactive.lastState,'victory');assert.ok(a.reactive.voices.size>0);a.musicVolume=0;a.score(true,'boss',5);assert.equal(a.reactive.voices.size,0);
console.log('PASS: reactive patrol/combat/boss/victory states, timing, independent music/effects volume, pause and mute.');

// Soundscape layers obey independent buses and never repeat a missile flyby.
a.enabled=true;a.effectsVolume=.65;a.engineVolume=.45;c.currentTime+=1;
a.update(true,200,false,false,1,false,false,false,'armored');const heavy=a.harmonic.frequency.value;
a.update(true,200,false,false,1,false,false,false,'meteor');assert.notEqual(a.harmonic.frequency.value,heavy);
a.engineVolume=0;a.update(true,200,false,false);assert.equal(a.harmonicGain.gain.value,0);
let noises=0,tones=0,swept=false;const savedNoise=a.noise,savedTone=a.tone;
a.noise=(d,v,f,s)=>{noises++;swept ||= !!s};a.tone=()=>{tones++};
const m={x:650,y:300},flight={mode:'playing',briefingTimer:0,refitPending:false,finale:null,campaign:null,mission:null,enemies:[{missile:m}],player:{x:600,y:300},trucks:[{}],groundTargets:[],boss:null,wave:3,time:10};
a.soundscape(flight,.016);assert.equal(noises,1);assert(swept);a.soundscape(flight,.016);assert.equal(noises,1);
a.ambienceDue=0;flight.mode='paused';a.soundscape(flight,.1);assert.equal(noises,1);assert.equal(a.ambienceDue,0);
flight.mode='playing';a.soundscape(flight,.1);assert.equal(noises,2);assert(a.ambienceDue>=9);
a.pan=.4;flight.enemies=[{missile:{x:620,y:300}}];a.soundscape(flight,.016);assert.equal(a.pan,.4);
a.noise=savedNoise;a.tone=savedTone;a.mute();assert.equal(a.harmonicGain.gain.value,0);
rc.currentTime=20;reactive.victoryUntil=0;reactive.volume=.4;reactive.drive(true,.8,false,false);reactive.drive(true,.5,false,false);assert.equal(reactive.lastState,'combat');reactive.drive(true,.3,false,false);assert.equal(reactive.lastState,'patrol');
console.log('PASS: engine character, harmonic mute, one-shot missile sweep, ambient cadence/pause, pan restore and music hysteresis');

let recordedCalls=0;a.recorded.update=()=>{recordedCalls++;return true};a.musicVolume=.4;a.enabled=true;a.mix=.25;c.currentTime+=10;a.reactive.victoryUntil=0;
for(let i=0;i<100;i++)a.score(true,'mission',1,.43);
assert.equal(a.reactive.lastState,'combat');assert.equal(recordedCalls,0);
for(let i=0;i<100;i++)a.score(true,'mission',1,.25);
assert.equal(a.reactive.lastState,'patrol');a.score(false,'mission',1,.25);assert.equal(a.reactive.voices.size,0);
console.log('PASS: primary adaptive score, single-enemy combat cue, patrol recovery and pause');
