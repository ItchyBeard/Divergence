import { modeIds } from './modes'

// Genuine in-game assets can be supplied here; null keeps the compact text label.
export const modeIcons = { multiplayer: null, dmz: null, warzone: null }

export const resolveTrackerMode = (requested, fallback = 'multiplayer') =>
  modeIds.includes(requested) ? requested : modeIds.includes(fallback) ? fallback : 'multiplayer'

export const legacyTrackerLocation = (route, mode) => ({
  path: '/tracker',
  query: { ...route.query, mode },
  hash: route.hash,
})
