import { describe, expect, it } from 'vitest'
import weapon from '../../weapons/pistols/50-gs.weapon'
import han from '../../weapons/assault-rifles/han-86.weapon'
import { getWeaponCamos } from '../catalog'
import { getPrestigeCamos } from '../prestige'
import { validateWeapons } from '../validate'
import { camoText, challengeText } from '../presentation'
import { camoTogglePlan } from '../tracker'

const counts = [6, 9, 11, 14, 17, 21, 25, 28]
const copy = () => JSON.parse(JSON.stringify(weapon))

describe('confirmed .50 GS unlock-count semantics', () => {
  it('keeps weapon maximum, Military counts, Special counts and player level distinct', () => {
    expect(validateWeapons([weapon])).toEqual([])
    expect(weapon.maxLevel).toBe(36)
    expect(weapon).not.toHaveProperty('militaryUnlockLevels')
    expect(weapon.militaryUnlockCounts).toEqual(counts)
    expect(weapon.specialCamos.map((camo) => camo.unlockRequirements)).toEqual(
      [10, 21, 32].map((count) => [{ type: 'weapon_unlocks', count }])
    )
    expect(weapon.prestigeCamos.slice(1).map((camo) => camo.requirements[1].level)).toEqual([
      38, 150, 250,
    ])
    expect(getPrestigeCamos(weapon)[1].challenge.description).toContain(
      'overall player Prestige Master Level 38'
    )
    expect(
      getPrestigeCamos(weapon)
        .slice(2)
        .every((camo) => !camo.requirementPending)
    ).toBe(true)
  })

  it.each(['multiplayer', 'dmz', 'warzone'])(
    'projects exact counts without a level offset in %s',
    (mode) => {
      const rows = getWeaponCamos(weapon, mode)
      expect(rows.slice(0, 8).map((camo) => camo.challenge)).toEqual(
        counts.map((amount) => ({
          status: 'available',
          type: 'weapon_unlocks',
          amount,
          target: 'weapon',
        }))
      )
      expect(challengeText(rows[7].challenge)).toBe('Earn 28 weapon unlocks')
      expect(camoText(rows[7], weapon)).not.toContain('Level')
      expect(camoText(rows[10], weapon)).toContain('Earn 32 weapon unlocks using the .50 GS.')
      expect(camoTogglePlan(rows, 'military-8', {}).changes).toEqual(
        Object.fromEntries(rows.slice(0, 8).map((camo) => [camo.id, true]))
      )
      expect(getWeaponCamos(han, mode)[0].challenge).toMatchObject({
        type: 'weapon_level',
        amount: 10,
      })
    }
  )

  it('rejects ambiguous units and keeps counts independent from maximum weapon level', () => {
    const ambiguous = { ...copy(), militaryUnlockLevels: han.militaryUnlockLevels }
    expect(validateWeapons([ambiguous]).join(' ')).toContain('not both')
    const highCount = copy()
    highCount.militaryUnlockCounts[7] = 80
    expect(validateWeapons([highCount])).toEqual([])
  })

  it.each(
    [
      [6, 9, 11],
      [6, 9, 11, 14, 17, 21, 25, 999],
      [0, 9, 11, 14, 17, 21, 25, 28],
      [6, 9, 11, 14, 17, 21, 25, 25],
      [6, 9, 11, 14, 17, 21, 25, '28'],
      [6, 9, 11, 14, 17, 21, 25, 28.5],
      [6, 9, 11, 14, 17, 21, 25, Infinity],
      [6, 9, 11, 14, 17, 21, 25, -28],
    ].map((values) => [values])
  )('rejects invalid Military unlock counts %j', (values) => {
    const value = copy()
    value.militaryUnlockCounts = values
    expect(validateWeapons([value]).join(' ')).toContain('militaryUnlockCounts')
  })
})
