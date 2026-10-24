# Milestone 8.1: progression import and manual tracking

Source: supplied divergence_missing_weapon_requirements.xlsx (the actual attachment is XLSX, despite the request calling it CSV). Read once; sheet rows 2–34 matched to all existing stable weapon IDs. Workbook notes were treated as source data, not instructions.

- **33 weapon files updated**; identities, ordering, Military thresholds/units, Special names/IDs, challenge objectives, existing maximum levels and Completionist rules preserved.
- **28 maxWeaponUnlocks fields added**, separate from retained maxLevel metadata. No +1/−1 conversion or level inference. Earlier level values remain as existing metadata; adding a count maximum does not verify them.
- **24 valid Special prerequisite values accepted**: 23 changed prerequisites and one already-confirmed .50 GS count retained. One additional supplied value is pending. All **74 blank Special cells** retain their existing documented requirements/units; no missing counts were invented or relabelled from levels.
- **89 pending weapon-specific Prestige thresholds filled**. All 99 Terminus/Scatter/Cascade thresholds are now populated; verified HAN 86, VEL 46, Knife and .50 GS values were preserved. Every stage still requires prestiging its own weapon.
- **1 numeric 999 remains**: Krait P68 Smokescreen. Supplied count 50 exceeds the reported count maximum 37. The definition retains a searchable TODO and neutral pending display.

## Matching and unresolved data

| Item | Treatment |
|---|---|
| M4 Special 3 cell F3 | Notes identify Green; applied count 42 to stable ID green, preserving existing file order and Night Ops level 51. |
| MAR-9 row 20 | Weapon-name cell was converted to Excel date serial 46090. Matched uniquely using Marksman category and White camo identity; retained mar-9. |
| Krait P68 Smokescreen | Count 50 versus maximum unlocks 37 remains pending; no rounding or correction. |
| Blank Special cells | Existing level/count requirements retained; additional unlock counts were not supplied. |
| Existing challenge-wording conflicts | Hyeon Kitty Kaos MP, Mojave Miami MP, KG Treeline DMZ, Knife MP targets and Melee Harmonic Break DMZ remain as documented previously; this import does not change challenge objectives. |

## Manual completion

Released-weapon camos can be ticked regardless of pending prerequisites or unpublished challenges. Shared and Prestige prefix/suffix shortcuts remain isolated per weapon and persist once per action. Mode Mastery can also be manually recorded without published requirements. Requirements remain informative and never become verified merely because a camo was checked. Gallery requirement-availability information remains separate from manual trackability.

All defined shared camos on released weapons count in totals, Completionist counters, sorting and recorded completion; Prestige and Mastery stay separate. Future/unknown/delayed weapon releases remain locked. No stable IDs, v1 save contract, storage keys or JSON import/export structure changed. No Singularity saves were accessed.

## Verification

Relevant data/store tests: **208 passed**, including **161 data tests**, after updating one old blocking assertion. Full suite ran once: 271 passed / 5 failed initially; the import-related table assertion was corrected and all 16 table tests passed on the targeted rerun. **272/276 tests passed across these checks; 4 existing mode-label assertion failures remain**. Repository-wide ESLint and production build passed; the final table-test edit also passed targeted ESLint. No browser automation, screenshots, external research or deployment.

Remaining unrelated failures (left unchanged under the requested scope):

- camoDetails.spec.js: desktop tooltip expects Multiplayer; current mode data displays MP.
- modeNavigation.spec.js: radio labels expect Multiplayer/Warzone; current mode data displays MP/WZ.
- tracker.spec.js: two mode-label assertions expect Multiplayer and Warzone respectively; current mode data displays MP and WZ.

