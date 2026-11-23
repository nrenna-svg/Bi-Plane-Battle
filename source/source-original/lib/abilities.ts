import type { PlaneId } from "./progression";
export type Ability="winch"|"roll"|"cannon"|"dash";
export const abilityFor=(id:PlaneId):Ability=>["osprey","albatross"].includes(id)?"winch":["stunt","hornet","dragonfly","kestrel"].includes(id)?"roll":["armored","vanguard","tempest","nightjar"].includes(id)?"cannon":"dash";
export const ABILITIES={
 winch:{name:"Rescue winch",detail:"Collect pilots within 170m. 14s cooldown.",cooldown:14},
 roll:{name:"Evasive roll",detail:"1.2s collision protection. Guns pause during the roll. 12s cooldown.",cooldown:12},
 cannon:{name:"Heavy cannon",detail:"One two-hull shell; adds 35 heat. 16s cooldown.",cooldown:16},
 dash:{name:"Emergency throttle",detail:"3s speed boost; adds 20 heat. 14s cooldown.",cooldown:14}
} as const;
