"use client";
import {useEffect,useState} from "react";
import {missionName,stageInfo,starRules} from "../lib/mission-catalog";
import {REGIONS} from "../lib/campaign";
import {totalStars,type Workshop} from "../lib/workshop";
import type {MissionResult} from "../lib/mission-rewards";
import type {FlightFrame} from "../lib/mission-film";
type Props={report:MissionResult;workshop:Workshop;frames:FlightFrame[];motion:boolean;active:boolean;testing:boolean;pending:boolean;won:boolean;transition:number;onReplay:()=>void;onContinue:()=>void;onHangar:()=>void;onChoose:()=>void};
export function MissionDebrief(p:Props){
 const [index,setIndex]=useState(0),[paused,setPaused]=useState(false);
 const r=p.report,reward=r.reward,region=stageInfo(r.stage).region,stars=reward?.stars??[];
 useEffect(()=>{setIndex(0);setPaused(false)},[p.frames,r]);
 useEffect(()=>{if(!p.active||!p.motion||paused||p.frames.length<2)return;const timer=setInterval(()=>{if(!document.hidden)setIndex(i=>(i+1)%p.frames.length)},4500);return()=>clearInterval(timer)},[p.active,p.motion,paused,p.frames]);
 const current=p.frames[index%Math.max(1,p.frames.length)],move=(direction:number)=>{setPaused(true);setIndex(i=>(i+direction+p.frames.length)%p.frames.length)};
 return <section className="mission-report debrief-card" aria-label="Mission debrief">
  <div className="debrief-masthead"><span>✦ FLIGHT COMMAND / AFTER-ACTION REPORT</span><span>{REGIONS[region].name} · STAGE {String(r.stage+1).padStart(2,"0")}</span></div>
  <div className="debrief-columns"><div className="debrief-results">
   <div className="debrief-heading"><strong className="grade-seal" aria-label={stars.length+" of 5 stars earned"}><span>{stars.length}<small>/5</small></span><em>MISSION STARS</em></strong><div><p className="eyebrow">{reward?.perfect?"PERFECT FLIGHT":"MISSION COMPLETE"}</p><h2>Objective secured</h2><p className="debrief-mission-name">{missionName(r.stage)}</p></div></div>
   <div className="debrief-rewards"><div><strong>+1,000</strong><span>MISSION POINTS</span></div><div><strong>+{reward?.credits??0}</strong><span>CREDITS EARNED</span></div><div><strong>+{reward?.newStars.length??0} ★</strong><span>NEW MASTERY STARS</span></div></div>
   <div className="debrief-medals"><span>{r.accuracy===null?"Accuracy: fewer than 5 shots":Math.round(r.accuracy*100)+"% accuracy"}</span>{r.medals.map(m=><span key={m}>✦ {m}</span>)}</div>
   <div className="debrief-goals-heading"><h3>Flight objectives</h3><span>THIS FLIGHT</span></div>
   <ul className="star-checklist debrief-goals">{starRules(r.stage).map(rule=><li key={rule.id} className={stars.includes(rule.id)?"earned":"unearned"}><span aria-hidden="true">{stars.includes(rule.id)?"★":"☆"}</span><span>{rule.label}</span><small>{stars.includes(rule.id)?"EARNED":"REPLAY GOAL"}</small></li>)}</ul>
   <p className="debrief-save-note">{p.testing?"TEST FLIGHT · Rewards and progress are temporary.":"✓ Checkpoint saved · Previously earned stars stay yours."}</p>
  </div><aside className="debrief-film" aria-label="Mission snapshots">
   <div className="film-heading"><span>FLIGHT RECORDER</span><span>{current?String(index+1).padStart(2,"0")+" / "+String(p.frames.length).padStart(2,"0"):"SECTOR VIEW"}</span></div>
   <div className="film-image"><img key={current?.src??"sector"} src={current?.src??"/scenery/"+["harbor","forest","city","desert","mountain"][region]+"-v1.webp"} alt={current?current.caption+" — gameplay snapshot from "+missionName(r.stage):REGIONS[region].name+" scenery; no gameplay snapshots available"}/><span className="film-crosshair" aria-hidden="true">+</span><span className="film-stamp">{current?"MISSION CAPTURE":"SECTOR RECON"}</span><span className="film-timestamp">{current?String(Math.floor(current.seconds/60)).padStart(2,"0")+":"+String(current.seconds%60).padStart(2,"0"):"—:—"}</span></div>
   <div className="film-caption"><strong>{current?.caption??REGIONS[region].name}</strong><span>{current?"A moment from your flight":"Snapshots will appear after flying a mission."}</span></div>
   {p.frames.length>1&&<div className="film-controls"><button aria-label="Previous snapshot" onClick={()=>move(-1)}>←</button><div className="film-dots">{p.frames.map((_,i)=><button key={i} aria-label={"Show snapshot "+(i+1)} aria-pressed={i===index} onClick={()=>{setPaused(true);setIndex(i)}}/>)}</div><button aria-label="Next snapshot" onClick={()=>move(1)}>→</button>{p.motion&&<button onClick={()=>setPaused(v=>!v)}>{paused?"Play gallery":"Pause gallery"}</button>}</div>}
   <div className="debrief-next"><p className="eyebrow">{p.won?"CAMPAIGN COMPLETE":"NEXT SORTIE"}</p><h3>{p.won?"All sectors secured":missionName(r.stage+1)}</h3><p>{p.workshop.credits.toLocaleString()} credits · {totalStars(p.workshop)} mastery stars</p><span>Save for your next aircraft or fine-tune your current plane.</span><button onClick={p.onHangar}>Visit hangar ↗</button></div>
  </aside></div>
  <div className="debrief-footer"><div className="mission-actions"><button className="secondary-launch" onClick={p.onReplay}>Replay Mission ↺</button>{p.pending?<button className="launch continue-button" onClick={p.onContinue}>Continue to mission {r.stage+2} →</button>:p.won?<button className="launch continue-button" onClick={p.onChoose}>Choose another mission →</button>:<span>Next stage in {Math.ceil(p.transition)}…</span>}</div><button className="debrief-map-link" onClick={p.onChoose}>← Mission map</button></div>
 </section>;
}
