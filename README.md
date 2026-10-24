# Divergence

A compact Vue 3 / Vite / Pinia camo tracker for Modern Warfare 4, with 33 launch
weapon definitions. Military, Special and Completionist progress is shared across
Multiplayer, DMZ and Warzone. Weapon Prestige and mode Mastery are independent.

## Local development

Install a current Node.js LTS release with npm, then run:

```sh
npm ci
npm run dev
```

```sh
npm run test:data
npm test
npm exec eslint -- . --ext .vue,.js,.jsx,.cjs,.mjs --ignore-path .gitignore
npm run build
npm run preview
```

The build output is `dist/`. Use npm and the committed `package-lock.json` for
reproducible installs. No environment variables or backend are required.

## Data and saves

See the [weapon developer guide](src/data/weapons/README.md). Adding a weapon
requires one definition file; discovery is automatic. Unknown requirements remain
pending and are never presented as confirmed thresholds.

Progress uses the existing versioned Divergence v1 browser storage contract.
Export a JSON backup through Settings before changing browser or device.
Legacy Singularity saves are never read, overwritten or migrated.

## GitHub and Netlify

Create an empty GitHub repository, review local changes, then commit and push to
your chosen remote. Local configuration, credentials, dependencies and build
outputs are excluded by `.gitignore`. Do not commit secrets.

When ready to publish, connect that repository to Netlify. `netlify.toml` specifies
`npm run build` and publish directory `dist`. The existing `public/_redirects`
provides the fallback required by Vue Router's history routes. Public assets are
copied by Vite; camouflage artwork uses the central absolute CDN configuration.
No functions, accounts integration or additional environment variables are needed.

The favicon master is `public/favicon.svg`, using the same brand gradient as
`src/scss/abstracts/_variables.scss`. Its PNG/ICO variants share that artwork.
The rounded PNGs are standard PWA icons rather than full-bleed maskable artwork.

An unofficial fan tracker. Made by ItchyBeard. Inspired by Emil Carlsson.
See [LICENSE](LICENSE).
