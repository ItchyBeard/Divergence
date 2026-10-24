# Milestone 3 — UX restoration, artwork and Weapon Prestige

The MW4 catalog and automatic discovery remain in place. No additional weapon
or challenge data was fabricated, and the original Singularity repository was
accessed read-only as a UI reference.

## Restored experience

- A fixed 35px bottom bar displays shared camo progress on every route. It sits
  outside route transitions, spans the viewport, respects safe-area insets, and
  has matching content padding. Neither mode mastery nor Weapon Prestige enters
  this percentage.
- Double-clicking a weapon name completes its applicable camos or clears the
  weapon. Enter/Space and the adjacent labelled completion button offer keyboard
  and touch alternatives. Unpublished requirements are excluded from completion;
  reset clears known shared camos on that weapon only.
- Military clicks complete the selected prefix or clear the selected suffix.
  Special and Completionist camos remain independent; no cross-weapon awards or
  automatic mastery/Prestige changes occur. Each action persists once.
- Original Unicon check/times indicators, 25% image opacity, hover feedback and
  compact thumbnail sizing replace the temporary text swatches and checkmarks.
- Compact search/category controls, favourite filtering, layout cycling and a
  persistent show/hide-filters control replace the oversized filter block.
  Individual completionist filters and unreleased/completed filtering remain.
- Removed dataset, provenance, placeholder and manual-checklist notices from
  public views. Requirements and cross-weapon prerequisites stay in tooltips.
- Launch weapons have no badge. Seasonal releases retain their season label;
  future dates show availability, unknown dates show Coming Soon, and delayed
  releases remain locked. Unreleased records stay out of progress totals.
- Footer credit reads exactly: Made by ItchyBeard. Inspired by Emil Carlsson.

## Tooltips and artwork

Desktop details open on hover or keyboard focus and clamp to the viewport.
On phones/coarse pointers, tapping opens a dismissible bottom popover with a
44px explicit completion action. Opening, focusing and dismissing requirements
never changes completion. Popovers support Escape, focus return and keyboard
focus trapping. Unreleased weapons stay locked; unpublished requirements can be
read but cannot be marked complete.

The CDN base is centralized in `src/data/mw4/artwork.js`. Military and shared
Completionist filenames use stable IDs; Special definitions can supply their own
validated PNG basename. Missing assets render a neutral named fallback with no
substitution from another weapon or camo. No WZHub assets are used.

All 19 supplied URLs returned HTTP 200 with image/png. In-browser checks also
confirmed successful decoding of all 15 main-grid images and all four Prestige
images. Mode mastery artwork was not supplied; its dedicated compact rows use
named neutral tiles without requesting invented image URLs.

## Prestige and save compatibility

Weapon Prestige has its own route, uses the existing weapon IDs/catalog and
shares seasonal availability guards. The original unlock interpretation has been
superseded by the [Weapon Prestige refinement](weapon-prestige-refinement.md):
identities/artwork remain central, while every weapon supplies its own four
structured unlock requirements. Player Prestige Master levels are distinct from
weapon levels.

The version 1 Divergence contract adds an optional root `prestige` map keyed by
weapon ID, with camo-ID boolean records. Older version 1 saves without that map
load with empty Prestige progress and preserve their camos/mastery/preferences.
Unknown IDs survive round trips. Export, import, reset and malformed-save
protection include Prestige. Storage keys are unchanged; Singularity keys are
never read, written or deleted.

Mode mastery remains in its existing save structure and now has a dedicated
compact Mastery route, rather than three large boxes under the weapon grid.

## Verification

Automated coverage includes Military prefix/suffix behavior, selected-weapon
bulk completion/reset, touch completion controls, shared modes, independent
mastery and Prestige, old-save compatibility, atomic imports, unknown IDs,
release dates and delayed releases, filters, reactive progress, desktop/mobile
tooltip behavior, viewport clamping, image fallback, artwork resolution, verified
Prestige levels and legacy-save access spies.

Browser checks cover real artwork, Military 8 → Military 3 behavior, fixed-bar
geometry while scrolling, double-click completion, phone-width filters, touch
read/complete controls, Prestige independence and mode navigation. Temporary
390×844 viewport overrides are restored after testing.

Final checks: **75 tests pass**, repository-wide ESLint passes, and the production
build passes without warnings. Browser error/warning logs were empty after a
fresh load. The ESLint configuration now declares its own Node environment so
the complete repository check also covers its CommonJS configuration correctly.

Screenshots: [desktop grid](milestone-3-grid.png),
[completion overlays](milestone-3-completed.png),
[phone grid](milestone-3-mobile-grid.png), and
[touch requirement popover](milestone-3-mobile-tooltip.png).

## Reference and remaining data

UI references: [Singularity weapon cards](https://github.com/ItchyBeard/singularity/blob/master/src/components/WeaponComponent.vue),
[fixed progress bar](https://github.com/ItchyBeard/singularity/blob/master/src/components/ProgressComponent.vue),
and [filter controls](https://github.com/ItchyBeard/singularity/blob/master/src/components/FiltersComponent.vue).
Prestige requirements: [official MW4 progression guide](https://www.callofduty.com/en/blog/2026/10/call-of-duty-modern-warfare-4-ready-for-launch-progression-prestige).

Only HAN 86 is populated. Warzone challenges and some category counts remain
unpublished, and the source still omits Red Multiplayer's repetition count.
Those limits are preserved without invented values or development notices in the
tracker. No deployment was performed.
