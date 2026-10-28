import { getWeaponCamos } from './catalog'
import { getPrestigeCamos } from './prestige'
import { modes, modeIds } from './modes'
import { categoriesById } from './categories'
import { camoImageUrl } from './artwork'
import { challengeText, prerequisiteText } from './presentation'
import { weaponAvailability } from './availability'
import { camoApplicable } from './tracker'
import {
  collectibles,
  collectibleCategories,
  collectibleOwned,
  collectibleAvailabilityLabels,
  collectibleWeaponEligible,
} from './collectibles'
import { launchRequirements, progressPercentage } from './launchRequirements'

export const galleryStages = [
  { id: 'military', name: 'Military' },
  { id: 'special', name: 'Special' },
  { id: 'completionist', name: 'Completionist' },
  { id: 'prestige', name: 'Weapon Prestige' },
  { id: 'mastery', name: 'Mode Mastery' },
  ...collectibleCategories.map((category) => ({
    id: 'collectible-' + category.id,
    name: category.name,
  })),
]
export const modeTrackerPath = (mode) => (mode === 'multiplayer' ? '/' : '/' + mode)

// The discovered definition array is immutable for an app session. Cache only
// design metadata; completion and availability always come from the live save.
const galleryCatalogs = new WeakMap()
export function getGallery(weapons) {
  if (!galleryCatalogs.has(weapons))
    galleryCatalogs.set(weapons, [...buildGallery(weapons), ...buildCollectibleGallery(weapons)])
  return galleryCatalogs.get(weapons)
}

export function buildCollectibleGallery(weapons, definitions = collectibles) {
  return definitions.map((definition) => {
    const camo = { ...definition, stage: 'collectible-' + definition.category }
    const eligible =
      definition.ownership === 'weapon'
        ? weapons.filter((weapon) => collectibleWeaponEligible(definition, weapon.id))
        : [null]
    return {
      key: 'collectible:' + camo.id,
      kind: 'collectible',
      camo,
      stage: camo.stage,
      name: camo.name,
      associations: eligible.map((weapon) => ({
        camo,
        weapon,
        mode: definition.mode || null,
        search: [
          camo.name,
          camo.requirement,
          camo.requirementNote,
          camo.eligibilityNote,
          weapon?.name,
          weapon && categoriesById[weapon.category].name,
        ]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase('en-GB'),
      })),
    }
  })
}

export function galleryProgress(record, { category = '' } = {}) {
  const completed = record.instances.filter((instance) => instance.completed).length
  const total =
    record.stage === 'completionist'
      ? category
        ? launchRequirements.categories[category]
        : launchRequirements.weapons
      : record.instances.length
  return { completed, total, percent: progressPercentage(completed, total) }
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
        ? record.kind === 'collectible'
          ? collectibleOwned(save, camo, weapon.id)
          : record.stage === 'prestige'
          ? save.prestige[weapon.id]?.[camo.id] === true
          : save.weapons[weapon.id]?.sharedCamos[camo.id] === true
        : record.kind === 'collectible'
        ? collectibleOwned(save, camo)
        : save.mastery[association.mode]?.[camo.id] === true
      instances.set(key, {
        key,
        weapon,
        mode: association.mode,
        completed,
        available: false,
        associations: [],
        label:
          record.kind === 'collectible'
            ? collectibleAvailabilityLabels[camo.availability]
            : weapon
            ? availability(weapon).label
            : modes[association.mode].name,
      })
    }
    const instance = instances.get(key)
    instance.associations.push(association)
    instance.available ||=
      record.kind === 'collectible'
        ? ['available', 'limited-time'].includes(camo.availability)
        : (!weapon || availability(weapon).available) && camoApplicable(camo)
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
        (!filters.stage ||
          record.stage === filters.stage ||
          (filters.stage === 'collectibles' && record.kind === 'collectible') ||
          (filters.stage === 'progression' && record.kind !== 'collectible')) &&
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
    .map((record) => {
      const entry = { ...record, instances: galleryInstances(record, save, instanceOptions) }
      return { ...entry, progress: galleryProgress(entry, filters) }
    })
    .filter(
      (record) =>
        record.instances.length &&
        (filters.status !== 'unlocked' ||
          record.instances.some((instance) => instance.completed)) &&
        (filters.status !== 'locked' || record.instances.some((instance) => !instance.completed)) &&
        (filters.availability !== 'available' ||
          record.instances.some((instance) => instance.available)) &&
        (filters.availability !== 'upcoming' ||
          (record.kind === 'collectible'
            ? record.camo.availability === 'unobtainable'
            : record.instances.some((instance) => !instance.available))) &&
        (filters.availability !== 'unknown' ||
          (record.kind === 'collectible' && record.camo.availability === 'unknown'))
    )
  const byName = (a, b) => a.name.localeCompare(b.name, 'en-GB') || a.key.localeCompare(b.key)
  // Compare completion fractions so single-owner and per-weapon designs sort fairly.
  // Keep over-completion meaningful even though the visual progress bar caps at 100%.
  const ratio = (entry) =>
    entry.progress.total > 0 ? entry.progress.completed / entry.progress.total : 0
  switch (filters.sort) {
    case 'stage':
      return entries
    case 'name-desc':
      return entries.sort((a, b) => byName(b, a))
    case 'progress-desc':
      return entries.sort((a, b) => ratio(b) - ratio(a) || byName(a, b))
    case 'progress-asc':
      return entries.sort((a, b) => ratio(a) - ratio(b) || byName(a, b))
    default:
      return entries.sort(byName)
  }
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
