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
const confirmedSpecials = {
  'cronen-osprey': ['In The Weeds', 'Dark Ichor', 'Chained'],
  'csg-35': ['Polyhedron', 'Rind', 'Black Grip'],
}

const specialUnlockCounts = { 'cronen-osprey': [12, 23, 29], 'csg-35': [11, 20, 31] }
const categoryPeers = { 'cronen-osprey': 'han-86', 'csg-35': 'vel-46' }
const militaryUnlockCounts = {
  'cronen-osprey': [6, 10, 12, 16, 19, 22, 24, 27],
  'csg-35': [8, 10, 14, 16, 18, 22, 25, 28],
}

describe('Season 1 weapon placeholders', () => {
  it.each(newWeapons)('discovers %s and keeps unconfirmed requirements pending', (id) => {
    const weapon = weaponsById[id]
    expect(weapon).toBeDefined()
    expect(validateWeapons([weapon])).toEqual([])
    expect(weapon.maxLevel).toBe(999)
    expect(weapon).not.toHaveProperty('maxWeaponUnlocks')
    expect(
      weapon[id === 'zlr-talonhawk' ? 'militaryUnlockLevels' : 'militaryUnlockCounts']
    ).toEqual(militaryUnlockCounts[id] ?? null)
    if (specialUnlockCounts[id]) {
      expect(weapon.specialCamos.map((camo) => camo.unlockRequirements)).toEqual(
        specialUnlockCounts[id].map((count) => [{ type: 'weapon_unlocks', count }])
      )
    }
    for (const mode of modeIds) {
      const camos = getWeaponCamos(weapon, mode)
      const peer = weaponsById[categoryPeers[id]]
      const peerCamos = peer ? getWeaponCamos(peer, mode) : []
      expect(camos).toHaveLength(15)
      for (const [index, camo] of camos.entries()) {
        if (camo.award) continue
        if (camo.stage === 'completionist' && peer) {
          expect(camo).toMatchObject({
            challenge: peerCamos[index].challenge,
            prerequisite: peerCamos[index].prerequisite,
          })
          continue
        }
        if (camo.stage === 'military' && militaryUnlockCounts[id]) {
          expect(camo.challenge).toMatchObject({
            status: 'available',
            type: 'weapon_unlocks',
            amount: militaryUnlockCounts[id][index],
          })
          continue
        }
        if (mode === 'multiplayer' && camo.stage === 'special' && confirmedSpecials[id]) {
          expect(camo.challenge).toMatchObject({ status: 'available', target: 'players' })
          expect(camo.requirementPending).toBe(false)
          continue
        }
        expect(camo.challenge.status).toBe('unavailable')
        expect(camo.challenge).not.toHaveProperty('amount')
        expect(camoText(camo, weapon)).not.toMatch(/Level 999|Miri|Splinter Rock|Sunset Tropic/)
      }
      expect(camos.filter((camo) => camo.stage === 'special').map((camo) => camo.name)).toEqual(
        confirmedSpecials[id] ?? [
          'Special Camo 1 (pending)',
          'Special Camo 2 (pending)',
          'Special Camo 3 (pending)',
        ]
      )
    }
    expect(getPrestigeCamos(weapon).every((camo) => camo.challenge.status === 'unavailable')).toBe(
      true
    )
    expect(weaponAvailability(weapon, new Date(2026, 9, 28).getTime()).available).toBe(false)
  })

  it('retains season-start dates and never releases mid-season weapons on a guessed date', () => {
    for (const id of newWeapons.slice(0, 2)) {
      expect(weaponsById[id].releaseDate).toBe('2026-11-06')
      expect(weaponAvailability(weaponsById[id], new Date(2026, 10, 6).getTime())).toMatchObject({
        available: true,
        label: 'Season 1',
        releaseDateLabel: '6 Nov 2026',
      })
    }
    for (const id of newWeapons.slice(2)) {
      expect(weaponsById[id].releaseDate).toBeNull()
      expect(weaponAvailability(weaponsById[id], new Date(2027, 0, 1).getTime())).toMatchObject({
        available: false,
        reason: 'Release date unknown',
      })
    }
  })

  it('requires explicit unknown Military thresholds and still rejects missing or fabricated data', () => {
    const { militaryUnlockCounts, ...definition } = han
    const weapon = { ...definition, militaryUnlockLevels: null }
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
