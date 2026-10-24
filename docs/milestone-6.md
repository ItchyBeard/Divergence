# Milestone 6 implementation report

## Schema and presentation

All 33 discovered definitions now use a nonempty Special `unlockRequirements` array, separate from mode-specific `challenges`. The typed conditions are `weapon_unlocks` (`count`), `weapon_level` (`level`) and `unavailable` (`reason`). Multiple conditions are supported. Level bounds apply only to level conditions, never to unlock counts. Unknown numeric values remain `999` with adjacent `// TODO: VERIFY` comments.

The legacy `unlockLevel` field remains readable and strictly validated, but every production definition has migrated. New structured requirements take precedence if both representations are supplied. Neither representation is saved as progression; version 1 stable weapon/camo flags are unchanged.

The migration compared every non-prerequisite field before writing each definition. Weapon identities, categories/order, Military levels, Special challenges, Completionist data, Prestige conditions and exceptions were preserved. HAN 86 Red remains level 72, requiring 3 player kills without dying, 15 times. Existing HAN 86 (25/46/72) and VEL 46 (19/39/59) level gates were kept as explicitly level-based conditions. No example unlock count was promoted to a weapon fact.

Tracker hover/focus details, touch popovers and Gallery use the same CamoRequirements component and presentation helpers. Special rows show Unlock and Challenge. Other stages show their core requirement and a concise prerequisite. Repeated mode headings, sequential-shortcut paragraphs and the generic Gallery read-only instruction were removed. List summaries and accessible names use the same row data.

Manual toggles, sequential chains, pending-stage safeguards, old checked flags, shared mode state, independent Prestige/mastery, filters, gradients, artwork and storage contracts were retained. Pending requirements stay excluded from eligibility and cannot be bypassed by a completion prefix. Old checked pending flags remain explicitly undoable.

## Verification

- Full unit/app suite: 224 tests passed across 13 files.
- Data suite: 135 tests passed across 6 files.
- Repository-wide ESLint: passed.
- Production build: passed. Existing bundle-size warning remains: main JS 552.00 kB (157.92 kB gzip), over Vite's 500 kB warning threshold.
- Browser checks: desktop at 1280px; touch details at 390px; Gallery at 390px and 320px. No horizontal overflow at checked widths. Pending completion button disabled; no 999 displayed. Gallery switching MP → DMZ → Warzone changes challenges while retaining the same unlock prerequisite; Warzone stays unavailable. Temporary viewport override reset.
- Screenshots were inspected locally. No deployment or publication performed.

## Screenshots

- [Tracker Special, desktop](D:/Desktop/mw4-divergence-camo-tracker/docs/screenshots/milestone-6/tracker-special-desktop.png)
- [Pending Special, 390px](D:/Desktop/mw4-divergence-camo-tracker/docs/screenshots/milestone-6/tracker-pending-mobile-390.png)
- [Gallery Special, desktop](D:/Desktop/mw4-divergence-camo-tracker/docs/screenshots/milestone-6/gallery-special-desktop.png)
- [Gallery Special, DMZ, 320px](D:/Desktop/mw4-divergence-camo-tracker/docs/screenshots/milestone-6/gallery-special-mobile-320.png)

## Missing Special prerequisites

93 Special unlock counts across 31 weapons remain pending. The six retained HAN 86 / VEL 46 level gates have not been reinterpreted as counts. No verified numeric weapon-unlock counts were supplied. Confirm any replacement values in-game, including the correct requirement type.

