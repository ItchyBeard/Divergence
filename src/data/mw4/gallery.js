import { getWeaponCamos } from './catalog'
import { getPrestigeCamos } from './prestige'
import { modes, modeIds } from './modes'
import { categoriesById } from './categories'
import { camoImageUrl } from './artwork'
import { challengeText, prerequisiteText } from './presentation'
import { weaponAvailability } from './availability'
import { camoApplicable } from './tracker'

export const galleryStages = [
  { id: 'military', name: 'Military' },
  { id: 'special', name: 'Special' },
  { id: 'completionist', name: 'Completionist' },
  { id: 'prestige', name: 'Weapon Prestige' },
  { id: 'mastery', name: 'Mode Mastery' },
]
export const modeTrackerPath = (mode) => (mode === 'multiplayer' ? '/' : '/' + mode)

// The discovered definition array is immutable for an app session. Cache only
// design metadata; completion and availability always come from the live save.
const galleryCatalogs = new WeakMap()
export function getGallery(weapons) {
  if (!galleryCatalogs.has(weapons)) galleryCatalogs.set(weapons, buildGallery(weapons))
  return galleryCatalogs.get(weapons)
}

// Derived once from discovered definitions. Canonical artwork distinguishes equal
// names, and explicitly shared artwork merges design aliases without merging flags.
export function buildGallery(weapons) {
  const records = new Map()
  const add = (camo, weapon, mode) => {
    const artwork = camoImageUrl(camo)
    const key = camo.stage + ':' + (artwork || camo.id)
    if (!records.has(key))
      records.set(key, { key, camo, stage: camo.stage, name: camo.name, associations: [] })
    records.get(key).associations.push({
      camo,
      weapon,
      mode,
      search: [
        camo.name,
        weapon?.name,
        weapon && categoriesById[weapon.category].name,
        challengeText(camo.challenge),
        prerequisiteText(camo, weapon),
      ]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('en-GB'),
    })
  }
  for (const weapon of weapons) {
    for (const mode of modeIds)
      for (const camo of getWeaponCamos(weapon, mode)) add(camo, weapon, mode)
    for (const camo of getPrestigeCamos(weapon)) add(camo, weapon, null)
  }
  for (const mode of modeIds) for (const camo of modes[mode].mastery) add(camo, null, mode)
  return [...records.values()].sort(
    (a, b) =>
      galleryStages.findIndex((stage) => stage.id === a.stage) -
      galleryStages.findIndex((stage) => stage.id === b.stage)
  )
}

export function galleryInstances(
  record,
  save,
  { mode = 'all', category = '', now = Date.now(), availabilityCache = new Map() } = {}
) {
  const instances = new Map()
  const availability = (weapon) => {
    if (!availabilityCache.has(weapon))
      availabilityCache.set(weapon, weaponAvailability(weapon, now))
    return availabilityCache.get(weapon)
  }
  for (const association of record.associations) {
    const { weapon, camo } = association
    if (mode !== 'all' && association.mode && association.mode !== mode) continue
    if (category && weapon?.category !== category) continue
    const key = weapon ? weapon.id + ':' + camo.id : association.mode
    if (!instances.has(key)) {
      const completed = weapon
        ? record.stage === 'prestige'
          ? save.prestige[weapon.id]?.[camo.id] === true
          : save.weapons[weapon.id]?.sharedCamos[camo.id] === true
        : save.mastery[association.mode]?.[camo.id] === true
      instances.set(key, {
        key,
        weapon,
        mode: association.mode,
        completed,
        available: false,
        associations: [],
        label: weapon ? availability(weapon).label : modes[association.mode].name,
      })
    }
    const instance = instances.get(key)
    instance.associations.push(association)
    instance.available ||= (!weapon || availability(weapon).available) && camoApplicable(camo)
  }
  return [...instances.values()]
}

export function filterGallery(records, save, filters = {}) {
  const query = (filters.search || '').trim().toLocaleLowerCase('en-GB')
  // One calendar/label calculation per weapon per pass, never a stale time cache.
  const instanceOptions = {
    ...filters,
    now: filters.now ?? Date.now(),
    availabilityCache: new Map(),
  }
  const entries = records
    .filter(
      (record) =>
        (!filters.stage || record.stage === filters.stage) &&
        record.associations.some(
          (association) =>
            (!filters.mode ||
              filters.mode === 'all' ||
              !association.mode ||
              association.mode === filters.mode) &&
            (!filters.category || association.weapon?.category === filters.category) &&
            (!query || association.search.includes(query))
        )
    )
    .map((record) => ({ ...record, instances: galleryInstances(record, save, instanceOptions) }))
    .filter(
      (record) =>
        record.instances.length &&
        (filters.status !== 'unlocked' ||
          record.instances.some((instance) => instance.completed)) &&
        (filters.status !== 'locked' || record.instances.some((instance) => !instance.completed)) &&
        (filters.availability !== 'available' ||
          record.instances.some((instance) => instance.available)) &&
        (filters.availability !== 'upcoming' ||
          record.instances.some((instance) => !instance.available))
    )
  return filters.sort === 'name'
    ? entries.sort((a, b) => a.name.localeCompare(b.name, 'en-GB') || a.key.localeCompare(b.key))
    : entries
}

export function galleryWeaponLocation(association) {
  return {
    path: !association.weapon
      ? '/mastery'
      : association.camo.stage === 'prestige'
      ? '/prestige'
      : modeTrackerPath(association.mode || 'multiplayer'),
    query: {
      ...(association.weapon ? { weapon: association.weapon.id } : { mode: association.mode }),
      camo: association.camo.id,
    },
  }
}
