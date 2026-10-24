// UI projections only: no additional progress state or weapon registration.
export const weaponSortOptions = [
  { id: 'default', name: 'Default' },
  { id: 'closest', name: 'Closest to completion' },
  { id: 'least', name: 'Least completed' },
  { id: 'name-asc', name: 'Name (A–Z)' },
  { id: 'name-desc', name: 'Name (Z–A)' },
  { id: 'released', name: 'Most recently released' },
]

const headerTiers = ['divergence', 'harmonic-break', 'platinum', 'gold']
export const completionHeaderTier = (flags) =>
  headerTiers.find((id) => flags[id] === true) || 'default'
// Requirement-information availability for Gallery discovery, not permission to track a camo.
export const camoApplicable = (camo) =>
  !camo.requirementPending && Boolean(camo.award || camo.challenge?.status === 'available')

export function sharedCompletion(weapon, camos, flags) {
  // Definitions determine applicability; missing requirement information never removes a flag.
  const applicable = weapon.available ? camos : []
  const total = applicable.length
  const completed = applicable.filter((camo) => flags[camo.id] === true).length
  return { completed, total, ratio: total ? completed / total : 0 }
}

// Input is already visibility-filtered. Explicit catalog indices break every tie.
export function sortWeapons(weapons, sortBy, progress, catalogIds) {
  const order = new Map(catalogIds.map((id, index) => [id, index]))
  const metrics = new Map(weapons.map((weapon) => [weapon.id, progress(weapon)]))
  const compare = (a, b) => (a < b ? -1 : a > b ? 1 : 0)
  const group = (value) =>
    !value.total ? 3 : value.completed === 0 ? 1 : value.completed === value.total ? 2 : 0
  return [...weapons].sort((a, b) => {
    const left = metrics.get(a.id),
      right = metrics.get(b.id)
    let result = 0
    if (sortBy === 'closest') result = group(left) - group(right) || right.ratio - left.ratio
    if (sortBy === 'least')
      result = Number(!left.total) - Number(!right.total) || left.ratio - right.ratio
    if (sortBy === 'name-asc' || sortBy === 'name-desc')
      result =
        compare(a.name.toLocaleLowerCase('en-GB'), b.name.toLocaleLowerCase('en-GB')) *
        (sortBy === 'name-desc' ? -1 : 1)
    if (sortBy === 'released') {
      // Newest released first, then dated upcoming/delayed weapons, then unknown dates.
      const releaseGroup = (weapon) => (!weapon.releaseDate ? 2 : weapon.available ? 0 : 1)
      result =
        releaseGroup(a) - releaseGroup(b) || compare(b.releaseDate || '', a.releaseDate || '')
    }
    return result || order.get(a.id) - order.get(b.id)
  })
}

// Every click is planned before committing flags. This is a manual shortcut,
// independent of whether its requirement information has been published.
export function camoTogglePlan(camos, camoId, flags, prestige = false) {
  const selected = camos.find((camo) => camo.id === camoId)
  if (!selected) return { changes: {}, blocked: [] }
  const complete = flags[camoId] !== true
  let targets = [selected]
  if (prestige || selected.stage === 'military') {
    const chain = prestige ? camos : camos.filter((camo) => camo.stage === 'military')
    const index = chain.findIndex((camo) => camo.id === camoId)
    targets = complete ? chain.slice(0, index + 1) : chain.slice(index)
  } else if (selected.stage === 'completionist') {
    const chain = camos.filter((camo) => camo.stage === 'completionist')
    const index = chain.findIndex((camo) => camo.id === camoId)
    targets = complete
      ? [
          ...camos.filter((camo) => ['military', 'special'].includes(camo.stage)),
          ...chain.slice(0, index + 1),
        ]
      : chain.slice(index)
  }
  return {
    changes: Object.fromEntries(targets.map((camo) => [camo.id, complete])),
    blocked: [],
  }
}