| Weapon | Pending Special prerequisites |
|---|---|
| AXION | Splinter Rock, Sunset Tropic, Cyan |
| CRONEN SQUALL | Oni, Urban Smoke, Optical Reverb |
| ODEN | Dark Moss, Shale, Hot Rod |
| HYEON BURST | Ponderosa, Red Rain, Kitty Kaos |
| KASTOV 762 | Samnim, Raster Aux, Yellow |
| PATRIOT XMR | Dune Sea, Scorch, Disperse |
| M4 | Myriad, Green, Night Ops |
| WZ.55 STRIGA | Stellation, Rattlesnake, Dark Tan |
| ISO NIGHTSHADE | Asphalt, Black Topo, Brown |
| PPSH-41 | Blackwell, Iron, Currents |
| X-58 NYX | Sniper Veil, Carbonated, Lime |
| WARLORD | Redshift, Corrupted Clay, Magma Ire |
| REZI 12 | Struck Oil, Brushstroke, White Pine |
| APOC 338 | Phantom Flux, Mineral, Tiger Swipe |
| FINN LMG | Desert Tactics, Green Tiger, Thunderhead |
| TYPE 73 | Ash Pine, Mineral, Tiger Swipe |
| MOISIN NAGANT | Ice Sheer, Fractal Snow, Sticker Shock |
| MAR-9 | Mangrove, Fungal Grid, White |
| ORIS 8.6 | Hibiscus, Fire Topo, Deep Space |
| SIGNAL 50 | Anaconda, Ripplewave, Sunburn |
| KG-7 VULCAN | Treeline, Spidersilk, Tension |
| ASTAROTH .57 | Dry Brush, Backcountry, Dread Plague |
| .50 GS | Frosted, Splatter Ops, Red Tiger |
| KRAIT P68 | Off Grid, Urban Flamingo, Smokescreen |
| MOJAVE .357 | Miami, Wallpaper, Garland |
| SANG 9MM | Autumn, Snakeskin, Space Time |
| JOKR | Thicket, Tectonic, Blue Tiger |
| PILA | Frontier, Sandwash, Digital Fall |
| PM-40 ANVIL | Night Snow, Recursive, Urban Standard |
| RPG 8 | Digi Bark, Stone Bits, Bubblegum Ops |
| FSS CARBON EDGE 1095 | Raster Lite, Stockpile, Deathbed |

Other previously pending weapon maximums, player Prestige thresholds, category rules and unpublished Warzone challenges remain outside this milestone. The earlier concern about maximum weapon levels versus UI unlock counts also remains flagged in the definitions; no blanket numeric correction was made.

## Files modified or added

