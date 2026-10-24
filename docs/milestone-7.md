# Milestone 7 — Classic table, performance and UI polish

## Implementation

Restored the classic table presentation using the original Singularity [WeaponsTable](https://github.com/ItchyBeard/singularity/blob/master/src/components/WeaponsTable.vue) and [CamoTableCell](https://github.com/ItchyBeard/singularity/blob/master/src/components/CamoTableCell.vue) as read-only visual references. No legacy game data or state logic was brought back.

- Desktop weapon rows measure 31px high; completion indicators are 22px squares with the original purple fill (#8634b5), muted border and white checkmark. Incomplete indicators stay dark and outlined. Touch rows are 45px high with 44px controls.
- Headers use the central artwork resolver for Military/Completionist (or Prestige) artwork. Special 1–3 have neutral position markers and explain that camos vary by weapon. No HAN-specific Special artwork appears as a universal header.
- The weapon column has left-aligned names, compact favourites, seasonal labels and existing double-click/keyboard/explicit completion controls. A small Completionist accent replaces the grid header gradient in Table mode; its space is reserved to avoid name shifts.
- Table cells use CamoButton in indicator mode, sharing the existing tooltip, mobile details, store actions, availability protections, stable IDs and manual progression. There is no table-only progress model or duplicate cascade implementation.
- Sorting and filtering remain in WeaponsComponent/store, so Grid/List/Table consume the same ordered weapon groups. No route URLs or saved preference fields changed.
- Table scrolling is confined to its own container, with sticky weapon names. Corrected checkbox layering over the sticky column and added scroll padding. Gallery jumps centre the requested table camo so it is visible beside the sticky column.
- Fixed mobile navigation extending beyond the viewport; made its open/close controls at least 44px. Existing accents, compact filters, Gallery details, grid gradients, circular milestones and fixed overall progress bar remain intact.

## Bundle investigation and results

| Metric | Before | After |
|---|---:|---:|
| Main JS, Vite displayed size | 552.00 kB | 300.40 kB |
| Main JS gzip | 157.92 kB | 92.79 kB |
| Raw UTF-8 initial JS bytes | 552901 | 300425 |
| Build size warning | Over 500 kB | None |

Main JS decreased 45.6%; gzip decreased 41.2%. Vite reports minified string length; the raw-byte diagnostic also records UTF-8 encoding. No warning threshold was raised.

Rollup module inspection identified html2canvas (409,649 rendered bytes before chunk minification) and vue-tippy (141,172) as the largest optional contributors. Vue runtime, router and i18n were other large contributors and remain necessary. The icon imports were already tree-shaken; no icon-library rewrite was needed.

html2canvas now loads only when the user requests a progress image, in a 201.43 kB / 48.04 kB gzip secondary chunk. Removed the startup tooltip-library/plugin imports and replaced the remaining simple button hints with native titles; factual camo details still use the custom accessible renderer. Dependencies were not reinstalled or changed.

Gallery, Prestige, Mastery, Settings, About and Requirements were already lazy route imports. They remain separate chunks. Routes, navigation guards and existing history behaviour were preserved; the focused table-jump visibility fix is described above.

Gallery now caches immutable design metadata per discovered catalog, keeps selected metadata shallow, rejects static search/category/mode mismatches before reading progress, and calculates availability/labels once per weapon per filter pass. Completion and dates remain live; no saved progression or indefinitely cached availability was introduced. A local five-pass diagnostic improved from about 75.3ms to 2.2ms after availability memoisation. See gallery-benchmark.json for its scope. All Gallery thumbnails remain lazy-loaded; table rows request no artwork, leaving only 12 shared header thumbnails for a full shared-camo table.

Closed camo controls no longer attach their own document/window tooltip listeners. Those listeners exist only while a detail view is open and are cleaned up on dismissal/unmount. No virtualisation library was added.

## Verification

- Full unit/app suite: **244 passed**, 14 files. New table tests cover ordering, indicator rendering, per-weapon Specials, sequential toggles, pending safeguards, touch details, favourites, filtering, shared modes, seasons, v1 persistence/import/reset and independent Prestige.
- Data suite: **138 passed**, 6 files. Added cache/reactivity, static-filter and seasonal-date cache regressions.
- Repository-wide ESLint: **passed**. The profiling utility imports its Node globals explicitly.
- Canonical `npm run build`: **passed**, no chunk-size warning. The profiled build and canonical build produced matching asset hashes.
- Browser checks: **1280×720 desktop, 768×1024 tablet, 390×844 and 320×740 mobile**. No page-wide horizontal overflow at the checked widths. Table width remained 840px on mobile and scrolled inside the container; sticky names stayed visible. At 320px, a Gallery jump placed Smoke at x≈221–264 beside the sticky name column ending at x≈207.
- Browser completion checks: Military 8 completed the prefix; Military 3 cleared the suffix; Gold completed its shared prefix; the name accent and overall progress updated. Touch used the explicit completion button. Switching MP/DMZ/Warzone retained shared flags while changing challenge text. Warzone remained explicitly unavailable.
- Browser layout checks: Grid gradients retained, List Special summaries retained both Unlock and Challenge, table header images/cell indicators rendered correctly, Settings import/export controls stayed within the viewport, Gallery rendered 122 unique designs and filtered responsively.
- Live image-export checks produced a local **2400×1260 PNG** in both development and the local production build. Production Gallery, Prestige, Mastery and Settings route chunks also loaded, with all 33 weapons in the shared and Prestige trackers.
- Development and production console error/warning inspections returned **none**. Initial localhost preview socket isolation was resolved by running the preview outside the sandbox, still bound only to 127.0.0.1. The temporary production preview was stopped after checking.

## Data and saves

SHA-256 comparison confirmed all **33 weapon definition files are byte-for-byte unchanged** from the start of this milestone. No requirements, placeholder values/comments, camo identities, artwork filenames or Prestige thresholds were changed. The discovery index, save contract, store progression implementation and version 1 save schema were not edited.

Before interactive checks, the existing Divergence export was captured through Settings. After temporary test interactions, it was restored through the existing import UI, compared exactly with the original export, then rechecked after refresh. Progress, favourites, filters and preferences matched exactly. No real Singularity save was read or modified. Screenshots show the temporary verification state, not newly assigned progress left in the user save.

## Screenshots

- [docs/screenshots/milestone-7/table-desktop.png](D:/Desktop/mw4-divergence-camo-tracker/docs/screenshots/milestone-7/table-desktop.png)
- [docs/screenshots/milestone-7/table-mobile-390-scrolled.png](D:/Desktop/mw4-divergence-camo-tracker/docs/screenshots/milestone-7/table-mobile-390-scrolled.png)
- [docs/screenshots/milestone-7/table-mobile-320-scrolled.png](D:/Desktop/mw4-divergence-camo-tracker/docs/screenshots/milestone-7/table-mobile-320-scrolled.png)
- [docs/screenshots/milestone-7/table-tablet-768.png](D:/Desktop/mw4-divergence-camo-tracker/docs/screenshots/milestone-7/table-tablet-768.png)

## Remaining limitations

Existing unverified requirements and missing artwork remain unchanged and use their established pending/fallback states. They did not block this milestone. Small generic button hints now use native browser titles; camo details and table headers retain custom requirement/name presentations. Responsive checks used browser viewport emulation, not physical-device testing. No deployment or publication was performed.

## Modified and added files

- [src/components/WeaponsTable.vue](D:/Desktop/mw4-divergence-camo-tracker/src/components/WeaponsTable.vue)
- [src/components/CamoButton.vue](D:/Desktop/mw4-divergence-camo-tracker/src/components/CamoButton.vue)
- [src/components/WeaponName.vue](D:/Desktop/mw4-divergence-camo-tracker/src/components/WeaponName.vue)
- [src/components/ShareProgressModal.vue](D:/Desktop/mw4-divergence-camo-tracker/src/components/ShareProgressModal.vue)
- [src/main.js](D:/Desktop/mw4-divergence-camo-tracker/src/main.js)
- [src/components/LayoutToggleComponent.vue](D:/Desktop/mw4-divergence-camo-tracker/src/components/LayoutToggleComponent.vue)
- [src/components/FavoritesToggleComponent.vue](D:/Desktop/mw4-divergence-camo-tracker/src/components/FavoritesToggleComponent.vue)
- [src/components/LocaleSwitcherComponent.vue](D:/Desktop/mw4-divergence-camo-tracker/src/components/LocaleSwitcherComponent.vue)
- [src/components/layout/NavigationComponent.vue](D:/Desktop/mw4-divergence-camo-tracker/src/components/layout/NavigationComponent.vue)
- [src/components/layout/MobileNavigationComponent.vue](D:/Desktop/mw4-divergence-camo-tracker/src/components/layout/MobileNavigationComponent.vue)
- [src/views/GalleryView.vue](D:/Desktop/mw4-divergence-camo-tracker/src/views/GalleryView.vue)
- [src/data/mw4/gallery.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/mw4/gallery.js)
- [src/composables/useTrackerJump.js](D:/Desktop/mw4-divergence-camo-tracker/src/composables/useTrackerJump.js)
- [src/components/__tests__/table.spec.js](D:/Desktop/mw4-divergence-camo-tracker/src/components/__tests__/table.spec.js)
- [src/components/__tests__/camoDetails.spec.js](D:/Desktop/mw4-divergence-camo-tracker/src/components/__tests__/camoDetails.spec.js)
- [src/data/mw4/__tests__/gallery.spec.js](D:/Desktop/mw4-divergence-camo-tracker/src/data/mw4/__tests__/gallery.spec.js)
- [scripts/profile-build.mjs](D:/Desktop/mw4-divergence-camo-tracker/scripts/profile-build.mjs)
- [docs/milestone-7.md](D:/Desktop/mw4-divergence-camo-tracker/docs/milestone-7.md)
- [docs/performance/milestone-7/before.json](D:/Desktop/mw4-divergence-camo-tracker/docs/performance/milestone-7/before.json)
- [docs/performance/milestone-7/after.json](D:/Desktop/mw4-divergence-camo-tracker/docs/performance/milestone-7/after.json)
- [docs/performance/milestone-7/weapon-data-baseline.json](D:/Desktop/mw4-divergence-camo-tracker/docs/performance/milestone-7/weapon-data-baseline.json)
- [docs/performance/milestone-7/gallery-benchmark.json](D:/Desktop/mw4-divergence-camo-tracker/docs/performance/milestone-7/gallery-benchmark.json)

The four screenshots listed above are additional generated artifacts. Build output in dist/ was regenerated locally and is ignored by the repository configuration.
