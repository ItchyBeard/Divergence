// Ownership is manual and independent of every progression/achievement counter.
export const collectibleCategories = [
  { id: 'special', name: 'Special collectibles' },
  { id: 'dmz', name: 'DMZ collectibles' },
  { id: 'promotional', name: 'Promotional collectibles' },
]

export const collectibleAvailabilityLabels = {
  'available': 'Available',
  'limited-time': 'Limited-time',
  'unobtainable': 'No longer obtainable',
  'unknown': 'Unknown',
}

export const collectibles = [
  {
    id: 'litmus',
    name: 'Litmus',
    category: 'special',
    requirement: 'Get 1,500 Operator Kills during the MW4 Beta',
    image: 'litmus.png',
    ownership: 'standalone',
    availability: 'unobtainable',
  },
  {
    id: 'locked-down',
    name: 'Locked Down',
    category: 'special',
    requirement: 'Confirm your Call of Duty account email',
    image: 'locked-down.png',
    ownership: 'standalone',
    availability: 'available',
  },
  {
    id: 'prestige-master',
    name: 'Prestige Master',
    category: 'special',
    requirement: 'Reach Player Prestige Master Level 1000',
    image: 'prestige-master.png',
    ownership: 'standalone',
    availability: 'available',
  },
  {
    id: 'hajin',
    name: 'Hajin',
    category: 'dmz',
    requirement: 'Prestige operators 100 times in DMZ',
    image: 'hajin.png',
    ownership: 'standalone',
    availability: 'available',
    mode: 'dmz',
  },
  {
    id: 'gilded-ruin',
    name: 'Gilded Ruin',
    category: 'promotional',
    requirement: 'Pre-order Modern Warfare 4',
    image: 'gilded-ruin.png',
    ownership: 'standalone',
    availability: 'unobtainable',
  },
  {
    id: 'moonlit-pearl',
    name: 'Moonlit Pearl',
    category: 'promotional',
    requirement: 'Pre-order Modern Warfare 4',
    image: 'moonlit-pearl.png',
    ownership: 'standalone',
    availability: 'unobtainable',
  },
  {
    id: 'war-spoils',
    name: 'War Spoils',
    category: 'dmz',
    requirement: 'Extract 3 Weapon Manuals for this weapon in DMZ.',
    image: 'war-spoils.png',
    ownership: 'weapon',
    availability: 'available',
    mode: 'dmz',
    requirementVerified: false,
    requirementNote: null,
    eligibility: 'all-weapons',
    eligibilityBasis: 'Owner-approved assumption after manually verifying over 10 weapons.',
    eligibilityComplete: true,
    eligibilityNote: null,
  },
]

export const collectiblesById = Object.fromEntries(collectibles.map((camo) => [camo.id, camo]))

export function collectibleWeaponEligible(camo, weaponId) {
  return camo.eligibility === 'all-weapons' || camo.eligibleWeaponIds?.includes(weaponId) === true
}

export function collectibleOwned(save, camo, weaponId) {
  return camo.ownership === 'weapon'
    ? save.collectibles?.perWeapon?.[camo.id]?.[weaponId] === true
    : save.collectibles?.standalone?.[camo.id] === true
}

export function collectionSummary(save) {
  const standalone = collectibles.filter((camo) => camo.ownership === 'standalone')
  return {
    completed: standalone.filter((camo) => collectibleOwned(save, camo)).length,
    total: standalone.length,
  }
}
