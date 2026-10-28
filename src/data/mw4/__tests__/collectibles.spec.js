import { describe, expect, it } from 'vitest'
import catalog from '../../weapons/index'
import { collectibles, collectiblesById, collectionSummary } from '../collectibles'
import {
  buildCollectibleGallery,
  filterGallery,
  galleryInstances,
  galleryProgress,
  getGallery,
} from '../gallery'
import { emptySave, parseSave } from '../save'
import { camoImageUrl, camoCdnBase } from '../artwork'

describe('collectible catalogue and Gallery projections', () => {
  it('includes the entire catalogue and future weapons in one War Spoils design', () => {
    const future = { ...catalog[0], id: 'future-weapon', releaseDate: null }
    const weapons = [...catalog, future]
    const records = buildCollectibleGallery(weapons)
    const war = records.filter((record) => record.camo.id === 'war-spoils')
    expect(war).toHaveLength(1)
    const instances = galleryInstances(war[0], emptySave())
    expect(instances.map((instance) => instance.weapon.id)).toEqual(
      weapons.map((weapon) => weapon.id)
    )
    expect(galleryProgress({ ...war[0], instances })).toEqual({
      completed: 0,
      total: weapons.length,
      percent: 0,
    })
    expect(instances.some((instance) => instance.weapon.category === 'launchers')).toBe(true)
    expect(instances.some((instance) => instance.weapon.category === 'melee')).toBe(true)
  })
  it('defines six standalone designs and one weapon design with stable IDs and CDN artwork', () => {
    expect(collectibles.filter((camo) => camo.ownership === 'standalone')).toHaveLength(6)
    expect(new Set(collectibles.map((camo) => camo.id)).size).toBe(7)
    for (const camo of collectibles) {
      expect(camo.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      expect(camoImageUrl(camo)).toBe(camoCdnBase + camo.id + '.png')
      expect(camo.requirement.length).toBeGreaterThan(0)
      expect(camo.availability).toBe('unknown')
    }
    const war = collectiblesById['war-spoils']
    expect(war.requirement).toBe('Extract 3 Weapon Manuals for this weapon in DMZ.')
    expect(war.requirementVerified).toBe(false)
    expect(war.eligibility).toBe('all-weapons')
    expect(war.eligibilityBasis).toContain('assumption')
    expect(war.eligibilityComplete).toBe(true)
  })

  it('keeps a single War Spoils card with independently owned weapon instances', () => {
    // Other collections can still declare an explicit supported subset.
    const war = {
      ...collectiblesById['war-spoils'],
      eligibility: undefined,
      eligibleWeaponIds: ['50-gs', 'm4'],
    }
    const records = buildCollectibleGallery(catalog, [war])
    const save = emptySave()
    save.collectibles.perWeapon['war-spoils'] = { '50-gs': true, 'm4': false }
    expect(records).toHaveLength(1)
    const instances = galleryInstances(records[0], save)
    expect(
      Object.fromEntries(instances.map((instance) => [instance.weapon.id, instance.completed]))
    ).toEqual({ '50-gs': true, 'm4': false })
    expect(galleryProgress({ ...records[0], instances })).toEqual({
      completed: 1,
      total: 2,
      percent: 50,
    })
    save.collectibles.perWeapon['war-spoils'].m4 = true
    expect(galleryInstances(records[0], save).every((instance) => instance.completed)).toBe(true)
    expect(collectionSummary(save)).toEqual({ completed: 0, total: 6 })
  })

  it('combines collection categories, ownership, search, mode, weapon category and sorting', () => {
    const records = getGallery(catalog)
    const save = emptySave()
    save.collectibles.standalone.litmus = true
    const owned = filterGallery(records, save, { stage: 'collectibles', status: 'unlocked' })
    expect(owned.map((entry) => entry.name)).toEqual(['Litmus'])
    expect(owned[0].progress).toEqual({ completed: 1, total: 1, percent: 100 })
    expect(filterGallery(records, save, { stage: 'collectibles', status: 'locked' })).toHaveLength(
      6
    )
    expect(filterGallery(records, save, { stage: 'collectible-special' })).toHaveLength(3)
    expect(
      filterGallery(records, save, { stage: 'collectible-promotional', search: 'pre-order' })
    ).toHaveLength(2)
    expect(filterGallery(records, save, { stage: 'collectible-dmz', mode: 'multiplayer' })).toEqual(
      []
    )
    expect(filterGallery(records, save, { stage: 'collectible-dmz', mode: 'dmz' })).toHaveLength(2)
    expect(
      filterGallery(records, save, { stage: 'collectibles', category: 'pistols' }).map(
        (entry) => entry.name
      )
    ).toEqual(['War Spoils'])
    expect(
      filterGallery(records, save, { stage: 'progression' }).every(
        (entry) => entry.kind !== 'collectible'
      )
    ).toBe(true)
    const sorted = filterGallery(records, save, { stage: 'collectibles', sort: 'name' }).map(
      (entry) => entry.name
    )
    expect(sorted).toEqual([...sorted].sort((a, b) => a.localeCompare(b, 'en-GB')))
  })

  it('never invents availability or treats unknown rewards as obtainable or unobtainable', () => {
    const records = buildCollectibleGallery(catalog)
    const save = emptySave()
    expect(filterGallery(records, save, { availability: 'available' })).toEqual([])
    expect(filterGallery(records, save, { availability: 'upcoming' })).toEqual([])
    expect(filterGallery(records, save, { availability: 'unknown' })).toHaveLength(7)
    const known = buildCollectibleGallery(catalog, [
      { ...collectibles[0], availability: 'available' },
      { ...collectibles[1], availability: 'unobtainable' },
    ])
    expect(
      filterGallery(known, save, { availability: 'available' }).map((entry) => entry.name)
    ).toEqual(['Litmus'])
    expect(
      filterGallery(known, save, { availability: 'upcoming' }).map((entry) => entry.name)
    ).toEqual(['Locked Down'])
  })

  it('uses fixed Completionist targets and caps bars without hiding over-completion', () => {
    const entry = {
      stage: 'completionist',
      instances: Array.from({ length: 34 }, () => ({ completed: true })),
    }
    expect(galleryProgress(entry)).toEqual({ completed: 34, total: 33, percent: 100 })
    expect(galleryProgress({ ...entry, instances: entry.instances.slice(0, 6) })).toEqual({
      completed: 6,
      total: 33,
      percent: (100 * 6) / 33,
    })
    expect(galleryProgress({ ...entry, instances: [] })).toEqual({
      completed: 0,
      total: 33,
      percent: 0,
    })
  })
})

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
