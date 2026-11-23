import { createElement as h } from "react";
import type { Upgrade } from "../lib/workshop";
export function WorkshopPart({part,rank=0}:{part:Upgrade;rank?:number}){
 const path=(d:string,props:object={})=>h("path",{d,...props});
 const rect=(x:number,y:number,width:number,height:number,props:object={})=>h("rect",{x,y,width,height,rx:3,...props});
 const line=(x1:number,y1:number,x2:number,y2:number,props:object={})=>h("line",{x1,y1,x2,y2,...props});
 const circle=(cx:number,cy:number,r:number,props:object={})=>h("circle",{cx,cy,r,...props});
 const art=part==="engine"?[rect(40,25,48,48),...[0,1,2,3].map(i=>line(37,31+i*11,91,31+i*11)),h("g",{className:"part-spin",style:{transformOrigin:"64px 49px"}},path("M64 49 Q38 17 64 12 Q80 19 64 49 Q90 81 64 86 Q48 80 64 49",{fill:"#ecc675"})),circle(64,49,7,{fill:"#d4e9e5"})]:
 part==="wings"?[h("g",{className:"part-flex"},path("M12 27 L112 21 L117 34 L16 41 Z",{fill:"#cbb785"}),path("M15 65 L109 60 L116 73 L20 79 Z",{fill:"#b69561"}),line(30,38,44,65),line(94,36,82,62),line(34,39,87,62),line(91,36,41,65))]:
 part==="hull"?[path("M10 55 Q37 25 103 38 Q124 46 109 61 Q47 78 10 55 Z",{fill:"#819b9d"}),...[0,1,2,3,4].map(i=>path(`M${33+i*14} 37 Q${40+i*14} 50 ${34+i*14} 66`,{className:"part-glow"})),path("M50 39 Q60 17 78 36",{fill:"#b9e0e0"})]:
 part==="armor"?[...[0,1,2].map(i=>h("g",{className:"part-plate",style:{animationDelay:i*-.4+"s"}},path(`M${28+i*8} ${21+i*7} L${83+i*8} ${14+i*7} L${91+i*8} ${60+i*7} L${36+i*8} ${69+i*7} Z`,{fill:["#405b65","#77908b","#c0b48a"][i]}))),...[0,1,2].map(i=>circle(53+i*17,46,2,{fill:"#f3d48d"}))]:
 part==="guns"?[rect(20,30,85,40,{fill:"#647e85"}),...[0,1,2,3,4,5].map(i=>line(34+i*11,35,29+i*11,65)),h("g",{className:"part-air"},path("M8 23 Q32 8 48 23 T88 23",{stroke:"#a6eced"}),path("M11 79 Q34 65 50 79 T100 79",{stroke:"#a6eced"}))]:
 [path("M45 15 L70 15 L68 29 L47 29 Z",{fill:"#c8c7a9"}),h("g",{className:"part-gear"},line(57,27,76,65,{strokeWidth:8}),path("M49 35 L65 35 L54 43 L72 43 L60 51 L77 51",{stroke:"#e8ca80"}),circle(77,75,17,{fill:"#172d38",strokeWidth:6}),circle(77,75,6,{fill:"#bac7bf"}))];
 return h("svg",{viewBox:"0 0 128 104",className:"workshop-part",fill:"none",stroke:"#d4dfd4",strokeWidth:2,"aria-hidden":true},...art,...[0,1,2].map(i=>rect(43+i*16,97,11,3,{fill:i<rank?"#f6cc72":"#3e5964",stroke:"none"})));
}
