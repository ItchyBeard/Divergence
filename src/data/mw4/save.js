import { weaponSortOptions } from './tracker'
import { gameId, saveVersion } from './saveContract'
import { modeIds } from './modes'
import { completionistCamos } from './camos'

export const defaultFilters = () => ({
  category: null,
  search: '',
  hideMilitaryCamos: false,
  hideUnreleased: false,
  hideCompleted: false,
  hideCamoIds: [],
  favoritesOnly: false,
  hideFilters: false,
})
export const defaultPreferences = () => ({
  layout: 'grid',
  sortBy: 'default',
  weaponGrouping: 'category',
  trackerMode: 'multiplayer',
  favorites: false,
  weaponIcons: false,
  showPrestigeCamos: false,
  locale: 'en-GB',
  completionTarget: completionistCamos.at(-1).id,
})
export const emptySave = () => ({
  game: gameId,
  version: saveVersion,
  weapons: {},
  prestige: {},
  collectibles: { standalone: {}, perWeapon: {} },
  firstCamoTracked: null,
  completedAt: null,
  celebrationHandled: false,
  mastery: Object.fromEntries(modeIds.map((mode) => [mode, {}])),
  favorites: [],
  filters: defaultFilters(),
  preferences: defaultPreferences(),
  beganGrind: null,
})

const object = (value) =>
  value !== null &&
  typeof value === 'object' &&
  [Object.prototype, null].includes(Object.getPrototypeOf(value))
const stableId = (value) => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
const flags = (value) =>
  object(value) &&
  Object.entries(value).every(([key, flag]) => stableId(key) && typeof flag === 'boolean')
const only = (value, keys) => Object.keys(value).every((key) => keys.includes(key))

// Validate before any mutation. Unknown weapon/camo IDs are retained for future catalog additions.
export function parseSave(input) {
  const source = typeof input === 'string' ? JSON.parse(input) : input
  const fail = (message) => {
    throw new Error(`Invalid Divergence save: ${message}`)
  }
  if (!object(source) || source.game !== gameId || source.version !== saveVersion)
    fail('expected MW4 version 1. Other game saves cannot be imported.')
  // Deployed automation fields are obsolete. Discard only metadata, never camo flags.
  // Work on a copy so importing an object cannot mutate the caller's backup.
  const value = { ...source }
  delete value.prestigeLevel
  delete value.prestigeAutomatic
  const defaults = emptySave()
  if (!only(value, Object.keys(defaults))) fail('unknown top-level fields')
  if ('collectibles' in value) {
    const collection = value.collectibles
    if (
      !object(collection) ||
      !only(collection, ['standalone', 'perWeapon']) ||
      !flags(collection.standalone) ||
      !object(collection.perWeapon) ||
      !Object.entries(collection.perWeapon).every(([id, weapons]) => stableId(id) && flags(weapons))
    )
      fail('invalid collectible records')
  }
  if (!object(value.weapons)) fail('weapons must be an ID-keyed object')
  for (const [key, record] of Object.entries(value.weapons)) {
    if (
      !stableId(key) ||
      !object(record) ||
      !only(record, ['sharedCamos']) ||
      !flags(record.sharedCamos)
    )
      fail(`malformed weapon ${key}`)
  }
  if (
    'prestige' in value &&
    (!object(value.prestige) ||
      !Object.entries(value.prestige).every(([id, camos]) => stableId(id) && flags(camos)))
  )
    fail('invalid weapon prestige records')
  for (const field of ['firstCamoTracked', 'completedAt']) {
    if (
      field in value &&
      value[field] !== null &&
      (typeof value[field] !== 'string' || !Number.isFinite(Date.parse(value[field])))
    )
      fail('invalid achievement date')
  }
  if ('celebrationHandled' in value && typeof value.celebrationHandled !== 'boolean')
    fail('invalid celebration status')
  if (
    !object(value.mastery) ||
    !only(value.mastery, modeIds) ||
    !modeIds.every((mode) => flags(value.mastery[mode]))
  )
    fail('expected three mastery records')
  if ('favorites' in value && (!Array.isArray(value.favorites) || !value.favorites.every(stableId)))
    fail('invalid favourites')
  if ('filters' in value) {
    const filters = value.filters
    if (
      !object(filters) ||
      !only(filters, Object.keys(defaults.filters)) ||
      ('category' in filters && filters.category !== null && !stableId(filters.category)) ||
      ('search' in filters && typeof filters.search !== 'string') ||
      ['hideMilitaryCamos', 'hideUnreleased', 'hideCompleted', 'favoritesOnly', 'hideFilters'].some(
        (key) => key in filters && typeof filters[key] !== 'boolean'
      ) ||
      ('hideCamoIds' in filters &&
        (!Array.isArray(filters.hideCamoIds) || !filters.hideCamoIds.every(stableId)))
    )
      fail('invalid filters')
  }
  if ('preferences' in value) {
    const preferences = value.preferences
    if (
      !object(preferences) ||
      !only(preferences, Object.keys(defaults.preferences)) ||
      ('trackerMode' in preferences && !modeIds.includes(preferences.trackerMode)) ||
      ('sortBy' in preferences &&
        !weaponSortOptions.some((option) => option.id === preferences.sortBy)) ||
      ('weaponGrouping' in preferences &&
        !['category', 'all'].includes(preferences.weaponGrouping)) ||
      ('layout' in preferences && !['grid', 'list', 'table'].includes(preferences.layout)) ||
      ('favorites' in preferences && typeof preferences.favorites !== 'boolean') ||
      ('weaponIcons' in preferences && typeof preferences.weaponIcons !== 'boolean') ||
      ('showPrestigeCamos' in preferences && typeof preferences.showPrestigeCamos !== 'boolean') ||
      ('locale' in preferences && preferences.locale !== 'en-GB') ||
      ('completionTarget' in preferences && !stableId(preferences.completionTarget))
    )
      fail('invalid preferences')
  }
  if (
    'beganGrind' in value &&
    value.beganGrind !== null &&
    (typeof value.beganGrind !== 'string' || !Number.isFinite(Date.parse(value.beganGrind)))
  )
    fail('invalid start date')
  return JSON.parse(
    JSON.stringify({
      ...defaults,
      ...value,
      favorites: [...new Set(value.favorites || [])],
      filters: { ...defaults.filters, ...value.filters },
      preferences: { ...defaults.preferences, ...value.preferences },
    })
  )
}
