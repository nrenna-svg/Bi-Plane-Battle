const assert=require('node:assert/strict'),fs=require('node:fs'),{load}=require('./load-typescript.cjs');
class AudioMock {
 constructor(src){this.src=src;this.paused=true;this.events={};}
 addEventListener(name,fn){this.events[name]=fn}play(){this.paused=false;return Promise.resolve()}pause(){this.paused=true}removeAttribute(){this.src=''}load(){}
}
(async()=>{
const {RecordedScore}=load('lib/recorded-score.ts',{Audio:AudioMock}),score=new RecordedScore();score.unlock();
for(const theme of ['flight','mission','boss']){assert.equal(score.tracks[theme].src,'/audio/'+theme+'.wav');const wav=fs.readFileSync('public/audio/'+theme+'.wav');assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.toString('ascii',8,12),'WAVE');assert.ok(wav.length>1e6)}
score.update(true,'flight',.4);await Promise.resolve();assert.equal(score.update(true,'flight',.4),true);assert.equal(score.tracks.flight.volume,.4*.55);
score.update(true,'boss',.5);await Promise.resolve();assert.equal(score.tracks.flight.paused,true);assert.equal(score.tracks.boss.paused,false);
score.update(false,'boss',.5);assert.equal(score.tracks.boss.paused,true);
score.update(true,'mission',0);assert.equal(score.tracks.mission.paused,true);
score.tracks.flight.events.error();assert.equal(score.update(true,'flight',.5),false,'Failed assets allow live synth fallback');
score.close();assert.equal(Object.keys(score.tracks).length,0);
const race=new RecordedScore();race.unlock();race.update(true,'flight',.5);race.stop();await Promise.resolve();assert.equal(race.tracks.flight.paused,true,'Pending play cannot restart audio after pause');
console.log('PASS: original soundtrack assets, theme switch, volume/mute, fallback, cleanup and pending-play pause race.');
})().catch(e=>{console.error(e);process.exitCode=1});
