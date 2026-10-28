# MW4 weapon definitions

Add one `<category>/<stable-id>.weapon.js` file exporting a definition. Vite's
`import.meta.glob('./*/*.weapon.js')` discovers it automatically; no registration,
translation, progress-default or Prestige requirement map needs editing. The folder
must match a category ID from `../mw4/categories.js` (`pistols`, not `handguns`).
Catalog order is category order, then optional weapon `order`, name and stable ID.

Use HAN 86 as a schema example. Supply a stable `id`, `name`, `category`, `season`,
`releaseDate` (or `null` when unannounced), `maxLevel`, eight increasing Military
unlock thresholds, three Special camos, four Prestige camos and `exceptions`.
Use exactly one of `militaryUnlockLevels` (documented weapon levels) or
`militaryUnlockCounts` (documented weapon unlock counts), each containing eight
strictly increasing positive safe integers. Military thresholds cannot be `999`.
For a weapon whose Military thresholds are entirely unpublished, explicitly set
`militaryUnlockLevels: null` (or `militaryUnlockCounts: null` when the unit is known
to be counts). This displays unavailable requirements for all eight Military camos;
omitting the field or supplying partial/guessed thresholds still fails validation.
Use pending Special names and unavailable prerequisites, challenges and Prestige
conditions until confirmed. Override each non-award Completionist challenge in
every mode with `unavailable(reason)` so shared objectives are not shown as confirmed.
Omit `maxWeaponUnlocks` when unknown; `999` is not valid for that field.
Keep `releaseDate: null` for mid-season weapons until a date is announced.
Counts are not levels, are not bounded by `maxLevel`, and are never automatically
converted with a +1 offset. The .50 GS uses in-game-confirmed counts; existing
level-based definitions retain their original meaning.
`maxWeaponUnlocks` is optional and stores a known positive count maximum separately
from `maxLevel`. Special unlock counts are bounded by it when present. Omitting it
means the count maximum has not been supplied; never derive one from a level cap.
Challenges use `challenge(type, amount, target, times?)`; `times` counts repetitions
separately from the objective amount. For example, Red requires 3 player kills
without dying **15 times**, not a 45-kill streak. Unpublished Warzone objectives use
`warzoneUnavailable()` and other unknown challenges use `unavailable(reason)`.
Challenge IDs use snake_case; targets are players, enemies, weapon, dog-tags or
equipment. Preserve the source wording when transcribing challenges.

Shared Military/Completionist identities, category rules and mode definitions live
in `../mw4/`. Prestige identities/artwork/order are also shared, but **every unlock
condition belongs in the weapon's own `prestigeCamos` array**. Player Prestige Master
levels refer to the player's overall level, never the weapon's level.

## Special unlock prerequisites

Each Special camo now has a nonempty `unlockRequirements` array, separate from
`challenges`. Multiple conditions are allowed. Supported conditions are:

- `{ type: 'weapon_unlocks', count: number }`: weapon unlock count, **not** weapon level.
- `{ type: 'weapon_level', level: number }`: an explicitly documented weapon level.
- `{ type: 'unavailable', reason: string }`: an unknown prerequisite or documented case awaiting schema support.

Use a positive safe integer or the pending sentinel below. Only `weapon_level`
conditions are checked against a known `maxLevel`; unlock counts are a different
measurement. Unknown types and extra fields fail validation, so new documented
types should extend `validateSpecialUnlockRequirement` before being used.

```js
{
  id: 'smoke',
  name: 'Smoke',
  unlockRequirements: [
    { type: 'weapon_unlocks', count: 999 },
  ],
  challenges: {
    multiplayer: challenge('mounted_kills', 20, 'players'),
    dmz: challenge('mounted_kills', 75, 'enemies'),
    warzone: warzoneUnavailable(),
  },
}
```

This example illustrates an unknown count, not a correction to HAN 86's existing
level prerequisite. Production HAN 86 retains 25/46/72 and VEL 46 retains the
existing 19/39/59 level gates as `weapon_level`. Do not reinterpret these numbers
as weapon unlock counts. Reconciled weapons use their documented levels or explicit
pending conditions. The .50 GS now uses confirmed Special unlock counts 10/21/32.

