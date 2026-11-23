## v8.76 — Debrief viewport fix
- Fit the debrief to the browser height with compact header/HUD, height-aware snapshots and always-visible Replay/Continue actions. Small windows scroll report details internally.
- Scope the fitted layout to the flight tab so hangar and mission screens retain normal scrolling.

## v8.76 — After-action report and flight recorder
- Redesigned debrief with mission-star insignia, reward tiles, clear earned/replay goals and next-sortie panel.
- Rotating gallery of up to six actual mission snapshots, with manual navigation, pause and reduced-motion support. Images stay in memory and are cleared on the next mission.

## v8.72 — Mission briefing redesign
- Aviation briefing cards with winged insignia, mission titles, objective hierarchy, threat/tactics panels and a live takeoff countdown ring.
- Shared presentation for campaign and arcade missions; long briefing text wraps within its panel.

## v8.70 — Flight test lab
- Local password gate for Dev Tools, after What's new.
- Confirmed fresh-career reset with automatic backup and explicit backup/restore.
- Any-mission test flights suppress all career, workshop, score and daily-record persistence; exit reloads the earned career.
- Settings and existing progress are preserved until the player explicitly confirms a reset or restore.

## v8.64 — Hangar ladder
- Replay Mission beside Continue, preserving mastery, credits, equipment and furthest progress.
- Tiered equipment: max Scout equals stock Skylark; later aircraft open three more ranks. Scout full build 1,620 credits, Skylark 1,782, with all equipment spending credited toward aircraft purchase prices.
- Credits and rewards converted to larger units; saved balances, ranks, aircraft and mastery migrate automatically. Aircraft hull displays in ten-point units for finer tuning, without multiplying flight speed.
- Six illustrated animated workshop parts, inspection, current/next values and fitting feedback; reduced-motion support.
- Four distinct silhouettes: inline Comet, twin-boom pusher Falcon, radial Meteor and delta/canard twin-engine Phoenix, used in flight and hangar. Regenerated all 16 previews with correct transforms.

## v8.56 — Rebuild foundation
- Ten new rookie missions mix 1/2/3/5/10 takedowns, pilot captures, score targets, survival and a damage-reset capture streak; 15 missions in the first sector, 35 total.
- Five mission-specific permanent stars, Perfect Flight awards and best score/time records.
- Slow credit rewards: 10 for a first clear, 2 for each new star, 1 per replay clear; no kill farming.
- Shared three-rank engine, wings, hull, armor, cooling and landing-gear workshop; aircraft purchases require stars and credits, preserving legacy aircraft.
- Fresh-career reset and restore backup on this browser only; other players retain their saves.
- Fix: collision damage now counts toward mission damage and clean-rescue streaks.
- Includes the previously unpublished v8.46 vehicle/airspace expansion below. Ground boarding, birds, armored front/rear enemies and expanded later sectors remain planned.

## v8.46
- Helicopter underside combat and introductory hunt.
- Fast interceptors with turn windows and rear weak spots.
- Armored cargo aircraft with repair drops.
- 25 campaign stages with stable-ID migration of old checkpoints and grades.
- Sector score attacks with 3,000-point targets, 90-second limits and capped reinforcements.
- 220m more airspace, vertical tracking, altitude display and off-screen threat markers.

## v8.34
- Detailed blimp hull, damage-reactive engine pods, window-fitting cockpit, directional damage cues, boss bomb-path warnings, and optional fullscreen.

## v8.22
- Six presentation features: focused menu navigation, contextual flight help, prioritized HUD, structured mission briefings, hangar filters/comparisons/progress, and deliberate upgrade selection with Continue.

## v8.10
- Redesigned friendly transports and enemy carriers with swept fins, plated hulls, glazed bridges, turbines, and recessed hangars.
- Detailed naval-style aerial mines with fuse lights, rivets, and arming rings.
- Object-specific explosions and airframe-sized painted wreckage, with more fragments and separate visual/hazard budgets.

