import { describe, expect, it, vi } from 'vitest'
import { computed, reactive } from 'vue'
import han from '../../weapons/assault-rifles/han-86.weapon'
import {
  buildGallery,
  getGallery,
  filterGallery,
  galleryInstances,
  galleryWeaponLocation,
} from '../gallery'
import { emptySave, parseSave } from '../save'
import { modes } from '../modes'
import { camoImageUrl, camoCdnBase } from '../artwork'

const now = new Date('2026-10-24T12:00:00').getTime()
const copy = (patch = {}) => ({
  ...JSON.parse(JSON.stringify(han)),
  id: 'test-weapon',
  name: 'Test Weapon',
  ...patch,
})
const find = (records, id) => records.find((record) => record.camo.id === id)

describe('derived Camo Gallery', () => {
  it('keeps unrelated designs separate when both lack confirmed artwork', () => {
    const first = copy({ id: 'first-weapon' })
    const second = copy({ id: 'second-weapon' })
    first.specialCamos[0] = { ...first.specialCamos[0], id: 'pending-a', image: null }
    second.specialCamos[0] = { ...second.specialCamos[0], id: 'pending-b', image: null }
    const records = buildGallery([first, second])
    const a = find(records, 'pending-a')
    const b = find(records, 'pending-b')
    expect(a).toBeDefined()
    expect(b).toBeDefined()
    expect(a.key).not.toBe(b.key)
    expect(a.associations.every((association) => association.weapon.id === 'first-weapon')).toBe(true)
    expect(b.associations.every((association) => association.weapon.id === 'second-weapon')).toBe(true)
  })
  it('defaults to A–Z and sorts completion fractions with alphabetical ties', () => {
    const all = buildGallery([han, copy()])
    const records = ['smoke', 'military-1', 'gold'].map((id) => find(all, id))
    const save = emptySave()
    save.weapons['han-86'] = { sharedCamos: { smoke: true, gold: true } }
    const names = (sort) => filterGallery(records, save, { now, sort }).map((record) => record.name)
    expect(names()).toEqual(['Gold', 'Military Camo 1', 'Smoke'])
    expect(names('name-desc')).toEqual(['Smoke', 'Military Camo 1', 'Gold'])
    // Smoke is 1/2; Gold is 1/33. Raw unlocked counts must not tie them.
    expect(names('progress-desc')).toEqual(['Smoke', 'Gold', 'Military Camo 1'])
    expect(names('progress-asc')).toEqual(['Military Camo 1', 'Gold', 'Smoke'])
    expect(names('stage')).toEqual(records.map((record) => record.name))
    save.weapons = {}
    expect(names('progress-desc')).toEqual(names())
    expect(names('progress-asc')).toEqual(names())
  })
  it('reuses design metadata across visits while keeping completion reactive and unrelated preferences cached', () => {
    const catalog = [han, copy()]
    const records = getGallery(catalog)
    expect(getGallery(catalog)).toBe(records)
    expect(getGallery([...catalog])).not.toBe(records)
    const save = reactive(emptySave())
    const project = vi.fn(() => filterGallery(records, save, { now }))
    const entries = computed(project)
    const before = entries.value
    save.preferences.layout = 'table'
    save.favorites.push('han-86')
    expect(entries.value).toBe(before)
    expect(project).toHaveBeenCalledTimes(1)
    save.weapons['han-86'] = { sharedCamos: { smoke: true } }
    expect(find(entries.value, 'smoke').instances[0].completed).toBe(true)
    expect(getGallery(catalog)).toBe(records)
    expect(project).toHaveBeenCalledTimes(2)
  })

  it('rejects static search/category/mode mismatches before reading any progress', () => {
    const records = getGallery([han])
    const unreadable = new Proxy(
      {},
      {
        get() {
          throw new Error('Unnecessary progress read')
        },
      }
    )
    expect(
      filterGallery(records, unreadable, { stage: 'special', search: 'no-such-camo' })
    ).toEqual([])
    expect(filterGallery(records, unreadable, { category: 'sniper-rifles', mode: 'dmz' })).toEqual(
      []
    )
  })

  it('refreshes seasonal availability after a release date despite cached Gallery metadata', () => {
    const catalog = [copy({ season: 2, releaseDate: '2027-01-01' })]
    const records = getGallery(catalog)
    expect(
      filterGallery(records, emptySave(), { now, stage: 'military', availability: 'available' })
    ).toEqual([])
    expect(
      filterGallery(records, emptySave(), {
        now: Date.parse('2027-01-02'),
        stage: 'military',
        availability: 'available',
      })
    ).toHaveLength(8)
    expect(getGallery(catalog)).toBe(records)
  })

  it('projects all 28 known designs without a second catalog or duplicate mode tiles', () => {
    const records = buildGallery([han])
    expect(records).toHaveLength(28)
    expect(new Set(records.map((record) => record.key)).size).toBe(28)
    expect(find(records, 'military-1').associations).toHaveLength(3)
    expect(find(records, 'smoke').associations[0].weapon.id).toBe('han-86')
    expect(records.slice(0, 8).every((record) => record.stage === 'military')).toBe(true)
  })
  it('merges shared designs across weapons while retaining individual weapon flags', () => {
    const other = copy()
    const records = buildGallery([han, other])
    const save = emptySave()
    save.weapons['han-86'] = { sharedCamos: { smoke: true } }
    expect(records).toHaveLength(28)
    expect(
      galleryInstances(find(records, 'smoke'), save, { now }).map((instance) => [
        instance.weapon.id,
        instance.completed,
      ])
    ).toEqual([
      ['han-86', true],
      ['test-weapon', false],
    ])
  })
  it('uses canonical artwork for aliases, but never merges equal names with distinct artwork', () => {
    const other = copy()
    other.specialCamos[0].image = 'test-distinct.png'
    const distinct = buildGallery([han, other])
    expect(distinct.filter((record) => record.name === 'Smoke')).toHaveLength(2)
    other.specialCamos[0].id = 'test-alias'
    other.specialCamos[0].image = 'smoke.png'
    const aliases = buildGallery([han, other])
    expect(aliases.filter((record) => record.name === 'Smoke')).toHaveLength(1)
    const save = emptySave()
    save.weapons['test-weapon'] = { sharedCamos: { 'test-alias': true } }
    const instances = galleryInstances(find(aliases, 'smoke'), save, { now })
    expect(instances.map((instance) => instance.completed)).toEqual([false, true])
    expect(galleryWeaponLocation(instances[1].associations[0]).query.camo).toBe('test-alias')
  })
  it('keeps per-mode requirements and shared completion, Prestige and global mastery separate', () => {
    const records = buildGallery([han]),
      save = emptySave()
    save.weapons['han-86'] = { sharedCamos: { smoke: true } }
    save.prestige['han-86'] = { pyroclast: true }
    save.mastery.dmz.chiral = true
    for (const mode of ['multiplayer', 'dmz', 'warzone']) {
      const instance = galleryInstances(find(records, 'smoke'), save, { mode, now })[0]
      expect(instance.completed).toBe(true)
      expect(instance.associations).toHaveLength(1)
      expect(instance.associations[0].camo.challenge).toEqual(han.specialCamos[0].challenges[mode])
    }
    expect(galleryInstances(find(records, 'pyroclast'), save)[0].completed).toBe(true)
    expect(galleryInstances(find(records, 'pyroclast-terminus'), save)[0].completed).toBe(false)
    expect(galleryInstances(find(records, 'chiral'), save)[0].completed).toBe(true)
    expect(galleryInstances(find(records, 'mercurial-drift'), save)[0].completed).toBe(false)
  })
  it('combines mode, category, status, stage and documented challenge searches', () => {
    const other = copy({ category: 'submachine-guns' })
    const records = buildGallery([han, other]),
      save = emptySave()
    save.weapons['han-86'] = { sharedCamos: { smoke: true } }
    const filtered = filterGallery(records, save, {
      now,
      stage: 'special',
      category: 'assault-rifles',
      mode: 'dmz',
      status: 'unlocked',
      availability: 'available',
      search: '75 kills while mounted',
    })
    expect(filtered.map((record) => record.name)).toEqual(['Smoke'])
    expect(
      filterGallery(records, save, { now, mode: 'warzone', search: '75 kills while mounted' })
    ).toEqual([])
    expect(
      filterGallery(records, save, { now, search: 'Test Weapon' }).some(
        (record) => record.name === 'Smoke'
      )
    ).toBe(true)
    expect(
      filterGallery(records, save, { now, search: 'Submachine Guns' }).every(
        (record) => record.stage !== 'mastery'
      )
    ).toBe(true)
    expect(
      filterGallery(records, save, { now, status: 'locked', stage: 'special' }).map(
        (record) => record.name
      )
    ).toContain('Smoke') // still locked on another weapon
    const alphabetical = filterGallery(records, save, { now, sort: 'name' }).map(
      (record) => record.name
    )
    expect(alphabetical).toEqual([...alphabetical].sort((a, b) => a.localeCompare(b, 'en-GB')))
  })
  it('preserves release dates, unknown and delayed weapons without guessing availability', () => {
    const future = copy({ id: 'test-future', season: 2, releaseDate: '2027-01-01' })
    const unknown = copy({ id: 'test-unknown', season: 3, releaseDate: null })
    const delayed = copy({ id: 'test-delayed', season: 1, releaseStatus: 'delayed' })
    const record = find(buildGallery([han, future, unknown, delayed]), 'smoke')
    const instances = galleryInstances(record, emptySave(), { now })
    expect(instances.map((instance) => instance.available)).toEqual([true, false, false, false])
    expect(instances[1].label).toContain('Season 2')
    expect(instances[2].label).toContain('Coming Soon')
    expect(
      galleryInstances(record, emptySave(), { now: new Date('2028-01-01').getTime() }).map(
        (instance) => instance.available
      )
    ).toEqual([true, true, false, false])
    expect(filterGallery([record], emptySave(), { now, availability: 'upcoming' })).toHaveLength(1)
  })
  it('keeps unpublished Warzone requirements explicit and filters meaningful availability', () => {
    const records = buildGallery([han]),
      save = emptySave()
    const smoke = find(records, 'smoke')
    expect(galleryInstances(smoke, save, { mode: 'warzone', now })[0].available).toBe(false)
    expect(
      filterGallery(records, save, {
        now,
        mode: 'warzone',
        stage: 'mastery',
        availability: 'upcoming',
      })
    ).toHaveLength(3)
    expect(
      filterGallery(records, save, {
        now,
        mode: 'warzone',
        stage: 'mastery',
        availability: 'available',
      })
    ).toHaveLength(0)
  })
  it('builds existing tracker destinations with the correct weapon/camo IDs and mode', () => {
    const records = buildGallery([han])
    expect(galleryWeaponLocation(find(records, 'smoke').associations[1])).toEqual({
      path: '/dmz',
      query: { weapon: 'han-86', camo: 'smoke' },
    })
    expect(galleryWeaponLocation(find(records, 'pyroclast').associations[0]).path).toBe('/prestige')
    expect(galleryWeaponLocation(find(records, 'chiral').associations[0])).toEqual({
      path: '/mastery',
      query: { mode: 'dmz', camo: 'chiral' },
    })
  })
  it('never writes progress or adds a Gallery save structure, including old v1 saves', () => {
    const previous = emptySave()
    delete previous.prestige
    const save = parseSave(previous),
      before = JSON.stringify(save)
    const records = buildGallery([han])
    filterGallery(records, save, { now, status: 'locked' })
    galleryInstances(find(records, 'pyroclast'), save, { now })
    expect(JSON.stringify(save)).toBe(before)
    expect(save).not.toHaveProperty('gallery')
  })
})

describe('verified Mastery artwork', () => {
  it('uses the central CDN convention for all nine supplied Mastery files', () => {
    for (const mode of Object.values(modes))
      for (const camo of mode.mastery)
        expect(camoImageUrl(camo)).toBe(camoCdnBase + camo.id + '.png')
  })
  it('resolves completed Warzone artwork without treating unpublished challenges as verified', () => {
    expect(modes.warzone.mastery.map((camo) => camo.id)).toEqual([
      'parallax',
      'damascus-reforged',
      'empyros',
    ])
    for (const camo of modes.warzone.mastery) {
      expect(camoImageUrl(camo)).toBe(camoCdnBase + camo.id + '.png')
      expect(camo.challenge.status).toBe('unavailable')
      expect(camo.challenge).not.toHaveProperty('amount')
    }
  })
})
