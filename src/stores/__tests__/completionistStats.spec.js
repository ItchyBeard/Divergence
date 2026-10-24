// @vitest-environment jsdom
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useStore } from '../store'
import { emptySave } from '@/data/mw4/save'

vi.mock('@/data/weapons/index.js', async () => {
  const { default: han } = await import('@/data/weapons/assault-rifles/han-86.weapon')
  const unknown = {
    ...han,
    id: 'test-unknown-challenge',
    name: 'Test Unknown Challenge',
    exceptions: {
      ...han.exceptions,
      challengeOverrides: ['multiplayer', 'dmz', 'warzone'].map((mode) => ({
        camoId: 'platinum',
        mode,
        reason: 'Synthetic unavailable threshold.',
        challenge: { status: 'unavailable', reason: 'Not published.' },
      })),
    },
  }
  return {
    default: [han, unknown, { ...han, id: 'test-future', season: 2, releaseDate: '2027-01-01' }],
  }
})
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-24T12:00:00'))
  localStorage.clear()
  setActivePinia(createPinia())
})
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})
describe('shared Completionist milestone applicability', () => {
  it('excludes future weapons but counts manual flags for unpublished challenges', () => {
    const store = useStore()
    store.importProgress({
      ...emptySave(),
      weapons: {
        'test-unknown-challenge': { sharedCamos: { platinum: true } },
        'test-future': { sharedCamos: { gold: true, platinum: true } },
      },
    })
    expect(store.completionistStats.find((camo) => camo.id === 'gold')).toMatchObject({
      completed: 0,
      total: 2,
    })
    expect(store.completionistStats.find((camo) => camo.id === 'platinum')).toMatchObject({
      completed: 1,
      total: 2,
    })
    expect(store.overallProgress.total).toBe(30)
  })
  it('counts the same explicit shared flags in every mode while excluding Prestige and mastery', () => {
    const store = useStore()
    store.toggleCamo('han-86', 'platinum', 'dmz')
    store.togglePrestige('han-86', 'pyroclast')
    store.toggleMastery('dmz', 'chiral')
    const expected = store.completionistStats.map((camo) => [camo.id, camo.completed, camo.total])
    expect(expected).toEqual([
      ['gold', 1, 2],
      ['platinum', 1, 2],
      ['harmonic-break', 0, 2],
      ['divergence', 0, 2],
    ])
    for (const mode of ['multiplayer', 'dmz', 'warzone']) {
      store.camoRows(store.weapons[0], mode)
      expect(store.completionistStats.map((camo) => [camo.id, camo.completed, camo.total])).toEqual(
        expected
      )
    }
    store.resetProgress()
    expect(store.completionistStats.every((camo) => camo.completed === 0)).toBe(true)
  })
})
