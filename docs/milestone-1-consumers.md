# Milestone 1: legacy consumers and integration boundary

Historical inventory: Milestone 2 has migrated the active app and removed these legacy data paths. See [the current report](milestone-2.md).

Inspected before implementation. All paths below are relative to this project.
The existing Singularity data/UI/store remain in use; this milestone adds a
parallel validated MW4 catalog, not a partially converted live progression system.

| Consumer | Current dependency and required next change |
| --- | --- |
| `src/data/weapons.js` | Manual category imports, name-keyed season metadata and legacy `required` counts; attaches progress from defaults. Keep as legacy; new store will consume `src/data/weapons/index.js`. |
| `src/data/requirements/weapons.js` and its category files | Separate name-keyed requirement maps composed from `src/data/camouflages/definitions.js`. Replace for MW4 with catalog projections; no changes to legacy maps. |
| `src/data/defaults/progress.js` | Derives false flags from the legacy per-mode requirement maps. MW4 needs one shared record per weapon, not one per mode. |
| `src/data/requirements/prestige.js`, its category files, `src/utils/prestigeHelper.js` | Separate prestige lists and name-keyed camo construction. MW4 mode mastery is separate from weapon prestige; decide future prestige scope independently. |
| `src/stores/store.js` | Imports default weapons, requirements, camo order/name changes and prestige lists. Joins saved data by display name, stores per-mode flags, favorites and filters, auto-completes earlier camos and clears later ones. Add a distinct MW4 store with stable IDs, shared completion, separate mastery, explicit eligibility and scoped actions. Preserve old localStorage data. |
| `src/utils/utils.js` | Reads legacy localStorage for progress export. Add versioned MW4 export/import without routing it through legacy helpers. |
| `src/components/PrestigeWeapon.vue` | Directly imports `weaponMetadata` from legacy weapons, looks up state/favorites by name, and toggles prestige. Use stable IDs and MW4 metadata only when converted. |
| `src/views/PrestigeView.vue` | Directly reads the prestige master list and matches weapon names. Revisit separately from mode mastery. |
| `src/components/PrestigeWeapons.vue` | Reads store weapons and imports a currently absent `src/data/weaponPrestigeUnlocks`; it is not in the active build import graph. Do not wire this stale component into MW4 mastery. |
| `src/components/WeaponComponent.vue` | Reads mode progress and name-keyed requirements; hardcodes slices 0–9 and 9–16, old completionist names/styles, requirement translations and legacy CDN image names. Render stages from MW4 data (8/3/4), stable IDs and unavailable status. |
| `src/components/CamoTableCell.vue` | Resolves challenge and completion by weapon/camo name and mode; has old Warzone logic. Use shared completion with mode-selected challenges. |
| `src/components/WeaponsTable.vue` | Imports global camo order and slices mode columns in groups of 16. Generate columns from MW4 stages and Special slots instead. |
| `src/components/WeaponsComponent.vue` | Joins requirements with flags, hardcodes completionist thresholds/names and category bulk actions. Use explicit MW4 stage rules and scoped bulk actions. |
| `src/views/HomeView.vue`, `ZombiesView.vue`, `CampaignView.vue`, `WarzoneView.vue` | Group/filter by category, name favorites and hardcoded per-mode completionist flags. Introduce DMZ navigation and MW4 filters without interpreting old Zombies/Campaign flags as DMZ progress. |
| `src/components/ProgressComponent.vue` | Calculates totals from per-mode flag sets and required weapon totals. Count shared camos once, and mode mastery separately. |
| `src/components/OverallProgressComponent.vue` | Hardcodes old completionist names, base-season denominator, gradients and CDN images. Use shared MW4 stage counts and documented class/arsenal thresholds. |
| `src/components/ShareProgressModal.vue` | Counts legacy per-mode completionist flags with old naming/assets and export filenames. Update for shared completion and independent mastery. |
| `src/components/FiltersComponent.vue`, `FilterComponent.vue`, `FavoritesToggleComponent.vue` | Consume categories, favorites, completion filters and mode keys via store/props. Use stable IDs and MW4 modes and labels. |
| `src/views/SettingsView.vue` | Exports/imports unversioned weapon arrays and calls the legacy store; completion preference assumes old four milestones. Add game/version checks and preserve unrelated saves. |
| `src/views/RequirementsView.vue` | Static Singularity progression explanation. Replace with the documented MW4 prerequisite structure. |
| `src/data/camouflageOrder.js`, `camouflageNameChanges.js`, `defaults/filters.js`, `defaults/preferences.js` | Legacy order, migration aliases and preferences. Keep separate from new IDs and future MW4 save defaults. |
| `src/router/index.js`, layout navigation, `src/i18n/locales/en-GB.json`, SCSS and camo assets | Old mode labels, routes, requirement text, stage visuals and imagery. Add verified MW4 labels and visuals during UI integration. No fabricated images or asset paths in this milestone. |

`src/main.js` imports the new registry for discovery and fail-fast validation only.
The old UI continues to receive the old catalog from its current store. The new
catalog deliberately contains only the documented HAN 86 example, not fake data
to fill the 33-weapon arsenal. Eight Assault Rifle Golds and 33 arsenal challenges
remain documented thresholds even while only one weapon is registered.

## Verification

`npm run test:data` covers the official example, real Vite discovery of a newly
created fixture file in a temporary catalog mirror, ordering, malformed input,
exception isolation, shared camo identity, mode mastery separation and save keys.
Synthetic fixtures never enter production weapon directories.
The save-boundary regression also restores an existing Singularity completion
and favorites while asserting that both games' stored JSON remains unchanged.

The pre-existing `src/components/__tests__/HelloWorld.spec.js` imports a missing
`HelloWorld.vue`. This suite already failed before the change and remains visible
in `npm test`; it is not excluded or replaced. The baseline production build
passes with a >500 kB chunk warning. No deployment is part of this milestone.

Final checks: all 34 new tests pass; `npm test` still reports the one pre-existing
HelloWorld suite failure; `npm run build` passes with the same chunk-size warning.
ESLint passes for all new JavaScript files and the modified startup module.
