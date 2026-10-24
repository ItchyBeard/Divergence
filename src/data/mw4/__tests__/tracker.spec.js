import { describe, expect, it } from 'vitest'
import { completionHeaderTier, sharedCompletion, sortWeapons, camoTogglePlan } from '../tracker'
import { emptySave, parseSave } from '../save'

const weapon = (id, completed, total = 15, extra = {}) => ({
  id,
  name: id,
  available: true,
  completed,
  total,
  ...extra,
})
const fixtures = [
  weapon('a', 13),
  weapon('b', 8),
  weapon('c', 2),
  weapon('d', 0),
  weapon('e', 15),
  weapon('f', 0, 0, { available: false }),
]
const ranked = (weapons, mode) =>
  sortWeapons(
    weapons,
    mode,
    (entry) => ({ ...entry, ratio: entry.total ? entry.completed / entry.total : 0 }),
    weapons.map((entry) => entry.id)
  ).map((entry) => entry.id)

describe('completion header appearance', () => {
  it('uses only explicitly true shared Completionist flags with descending priority', () => {
    const flags = { 'smoke': true, 'pyroclast': true, 'mercurial-drift': true }
    expect(completionHeaderTier(flags)).toBe('default')
    for (const id of ['gold', 'platinum', 'harmonic-break', 'divergence']) {
      flags[id] = true
      expect(completionHeaderTier(flags)).toBe(id)
    }
    for (const [id, next] of [
      ['divergence', 'harmonic-break'],
      ['harmonic-break', 'platinum'],
      ['platinum', 'gold'],
      ['gold', 'default'],
    ]) {
      flags[id] = false
      expect(completionHeaderTier(flags)).toBe(next)
    }
    expect(completionHeaderTier({ divergence: 1, gold: 'true' })).toBe('default')
  })
})

describe('smart weapon sorting', () => {
  it('puts partial weapons first, untouched next, completed next and unreleased last', () => {
    expect(ranked(fixtures, 'closest')).toEqual(['a', 'b', 'c', 'd', 'e', 'f'])
    expect(ranked(fixtures, 'least')).toEqual(['d', 'c', 'b', 'a', 'e', 'f'])
  })
  it('compares percentages rather than counts and preserves catalog order for ties', () => {
    const entries = [weapon('first', 4, 8), weapon('second', 7, 14), weapon('highest', 6, 8)]
    expect(ranked(entries, 'closest')).toEqual(['highest', 'first', 'second'])
    expect(ranked(entries, 'least')).toEqual(['first', 'second', 'highest'])
    expect(ranked(entries, 'default')).toEqual(['first', 'second', 'highest'])
    expect(entries.map((entry) => entry.id)).toEqual(['first', 'second', 'highest'])
  })
  it('sorts names both ways, retaining catalog order for equivalent names', () => {
    const entries = [
      weapon('z', 0, 15, { name: 'Zulu' }),
      weapon('a', 0, 15, { name: 'Alpha' }),
      weapon('a2', 0, 15, { name: 'alpha' }),
    ]
    expect(ranked(entries, 'name-asc')).toEqual(['a', 'a2', 'z'])
    expect(ranked(entries, 'name-desc')).toEqual(['z', 'a', 'a2'])
  })
  it('ranks released dates newest first, upcoming known dates next, unknown dates last', () => {
    const entries = [
      weapon('unknown', 0, 0, { available: false, releaseDate: null }),
      weapon('old', 0, 15, { releaseDate: '2026-10-01' }),
      weapon('new', 0, 15, { releaseDate: '2026-10-23' }),
      weapon('tie', 0, 15, { releaseDate: '2026-10-23' }),
      weapon('future', 0, 0, { available: false, releaseDate: '2027-01-01' }),
    ]
    expect(ranked(entries, 'released')).toEqual(['new', 'tie', 'old', 'future', 'unknown'])
  })
  it('counts manually completed unpublished challenges while excluding unreleased weapons', () => {
    const camos = [
      { id: 'a', challenge: { status: 'available' } },
      { id: 'b', challenge: { status: 'unavailable' } },
      { id: 'c', award: 'prerequisite' },
    ]
    expect(
      sharedCompletion({ available: true }, camos, { a: true, b: true, pyroclast: true })
    ).toEqual({ completed: 2, total: 3, ratio: 2 / 3 })
    expect(sharedCompletion({ available: false }, camos, { a: true, c: true })).toEqual({
      completed: 0,
      total: 0,
      ratio: 0,
    })
  })
})

describe('sorting save compatibility', () => {
  it('defaults old v1 saves to the original ordering, and round-trips preferences', () => {
    const previous = emptySave()
    delete previous.preferences.sortBy
    delete previous.preferences.weaponGrouping
    const loaded = parseSave(previous)
    expect(loaded.preferences).toMatchObject({ sortBy: 'default', weaponGrouping: 'category' })
    loaded.preferences.sortBy = 'closest'
    loaded.preferences.weaponGrouping = 'all'
    expect(parseSave(JSON.stringify(loaded))).toEqual(loaded)
  })
  it.each([{ sortBy: 'bad' }, { weaponGrouping: false }, { sortBy: null }])(
    'rejects malformed sorting preferences %j',
    (preferences) => {
      expect(() => parseSave({ ...emptySave(), preferences })).toThrow('preferences')
    }
  )
})

it('includes all Special entries even when their definition order differs', () => {
  const camos = [
    { id: 'special-b', stage: 'special', challenge: { status: 'available' } },
    { id: 'special-a', stage: 'special', challenge: { status: 'available' } },
    { id: 'gold', stage: 'completionist', challenge: { status: 'available' } },
  ]
  expect(camoTogglePlan(camos, 'gold', {}).changes).toEqual({
    'special-b': true,
    'special-a': true,
    'gold': true,
  })
})
