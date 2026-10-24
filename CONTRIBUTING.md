# Contributing to Divergence

Use `npm install`, then `npm run dev` for the local tracker. Before submitting changes, run `npm test`, `npm exec eslint -- src --ext .vue,.js`, and `npm run build`.

Add weapons only through the one-file-per-weapon format described in the [developer guide](src/data/weapons/README.md). Include an official source; leave unpublished values explicitly unavailable. New weapons must not require registration lists, progress defaults or translations.

Keep the compact grid/list/table interface and shared-versus-mode progression boundary. Never access or migrate Singularity storage. Preserve unknown IDs in versioned exports and protect malformed stored data from automatic writes. Use synthetic weapon/release fixtures only in tests.

The current interface is English. Localization work must cover the live MW4 components and save validation, not reintroduce old game definitions. Use the central artwork resolver and original completion overlays. Only add artwork with a verified source; missing assets must never fall back to an unrelated camo.
