import { describe, expect, it } from 'vitest'
import weapons, { weaponsById } from '../../weapons/index'
import { getWeaponCamos } from '../catalog'
import { challengeText } from '../presentation'
import { validateChallenge } from '../validate'

const warzoneCamo = (weaponId, camoId) =>
  getWeaponCamos(weaponsById[weaponId], 'warzone').find((camo) => camo.id === camoId)

describe('Warzone camo requirements', () => {
  it.each([
    [
      'kastov-762',
      'samnim',
      'kills_without_dying',
      3,
      null,
      5,
      'Get 3 kills without dying 5 times',
    ],
    [
      'iso-nightshade',
      'black-topo',
      'rapid_kills',
      2,
      null,
      5,
      'Get 2 kills within 10 seconds 5 times',
    ],
    ['ppsh-41', 'blackwell', 'rapid_kills', 2, null, 5, 'Get 2 kills within 10 seconds 5 times'],
    ['type-73', 'mineral', 'rapid_kills', 2, null, 5, 'Get 2 kills within 10 seconds 5 times'],
    ['pila', 'sandwash', 'rapid_kills', 2, null, 3, 'Get 2 kills within 10 seconds 3 times'],
    ['krait-p68', 'off-grid', 'sliding_kills', 10, null, undefined, 'Get 10 sliding kills'],
    [
      'finn-lmg',
      'desert-tactics',
      'point_blank_kills',
      10,
      'players',
      undefined,
      'Get 10 point blank kills against Players',
    ],
    [
      'finn-lmg',
      'green-tiger',
      'kills_without_reloading',
      2,
      'players',
      5,
      'Get 2 Kills without Reloading 5 times against Players',
    ],
    [
      'type-73',
      'tiger-swipe',
      'headshots',
      20,
      'players',
      undefined,
      'Get 20 headshot kills against players',
    ],
  ])(
    'uses the in-game objective for %s / %s',
    (weaponId, camoId, type, amount, target, times, text) => {
      const { challenge } = warzoneCamo(weaponId, camoId)
      expect(challenge).toEqual({
        status: 'available',
        type,
        amount,
        target,
        ...(times === undefined ? {} : { times }),
        description: text,
      })
      expect(challengeText(challenge)).toBe(text)
      if (target === null) {
        expect(validateChallenge({ ...challenge, description: '' })).not.toEqual([])
      }
    }
  )

  it('maps available Special challenges and preserves the exact pending slots', () => {
    const unavailable = []
    for (const weapon of weapons) {
      const specials = getWeaponCamos(weapon, 'warzone').filter((camo) => camo.stage === 'special')
      expect(specials.map((camo) => [camo.id, camo.name])).toEqual(
        weapon.specialCamos.map((camo) => [camo.id, camo.name])
      )
      for (const camo of specials) {
        expect(validateChallenge(camo.challenge)).toEqual([])
        if (camo.challenge.status === 'unavailable') {
          expect(camo.challenge).not.toHaveProperty('amount')
          unavailable.push(weapon.id + '/' + camo.id)
        }
      }
    }
    expect(unavailable).toEqual([
      'warlord/corrupted-clay',
      'jak-12/special-1',
      'jak-12/special-2',
      'jak-12/special-3',
      '50-gs/splatter-ops',
      'jokr/thicket',
      'zlr-talonhawk/special-1',
      'zlr-talonhawk/special-2',
      'zlr-talonhawk/special-3',
    ])
  })

  it('preserves timed, attachment and equipment objectives in the displayed text', () => {
    expect(challengeText(warzoneCamo('signal-50', 'anaconda').challenge)).toBe(
      'Get 2 player kills within 5 seconds 5 times'
    )
    expect(challengeText(warzoneCamo('axion', 'sunset-tropic').challenge)).toBe(
      'Get 10 player kills with the Miri 40mm Grenade Launcher'
    )
    expect(challengeText(warzoneCamo('pila', 'digital-fall').challenge)).toBe(
      'Destroy 15 killstreaks or enemy vehicles'
    )
  })

  it('projects category objectives without changing prerequisites or pending weapon overrides', () => {
    const unavailable = []
    for (const weapon of weapons) {
      const mp = getWeaponCamos(weapon, 'multiplayer')
      for (const [index, camo] of getWeaponCamos(weapon, 'warzone').entries()) {
        if (camo.stage !== 'completionist') continue
        expect(camo.prerequisite).toEqual(mp[index].prerequisite)
        if (camo.award) {
          expect(camo.id).toBe('divergence')
          expect(camo).not.toHaveProperty('challenge')
        } else if (camo.challenge.status === 'unavailable') {
          unavailable.push(weapon.id + '/' + camo.id)
        } else {
          expect(validateChallenge(camo.challenge)).toEqual([])
        }
      }
    }
    expect(unavailable).toEqual([
      'rezi-12/platinum',
      'warlord/platinum',
      'jak-12/gold',
      'jak-12/platinum',
      'jak-12/harmonic-break',
      'zlr-talonhawk/gold',
      'zlr-talonhawk/platinum',
      'zlr-talonhawk/harmonic-break',
    ])
    expect(warzoneCamo('pila', 'gold').challenge).toMatchObject({
      type: 'kills_in_match',
      amount: 8,
      target: 'players',
    })
    expect(warzoneCamo('han-86', 'harmonic-break').challenge).toMatchObject({
      type: 'rapid_kills',
      amount: 2,
      target: 'players',
      times: 15,
      description: 'Get 2 player kills within 10 seconds 15 times',
    })
    expect(warzoneCamo('mar-9', 'harmonic-break').challenge).toMatchObject({
      type: 'kills_without_damage_from_target',
      amount: 45,
      target: 'players',
    })
  })
})
