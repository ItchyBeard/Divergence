import { describe, expect, it } from 'vitest'
import weapons, { weaponsById } from '../../weapons/index'
import han from '../../weapons/assault-rifles/han-86.weapon'
import { validateWeapons, validateChallenge } from '../validate'
import { getWeaponCamos } from '../catalog'
import { getPrestigeCamos, validatePrestigeRequirement } from '../prestige'
import { camoApplicable, camoTogglePlan, sharedCompletion } from '../tracker'
import { requirementPending } from '../requirements'
import { camoText, challengeText } from '../presentation'
import { buildGallery, filterGallery } from '../gallery'
import { emptySave } from '../save'
import { weaponAvailability } from '../availability'

const copy = () => JSON.parse(JSON.stringify(han))
const now = Date.parse('2026-10-24T12:00:00Z')
const definitionSources = import.meta.glob('../../weapons/*/*.weapon.js', {
  eager: true,
  as: 'raw',
})

describe('explicit unknown numeric requirements', () => {
  it('discovers comment-free definitions without source or exception notes', () => {
    expect(Object.keys(definitionSources)).toHaveLength(weapons.length)
    for (const source of Object.values(definitionSources)) expect(source).not.toMatch(/\/\/|\/\*/)
    for (const weapon of weapons) {
      expect(weapon).not.toHaveProperty('source')
      expect(weapon.exceptions).toEqual({ challengeOverrides: [], notes: [] })
    }
  })

  it('discovers all 33 launch weapons and validates every structured challenge', () => {
    expect(weapons.length).toBeGreaterThanOrEqual(33)
    expect(validateWeapons(weapons)).toEqual([])
    expect(han.maxLevel).toBe(72)
    expect(han.specialCamos[2].unlockRequirements[0].level).toBe(72)
    expect(han.specialCamos[2].challenges.multiplayer).toMatchObject({ amount: 3, times: 15 })
    expect(challengeText(han.specialCamos[2].challenges.multiplayer)).toContain(
      '3 kills without dying against players, 15 times'
    )
    expect(
      weaponsById.m4.specialCamos.find((camo) => camo.id === 'night-ops').unlockRequirements
    ).toEqual([{ type: 'weapon_level', level: 51 }])
    expect(
      weaponsById.m4.specialCamos.find((camo) => camo.id === 'green').unlockRequirements
    ).toEqual([{ type: 'weapon_unlocks', count: 42 }])
    expect(weaponsById['vel-46'].specialCamos[0].challenges.multiplayer).toMatchObject({
      type: 'ads_kills',
      amount: 50,
      target: 'players',
    })
    expect(weaponsById['mosin-nagant'].specialCamos[1].challenges.multiplayer).toMatchObject({
      type: 'kills_without_reloading',
      amount: 2,
      times: 10,
    })
    expect(weaponsById['kg-7-vulcan'].specialCamos[0].challenges.dmz.status).toBe('unavailable')
    for (const weapon of weapons)
      for (const special of weapon.specialCamos)
        for (const challenge of Object.values(special.challenges))
          expect(validateChallenge(challenge)).toEqual([])
  })

  it('retains supplied maximums and fills missing maximums from the workbook', () => {
    expect(weaponsById.m4.maxLevel).toBe(71)
    expect(weaponsById['vel-46'].maxLevel).toBe(59)
    expect(weaponsById['astaroth-57'].maxLevel).toBe(53)
    expect(weaponsById['x-58-nyx'].maxLevel).toBe(53)
    expect(weaponsById['mojave-357'].maxLevel).toBe(43)
    expect(weaponsById['mojave-357'].maxWeaponUnlocks).toBe(43)
    expect(weaponsById['mojave-357'].specialCamos[2].unlockRequirements[0].count).toBe(31)
    expect(weaponsById['krait-p68'].specialCamos[2].unlockRequirements[0].count).toBe(34)
    expect(weaponsById['50-gs'].maxLevel).toBe(36)
    expect(weaponsById['50-gs'].specialCamos.map((camo) => camo.unlockRequirements[0])).toEqual([
      { type: 'weapon_unlocks', count: 10 },
      { type: 'weapon_unlocks', count: 21 },
      { type: 'weapon_unlocks', count: 32 },
    ])
    expect(weaponsById['type-73'].specialCamos.map((camo) => [camo.id, camo.name])).toEqual([
      ['ash-pine', 'Ash Pine'],
      ['mineral', 'Outcrop'],
      ['tiger-swipe', 'Foxtrail'],
    ])
    expect(weaponsById['type-73'].specialCamos[1].image).toBe('outcrop.png')
    expect(weaponsById['type-73'].specialCamos[2].image).toBe('foxtrail.png')
    expect(weapons.filter((weapon) => weapon.maxLevel === 999)).toEqual([])
  })

  it('accepts the sentinel in the three permitted numeric fields without imposing a fake upper bound', () => {
    const weapon = copy()
    weapon.maxLevel = 999 // TODO: VERIFY synthetic unknown maximum.
    weapon.specialCamos[0].unlockRequirements[0].level = 999 // TODO: VERIFY synthetic unknown unlock level.
    weapon.prestigeCamos[1].requirements[1].level = 999 // TODO: VERIFY synthetic unknown threshold.
    expect(validateWeapons([weapon])).toEqual([])
    weapon.militaryUnlockLevels[7] = 1200
    weapon.specialCamos[1].unlockRequirements[0].level = 1300
    expect(validateWeapons([weapon])).toEqual([])
    expect(requirementPending('999')).toBe(false)
  })

  it.each([null, undefined, 0, -1, 1.5, '999', NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])(
    'retains strict validation for invalid numeric value %s',
    (value) => {
      for (const field of ['maxLevel', 'unlockLevel', 'prestige']) {
        const weapon = copy()
        if (field === 'maxLevel') weapon.maxLevel = value
        if (field === 'unlockLevel') weapon.specialCamos[0].unlockRequirements[0].level = value
        if (field === 'prestige') weapon.prestigeCamos[1].requirements[1].level = value
        expect(validateWeapons([weapon]).length).toBeGreaterThan(0)
      }
    }
  )

  it('retains bounds on verified levels and does not allow pending Military levels', () => {
    const weapon = copy()
    weapon.specialCamos[0].unlockRequirements[0].level = 73
    expect(validateWeapons([weapon]).join(' ')).toContain('unlockRequirements')
    weapon.specialCamos[0].unlockRequirements[0].level = 999 // TODO: VERIFY synthetic unknown level.
    weapon.militaryUnlockLevels[7] = 999
    weapon.maxLevel = 999 // TODO: VERIFY synthetic unknown maximum.
    expect(validateWeapons([weapon]).join(' ')).toContain('militaryUnlockLevels')
    expect(
      validatePrestigeRequirement({ type: 'player_prestige_master_level' }).length
    ).toBeGreaterThan(0)
    expect(
      validateChallenge({ status: 'available', type: 'kills', amount: 999, target: 'players' })
    ).toEqual([])
  })

  it('preserves known challenge text but never exposes a pending level as verified in any mode or Gallery search', () => {
    for (const weapon of weapons) {
      for (const mode of ['multiplayer', 'dmz', 'warzone'])
        for (const camo of getWeaponCamos(weapon, mode)) {
          expect(camoText(camo, weapon)).not.toMatch(/Level 999/i)
          if (camo.requirementPending) {
            expect(camoApplicable(camo)).toBe(false)
            expect(camoText(camo, weapon)).toContain('Requirement pending')
          }
        }
      for (const camo of getPrestigeCamos(weapon)) {
        expect(camoText(camo, weapon)).not.toMatch(/Level 999/i)
        if (camo.requirementPending) expect(camo.challenge.status).toBe('unavailable')
      }
    }
    expect(filterGallery(buildGallery(weapons), emptySave(), { search: 'level 999', now })).toEqual(
      []
    )
    const special = getWeaponCamos(weaponsById.m4, 'multiplayer').find(
      (camo) => camo.stage === 'special'
    )
    expect(challengeText(special.challenge)).not.toContain('Unavailable')
  })

  it('includes pending Special and Completionist stages in manual progress totals', () => {
    const weapon = {
      ...weaponsById.m4,
      ...weaponAvailability(weaponsById.m4, now),
      // Pending eligibility uses synthetic conditions, independent of catalog reconciliation.
      specialCamos: weaponsById.m4.specialCamos.map((camo) => ({
        ...camo,
        unlockRequirements: [{ type: 'weapon_level', level: 999 }], // TODO: VERIFY synthetic level.
      })),
    }
    const camos = getWeaponCamos(weapon, 'multiplayer')
    const flags = Object.fromEntries(camos.map((camo) => [camo.id, true]))
    expect(sharedCompletion(weapon, camos, flags)).toEqual({ completed: 15, total: 15, ratio: 1 })
    expect(sharedCompletion({ ...weapon, available: false }, camos, flags).total).toBe(0)
    expect(weaponAvailability({ ...weapon, releaseDate: null }, now).available).toBe(false)
    const unknownMax = copy()
    unknownMax.maxLevel = 999 // TODO: VERIFY synthetic unknown maximum.
    expect(getWeaponCamos(unknownMax, 'multiplayer').filter(camoApplicable)).toHaveLength(15)
  })

  it('allows a Prestige prefix regardless of requirement information or older flags', () => {
    const rows = getPrestigeCamos(weaponsById.m4)
    // A verified later condition cannot bypass an unverified preceding condition.
    rows[2] = { ...getPrestigeCamos(han)[2] }
    expect(
      camoTogglePlan(rows, rows[2].id, { 'pyroclast-terminus': true }, true).blocked.map(
        (camo) => camo.id
      )
    ).toEqual([])
    expect(
      camoTogglePlan(rows, 'pyroclast-terminus', { 'pyroclast-terminus': true }, true).changes
    ).toEqual({
      'pyroclast-terminus': false,
      'pyroclast-scatter': false,
      'pyroclast-cascade': false,
    })
  })
})
