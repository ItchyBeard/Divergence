# Historical draft validation

The 32 incomplete definitions previously staged here have now been validated and
restored to `src/data/weapons/<category>/`. Their stable identities, Military levels
and extracted Special challenges were checked for preservation before writing.
Pistol drafts use the existing `pistols` category ID and folder.

`validation.json` records the **historical, pre-restoration** failures and original
staging paths. Those paths no longer contain the restored definitions; this file
is an audit record, not a current validation report or discovery exclusion list.

Unknown numeric requirements now use explicit `999` placeholders with adjacent
`// TODO: VERIFY` comments, and remain unavailable in the UI and completion logic.
See `src/data/weapons/README.md` for the current schema, confirmed-value caveats
and remaining verification work. The original extraction metadata is preserved
in `src/data/weapons/source-data.json`.
