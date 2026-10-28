import { describe, expect, it } from 'vitest'
import weapons, { weaponsById } from '../../weapons/index'
import { validateWeapons } from '../validate'
import { getWeaponCamos } from '../catalog'
import { getPrestigeCamos } from '../prestige'

const counts = (weapon) => weapon.specialCamos.map((c) => c.unlockRequirements[0])
describe('player-reported progression import', () => {
  it('keeps count maximums distinct from level maximums and preserves documented Military units', () => {
    expect(weapons.filter((w) => w.season === 0)).toHaveLength(33)
    expect(validateWeapons(weapons)).toEqual([])
    expect(weapons.filter((w) => w.season === 0 && w.maxWeaponUnlocks !== undefined)).toHaveLength(
      28
    )
    expect(weaponsById['han-86']).toMatchObject({ maxLevel: 72, maxWeaponUnlocks: 71 })
    expect(weaponsById['50-gs']).toMatchObject({
      maxLevel: 36,
      maxWeaponUnlocks: 36,
      militaryUnlockCounts: [6, 9, 11, 14, 17, 21, 25, 28],
    })
    expect(weaponsById['mojave-357'].maxWeaponUnlocks).toBe(43)
    for (const w of weapons.filter((w) => w.season === 0 && ['launchers', 'melee'].includes(w.category))) {
      expect(w).not.toHaveProperty('maxWeaponUnlocks')
      expect(counts(w).every((c) => c.type === 'weapon_level')).toBe(true)
    }
  })
  it('matches camo identities, preserves blank cells, and retains confirmed in-game corrections', () => {
    const m4 = weaponsById.m4
    expect(m4.specialCamos.find((c) => c.id === 'green').unlockRequirements).toEqual([
      { type: 'weapon_unlocks', count: 42 },
    ])
    expect(m4.specialCamos.find((c) => c.id === 'night-ops').unlockRequirements).toEqual([
      { type: 'weapon_level', level: 51 },
    ])
    expect(
      weaponsById['mar-9'].specialCamos.find((c) => c.id === 'white').unlockRequirements
    ).toEqual([{ type: 'weapon_unlocks', count: 43 }])
    expect(weaponsById['krait-p68'].maxWeaponUnlocks).toBe(37)
    expect(weaponsById['krait-p68'].specialCamos[2].unlockRequirements).toEqual([
      { type: 'weapon_unlocks', count: 34 },
    ])
    expect(weaponsById['han-86'].specialCamos[2].challenges.multiplayer).toMatchObject({
      amount: 3,
      times: 15,
    })
  })
  it('keeps all weapon-specific Prestige thresholds, stable IDs and unpublished challenge information', () => {
    for (const w of weapons.filter((w) => w.season === 0)) {
      expect(w.prestigeCamos.map((c) => c.requirements[0])).toEqual(
        Array(4).fill({ type: 'weapon_prestige', required: true })
      )
      expect(w.prestigeCamos.slice(2).map((c) => c.requirements[1].level)).toEqual([150, 250])
      expect(getPrestigeCamos(w).map((c) => c.id)).toEqual([
        'pyroclast',
        'pyroclast-terminus',
        'pyroclast-scatter',
        'pyroclast-cascade',
      ])
      expect(
        getWeaponCamos(w, 'warzone')
          .filter((c) => c.stage === 'special')
          .every((c) => c.challenge.status === 'unavailable')
      ).toBe(true)
    }
    expect(weaponsById['vel-46'].prestigeCamos[1].requirements[1].level).toBe(61)
    expect(weaponsById['50-gs'].prestigeCamos[1].requirements[1].level).toBe(38)
  })
  it.each([0, -1, 1.5, '71', null, 999])('rejects invalid unlock maximum %s', (value) => {
    expect(
      validateWeapons([{ ...weaponsById['han-86'], maxWeaponUnlocks: value }]).join(' ')
    ).toContain('maxWeaponUnlocks')
  })
  it('validates Special counts against count maxima without equating counts with levels', () => {
    const w = JSON.parse(JSON.stringify(weaponsById['50-gs']))
    w.specialCamos[0].unlockRequirements[0].count = 37
    expect(validateWeapons([w]).join(' ')).toContain('maxWeaponUnlocks')
    w.maxWeaponUnlocks = 40
    expect(validateWeapons([w])).toEqual([])
    expect(w.maxLevel).toBe(36)
  })
})
