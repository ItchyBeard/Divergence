# Prestige Level and completion celebrations

## Original implementation inspected

- [Singularity NoticeComponent](https://github.com/ItchyBeard/singularity/blob/master/src/components/NoticeComponent.vue): hidden initially, a 15,000 ms mount timer, slide-down transition and a close icon. Dismissal only changed component state; it was not persisted.
- [Singularity ProgressComponent](https://github.com/ItchyBeard/singularity/blob/master/src/components/ProgressComponent.vue): progress watcher, congratulations modal, donation link, 120 confetti sprites over 10 seconds, plus delayed canvas removal. Its historical start-date fallback used the current date.
- [Singularity confetti](https://github.com/ItchyBeard/singularity/blob/master/src/utils/confetti.js): lightweight canvas paper particles; animation frames were not cancelled when the canvas was removed.
- [Singularity store](https://github.com/ItchyBeard/singularity/blob/master/src/stores/store.js): `beganGrind` was initialized by any first save, rather than reliably recording a camo completion.
- Donation destination: `https://www.buymeacoffee.com/itchybeard`; the creator's [canonical page](https://buymeacoffee.com/itchybeard) was verified and still describes support as buying a beer.

## Save compatibility and ownership

The production key remains `divergence:mw4:v1` (development uses its existing `:dev` suffix). No catalog definitions, challenge IDs or existing progress structures changed.

The v1 parser accepts and validates optional additive fields:

| Field | Default | Purpose |
| --- | --- | --- |
| `prestigeLevel` | `null` | Blank/unconfigured, or a non-negative safe integer |
| `prestigeAutomatic` | `{}` | Weapon/camo ID flags identifying automatic completions only |
| `firstCamoTracked` | `null` | Reliable first camo completion time recorded by this version |
| `completedAt` | `null` | Original shared launch-roster achievement time |
| `celebrationHandled` | `false` | Suppresses repeated celebrations, including legacy completed imports |

Old saves receive defaults; their existing Prestige flags remain manual. Export/import preserve metadata. Progress reset clears these fields, keeping the existing preference/filter behavior. Legacy `beganGrind` remains intact, but is not presented as a reliable first-camo timestamp: older versions could set it without completing a camo. Missing history displays “Not recorded”.

Automatic stages are evaluated from each weapon definition. Base Pyroclast is never inferred from a player level. A `weapon_prestige` condition requires the player to have checked that weapon's base Pyroclast. Unknown (`999`), unreleased, unavailable, player-level and custom additional conditions are never inferred. A definition containing only known Player Prestige Master conditions can qualify directly.

Changing the level adds eligible flags and removes only flags owned by automation. Manual chain toggles take ownership of all stages they touch, keeping progression shortcuts working. Manual unchecking works immediately; re-entering the same level is a no-op. A changed level reevaluates eligibility. Checking base Pyroclast also evaluates the configured level for that weapon. Prestige sorting uses Prestige progress rather than shared-camo progress.

## Celebration and notice lifecycle

Only shared-camo toggle and bulk-completion actions can raise the achievement event. All shared camo IDs must be complete on any 33 eligible released weapons, including seasonal replacements, under the [fixed launch requirements](launch-requirements.md). No rounded percentage, display filter, selected mode, Prestige or Mastery state participates. Loading/importing a completed save suppresses celebrations without inventing an achievement date. Original dates and the handled marker survive dropping below completion and returning to it. Reset starts a new tracking history.

The root-level celebration component uses the existing gradient modal, with labelled dialog semantics, focus entry/trapping/restoration, Escape and button dismissal. Adapted confetti uses a single canvas with 55 mobile or 100 desktop particles, a 3.5-second frame bound and a 4-second cleanup fallback. Closing/unmounting cancels animation and removes its canvas; reduced motion skips it entirely. Modal/banner transitions also respect reduced motion.

The root-level support banner retains the original 15-second delay without route remounts. It is fixed near the viewport top and does not move page content. `divergence:mw4:support-notice:v1` remembers `shown` or `dismissed`, preventing repeated notices across refreshes. This browser UI preference is separate from tracker exports and progress reset, like other browser consent/preferences; a progress reset does not reintroduce donation prompts. Blocked optional storage suppresses the notice. Both donation links use the original destination and safe new-tab attributes.

No new dependencies, backend, analytics events or deployment changes were introduced.
