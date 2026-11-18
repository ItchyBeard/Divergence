import { describe, expect, it } from 'vitest'
import { emptySave, parseSave } from '../save'

describe('collectible v1 save compatibility', () => {
  it('round-trips all ownership independently and retains future stable IDs', () => {
    const save = emptySave()
    save.weapons.m4 = { sharedCamos: { gold: true } }
    save.collectibles.standalone = { 'litmus': true, 'hajin': false, 'future-camo': true }
    save.collectibles.perWeapon = {
      'war-spoils': { '50-gs': true, 'm4': false, 'future-weapon': true },
    }
    expect(parseSave(JSON.stringify(save))).toEqual(save)
  })
  it('imports old exports without altering their flags or mutating the original', () => {
    const old = emptySave()
    delete old.collectibles
    old.weapons.m4 = { sharedCamos: { gold: true, platinum: true } }
    const before = JSON.stringify(old)
    const parsed = parseSave(old)
    expect(parsed.collectibles).toEqual({ standalone: {}, perWeapon: {} })
    expect(parsed.weapons).toEqual(old.weapons)
    expect(JSON.stringify(old)).toBe(before)
    expect(parsed.version).toBe(1)
  })
  it.each([
    null,
    {},
    { standalone: { litmus: 1 }, perWeapon: {} },
    { standalone: {}, perWeapon: { 'war-spoils': { m4: 'true' } } },
    { standalone: {}, perWeapon: {}, extractedManuals: 3 },
  ])('rejects malformed collection records before import: %j', (collectibles) => {
    expect(() => parseSave({ ...emptySave(), collectibles })).toThrow('invalid collectible records')
  })
})