The legacy `unlockLevel` field remains readable and validated for compatibility;
all production definitions use the new structure. If both are present, the new
array takes precedence. Saves contain stable camo flags, not these prerequisites,
so no save migration or new storage key is needed. Tracker, mobile and Gallery
details share `CamoRequirements.vue` and the formatting in `presentation.js`.

## Weapon Prestige checklist

Prestige completion is a manual four-camo sequence per weapon. Known Weapon Prestige
Master thresholds are shown as information only; no player or weapon levels are
tracked. The legacy requirement type `player_prestige_master_level` remains in
verified definitions for compatibility and is displayed as Weapon Prestige Master
Level. Do not add level-based automation or change confirmed threshold values.

## Temporary unknown numeric values

The exact number **999** is reserved as an explicit unknown value only for:

- `maxLevel`
- Special `weapon_unlocks.count` and `weapon_level.level` (and legacy `unlockLevel`)
- A `player_prestige_master_level` condition's `level`

Always attach a searchable comment:

```js
maxLevel: 999,
// Inside a Special camo's unlockRequirements array:
{ type: 'weapon_unlocks', count: 999 },
// If an explicitly level-based Special prerequisite is unknown:
{ type: 'weapon_level', level: 999 },
// Inside the weapon-specific Prestige requirements:
{ type: 'player_prestige_master_level', level: 999 },
```

These are unavailable requirements, **never Level 999 unlocks**. Players see
“Requirement pending.” Existing documented Special challenges remain readable.
Requirement verification is informational only. Every defined camo on a released
weapon can be manually completed, including sequential shortcuts across pending
conditions. All these flags count toward recorded progress. Unreleased weapons
remain locked. Existing flags survive import/refresh and remain undoable. Known Military levels stay usable when only the maximum is
unknown; a pending maximum is never treated as a confirmed cap or unlock condition.
Other numbers retain strict positive-integer validation and verified maximum
bounds. Military levels cannot use this placeholder. Do not replace unknown
challenge amounts with 999: use an explicitly unavailable challenge instead.

## Restored launch data and outstanding verification

All 33 launch definitions are discovered. The 32 staged drafts were restored after
schema validation; their weapon IDs, names, Military levels and extracted Special
challenges were preserved. Pistol category slugs were normalised to `pistols`.
The older extraction manifest in `source-data.json` is historical source material,
not the runtime catalog or a registration list.

HAN 86 retains its officially confirmed maximum and Red unlock level of **72**.
Red's Multiplayer challenge now includes the supplied in-game correction: 3 kills
without dying, 15 times. The other **22 supplied maximums** were copied unchanged.
**Verify that these are maximum weapon levels rather than UI weapon-unlock counts.**
No blanket +1 correction has been made. Each supplied value carries a reminder in
its own definition.

The player-reported Milestone 8.1 workbook supplies `maxWeaponUnlocks` for the 28
attachment weapons, separately from retained `maxLevel` metadata. Do not derive
a level maximum by adding one. Launchers and the knife retain level-based values.
Blank Special cells preserve their existing documented prerequisites; provided
attachment Special values use `weapon_unlocks`. Krait P68 Smokescreen uses the
owner's in-game-confirmed count of 34; the older workbook value is superseded.

All 33 weapons now have their three Player Prestige Master thresholds populated.
Their per-weapon conditions remain in each definition. No completion is inferred
from those thresholds or from the availability of challenge information.

Run `rg '\b999\b' src/data/weapons -g '*.weapon.js'` to find pending numeric values.
Weapon definitions contain no comments or source fields; leave exception and note arrays empty when unused. Run
`npm run test:data`, `npm test`, `npm exec eslint -- . --ext .vue,.js,.jsx,.cjs,.mjs --ignore-path .gitignore`
and `npm run build` before considering a definition ready. Saves remain independent
Divergence version 1 records; discovery or data verification never migrates or
rewrites progress automatically.