## v8.04
- Stage 13 carrier repair balloons: first delivery after 8 seconds, then every 12 seconds; player collection restores 2 hull (maximum 8). Full-health carriers leave the balloon available until it expires.

## v8.02
Six completed features (+0.12):
- Boss tactics: airship mines, carrier interceptor pairs and uncoupling train cars.
- Destructible fuel, radar and ammunition targets with chain reactions and tactical consequences.
- Campaign refits: one active upgrade with a trade-off, chosen between stages.
- Damage presentation: bent wings, uneven propellers, oil leaks, critical engine flames and burning wreckage.
- Reactive original musical layers: patrol ambience, combat/boss percussion and a victory phrase timed to the final boss blast.
- Campaign grades and medals with per-stage best records saved on this device.

## v7.90
- Boss destruction cinematic: camera push-in, sequential fireballs, rupturing airship/carrier hulls, train chain reactions and flying wreckage before progression resumes (+0.02).
- Fixed shake/flash carrying into mission briefings. Camera and transient effects reset at each wave/stage; reduced-motion mode skips zoom/shake/flash.

## v7.88
- New varied wreckage: torn wings, engine blocks, fuselage sections, shards and tail fins, with varied scale, tumble and matching collision areas (+0.02).
- Escape balance: faster accelerating debris, paired bursts that lead current flight, 0.7-second entry warnings, and denser later regions. Released debris never homes. Balance changes do not increment the version.

## v7.86
- Limited bombs: B/touch drops a momentum-driven bomb; two per run, maximum three, accurate blasts deal two ground hull damage.
- Drifting resupply balloons grant one bomb; ammunition persists across waves and lost lives.
- Detailed ground vehicles with armored train panels, moving wheels, truck panelwork and visible damage.
- Explosions eject rotating metal, smoke and sparks; bomb impacts leave temporary blast craters.
- Fixed floating ground with region-colored terrain blending, connected runway and aligned train wheels/rails (no feature increment).

# BI-PLANE BATTLE

Each completed feature adds 0.02 to the visible game version.

- **7.78 — Flight and encounter overhaul:** 14 completed features (+0.28):
  1. Smooth aircraft banking, animated ailerons/elevator, RPM-linked propellers, rivets and visible damage.
  2. Universal Shift dodge, brief protection and five-second cooldown.
  3. R dive energy: altitude becomes speed and helps the subsequent pull-up.
  4. Skill scoring for close calls, precise runway landings and high-energy takedowns.
  5. Squadron tactics: bomber protection, predictive flanking and one brief retreat for badly damaged fighters.
  6. Five named regional rival aces with distinct airframes, colors, tactics and bonus rewards.
  7. Carrier hangars visibly open before launches; engine damage changes attack phases and exposes a wider final volley.
  8. Armored train locks its aim visibly before firing, loses guns with carriages and changes tactics when half destroyed.
  9. Mission story beats, survivor flares, transport smoke and visible bridge damage.
  10. Marked mountain-pass collision hazards during the final escort.
  11. More detailed ground vehicles with aimed turrets, modeled wheels and headlights.
  12. Expanding blast rings, rounded smoke and sparks, and multi-piece boss wreckage.
  13. Layered noise-based gunfire, explosions, distant artillery, thunder and dive wind.
  14. Combat-responsive music mix with quieter briefings and stronger boss-phase intensity.
  - Existing Classic, daily and campaign progression are retained. Dodge and dive also have touch controls.
  - Browser automation could not start in this environment; live browser playtesting remains unverified.

- **7.50 — Realistic scenery:** five photographic-style scrolling landscape backgrounds across Classic and Campaign, textured rooftop facades and soft cloud sprites. Existing weather, collision boundaries and gameplay preserved. One scenery overhaul feature (+0.02).

