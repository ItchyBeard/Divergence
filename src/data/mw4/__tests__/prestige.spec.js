import { describe, expect, it } from 'vitest'
import han from '../../weapons/assault-rifles/han-86.weapon'
import { prestigeCamos, getPrestigeCamos, validatePrestigeRequirement } from '../prestige'
import { validateWeapons } from '../validate'
import { camoImageUrl, camoCdnBase } from '../artwork'

const copy = () => JSON.parse(JSON.stringify(han))

// Only Prestige thresholds are confirmed for these names. These clones are test
// fixtures, not complete definitions of Knife, Rocket Launcher or VEL 46.
describe('weapon-specific Prestige requirements', () => {
  it.each([
    ['Knife', 47],
    ['Rocket Launcher', 47],
    ['VEL 46', 61],
    ['HAN 86', 73],
  ])('renders the confirmed overall player Terminus threshold for %s', (name, level) => {
    const weapon = copy()
    weapon.name = name
    weapon.prestigeCamos[1].requirements[1].level = level
    const camos = getPrestigeCamos(weapon)
    expect(validateWeapons([weapon])).toEqual([])
    expect(camos[1].challenge.description).toBe(
      'Prestige this weapon. Reach overall player Prestige Master Level ' + level + '.'
    )
    expect(camos[0].challenge.description).toBe('Prestige this weapon.')
    expect(camos.slice(1).map((camo) => camo.requirements[1].level)).toEqual([level, 150, 250])
  })

  it('stores the confirmed HAN thresholds only in its weapon file', () => {
    expect(han.prestigeCamos.slice(1).map((camo) => camo.requirements[1].level)).toEqual([
      73, 150, 250,
    ])
    expect(prestigeCamos.every((camo) => !('level' in camo) && !('requirements' in camo))).toBe(
      true
    )
  })

  it('allows future weapon-specific Scatter and Cascade thresholds without mutating another definition', () => {
    const weapon = copy()
    weapon.prestigeCamos[2].requirements[1].level = 191 // synthetic future values
    weapon.prestigeCamos[3].requirements[1].level = 333
    expect(validateWeapons([weapon])).toEqual([])
    expect(
      getPrestigeCamos(weapon)
        .slice(2)
        .map((camo) => camo.requirements[1].level)
    ).toEqual([191, 333])
    expect(
      getPrestigeCamos(han)
        .slice(2)
        .map((camo) => camo.requirements[1].level)
    ).toEqual([150, 250])
  })

  it('orders by central stable identity, resolves CDN artwork and never uses maxLevel as a requirement', () => {
    const weapon = copy()
    weapon.maxLevel = 99
    weapon.prestigeCamos.reverse()
    const before = JSON.stringify(weapon)
    const rows = getPrestigeCamos(weapon)
    expect(rows.map((camo) => camo.id)).toEqual(prestigeCamos.map((camo) => camo.id))
    expect(rows[1].challenge.description).toContain('Level 73')
    for (const row of rows) expect(camoImageUrl(row)).toBe(camoCdnBase + row.image)
    expect(JSON.stringify(weapon)).toBe(before)
  })

  it('retains known conditions alongside explicit unavailable requirements', () => {
    const weapon = copy()
    weapon.prestigeCamos[1].requirements[1] = {
      type: 'unavailable',
      reason: 'Player threshold not published.',
    }
    expect(validateWeapons([weapon])).toEqual([])
    const row = getPrestigeCamos(weapon)[1]
    expect(row.challenge.status).toBe('unavailable')
    expect(row.challenge.reason).toBe('Prestige this weapon. Player threshold not published.')
    expect(row.challenge).not.toHaveProperty('amount')
  })

  it('supports documented future structured conditions without registering a new type', () => {
    const weapon = copy()
    weapon.prestigeCamos[1].requirements.push({
      type: 'documented_challenge',
      description: 'Complete the documented challenge.',
      parameters: { amount: 20, objective: 'test_objective', restrictions: ['test-only'] },
    })
    weapon.prestigeCamos[1].requirements.push({ type: 'player_level', level: 55 })
    expect(validateWeapons([weapon])).toEqual([])
    const row = getPrestigeCamos(weapon)[1]
    expect(row.challenge.status).toBe('available')
    expect(row.challenge.description).toContain(
      'Complete the documented challenge. Reach overall player Level 55.'
    )
  })

  it.each([
    undefined,
    null,
    [],
    {},
    { type: 'weapon_prestige' },
    { type: 'weapon_prestige', required: false },
    { type: 'weapon_prestige', required: true, level: 73 },
    { type: 'player_prestige_master_level', level: 0 },
    { type: 'player_prestige_master_level', level: -2 },
    { type: 'player_prestige_master_level', level: 2.5 },
    { type: 'player_prestige_master_level', level: '73' },
    { type: 'player_prestige_master_level' },
    { type: 'unavailable' },
    { type: 'unavailable', reason: ' ' },
    { type: 'unavailable', reason: 'Unknown.', level: 73 },
    { type: 'future_challenge' },
    { type: 'future_challenge', description: 'A challenge.', parameters: {} },
    { type: 'future_challenge', description: 'A challenge.', parameters: { count: NaN } },
  ])('rejects malformed conditions: %j', (condition) => {
    expect(validatePrestigeRequirement(condition).length).toBeGreaterThan(0)
    const weapon = copy()
    weapon.prestigeCamos[0].requirements = [condition]
    expect(validateWeapons([weapon]).join(' ')).toContain('prestigeCamos[0].requirements[0]')
    expect(getPrestigeCamos(weapon)[0].challenge.status).toBe('unavailable')
  })

  it.each([
    (weapon) => {
      delete weapon.prestigeCamos
    },
    (weapon) => {
      weapon.prestigeCamos.pop()
    },
    (weapon) => {
      weapon.prestigeCamos.push(weapon.prestigeCamos[0])
    },
    (weapon) => {
      weapon.prestigeCamos[1].id = 'pyroclast'
    },
    (weapon) => {
      weapon.prestigeCamos[1].id = 'unknown-camo'
    },
    (weapon) => {
      weapon.prestigeCamos[1] = null
    },
    (weapon) => {
      delete weapon.prestigeCamos[1].requirements
    },
    (weapon) => {
      weapon.prestigeCamos[1].requirements = []
    },
    (weapon) => {
      weapon.prestigeCamos[1].requirements = {}
    },
  ])('rejects missing, duplicate, unrecognised or malformed Prestige entries', (mutate) => {
    const weapon = copy()
    mutate(weapon)
    expect(validateWeapons([weapon]).join(' ')).toContain('prestigeCamos')
  })
})
