"""Render original, loopable synthesized score. No sampled or third-party music."""
import math, random, wave
from pathlib import Path
from array import array
RATE=22050
OUT=Path(__file__).resolve().parents[1]/"public"/"audio"
OUT.mkdir(parents=True,exist_ok=True)
def render(theme,bpm,key):
    beat=60/bpm
    length=beat*64
    n=int(length*RATE)
    mix=[0.0]*n
    rng=random.Random(82)
    def note(start,duration,midi,volume,instrument):
        frequency=440*2**((midi-69)/12)
        count=int(duration*RATE)
        offset=int(start*RATE)
        for j in range(count):
            t=j/RATE
            env=min(1,t/.025)*min(1,(duration-t)/.15)
            phase=2*math.pi*frequency*t
            if instrument=="strings":
                sample=(math.sin(phase)+.22*math.sin(phase*2)+.12*math.sin(phase*3))*env
            elif instrument=="brass":
                sample=(math.sin(phase)+.3*math.sin(phase*2)+.17*math.sin(phase*3))*env*(.8+.2*math.sin(t*30))
            else: sample=math.sin(phase)*math.exp(-t*4)*env
            mix[(offset+j)%n]+=sample*volume
    chords=[0,-3,-5,-7]
    melody=[0,7,12,10,7,3,5,7,0,3,7,12,10,7,5,3]
    for bar in range(16):
        root=key+chords[(bar//2)%4]
        for interval in [0,7,12,15]:
            note(bar*4*beat,4*beat,root+interval,.025,"strings")
        for b in range(4):
            start=(bar*4+b)*beat
            note(start,beat*.8,root-12,.085,"bass")
            if theme=="boss" or b%2==0:
                note(start,beat*.72,key+12+melody[(bar*2+b//2)%16],.068,"brass")
            # Timpani body and brushed snare transient.
            for j in range(int(.22*RATE)):
                t=j/RATE;sample=math.sin(2*math.pi*(58*t+2*(1-math.exp(-t*15))))*math.exp(-t*19)
                if b%2:sample+=rng.uniform(-1,1)*math.exp(-t*37)*.45
                mix[(int(start*RATE)+j)%n]+=sample*(.12 if theme=="boss" else .07)
            if theme!="flight":
                note(start+beat*.5,beat*.4,root+19,.025,"strings")
    peak=max(abs(v) for v in mix) or 1
    pcm=array('h',(int(max(-1,min(1,v/peak*.82))*32767) for v in mix))
    with wave.open(str(OUT/(theme+".wav")),'wb') as f:
        f.setnchannels(1);f.setsampwidth(2);f.setframerate(RATE);f.writeframes(pcm.tobytes())
    print(theme,round(length,1),"seconds",len(pcm)*2,"bytes")
for args in [("flight",108,50),("mission",120,48),("boss",132,45)]:render(*args)