- **7.48 — Operation: Horizon expansion:** 24 completed user-facing features, +0.48 from 7.00:
  - Campaign mode with a 15-stage mission map (+0.02); persistent stage checkpoints and replay (+0.02).
  - Five distinct animated regions: Iron Harbor, Verdant Falls, Cinder City, Dune Frontier, Frost Citadel (+0.10).
  - Transport escort, bomber interception, timed convoy assault (+0.06).
  - Fighter-launching sky carrier; destructible armored-train boss (+0.04). Existing fortress mechanics adapted for the multi-phase airship.
  - Falling-debris escape stages (+0.02).
  - Rescue winch, evasive roll, heavy cannon, emergency throttle, assigned by aircraft (+0.08).
  - Banking, prop-disc and damaged-airframe presentation (+0.02); falling wreckage (+0.02); perfect-jet slow motion with reduced-motion support (+0.02).
  - Aircraft-specific engine timbres (+0.02); stereo impact positioning (+0.02).
  - Original rendered flight, mission and boss score with live-synth fallback (+0.02); optional browser-voiced radio calls with persistent captions (+0.02).
  - Classic Arcade, daily runs, career unlocks and the existing audience are preserved. Music uses original synthesis, not live orchestral recordings. Browser radio voice varies by device.

- **7.00 bug fix:** active bonus jets and their schedules persist across wave changes; mission briefings pause them with the rest of the flight.
- **7.00 — Flight report:** closest aircraft, near-complete challenges and newly earned rewards.
- **6.98 — Mission presentation:** safe three-second briefing and victory fanfare.
- **6.96 — Adaptive score:** original flight, mission and boss arrangements with independent saved music volume.
- **7.00 balancing:** longer gun bursts before overheating; slower rescue-mission parachutes.
- **6.94 — Runway service limit:** cumulative 8-second stop, forced takeoff, 10-second closure and flight-circuit reset. Version now visible in the header and canvas.
- **6.92 — World polish:** detailed pickups, swept-wing bonus jet, zeppelin fins/windows, rooftops, AA turrets, flowing crosswind, dust funnel and layered tree branches.
- **6.90 — Major hangar and graphics update:** 12 new aircraft (+0.24), 20 new paint-reward challenges (+0.40), detailed individual airframes (+0.02), and polished scenery (+0.02). Total: 16 aircraft, 24 challenges, 25 paint schemes.
- **6.22 balance adjustment:** higher aircraft and paint requirements; previous unlocks preserved.
- **6.22 — Hold the Line:** survive 60 active seconds on waves ending in 8.
- **6.20 — Ground Assault:** destroy 3 replenishing AA trucks on waves ending in 6.
- **6.18 — Rescue Patrol:** rescue 5 pilots on waves ending in 3, with capped reinforcements and mission progress retained across lives.
- **6.16 — Ground forces:** AA trucks from wave 4, telegraphed slow fire, destructible hull and bonus points.
- **6.14 — Machine guns:** F/touch fire, directional tracers, three-hit hull damage, overheating, and armed pursuers from wave 6.
- **6.12 — Audio upgrade:** responsive engines, damaged-engine sputter, distinct impacts and pickups, jet flybys, layered explosions, ambient tones and saved effects/engine volume controls.
- **6.10 — Progressive enemy hull:** 1 hull in waves 1–3, +1 every three waves, capped at 6.
- **6.08 — Individual enemy pickups:** enemies can collect repair, armor and speed balloons; each balloon benefits one plane only. Fixed enemy rendering to show its own appearance and effects.
- **6.06 — Flight medals:** bronze, silver and gold awards for score, rescues and survival in the flight report.
- **6.04 — Flying fortress:** every tenth wave brings a moving boss with four armored engines, an exposed core phase and spreading bomb volleys.
- **6.02 — Daily challenge:** UTC date and game version seed repeatable events; every pilot uses the Scout; daily best is saved on this device for this version.
- **6.00 — Baseline:** aircraft hangar, unlock milestones, paint rewards and flight challenges.
