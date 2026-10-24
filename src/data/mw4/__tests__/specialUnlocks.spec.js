import { describe, expect, it } from 'vitest'
import han from '../../weapons/assault-rifles/han-86.weapon'
import weapons from '../../weapons/index'
import { getWeaponCamos } from '../catalog'
import { validateWeapons } from '../validate'
import { specialUnlockRequirements, specialUnlockPending } from '../requirements'
import { camoText, camoRequirementRows, prerequisiteText } from '../presentation'
import { camoTogglePlan, camoApplicable } from '../tracker'
import { buildGallery, filterGallery } from '../gallery'
import { emptySave, parseSave } from '../save'

const copy = () => JSON.parse(JSON.stringify(han))
const smoke = (weapon, mode = 'multiplayer') =>
  getWeaponCamos(weapon, mode).find((camo) => camo.id === 'smoke')

describe('structured Special unlock prerequisites', () => {
  it('migrates every production Special without legacy level fields or changing Red repetitions', () => {
    for (const weapon of weapons)
      for (const camo of weapon.specialCamos) {
        expect(camo).not.toHaveProperty('unlockLevel')
        expect(camo.unlockRequirements.length).toBeGreaterThan(0)
      }
    expect(validateWeapons(weapons)).toEqual([])
    expect(han.specialCamos[2].challenges.multiplayer).toMatchObject({ amount: 3, times: 15 })
  })

  it('keeps unlock counts separate from level caps and mode-specific objectives', () => {
    const weapon = copy()
    weapon.maxWeaponUnlocks = 100 // Synthetic count cap, independent of maxLevel: 72.
    weapon.specialCamos[0].unlockRequirements = [{ type: 'weapon_unlocks', count: 80 }]
    expect(validateWeapons([weapon])).toEqual([]) // A count is not constrained by maxLevel: 72.
    const mp = smoke(weapon)
    expect(camoRequirementRows(mp, weapon)).toEqual([
      { label: 'Unlock', text: 'Earn 80 weapon unlocks using the HAN 86.' },
      { label: 'Challenge', text: '20 kills while mounted against players' },
    ])
    expect(smoke(weapon, 'dmz').challenge.amount).toBe(75)
    expect(smoke(weapon, 'warzone').challenge.status).toBe('unavailable')
    expect(prerequisiteText(smoke(weapon, 'warzone'), weapon)).toBe(prerequisiteText(mp, weapon))
    const gallery = buildGallery([weapon])
    expect(
      filterGallery(gallery, emptySave(), { search: '80 weapon unlocks' }).map(
        (entry) => entry.name
      )
    ).toEqual(['Smoke'])
  })

  it('supports multiple conditions without inferring completion', () => {
    const weapon = copy()
    weapon.specialCamos[0].unlockRequirements = [
      { type: 'weapon_unlocks', count: 12 },
      { type: 'weapon_level', level: 25 },
    ]
    expect(validateWeapons([weapon])).toEqual([])
    expect(camoText(smoke(weapon), weapon)).toContain(
      'Earn 12 weapon unlocks using the HAN 86. Reach Weapon Level 25.'
    )
    expect(smoke(weapon)).not.toHaveProperty('completed')
    expect(camoApplicable(smoke(weapon))).toBe(true)
    expect(camoTogglePlan(getWeaponCamos(weapon, 'multiplayer'), 'gold', {}).changes.gold).toBe(
      true
    )
  })

  it.each([
    { type: 'weapon_unlocks', count: 999 }, // TODO: VERIFY synthetic unlock count.
    { type: 'weapon_level', level: 999 }, // TODO: VERIFY synthetic level.
    { type: 'unavailable', reason: 'Requirement pending.' },
  ])(
    'keeps %j informationally unavailable, permits prefixes and preserves existing flags for undo',
    (condition) => {
      const weapon = copy()
      weapon.specialCamos[0].unlockRequirements = [condition]
      expect(validateWeapons([weapon])).toEqual([])
      const rows = getWeaponCamos(weapon, 'multiplayer')
      const camo = smoke(weapon)
      expect(camoApplicable(camo)).toBe(false)
      expect(camoText(camo, weapon)).toContain('Requirement pending')
      expect(camoText(camo, weapon)).not.toContain('999')
      const save = emptySave()
      save.weapons[weapon.id] = { sharedCamos: { smoke: true, gold: true } }
      const restored = parseSave(JSON.stringify(save))
      const flags = restored.weapons[weapon.id].sharedCamos
      expect(flags).toEqual({ smoke: true, gold: true })
      expect(camoTogglePlan(rows, 'platinum', flags).blocked).toEqual([])
      expect(camoTogglePlan(rows, 'platinum', flags).changes).toMatchObject({
        smoke: true,
        platinum: true,
      })
      expect(camoTogglePlan(rows, 'smoke', flags)).toEqual({
        changes: { smoke: false },
        blocked: [],
      })
    }
  )

  it.each(
    [
      [],
      null,
      {},
      [null],
      [[]],
      [{ type: 'weapon_unlocks' }],
      [{ type: 'weapon_unlocks', count: 0 }],
      [{ type: 'weapon_unlocks', count: -1 }],
      [{ type: 'weapon_unlocks', count: '999' }],
      [{ type: 'weapon_unlocks', count: 1.5 }],
      [{ type: 'weapon_unlocks', count: Infinity }],
      [{ type: 'weapon_unlocks', count: Number.MAX_SAFE_INTEGER + 1 }],
      [{ type: 'weapon_level', level: 73 }],
      [{ type: 'weapon_level', level: null }],
      [{ type: 'weapon_level', count: 25 }],
      [{ type: 'unavailable' }],
      [{ type: 'unavailable', reason: '' }],
      [{ type: 'unavailable', reason: 'Pending', count: 0 }],
      [{ type: 'invented', count: 12 }],
      [{ type: 'weapon_unlocks', count: 12, automatic: true }],
    ].map((requirements) => [requirements])
  )('rejects malformed or unsupported prerequisites %j', (requirements) => {
    const weapon = copy()
    weapon.specialCamos[0].unlockRequirements = requirements
    expect(validateWeapons([weapon]).join(' ')).toContain('unlockRequirements')
  })

  it('reads legacy definitions but always prefers new structured prerequisites', () => {
    const weapon = copy()
    const camo = weapon.specialCamos[0]
    delete camo.unlockRequirements
    camo.unlockLevel = 25
    expect(validateWeapons([weapon])).toEqual([])
    expect(specialUnlockRequirements(camo)).toEqual([{ type: 'weapon_level', level: 25 }])
    expect(prerequisiteText(smoke(weapon), weapon)).toBe('Reach Weapon Level 25.')
    camo.unlockRequirements = [{ type: 'weapon_unlocks', count: 999 }] // TODO: VERIFY synthetic count.
    expect(specialUnlockPending(camo)).toBe(true)
    expect(camoText(smoke(weapon), weapon)).toContain('Requirement pending')
    expect(camoText(smoke(weapon), weapon)).not.toContain('Level 25')
    delete camo.unlockLevel
    delete camo.unlockRequirements
    expect(validateWeapons([weapon]).join(' ')).toContain('unlockRequirements')
  })
})
