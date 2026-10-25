import { getPrestigeCamos } from './prestige'
import { weaponAvailability } from './availability'

// Only conditions for which the tracker has evidence may be satisfied.
export function eligiblePrestigeCamos(weapon, level, flags, now = Date.now()) {
  if (level === null || !weaponAvailability(weapon, now).available) return []
  return getPrestigeCamos(weapon)
    .filter(
      (camo) =>
        camo.id !== 'pyroclast' &&
        camo.challenge.status === 'available' &&
        camo.requirements.some((condition) => condition.type === 'player_prestige_master_level') &&
        camo.requirements.every((condition) => {
          if (condition.type === 'player_prestige_master_level')
            return condition.level !== 999 && condition.level <= level
          if (condition.type === 'weapon_prestige') return flags.pyroclast === true
          return false
        })
    )
    .map((camo) => camo.id)
}

export function applyPrestigeLevel(save, weapons, now = Date.now()) {
  for (const weapon of weapons) {
    const flags = save.prestige[weapon.id] || {}
    const owned = save.prestigeAutomatic[weapon.id] || {}
    const eligible = eligiblePrestigeCamos(weapon, save.prestigeLevel, flags, now)
    for (const [id, automatic] of Object.entries(owned)) {
      if (automatic && !eligible.includes(id)) {
        flags[id] = false
        delete owned[id]
      }
    }
    for (const id of eligible) {
      if (flags[id] !== true) {
        flags[id] = true
        owned[id] = true
      }
    }
    if (Object.keys(flags).length) save.prestige[weapon.id] = flags
    if (Object.keys(owned).length) save.prestigeAutomatic[weapon.id] = owned
    else delete save.prestigeAutomatic[weapon.id]
  }
}