- [src/data/mw4/requirements.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/mw4/requirements.js)
- [src/data/mw4/validate.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/mw4/validate.js)
- [src/data/mw4/catalog.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/mw4/catalog.js)
- [src/data/mw4/presentation.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/mw4/presentation.js)
- [src/components/CamoRequirements.vue](D:/Desktop/mw4-divergence-camo-tracker/src/components/CamoRequirements.vue)
- [src/components/CamoButton.vue](D:/Desktop/mw4-divergence-camo-tracker/src/components/CamoButton.vue)
- [src/views/GalleryView.vue](D:/Desktop/mw4-divergence-camo-tracker/src/views/GalleryView.vue)
- [src/data/weapons/assault-rifles/han-86.weapon.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/weapons/assault-rifles/han-86.weapon.js)
- [src/data/weapons/assault-rifles/axion.weapon.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/weapons/assault-rifles/axion.weapon.js)
- [src/data/weapons/assault-rifles/cronen-squall.weapon.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/weapons/assault-rifles/cronen-squall.weapon.js)
- [src/data/weapons/assault-rifles/oden.weapon.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/weapons/assault-rifles/oden.weapon.js)
- [src/data/weapons/assault-rifles/hyeon-burst.weapon.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/weapons/assault-rifles/hyeon-burst.weapon.js)
- [src/data/weapons/assault-rifles/kastov-762.weapon.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/weapons/assault-rifles/kastov-762.weapon.js)
- [src/data/weapons/assault-rifles/patriot-xmr.weapon.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/weapons/assault-rifles/patriot-xmr.weapon.js)
- [src/data/weapons/assault-rifles/m4.weapon.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/weapons/assault-rifles/m4.weapon.js)
- [src/data/weapons/submachine-guns/vel-46.weapon.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/weapons/submachine-guns/vel-46.weapon.js)
- [src/data/weapons/submachine-guns/wz-55-striga.weapon.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/weapons/submachine-guns/wz-55-striga.weapon.js)
- [src/data/weapons/submachine-guns/iso-nightshade.weapon.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/weapons/submachine-guns/iso-nightshade.weapon.js)
- [src/data/weapons/submachine-guns/ppsh-41.weapon.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/weapons/submachine-guns/ppsh-41.weapon.js)
- [src/data/weapons/submachine-guns/x-58-nyx.weapon.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/weapons/submachine-guns/x-58-nyx.weapon.js)
- [src/data/weapons/shotguns/warlord.weapon.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/weapons/shotguns/warlord.weapon.js)
- [src/data/weapons/shotguns/rezi-12.weapon.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/weapons/shotguns/rezi-12.weapon.js)
- [src/data/weapons/light-machine-guns/apoc-338.weapon.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/weapons/light-machine-guns/apoc-338.weapon.js)
- [src/data/weapons/light-machine-guns/finn-lmg.weapon.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/weapons/light-machine-guns/finn-lmg.weapon.js)
- [src/data/weapons/light-machine-guns/type-73.weapon.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/weapons/light-machine-guns/type-73.weapon.js)
- [src/data/weapons/marksman-rifles/mosin-nagant.weapon.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/weapons/marksman-rifles/mosin-nagant.weapon.js)
- [src/data/weapons/marksman-rifles/mar-9.weapon.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/weapons/marksman-rifles/mar-9.weapon.js)
- [src/data/weapons/marksman-rifles/oris-8-6.weapon.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/weapons/marksman-rifles/oris-8-6.weapon.js)
- [src/data/weapons/sniper-rifles/signal-50.weapon.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/weapons/sniper-rifles/signal-50.weapon.js)
- [src/data/weapons/sniper-rifles/kg-7-vulcan.weapon.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/weapons/sniper-rifles/kg-7-vulcan.weapon.js)
- [src/data/weapons/sniper-rifles/astaroth-57.weapon.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/weapons/sniper-rifles/astaroth-57.weapon.js)
- [src/data/weapons/pistols/50-gs.weapon.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/weapons/pistols/50-gs.weapon.js)
- [src/data/weapons/pistols/krait-p68.weapon.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/weapons/pistols/krait-p68.weapon.js)
- [src/data/weapons/pistols/mojave-357.weapon.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/weapons/pistols/mojave-357.weapon.js)
- [src/data/weapons/pistols/sang-9mm.weapon.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/weapons/pistols/sang-9mm.weapon.js)
- [src/data/weapons/launchers/jokr.weapon.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/weapons/launchers/jokr.weapon.js)
- [src/data/weapons/launchers/pila.weapon.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/weapons/launchers/pila.weapon.js)
- [src/data/weapons/launchers/pm-40-anvil.weapon.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/weapons/launchers/pm-40-anvil.weapon.js)
- [src/data/weapons/launchers/rpg-8.weapon.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/weapons/launchers/rpg-8.weapon.js)
- [src/data/weapons/melee/fss-carbon-edge-1095.weapon.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/weapons/melee/fss-carbon-edge-1095.weapon.js)
- [src/data/mw4/__tests__/requirements.spec.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/mw4/__tests__/requirements.spec.js)
- [src/data/mw4/__tests__/specialUnlocks.spec.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/mw4/__tests__/specialUnlocks.spec.js)
- [src/components/__tests__/camoDetails.spec.js](D:/Desktop/mw4-divergence-camo-tracker/src/components/__tests__/camoDetails.spec.js)
- [src/components/__tests__/gallery.spec.js](D:/Desktop/mw4-divergence-camo-tracker/src/components/__tests__/gallery.spec.js)
- [src/stores/__tests__/pendingRequirements.spec.js](D:/Desktop/mw4-divergence-camo-tracker/src/stores/__tests__/pendingRequirements.spec.js)
- [src/data/weapons/README.md](D:/Desktop/mw4-divergence-camo-tracker/src/data/weapons/README.md)
- [docs/milestone-6.md](D:/Desktop/mw4-divergence-camo-tracker/docs/milestone-6.md)

The four screenshots listed above are additional generated artifacts. Automatic discovery and save contract files were not changed.
