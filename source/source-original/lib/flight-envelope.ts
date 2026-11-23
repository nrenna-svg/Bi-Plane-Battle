import type { Battle } from './battle';
// Rank benefits flatten after the first aircraft tiers, avoiding runaway late-game stats.
export const flightRank=(rank:number)=>Math.min(6,rank)+Math.max(0,rank-6)*.25;
export function updateFlightEnvelope(g:Battle,dt:number,climb:boolean){
 if(g.daily){g.flightStrain=0;return 0;}
 const u=g.equipment,capacity=1+flightRank(u.engine)*.16+flightRank(u.wings)*.1;
 const prior=g.flightStrain;
 if(g.landed||!climb)g.flightStrain=Math.max(0,g.flightStrain-dt*(g.landed?1:.5+flightRank(u.engine)*.035));
 else g.flightStrain=Math.min(1,g.flightStrain+dt*.27/capacity*(g.boost>0?.5:1));
 if(prior<.78&&g.flightStrain>=.78){g.announce('LIFT FADING / RELEASE CLIMB TO RECOVER');g.sounds.push('stall');}
 // Only prolonged climbs lose lift. The first half of the gauge preserves full authority.
 return Math.max(0,(g.flightStrain-.5)*2);
}
