# Fixed launch requirements

`src/data/mw4/launchRequirements.js` records the original roster's requirements explicitly. Registering new weapons, changing filters, or waiting for releases never changes these targets.

| Category | Required weapons |
| --- | ---: |
| Assault Rifles | 8 |
| Submachine Guns | 5 |
| Shotguns | 2 |
| Light Machine Guns | 3 |
| Marksman Rifles | 3 |
| Sniper Rifles | 3 |
| Pistols | 4 |
| Launchers | 4 |
| Melee | 1 |
| **Global** | **33** |

These category counts match the project's original 33 season-zero definitions and the existing verified Gold prerequisites. Challenge amounts and weapon definitions are unchanged.

Any eligible released weapon contributes, including seasonal replacements. Numerators remain actual totals: completing all nine ARs shows 9/8, and 34 Gold unlocks show 34/33. Unreleased flags remain saved but receive no completion credit until release. Category headers count across eligible weapons in that category, independently of search and other visibility filters. The “All weapons” grouping uses 33. Prestige headers use the same fixed weapon targets while retaining their independent completion flags. Gallery occurrence counts and the share card's available-weapon count describe the catalog, rather than unlock requirements, and remain actual counts.

## Overall completion

The baseline shared format is eight Military, three Special and four Completionist camos: 15 per weapon, or **495 required camos**. The required total is fixed; a seasonal weapon does not introduce another required 15-camo obligation.

As in [Singularity's original ProgressComponent](https://github.com/ItchyBeard/singularity/blob/master/src/components/ProgressComponent.vue), the percentage credits only the best-progressed 33 released weapons. All actual recorded shared flags across released weapons still appear in the bottom counter, so 510/495 is valid. A tooltip and accessible description explain that the percentage uses the best 33.

For example, 32 fully completed weapons plus 18 weapons with one camo each gives 498 actual recorded camos. Only 481 are credited toward the fixed progression, so the grind remains incomplete. Scattered partial progress cannot substitute for completing a weapon. Thirty-three complete weapons reach 100%; more complete or partial weapons cannot lower it. Percentage fills cap at 100%, and rounding stays at 99% until the exact completion requirement is met.

The store's shared calculation drives both overall progression and celebration eligibility. Only a genuine shared-camo action crossing 33 complete weapons raises the existing once-only achievement. Prestige and Mastery never contribute to the shared calculation. The original timestamp and handled marker remain intact across catalog expansion, import/reload and re-completion.

## Other requirements and compatibility

Gold remains per-weapon. Platinum's category Gold requirement, Harmonic Break's 33 Platinum requirement, Divergence's 33 Harmonic Break requirement, and the first mode Mastery's 33 Divergence requirement all reference the central configuration. Prerequisites describe in-game requirements; they do not automatically tick camos or prevent manual completion when challenge details are unavailable.

Tracker counters and the captured Share Progress PNG use the same store totals and capped fill helper. No save fields, IDs, progress flags, analytics choices, dependencies, backend or deployment configuration changed for this update. Existing saves need no migration.

Focused tests cover the original distribution, seasonal substitution, 9/8 and 34/33 over-completion, 34/40/50-weapon catalogs, partial-progress edge cases, unreleased flags, genuine seasonal achievement triggers, timestamp preservation, filtered category headers, and PNG/app agreement. Earlier small-catalog fixtures now assert fixed requirements rather than treating fixture size as the progression target.
