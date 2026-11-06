// Ownership is manual and independent of every progression/achievement counter.
export const collectibleCategories = [
  { id: 'special', name: 'Special collectibles' },
  { id: 'dmz', name: 'DMZ collectibles' },
  { id: 'promotional', name: 'Promotional collectibles' },
  { id: 'special-unlocks', name: 'Special Camos', separateSummary: true },
  { id: 'blackcell-season-1', name: 'BlackCell Season 1', separateSummary: true },
  { id: 'event', name: 'Event Camos', separateSummary: true },
  { id: 'cdl-bundle', name: 'CDL / Bundle', separateSummary: true },
]

export const collectibleAvailabilityLabels = {
  'available': 'Available',
  'limited-time': 'Limited-time',
  'unobtainable': 'No longer obtainable',
  'unknown': 'Unknown',
}

const blackCellClasses = [
  [
    'infiltrator',
    'Infiltrator',
    'Assault Rifles',
    ['Get 10 double kills.', 'Get 20 triple kills.', 'Get 25 kills with ground loot.'],
  ],
  [
    'cell-ops',
    'Cell Ops',
    'SMGs',
    ['Get 20 point-blank kills.', 'Get 200 kills.', 'Get 10 hipfire kills.'],
  ],
  [
    'gold-tiger',
    'Gold Tiger',
    'Sniper Rifles',
    ['Get 3 kills without dying, 5 times.', 'Get 100 headshot kills.', 'Get 10 headshot kills.'],
  ],
  [
    'whirlpool',
    'Whirlpool',
    'LMGs',
    [
      'Get 30 longshot kills.',
      'Get 5 kills without reloading, 10 times.',
      'Get 2 kills without dying, 10 times.',
    ],
  ],
  [
    'intercept',
    'Intercept',
    'Melee',
    [
      'Get 3 kills in a match, 3 times.',
      'Get 50 undetected kills.',
      'Get 5 eliminations while in the Top 10.',
    ],
  ],
]
const blackCellCamos = [
  ...blackCellClasses,
  [
    'spinal-verge',
    'Spinal Verge',
    null,
    [
      'Finish first on the scoreboard, 3 times.',
      'Exfil with over 150 kills, 5 times.',
      'Get 2 kills within 10 seconds, 10 times.',
    ],
  ],
].map(([id, name, weaponClass, challenges]) => ({
  id,
  name,
  category: 'blackcell-season-1',
  season: 1,
  acquisition: 'premium-challenge',
  entitlement: 'blackcell-season-1',
  ownership: 'standalone',
  availability: 'limited-time',
  requirement: weaponClass
    ? `Use any weapon in the ${weaponClass} class.`
    : 'Final BlackCell reward.',
  prerequisiteIds: weaponClass ? [] : blackCellClasses.map(([classId]) => classId),
  challenges: challenges.map((description, index) => ({
    id: ['multiplayer', 'dmz', 'warzone'][index],
    description,
  })),
}))

export const collectibles = [
  {
    id: 'litmus',
    name: 'Litmus',
    acquisition: 'event-challenge',
    category: 'special',
    requirement: 'Get 1,500 Operator Kills during the MW4 Beta',
    image: 'litmus.png',
    ownership: 'standalone',
    availability: 'unobtainable',
  },
  {
    id: 'locked-down',
    name: 'Locked Down',
    acquisition: 'account-verification',
    category: 'special',
    requirement: 'Confirm your Call of Duty account email',
    image: 'locked-down.png',
    ownership: 'standalone',
    availability: 'available',
  },
  {
    id: 'prestige-master',
    name: 'Prestige Master',
    acquisition: 'challenge',
    category: 'special',
    requirement: 'Reach Player Prestige Master Level 1000',
    image: 'prestige-master.png',
    ownership: 'standalone',
    availability: 'available',
  },
  {
    id: 'hajin',
    name: 'Hajin',
    acquisition: 'challenge',
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
    acquisition: 'preorder',
    category: 'promotional',
    requirement: 'Pre-order Modern Warfare 4',
    image: 'gilded-ruin.png',
    ownership: 'standalone',
    availability: 'unobtainable',
  },
  {
    id: 'moonlit-pearl',
    name: 'Moonlit Pearl',
    acquisition: 'preorder',
    category: 'promotional',
    requirement: 'Pre-order Modern Warfare 4',
    image: 'moonlit-pearl.png',
    ownership: 'standalone',
    availability: 'unobtainable',
  },
  {
    id: 'war-spoils',
    name: 'War Spoils',
    acquisition: 'challenge',
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
  ...blackCellCamos,
  ...[
    ['gold-mosaic', 'Gold Mosaic', 10],
    ['gold-excellence', 'Gold Excellence', 25],
  ].map(([id, name, target]) => ({
    id,
    name,
    category: 'special-unlocks',
    ownership: 'standalone',
    acquisition: 'challenge',
    availability: 'available',
    requirement: `Complete ${target} challenges in any Stat track.`,
  })),
  {
    id: 'classified-weapon',
    name: 'Classified Weapon',
    category: 'event',
    ownership: 'standalone',
    acquisition: 'event-challenge',
    availability: 'unknown',
    requirement: 'Get 10 kills with a Classified Weapon.',
  },
  {
    id: 'blooming-skulls',
    name: 'Blooming Skulls',
    category: 'cdl-bundle',
    ownership: 'standalone',
    acquisition: 'purchase',
    availability: 'unknown',
    requirement: 'Available in the CDL Launch Pack 2027 bundle.',
  },
].map((camo) => ({ ...camo, countsTowardCoreProgress: false }))

export const collectiblesById = Object.fromEntries(collectibles.map((camo) => [camo.id, camo]))

export function collectibleWeaponEligible(camo, weaponId) {
  return camo.eligibility === 'all-weapons' || camo.eligibleWeaponIds?.includes(weaponId) === true
}

export function collectibleOwned(save, camo, weaponId) {
  return camo.ownership === 'weapon'
    ? save.collectibles?.perWeapon?.[camo.id]?.[weaponId] === true
    : save.collectibles?.standalone?.[camo.id] === true
}

export function collectionSummary(save, category) {
  const standalone = collectibles.filter(
    (camo) =>
      camo.ownership === 'standalone' &&
      (category
        ? camo.category === category
        : !collectibleCategories.find((entry) => entry.id === camo.category)?.separateSummary)
  )
  return {
    completed: standalone.filter((camo) => collectibleOwned(save, camo)).length,
    total: standalone.length,
  }
}
