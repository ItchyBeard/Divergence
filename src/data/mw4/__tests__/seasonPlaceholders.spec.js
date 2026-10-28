import { describe, expect, it } from 'vitest'
import { weaponsById } from '../../weapons/index'
import { validateWeapons } from '../validate'
import { getWeaponCamos } from '../catalog'
import { getPrestigeCamos } from '../prestige'
import { modeIds } from '../modes'
import { weaponAvailability } from '../availability'
import { camoText } from '../presentation'
import han from '../../weapons/assault-rifles/han-86.weapon'

const newWeapons = ['cronen-osprey', 'csg-35', 'jak-12', 'zlr-talonhawk']

describe('Season 1 weapon placeholders', () => {
  it.each(newWeapons)('discovers %s with unpublished challenges in every mode', (id) => {
    const weapon = weaponsById[id]
    expect(weapon).toBeDefined()
    expect(validateWeapons([weapon])).toEqual([])
    expect(weapon.maxLevel).toBe(999)
    expect(weapon).not.toHaveProperty('maxWeaponUnlocks')
    expect(weapon.militaryUnlockLevels).toBeNull()
    for (const mode of modeIds) {
      const camos = getWeaponCamos(weapon, mode)
      expect(camos).toHaveLength(15)
      for (const camo of camos.filter((camo) => !camo.award)) {
        expect(camo.challenge.status).toBe('unavailable')
        expect(camo.challenge).not.toHaveProperty('amount')
        expect(camoText(camo, weapon)).not.toMatch(/Level 999|Miri|Splinter Rock|Sunset Tropic/)
      }
      expect(camos.filter((camo) => camo.stage === 'special').map((camo) => camo.name)).toEqual([
        'Special Camo 1 (pending)', 'Special Camo 2 (pending)', 'Special Camo 3 (pending)',
      ])
    }
    expect(getPrestigeCamos(weapon).every((camo) => camo.challenge.status === 'unavailable')).toBe(true)
    expect(weaponAvailability(weapon, new Date(2026, 9, 28).getTime()).available).toBe(false)
  })

  it('retains season-start dates and never releases mid-season weapons on a guessed date', () => {
    for (const id of newWeapons.slice(0, 2)) {
      expect(weaponsById[id].releaseDate).toBe('2026-11-06')
      expect(weaponAvailability(weaponsById[id], new Date(2026, 10, 6).getTime()).available).toBe(true)
    }
    for (const id of newWeapons.slice(2)) {
      expect(weaponsById[id].releaseDate).toBeNull()
      expect(weaponAvailability(weaponsById[id], new Date(2027, 0, 1).getTime())).toMatchObject({
        available: false, reason: 'Release date unknown',
      })
    }
  })

  it('requires explicit unknown Military thresholds and still rejects missing or fabricated data', () => {
    const weapon = { ...han, militaryUnlockLevels: null }
    expect(validateWeapons([weapon])).toEqual([])
    expect(getWeaponCamos(weapon, 'multiplayer')[0].challenge.status).toBe('unavailable')
    delete weapon.militaryUnlockLevels
    expect(validateWeapons([weapon]).join(' ')).toContain('militaryUnlockLevels')
    for (const levels of [[], [10], Array(8).fill(999)]) {
      weapon.militaryUnlockLevels = levels
      expect(validateWeapons([weapon]).join(' ')).toContain('militaryUnlockLevels')
    }
    weapon.militaryUnlockLevels = null
    weapon.militaryUnlockCounts = null
    expect(validateWeapons([weapon]).join(' ')).toContain('not both')
  })
})
