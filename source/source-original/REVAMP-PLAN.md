# BI-PLANE BATTLE: build a pilot, teach a weakness

Status: v8.56 rebuild foundation implemented; publication pending validation. Ten rookie missions lead into the retained vehicle/campaign expansion: 15 first-sector missions and 35 total. Every mission has five saved star goals; shared upgrades, credit purchases and browser-only reset/restore are implemented. Later sectors retain five stages until their authored expansions are ready.

## Remaining releases
- Expand later sectors to 12–15 mixed-objective missions with unique mastery goals.
- Front/rear-only armored aircraft, introduced alone before mixed encounters.
- Ground crew landing, boarding and extraction.
- Decorative then interactive bird flocks; warning, scatter and collision immunity window.
- Secret collectibles remain undecided; do not make mastery depend on them yet.
- Balance through the user's fresh-career playthrough; preserve earned upgrades across aircraft.

## Shipped economy and mastery rules
First clear: 10 credits. Each newly earned star: 2 credits. Replay clears: 1 credit each, so all aircraft remain eventually attainable; kills never mint credits. Stars persist individually; five in one run grants Perfect Flight. Six equipment tracks have three ranks costing 12/35/80. New aircraft need a permanent star license plus credits. Daily equipment stays stock. Reset affects only this browser and retains an accessible previous-save backup.

## Core loop
Fly a short mission → earn credits and mastery stars → return to the hangar → upgrade shared equipment or save for a new airframe → learn the next combat rule.

## Economy proposal
Use credits as the only spendable currency. Stars are permanent mission-mastery achievements and license gates, never spent. First clears grant most credits; retries earn a smaller capped award so grinding is possible but not optimal. Failed attempts keep a modest earned amount, with no farming from repeated retries without progress. Avoid monetization, consumable purchases, and repair bills.

New aircraft require a skill license plus credits. Early upgrade pricing should let the first successful mission buy one small upgrade. Saving for an airframe should cost several missions, not hours. Exact costs require playtesting.

## Shared workshop
Start with one forgiving but modest starter biplane. Permanent upgrade levels belong to the player's workshop, not to one aircraft; they apply automatically to every owned aircraft, without repurchasing. Airframes retain distinctive base stats and abilities.

Tracks: engine speed; wing lift/handling; hull durability; limited armor protection; gun cooling/fire control; landing gear tolerance and service speed. Start with three ranks per track. Set stat caps, preserve airframe differences, and keep collision directions unchanged. Aircraft upgrades must never bypass a vehicle's required weak spot. Show base, upgrade and final values before purchase. Purchases occur only between missions and persist atomically.

Separate permanent workshop upgrades from the existing temporary campaign refits. Replace the refit screen with a hangar visit rather than stacking two confusing systems. Migrate existing aircraft unlocks, paint, records and scores; do not relock earned aircraft or charge for them again.

## Campaign learning ladder
Begin with regular biplanes: defeat 1, 2, 3, 5, then 10. Total takedowns are not simultaneous enemy count. Limit early active enemies to 1–2 and increase cautiously.

Introduce helicopters alone: teach dangerous top rotors and the exposed underside, then mix them with regular planes. Repeat a 1, 2, 5, 10 progression while varying formations. Introduce cargo and interceptor types the same way. Add short rescue, defense, score-attack and boss missions between lessons to avoid repetitive kill-count grinding.

Helicopter: rise into the belly or shoot upward into it. Cargo: armored nose, vulnerable tail, supplies on defeat. Interceptor: fast pass, slow turn, rear-engine weakness. Clearly mark protected and vulnerable surfaces with shape, animation, sound and short contextual prompts.

## Ground rescue
Marked landing zones contain stranded ground crew. Brake, land safely and stay stopped briefly to board survivors, then take off and reach an extraction marker. Show boarding progress and passenger count. Early missions use a safe strip; later missions introduce limited cover and approaching enemies. Boarding pauses when moving; nobody is rescued twice; a destroyed plane cannot deliver passengers. Improved landing gear helps approach speed without replacing careful flying.

## Release sequence
1. Small opening missions and persistent shared workshop with credit transactions and legacy-save migration.
2. Helicopter teaching ladder and mixed encounters.
3. Cargo/interceptor teaching ladders, varied objectives and bosses.
4. Ground-rescue landing/extraction missions.
5. Tune credit rewards, aircraft prices, enemy caps and vertical airspace through playtests.

## Validation gates
Never duplicate credits or charges. Verify save/load, old-profile migration, stat caps, transfer across aircraft, locked purchase rejection, insufficient balance, first-clear versus replay rewards, pause/restart, all weak-side collisions, bullet directions, off-screen warnings, objective completion, and ground-rescue boarding/extraction. Verify desktop and mobile HUD and keyboard focus. Publish only after the progression revision and these checks are complete.


## v8.64 hangar revision
The shared additive upgrade model is replaced by tier floors and caps. Three component ranks bridge each aircraft to the next stock tier. Scout max equipment costs 1,620; Skylark list is 1,782; investment credit makes the upgrade-first and save-first routes cost the same overall. Owned aircraft and purchased ranks persist; currency and reward units migrate tenfold. Higher-tier aircraft open further ranks; older aircraft retain their tier ceiling. Replay is available directly from debrief. Unique Comet/Falcon/Meteor/Phoenix silhouettes and animated workshop illustrations are implemented. Economy pacing still needs player feedback across the later campaign.
