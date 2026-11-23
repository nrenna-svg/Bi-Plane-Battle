import { newIsland, readIsland, type IslandProgress } from "./island-progress";
import { STAGE_COUNT } from "./mission-catalog";
export const PLANES={
 scout:{name:"Scout",role:"Balanced starter",hp:3,speed:290,accel:440,lift:560,climb:245,color:"#f6cc72",requirement:"Always available"},
 stunt:{name:"Skylark",role:"Quick turns · fragile hull",hp:2,speed:300,accel:660,lift:680,climb:280,color:"#b3a8ff",requirement:"25 lifetime takedowns"},
 racer:{name:"Comet",role:"Fast straights · wider turns",hp:3,speed:370,accel:470,lift:500,climb:230,color:"#87e5f5",requirement:"Earn a 10,000-point personal best"},
 armored:{name:"Bulwark",role:"Heavy armor · slower climb",hp:5,speed:235,accel:330,lift:480,climb:215,color:"#b8ccaa",requirement:"Defeat 5 bosses"},
 kestrel:{name:"Kestrel",role:"Short-wing interceptor",hp:2,speed:345,accel:590,lift:610,climb:265,color:"#ddad73",requirement:"60 lifetime takedowns"},
 albatross:{name:"Albatross",role:"Long-wing endurance cruiser",hp:4,speed:270,accel:390,lift:590,climb:240,color:"#ded6bf",requirement:"40 lifetime rescues"},
 hornet:{name:"Hornet",role:"Compact high-climb fighter",hp:2,speed:335,accel:620,lift:730,climb:305,color:"#eab84b",requirement:"Complete 8 flight challenges"},
 corsair:{name:"Corsair",role:"Gull-wing coastal fighter",hp:4,speed:325,accel:410,lift:570,climb:250,color:"#759cb6",requirement:"Earn a 20,000-point best"},
 falcon:{name:"Falcon",role:"Sleek pursuit racer",hp:3,speed:405,accel:480,lift:560,climb:270,color:"#bec9d3",requirement:"150 lifetime takedowns"},
 osprey:{name:"Osprey",role:"Float-equipped rescue craft",hp:4,speed:260,accel:430,lift:620,climb:255,color:"#e2a269",requirement:"100 lifetime rescues"},
 vanguard:{name:"Vanguard",role:"Twin-engine armored escort",hp:6,speed:245,accel:310,lift:510,climb:225,color:"#84988e",requirement:"Defeat 12 bosses"},
 meteor:{name:"Meteor",role:"Clipped-wing speed specialist",hp:2,speed:440,accel:410,lift:490,climb:235,color:"#ce7864",requirement:"Earn a 40,000-point best"},
 dragonfly:{name:"Dragonfly",role:"Triple-wing agile climber",hp:2,speed:285,accel:760,lift:780,climb:315,color:"#b7a2d3",requirement:"Complete 14 flight challenges"},
 nightjar:{name:"Nightjar",role:"Long-nose night fighter",hp:4,speed:350,accel:445,lift:600,climb:260,color:"#8992b5",requirement:"Reach wave 18"},
 tempest:{name:"Tempest",role:"Heavy radial-engine all-rounder",hp:5,speed:330,accel:390,lift:640,climb:275,color:"#8eb8b0",requirement:"Defeat 25 bosses"},
 phoenix:{name:"Phoenix",role:"Elite swept-wing prototype",hp:3,speed:420,accel:620,lift:710,climb:305,color:"#e5a66c",requirement:"Complete 22 flight challenges"},
} as const;
export type PlaneId=keyof typeof PLANES;
export const PAINTS={
 lostSquadron:{name:"Lost Squadron",color:"#62e9dd"},standard:{name:"Factory",color:null},crimson:{name:"Crimson",color:"#ff8d78"},arctic:{name:"Arctic",color:"#c2f5ff"},forest:{name:"Forest",color:"#91dba5"},royal:{name:"Royal",color:"#d3a4ff"},p0:{name:"Copper",color:"#d99e80"},p1:{name:"Lagoon",color:"#8fc4c2"},p2:{name:"Sandstone",color:"#c6b48c"},p3:{name:"Orchid",color:"#c395b9"},p4:{name:"Citron",color:"#c1cb8c"},p5:{name:"Cobalt",color:"#94aad5"},p6:{name:"Brass",color:"#dbb161"},p7:{name:"Jade",color:"#7fa994"},p8:{name:"Platinum",color:"#cfd5df"},p9:{name:"Ember",color:"#d98267"},p10:{name:"Glacier",color:"#98bfce"},p11:{name:"Amethyst",color:"#b8a0cf"},p12:{name:"Bronze",color:"#cea877"},p13:{name:"Slate",color:"#859cad"},p14:{name:"Ivory",color:"#e1bd91"},p15:{name:"Sage",color:"#a1b889"},p16:{name:"Rosewood",color:"#c39693"},p17:{name:"Petrol",color:"#8cbab7"},p18:{name:"Iris",color:"#c7a8dc"},p19:{name:"Sunburst",color:"#ecc773"}} as const;
