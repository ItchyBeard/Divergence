# Weapon Prestige refinement

Central identities, display order and artwork filenames stay in
`src/data/mw4/prestige.js`. There are no global player or weapon thresholds.
All four requirement arrays belong to each weapon's `prestigeCamos` field.
HAN 86 now requires weapon prestige for all four camos, with overall player
Prestige Master levels 73, 150 and 250 for Terminus, Scatter and Cascade.
These values use the user's confirmed requirements and replace the earlier
weapon-level interpretation. No external verification of those supplied values
was performed in this refinement.

The schema validates four unique recognised IDs, nonempty condition arrays,
built-in condition fields and positive integer player levels. Unpublished
conditions use `{ type: 'unavailable', reason: '...' }`; known conditions can
remain alongside them. Future documented condition types have an extension
format with descriptive text and structured JSON parameters, explained in the
[weapon developer guide](../src/data/weapons/README.md).

The existing compact Prestige tab, tooltip/popover, CDN image resolver and
seasonal guards are retained. Completion is manual. No condition is evaluated
to infer completion. Individual unavailable entries cannot be newly completed;
existing flags remain visible and support explicit undo. Bulk completion skips
unavailable entries, and bulk reset clears only that weapon's four known flags.
The main percentage, shared camo actions and mode mastery are unchanged.

The version 1 save contract and storage namespace are unchanged. Existing
Prestige flags use the same weapon and camo IDs, including previously checked
flags under the earlier interpretation. Nothing is automatically revoked or
recomputed. Version 1 exports without Prestige still load. Unknown saved IDs
continue to round-trip for future catalog additions. Singularity storage is
never read, changed or removed.

Verification completed:

- Complete test suite: 117 tests passed (69 data, 28 store, 20 component).
- ESLint: passed without changes requested by lint.
- Production build: passed.
- Data tests cover the four supplied Terminus thresholds, per-weapon
  Scatter/Cascade overrides, stable display ordering and CDN path resolution,
  unknown conditions, malformed definitions and automatic weapon discovery.
- Store tests cover independent flags, refresh, export/import, old version 1
  saves with/without Prestige, availability, bulk actions, reset, shared/mastery
  isolation, and untouched Singularity keys.
- Component tests cover Prestige player-level wording and accessible mobile
  requirement popovers, including unavailable requirements and explicit toggles.

HAN 86 remains the only populated production weapon. Knife (47), Rocket Launcher
(47) and VEL 46 (61) Terminus thresholds, with the supplied 150/250 later stages,
are tested using clearly marked fixture clones. Their complete weapon data have
not been provided, so no incomplete production definitions or requirement maps
were added. Add those confirmed conditions to each weapon file when its remaining
data are available. No thresholds for any other weapon are extrapolated.

No application deployment was performed. This refinement did not change artwork
URLs or styling; CDN delivery was not rechecked over the network. Existing
Milestone 3 rendering/fallback tests remain passing.
