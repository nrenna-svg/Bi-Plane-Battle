export const SCENERY_KEYS=["harbor","forest","city","desert","mountain"] as const;
export type SceneryKey=typeof SCENERY_KEYS[number];
const images=new Map<string,HTMLImageElement>();
export function sceneryImage(key:string){
 if(typeof Image==="undefined")return null;
 let img=images.get(key);
 if(!img){img=new Image();img.decoding="async";img.src="/scenery/"+key+"-v1."+(key==="kestrel-bay"?"png":"webp");images.set(key,img)}
 return img.complete&&img.naturalWidth>0?img:null;
}
export function preloadScenery(){for(const key of [...SCENERY_KEYS,"warehouse","cloud"])sceneryImage(key)}
let lastCamera:number|undefined,travel=0;
export function backgroundTravel(camera:number){
 if(lastCamera===undefined)travel=camera;
 else travel+=((camera-lastCamera+4500)%3000)-1500;
 lastCamera=camera;return travel;
}
export function drawSceneryArt(c:CanvasRenderingContext2D,key:SceneryKey,camera:number){
 const img=sceneryImage(key);if(!img)return false;
 const width=1300,offset=((backgroundTravel(camera)*.18)%(width*2)+width*2)%(width*2);
 c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality="high";
 // Alternating mirrored panels join exactly, avoiding a hard edge on a looping world.
 for(let i=-1;i<4;i++){const x=i*width-offset;if(x>1200||x+width<0)continue;c.save();c.translate(x+(i%2!==0?width:0),0);if(i%2!==0)c.scale(-1,1);c.drawImage(img,0,0,width,650);c.restore()}
 const shade=c.createLinearGradient(0,540,0,650);shade.addColorStop(0,"#07121a00");shade.addColorStop(1,"#07121a8c");c.fillStyle=shade;c.fillRect(0,540,1200,110);
 c.restore();return true;
}
export function drawRealCloud(c:CanvasRenderingContext2D,x:number,y:number,hidden:boolean){
 const img=sceneryImage("cloud");if(!img)return false;c.save();c.globalAlpha=hidden?.55:.36;c.drawImage(img,x-135,y-51,270,102);c.restore();return true;
}
export function drawRealBuilding(c:CanvasRenderingContext2D,x:number,top:number,width:number,height:number){
 const img=sceneryImage("warehouse");if(!img)return false;
 c.drawImage(img,60,75,1420,840,x-width/2,top,width,height);
 // Roof markers retain the exact visible collision boundary.
 c.strokeStyle="#e6c49c";c.lineWidth=2;c.beginPath();c.moveTo(x-width/2,top);c.lineTo(x+width/2,top);c.stroke();return true;
}
