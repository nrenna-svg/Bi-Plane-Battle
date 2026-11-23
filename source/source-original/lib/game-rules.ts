export type Aircraft = {x:number;y:number;vx:number;vy:number;dir:number;cool:number;hp:number;stall:number};
export const wrapDelta=(a:number,b:number)=>((a-b+4500)%3000)-1500;
export function ceiling(p:Aircraft,top=60){if(p.y<top){p.y=top;p.vy=230;p.stall=1.05;return true}return false}
export function collision(a:Aircraft,b:Aircraft){
 if(a.cool>0||b.cool>0||a.hp<=0||b.hp<=0||Math.abs(wrapDelta(a.x,b.x))>=48||Math.abs(a.y-b.y)>=35)return false;
 if(a.y<b.y-10){b.hp-=2;a.vy=-135;b.vy=175}
 else if(a.y>b.y+10){a.hp-=2;b.vy=-135;a.vy=175}
 else{const aBehind=wrapDelta(a.x,b.x)*b.dir<0,bBehind=wrapDelta(b.x,a.x)*a.dir<0;
 if(aBehind&&!bBehind)b.hp--;else if(bBehind&&!aBehind)a.hp--;else{a.hp--;b.hp--}
 a.vy=95;b.vy=140;
 }
 const side=wrapDelta(a.x,b.x)>=0?1:-1;
 a.x=(a.x+side*12+3000)%3000;b.x=(b.x-side*12+3000)%3000;
 a.vx=side*190;b.vx=-side*190;a.cool=.8;b.cool=.8;
 a.hp=Math.max(0,a.hp);b.hp=Math.max(0,b.hp);return true;
}
export function perfectJetHit(p:Aircraft,j:{x:number;y:number}){
 return Math.abs(wrapDelta(p.x,j.x))<52&&p.y<j.y-8&&p.y>j.y-44&&p.vy>20;
}
