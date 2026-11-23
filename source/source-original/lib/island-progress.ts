export const ISLAND_TARGETS={
 bay:{name:"Fire over Kestrel Bay",role:"CINEMATIC SORTIE",objective:"Follow the coast, destroy the convoy and harbor depots, defeat the ace, then return to the Resolute",effect:"An extended coastal operation. First return: 200 credits. Each new mastery star: 10 credits.",reward:200,x:15,y:73},
 radar:{name:"Needle Point",role:"RADAR STATION",objective:"Destroy the coastal radar",effect:"Removes guided-missile support from the fortress.",reward:120,x:24,y:29},
 convoy:{name:"Smuggler's Road",role:"SUPPLY CONVOY",objective:"Destroy all 3 supply trucks",effect:"Cuts fortress engine armor from 4 to 2 hull each.",reward:140,x:48,y:66},
 airfield:{name:"Raven Airfield",role:"FIGHTER BASE",objective:"Defeat 6 defending aircraft",effect:"Cuts fortress fighter patrols from pairs to singles.",reward:140,x:67,y:32},
 research:{name:"Station Wraith",role:"HIDDEN RESEARCH",objective:"Rescue 3 scientists from enemy aircraft",effect:"Scientists supply protective armor for fortress sorties.",reward:180,x:35,y:48},
 fortress:{name:"Crown Fortress",role:"FINAL ASSAULT",objective:"Destroy the engines, then the exposed core",effect:"Liberate the island. Earlier victories change this battle.",reward:300,x:82,y:19}
} as const;
export type IslandTarget=keyof typeof ISLAND_TARGETS;
export type IslandProgress={secured:IslandTarget[];discovered:boolean;bayStars?:number[];bayRescue?:boolean};
export const newIsland=():IslandProgress=>({secured:[],discovered:false});
export function readIsland(value:unknown):IslandProgress{
 const p=newIsland();if(!value||typeof value!=="object")return p;const v=value as Record<string,unknown>;
 p.secured=(Object.keys(ISLAND_TARGETS) as IslandTarget[]).filter(id=>Array.isArray(v.secured)&&v.secured.includes(id));p.bayStars=[0,1,2,3,4].filter(i=>Array.isArray(v.bayStars)&&v.bayStars.includes(i));p.bayRescue=v.bayRescue===true;p.discovered=v.discovered===true||p.secured.includes("research");return p;
}
export const fortressDefenses=(p:IslandProgress)=>({engineHull:p.secured.includes("convoy")?2:4,patrolSize:p.secured.includes("airfield")?1:2,missiles:!p.secured.includes("radar"),armor:p.secured.includes("research")?15:0});
