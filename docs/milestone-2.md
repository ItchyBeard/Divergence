# Milestone 2: MW4-only tracker integration

Historical milestone report. See [Milestone 3](milestone-3.md) for restored
interactions, artwork and Weapon Prestige tracking.

The active application now consumes the automatically discovered MW4 catalog.
HAN 86 is the only populated weapon. No other weapon or challenge data was added.
The existing dark compact card grid, responsive category layout, season badges,
list/table choices, favourites, filters, settings and image-share flow remain.

## State and progression

- Stable weapon IDs key one shared camo record across Multiplayer, DMZ and Warzone.
- Each mode has an independent account-level mastery record, outside shared totals.
- A toggle changes only the selected flag. There are no automatic earlier/later
  completions, cross-mode copies or cascading resets. This is a manual unlock
  tracker; source prerequisites appear in tooltips rather than being enforced
  against an incomplete weapon catalog.
- Military/Special/Completionist rendering comes from stage definitions. Special
  camos render per weapon, and table columns use their slot positions. Novel
  objective types can provide descriptions without adding translation entries.
- Warzone's unpublished requirements are shown as unavailable and disabled for
  new completion. Already earned shared unlocks remain visible and can be undone.
- Progress totals count released catalog weapons only, including released seasonal
  weapons. Filters never change the denominator. Actual eight-AR/33-weapon game
  prerequisites remain documented separately from catalog completion percentages.

## Storage and recovery

Only `divergence:mw4:v1` (production) and `divergence:mw4:v1:dev` (development)
are accessed. The locale loader also uses this contract. No legacy save read,
write, delete or migration exists in active code. Import/export includes camos,
mastery, favourites, filters, preferences and start date; foreign games and save
versions are rejected. Unknown weapon/camo IDs survive round trips so catalog
changes do not silently drop saves.

Malformed stored data blocks subsequent automatic writes and mutations. The raw
stored content can be downloaded for recovery. Import validates and writes before
updating state. Reset explicitly clears only Divergence camo/mastery progress,
keeping preferences/favourites/filters. Storage-write failures produce a visible
message; unsaved changes remain in memory and can still be exported.

## Seasons and release dates

Season 0 displays Launch. Future dates and unknown dates stay visible, labelled
and non-interactive. An optional delayed status holds a weapon after its planned
date; a revised date/status can be edited in the same weapon file. Availability
updates every 30 seconds, on window focus and on refresh; actions recheck time
immediately. Unreleased imported progress is retained but excluded from totals.

## Legacy cleanup

After the replacement store and components built successfully, removed:

- The old `src/data/weapons.js` aggregator and ten category name arrays.
- Legacy requirement/prestige maps, camo definitions, progress/filter/preference
  defaults, camo-order and rename mappings, and the prestige generator helper.
- Zombies, Campaign, old Warzone, Prestige and Calling Cards views; prestige,
  calling-card, old table-cell and support-notice components.
- Unused old camo gradients and tracker-image assets, stale localization data,
  old branding/remote asset URLs and the original analytics tag.
- The obsolete HelloWorld starter test importing a component that no longer exists.
  It was replaced by actual mounted tracker tests, not excluded from the runner.

Generic modal, icon, loader, alert, filter, locale and utility components/styles
were retained. ESLint now uses its Vue 3 essential preset to match this Vue 3 app.
The historical [Milestone 1 inventory](milestone-1-consumers.md) remains as a record
of the migration surface, not a description of current dependencies.

## Verification

Automated tests cover real Vite discovery of a newly created weapon file,
validation, shared identity, mode exceptions, persistence into a fresh Pinia
instance, single-flag changes, mastery separation, unavailable requirements,
future/unknown/delayed releases and release-day boundaries, imported unknown IDs,
versioned import/export/reset, malformed-save protection, failed storage writes,
legacy namespace access spies, mounted grid/list/table/favourite/filter controls,
Settings reset/import and image-share generation. Synthetic seasonal fixtures
exist only in tests.

Browser checks exercised Multiplayer → DMZ → Warzone shared completion, differing
challenge text, disabled unpublished requirements, refresh persistence, list and
table layouts, Settings export/reset/import restoration and PNG preview generation.
The share image is 2400×1260 (a 1200×630 card rendered at 2×), with a visible preview
and Download PNG link. No deployment was performed.

Final results: **54 tests pass**, source ESLint passes, and the production build
passes without the earlier oversized-chunk warning. A source audit found no
remaining legacy game/data imports or storage-key references outside the explicit
legacy-isolation tests. The original failing starter test has been replaced with
five mounted tracker integration tests.

Visual evidence: [compact tracker](mw4-tracker.png) and
[generated share image](share-progress-example.png).

## Remaining data and product limits

- Only HAN 86 is populated. The rest of the weapon catalog is for the next milestone.
- Warzone requirements and several other category counts are unpublished.
- Source ambiguity on Red Multiplayer's repetition count is preserved.
- No official MW4 camo artwork is supplied; stage swatches and full-name tooltips
  preserve a compact layout without inventing imagery.
- The tracker records earned unlocks manually. It does not verify in-game
  eligibility, infer partial challenge counters or calculate mixed-mode kill credit.
- English is currently the supplied interface language.