export type PaintId=keyof typeof PAINTS;
export type Challenge={id:string;name:string;detail:string;paint:PaintId;metric?:string;target?:number};
export const CHALLENGES:readonly Challenge[]=[
 {id:"first-flight",name:"First victories",detail:"Make 20 lifetime takedowns.",paint:"crimson"},
 {id:"rescue-flight",name:"Rescue patrol",detail:"Rescue 12 pilots in one flight.",paint:"arctic"},
 {id:"clutch-landing",name:"On a wing",detail:"Land safely with exactly 1 health three times in one flight.",paint:"forest"},
 {id:"flawless-boss",name:"Untouchable",detail:"Defeat 2 bosses before losing a life in that flight.",paint:"royal"},
 {id:"expanded-0",name:"Veteran Wings",detail:"Make 100 lifetime takedowns.",paint:"p0",metric:"kills",target:100},
 {id:"expanded-1",name:"Sky Legend",detail:"Make 300 lifetime takedowns.",paint:"p1",metric:"kills",target:300},
 {id:"expanded-2",name:"Mercy Flight",detail:"Rescue 50 pilots across your career.",paint:"p2",metric:"rescues",target:50},
 {id:"expanded-3",name:"Guardian Angel",detail:"Rescue 150 pilots across your career.",paint:"p3",metric:"rescues",target:150},
 {id:"expanded-4",name:"High Roller",detail:"Earn a 15,000-point personal best.",paint:"p4",metric:"bestScore",target:15000},
 {id:"expanded-5",name:"Sky Millionaire",detail:"Earn a 50,000-point personal best.",paint:"p5",metric:"bestScore",target:50000},
 {id:"expanded-6",name:"Into the Storm",detail:"Reach wave 12.",paint:"p6",metric:"bestWave",target:12},
 {id:"expanded-7",name:"Beyond the Horizon",detail:"Reach wave 20.",paint:"p7",metric:"bestWave",target:20},
 {id:"expanded-8",name:"Giant Slayer",detail:"Defeat 8 bosses across your career.",paint:"p8",metric:"bosses",target:8},
 {id:"expanded-9",name:"Fortress Breaker",detail:"Defeat 20 bosses across your career.",paint:"p9",metric:"bosses",target:20},
 {id:"expanded-10",name:"Jet Hunter",detail:"Intercept 3 jets in one flight.",paint:"p10",metric:"jets",target:3},
 {id:"expanded-11",name:"Jet Legend",detail:"Intercept 6 jets in one flight.",paint:"p11",metric:"jets",target:6},
 {id:"expanded-12",name:"Chain Reaction",detail:"Build a chain of 12 in one flight.",paint:"p12",metric:"bestChain",target:12},
 {id:"expanded-13",name:"Unbroken",detail:"Build a chain of 24 in one flight.",paint:"p13",metric:"bestChain",target:24},
 {id:"expanded-14",name:"Long Haul",detail:"Fly for 5 minutes in one flight.",paint:"p14",metric:"duration",target:300},
 {id:"expanded-15",name:"Marathon Pilot",detail:"Fly for 10 minutes in one flight.",paint:"p15",metric:"duration",target:600},
 {id:"expanded-16",name:"Groundbreaker",detail:"Destroy 6 AA trucks in one flight.",paint:"p16",metric:"trucks",target:6},
 {id:"expanded-17",name:"Roadblock",detail:"Destroy 12 AA trucks in one flight.",paint:"p17",metric:"trucks",target:12},
 {id:"expanded-18",name:"Mission Ready",detail:"Complete 3 mission waves in one flight.",paint:"p18",metric:"missions",target:3},
 {id:"expanded-19",name:"Mission Master",detail:"Complete 6 mission waves in one flight.",paint:"p19",metric:"missions",target:6},
];
export type Profile={island:IslandProgress;unlockRevision?:number;legacyPlanes?:PlaneId[];kills:number;rescues:number;bosses:number;bestScore:number;bestWave:number;completed:string[];blueprints:number[];plane:PlaneId;paint:PaintId};
export const newProfile=():Profile=>({island:newIsland(),unlockRevision:2,legacyPlanes:[],kills:0,rescues:0,bosses:0,bestScore:0,bestWave:1,completed:[],blueprints:[],plane:"scout",paint:"standard"});
export const EXTRA_GATES:Partial<Record<PlaneId,readonly [keyof Profile,number]>>={kestrel:["kills",60], albatross:["rescues",40], hornet:["completed",8], corsair:["bestScore",20000], falcon:["kills",150], osprey:["rescues",100], vanguard:["bosses",12], meteor:["bestScore",40000], dragonfly:["completed",14], nightjar:["bestWave",18], tempest:["bosses",25], phoenix:["completed",22]};
export function planeProgress(id:PlaneId,p:Profile){const gate=EXTRA_GATES[id];if(gate){const value=gate[0]==="completed"?p.completed.length:Number(p[gate[0]]);return [value,gate[1]]}return id==="stunt"?[p.kills,25]:id==="racer"?[p.bestScore,10000]:id==="armored"?[p.bosses,5]:[1,1]}
export const planeUnlocked=(id:PlaneId,p:Profile)=>id==="scout"||p.legacyPlanes?.includes(id)===true||id==="stunt"&&p.kills>=25||id==="racer"&&p.bestScore>=10000||id==="armored"&&p.bosses>=5||!!EXTRA_GATES[id]&&planeProgress(id,p)[0]>=planeProgress(id,p)[1];
export const paintUnlocked=(id:PaintId,p:Profile)=>id==="standard"||(id==="lostSquadron"&&p.blueprints.length>=5)||CHALLENGES.some(c=>c.paint===id&&p.completed.includes(c.id));
export function readProfile(raw:string|null):Profile{
 const p=newProfile();try{const v=JSON.parse(raw??"null");if(!v||typeof v!=="object"||Array.isArray(v))return p;
 for(const key of ["kills","rescues","bosses","bestScore","bestWave"] as const)if(typeof v[key]==="number"&&Number.isFinite(v[key])&&v[key]>=0)p[key]=Math.min(1e9,Math.floor(v[key]));
 if(v.unlockRevision!==2)p.legacyPlanes=([...(p.kills>=8?["stunt"]:[]),...(p.bestScore>=1500?["racer"]:[]),...(p.bosses>=1?["armored"]:[])] as PlaneId[]);
 else if(Array.isArray(v.legacyPlanes))p.legacyPlanes=(["stunt","racer","armored"] as PlaneId[]).filter(id=>v.legacyPlanes.includes(id));
 p.island=readIsland(v.island);
 if(Array.isArray(v.completed))p.completed=CHALLENGES.filter(c=>v.completed.includes(c.id)).map(c=>c.id);
 if(typeof v.plane==="string"&&Object.hasOwn(PLANES,v.plane)&&planeUnlocked(v.plane as PlaneId,p))p.plane=v.plane;
 if(Array.isArray(v.blueprints))p.blueprints=Array.from({length:STAGE_COUNT},(_,n)=>n).filter(n=>v.blueprints.includes(n));
 if(typeof v.paint==="string"&&Object.hasOwn(PAINTS,v.paint)&&paintUnlocked(v.paint as PaintId,p))p.paint=v.paint;
 }catch{}return p;
}

export function challengeValue(c:Challenge,p:Profile,stats:Record<string,number|boolean>){if(!c.metric)return 0;return Number((["kills","rescues","bestScore","bestWave","bosses"].includes(c.metric)?p[c.metric as keyof Profile]:stats[c.metric])??0)}
