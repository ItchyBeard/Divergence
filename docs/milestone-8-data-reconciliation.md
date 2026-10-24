# Milestone 8: Weapon data reconciliation

Source: supplied **Copy of MW4 Mastery Tracker by Axolwaffles.xlsx**, Mastery Camos (v1.0.2) and Weapon Prestige (v1.0.1). Extracted once and matched programmatically against all **33 launch weapons** using names/IDs, then Special names; Type 73 identity conflicts were not accepted by position alone. Workbook text was treated as data, not instructions. Community-sourced edits carry sheet/cell comments.

## Applied

- Filled **9 maximum levels**: cronen-squall 67; oden 65; x-58-nyx 53; warlord 60; apoc-338 56; mosin-nagant 69; mojave-357 44; jokr 46; pm-40-anvil 46. Both sheets agree on each replacement. Retained every previously supplied non-placeholder maximum; no blanket +1 adjustment.
- Resolved **74 of 93 pending Special prerequisites** as explicit weapon levels. Kept existing Special IDs, names and ordering, including M4’s different source order. HAN 86’s confirmed levels and VEL 46’s existing levels remain unchanged.
- Updated **40 Special challenge records/conditions**: corrected objectives, amounts, MP/DMZ targets, repetitions and missing Miri 40mm / five-second conditions; one invalid KG-7 DMZ challenge is now explicitly unavailable. Notable corrections include VEL Jungle Shadow ADS, Kastov Samnim 4 kills, Mosin Fractal Snow reloading, Sang’s swapped MP objectives and Launcher objective associations. HAN Red remains **3 player kills without dying, 15 times**.
- Completionist: filled **8 category Gold prerequisites** and **31 MP/DMZ category challenge conditions** across 16 category rules. Preserved repetitions independently of kill counts; LMG/Melee Platinum DMZ uses no-damage conditions; Launcher Harmonic Break uses 10 kills per match, 7/15 times. Melee Harmonic Break DMZ stays unavailable because its target is contradictory. Gold, AR challenges, arsenal prerequisites and Divergence award rules remain unchanged.
- Prestige: no individual player Prestige Master thresholds are documented. Left all **90 pending thresholds** unchanged and preserved confirmed HAN 86, VEL 46 and Knife requirements. Generic headers are insufficient evidence for per-weapon requirements.

## Remaining data

**110 numeric `999` placeholders**: **1 maximum**, **19 Special unlock levels**, **90 Prestige thresholds**. Each remains pending with an adjacent `// TODO: VERIFY`. Eighteen pending Special levels exceed retained maximums; Type 73 Mineral additionally has an identity conflict (Tiger Swipe has both conflicts). No guesses were substituted.

**19 maximum-level disagreements** remain; they are retained values, not additional placeholders. The table pairs each maximum with the affected final Special threshold. Source: Mastery Camos column D (top weapon table) and column B (Special blocks).

| Weapon | Retained max | Workbook max | Final Special level |
|---|---:|---:|---|
| AXION | 68 | 69 | Cyan 69 |
| HYEON BURST | 67 | 68 | Kitty Kaos 68 |
| KASTOV 762 | 67 | 68 | Yellow 68 |
| PATRIOT XMR | 71 | 72 | Disperse 72 |
| M4 | 71 | 72 | Green 72 |
| VEL 46 | 59 | 60 | Gunmetal 60 |
| WZ.55 STRIGA | 59 | 60 | Dark Tan 60 |
| ISO NIGHTSHADE | 63 | 64 | Brown 64 |
| PPSH-41 | 61 | 62 | Currents 62 |
| REZI 12 | 59 | 60 | White Pine 60 |
| FINN LMG | 58 | 59 | Thunderhead 59 |
| TYPE 73 | 64 | 65 | Foxtrail 65 |
| MAR-9 | 72 | 73 | White 73 |
| ORIS 8.6 | 69 | 70 | Deep Space 70 |
| SIGNAL 50 | 73 | 74 | Sunburn 74 |
| KG-7 VULCAN | 74 | 75 | Tension 75 |
| ASTAROTH .57 | 53 | 54 | Dread Plague 54 |
| KRAIT P68 | 37 | 38 | Smokescreen 38 |
| SANG 9MM | 37 | 38 | Space Time 38 |

### Other unresolved conflicts

| Source | Conflict / retained treatment |
|---|---|
| Weapon Prestige D8:D9 | Patriot/Kastov maximums 68/72 disagree with Mastery Camos 72/68. Retained supplied 71/67. |
| Mastery Camos B138, B140, B142 | VEL Special levels 20/40/60 disagree with existing 19/39/59; existing requirements retained. |
| Mastery Camos B207, B209 | Type 73 Outcrop/Foxtrail disagree with Mineral/Tiger Swipe. Names and stable IDs retained; unlock levels pending. |
| Mastery Camos D77 | Hyeon Kitty Kaos MP says 100 Enemy silenced kills; existing 100 player full-auto kills retained pending confirmation. DMZ target corrected to enemies. |
| Mastery Camos D37 vs existing Military levels | .50 GS maximum 37 is below existing Military unlock levels 38/41. Maximum remains `999`; Military levels retained pending verification. |
| Mastery Camos D255 | KG Treeline DMZ says **0** kills, 25 times; existing 1 was unsupported. Challenge made unavailable, not replaced with a guessed positive amount. |
| Mastery Camos D310 | Mojave Miami MP says 15 one-shot kills against Enemies; existing 20 player headshots retained pending confirmation. |
| Mastery Camos D361, D363 | Knife Stockpile/Deathbed MP explicitly targets Enemies in both sources. Existing target retained pending verification; no assumed conversion to players. |
| Mastery Camos O362 | Melee Harmonic Break DMZ says 75 Player kills from behind; condition remains unavailable pending target confirmation. |
| Mastery Camos N57:N120 vs X66 | AR Harmonic Break blocks say 30 Platinum; central sidebar and existing authoritative rule say 33. Retained 33. |
| Weapon Prestige G4:J4, L20:M29 | Generic stage headings conflict with rewards table (e.g. Terminus 150 / Scatter 200 versus existing confirmed thresholds). No weapon-specific requirements inferred. |

Warzone requirements remain unpublished and unchanged. DMZ challenge rows without an explicit target use their established enemy target where the surrounding MP/DMZ pairing is unambiguous. No weapon/camo identities, Military levels, saves, store actions, discovery, UI, artwork or progression architecture changed. HAN 86 definition is unchanged.

## Verification

The initial data/full runs exposed the .50 GS maximum conflict above (61 data tests and 163 full-suite tests passed; the remaining suites could not load). After retaining its pending maximum, the targeted rerun passed all 81 affected tests: all **138 data tests / 244 total tests** have now passed across those runs. Repository-wide ESLint passed. Production build passed; final rebuild after the maximum correction also passed. No browser checks, workbook edits or deployment.

