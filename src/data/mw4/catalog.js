import { categories, categoriesById } from './categories'
import { militaryCamos, completionistCamos } from './camos'
import { challenge } from './challenges'
import { modeIds } from './modes'
import { assertValidWeapons } from './validate'
import { specialUnlockPending, specialUnlockRequirements } from './requirements'

const compare = (a, b) => (a < b ? -1 : a > b ? 1 : 0)

export function createWeaponCatalog(modules) {
  const weapons = Object.entries(modules).map(([path, weapon]) => {
    assertValidWeapons([weapon])
    const categoryFolder = path.split('/').at(-2)
    if (categoryFolder !== weapon.category)
      throw new Error(`${path}: folder must match category ${weapon.category}`)
    return weapon
  })
  assertValidWeapons(weapons)
  return weapons.sort(
    (a, b) =>
      categories.findIndex((category) => category.id === a.category) -
        categories.findIndex((category) => category.id === b.category) ||
      (a.order ?? 0) - (b.order ?? 0) ||
      compare(a.name, b.name) ||
      compare(a.id, b.id)
  )
}

// Pure projection: a mode selects requirements, never a separate completion record.
export function getWeaponCamos(weapon, mode) {
  if (!modeIds.includes(mode)) throw new Error(`Unknown MW4 mode: ${mode}`)
  const category = categoriesById[weapon.category]
  return [
    ...militaryCamos.map((camo, index) => ({
      ...camo,
      challenge: weapon.militaryUnlockCounts
        ? challenge('weapon_unlocks', weapon.militaryUnlockCounts[index], 'weapon')
        : challenge('weapon_level', weapon.militaryUnlockLevels[index], 'weapon'),
    })),
    ...weapon.specialCamos.map(({ challenges, ...camo }) => ({
      ...camo,
      stage: 'special',
      unlockRequirements: specialUnlockRequirements(camo),
      requirementPending: specialUnlockPending(camo),
      challenge: challenges[mode],
    })),
    ...completionistCamos.map(({ challenges, categoryRule, ...camo }) => ({
      ...camo,
      // Every Completionist tier depends on this weapon's Special camo chain.
      requirementPending: weapon.specialCamos.some(specialUnlockPending),
      ...(camo.id === 'platinum'
        ? {
            prerequisite: { ...camo.prerequisite, count: category.goldRequired },
          }
        : {}),
      ...(!camo.award
        ? { challenge: categoryRule ? category[categoryRule].challenges[mode] : challenges[mode] }
        : {}),
    })),
  ].map((camo) => {
    const override = weapon.exceptions.challengeOverrides.find(
      (entry) => entry.camoId === camo.id && entry.mode === mode
    )
    return override
      ? { ...camo, challenge: override.challenge, exceptionReason: override.reason }
      : camo
  })
}
