// @vitest-environment jsdom
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import han from '@/data/weapons/assault-rifles/han-86.weapon'
import { useStore } from '../store'
import { emptySave, parseSave } from '@/data/mw4/save'
import { weaponAvailability } from '@/data/mw4/availability'
import { getStoredLocale } from '@/utils/utils'

// Synthetic seasonal data stays in tests, never in the weapon discovery directories.
vi.mock('@/data/weapons/index.js', async () => {
  const { default: weapon } = await import('@/data/weapons/assault-rifles/han-86.weapon')
  return {
    default: [
      weapon,
      { ...weapon, id: 'test-future', name: 'Test future', season: 2, releaseDate: '2027-01-01' },
      { ...weapon, id: 'test-unknown', name: 'Test unknown', season: 3, releaseDate: null },
      { ...weapon, id: 'test-delayed', name: 'Test delayed', season: 1, releaseStatus: 'delayed' },
      {
        ...weapon,
        id: 'test-seasonal',
        name: 'Test seasonal',
        season: 1,
        prestigeCamos: weapon.prestigeCamos.map((camo) =>
          camo.id === 'pyroclast-terminus'
            ? {
                ...camo,
                requirements: [
                  { type: 'weapon_prestige', required: true },
                  { type: 'unavailable', reason: 'Not published.' },
                ],
              }
            : camo
        ),
      },
    ],
  }
})

const key = 'divergence:mw4:v1:dev'
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-24T12:00:00'))
  localStorage.clear()
  setActivePinia(createPinia())
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('MW4 progression store', () => {
  it('persists one shared completion record across every mode and a fresh Pinia instance', () => {
    const store = useStore()
    expect(store.toggleCamo('han-86', 'smoke', 'multiplayer')).toBe(true)
    for (const mode of ['multiplayer', 'dmz', 'warzone']) {
      expect(store.camoRows(han, mode).find((camo) => camo.id === 'smoke').completed).toBe(true)
    }
    expect(store.save.weapons['han-86'].sharedCamos).toEqual({ smoke: true })
    setActivePinia(createPinia())
    const refreshed = useStore()
    refreshed.getStoredProgress()
    expect(refreshed.camoCompleted('han-86', 'smoke')).toBe(true)
    expect(refreshed.camoCompleted('han-86', 'military-1')).toBe(false)
    refreshed.toggleCamo('han-86', 'smoke', 'dmz')
    expect(refreshed.camoCompleted('han-86', 'smoke')).toBe(false)
  })

  it('completes the Completionist prefix and clears only its Completionist suffix', () => {
    const store = useStore()
    store.toggleCamo('han-86', 'platinum', 'dmz')
    expect(store.camoCompleted('han-86', 'military-8')).toBe(true)
    expect(store.camoCompleted('han-86', 'red')).toBe(true)
    expect(store.camoCompleted('han-86', 'gold')).toBe(true)
    store.toggleCamo('han-86', 'gold', 'multiplayer')
    expect(store.camoCompleted('han-86', 'gold')).toBe(false)
    expect(store.camoCompleted('han-86', 'platinum')).toBe(false)
    expect(store.camoCompleted('han-86', 'red')).toBe(true)
  })

  it('keeps mode mastery independent, persistent, and outside shared percentages', () => {
    const store = useStore()
    store.toggleMastery('multiplayer', 'mercurial-drift')
    expect(store.save.mastery.multiplayer['mercurial-drift']).toBe(true)
    expect(store.save.mastery.dmz).toEqual({})
    expect(store.save.mastery.warzone).toEqual({})
    expect(store.overallProgress.percent).toBe(0)
    setActivePinia(createPinia())
    const fresh = useStore()
    fresh.getStoredProgress()
    expect(fresh.masteryRows('multiplayer')[0].completed).toBe(true)
    expect(fresh.toggleMastery('dmz', 'mercurial-drift')).toBe(false)
  })

  it('allows unpublished requirements without changing their information status', () => {
    const store = useStore()
    expect(store.toggleCamo('han-86', 'smoke', 'warzone')).toBe(true)
    expect(store.toggleMastery('warzone', 'parallax')).toBe(true)
    expect(store.camoCompleted('han-86', 'smoke')).toBe(true)
    expect(store.toggleCamo('han-86', 'smoke', 'warzone')).toBe(true) // explicit undo is allowed
  })

  it('locks future, unknown and delayed weapons in the store, and filters them on request', () => {
    const store = useStore()
    for (const id of ['test-future', 'test-unknown', 'test-delayed']) {
      expect(store.weapons.find((weapon) => weapon.id === id).available).toBe(false)
      expect(store.toggleCamo(id, 'smoke', 'multiplayer')).toBe(false)
      expect(store.toggleFavorite(id)).toBe(false)
    }
    expect(store.filteredWeapons).toHaveLength(5)
    store.setFilters({ hideUnreleased: true })
    expect(store.filteredWeapons.map((weapon) => weapon.id)).toEqual(['han-86', 'test-seasonal'])
    expect(store.releasedWeapons).toHaveLength(2)
    store.toggleCamo('test-seasonal', 'smoke', 'multiplayer')
    expect(store.overallProgress).toEqual({ completed: 1, total: 495, percent: 0 })
  })

  it('rechecks dates on refresh and immediately before mutations, including release day', () => {
    const store = useStore()
    vi.setSystemTime(new Date('2027-01-01T00:00:00'))
    expect(store.toggleCamo('test-future', 'smoke', 'multiplayer')).toBe(true)
    store.refreshAvailability()
    expect(store.weapons.find((weapon) => weapon.id === 'test-future').available).toBe(true)
    expect(store.releasedWeapons).toHaveLength(3)
    expect(weaponAvailability({ ...han, releaseDate: '2027-01-02' }).available).toBe(false)
    expect(weaponAvailability({ ...han, releaseDate: null }).label).toContain('Coming Soon')
    expect(weaponAvailability({ ...han, releaseStatus: 'delayed' }).label).toContain('Delayed')
  })

  it('retains imported progress for unreleased or absent weapons but excludes it from totals', () => {
    const store = useStore()
    store.importProgress({
      ...emptySave(),
      weapons: {
        'test-future': { sharedCamos: { gold: true } },
        'not-yet-catalogued': { sharedCamos: { smoke: true } },
      },
    })
    expect(store.overallProgress.completed).toBe(0)
    expect(JSON.parse(store.exportProgress()).weapons['not-yet-catalogued'].sharedCamos.smoke).toBe(
      true
    )
  })

  it('round-trips camos, mastery, favourites, filters and preferences without display-name keys', () => {
    const store = useStore()
    store.toggleCamo('han-86', 'military-1', 'multiplayer')
    store.toggleMastery('dmz', 'chiral')
    store.toggleFavorite('han-86')
    store.setFilters({ search: 'HAN', hideMilitaryCamos: true, category: 'assault-rifles' })
    store.setPreferences({ layout: 'list', favorites: true, completionTarget: 'gold' })
    const exported = store.exportProgress()
    setActivePinia(createPinia())
    const fresh = useStore()
    fresh.importProgress(exported)
    expect(fresh.exportProgress()).toBe(exported)
    expect(fresh.favorites).toEqual(['han-86'])
    expect(fresh.preferences.layout).toBe('list')
    expect(fresh.filters.search).toBe('HAN')
    expect(getStoredLocale()).toBe('en-GB')
  })

  it.each([
    'not JSON',
    JSON.stringify({ weapons: [] }),
    JSON.stringify({ ...emptySave(), game: 'singularity' }),
    JSON.stringify({ ...emptySave(), version: 2 }),
    JSON.stringify({ ...emptySave(), weapons: { 'han-86': { sharedCamos: { smoke: 'true' } } } }),
  ])('rejects malformed or foreign imports atomically: %s', (input) => {
    const store = useStore()
    store.toggleCamo('han-86', 'smoke', 'multiplayer')
    const before = store.exportProgress()
    const stored = localStorage.getItem(key)
    expect(() => store.importProgress(input)).toThrow()
    expect(store.exportProgress()).toBe(before)
    expect(localStorage.getItem(key)).toBe(stored)
  })

  it('protects malformed stored data from all automatic writes and offers raw recovery', () => {
    localStorage.setItem(key, '{broken')
    const store = useStore()
    store.getStoredProgress()
    expect(store.loadError).toBeTruthy()
    expect(store.rawRecovery).toBe('{broken')
    expect(store.toggleCamo('han-86', 'smoke', 'multiplayer')).toBe(false)
    expect(store.setFilters({ search: 'x' })).toBe(false)
    expect(store.setPreferences({ layout: 'list' })).toBe(false)
    expect(store.storeProgress()).toBe(false)
    expect(localStorage.getItem(key)).toBe('{broken')
    store.importProgress(emptySave())
    expect(store.loadError).toBe('')
    expect(parseSave(localStorage.getItem(key)).game).toBe('mw4')
  })

  it('reports failed writes and rejects imports if storage is unavailable', () => {
    const store = useStore()
    const original = store.exportProgress()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage full')
    })
    expect(store.toggleCamo('han-86', 'smoke', 'multiplayer')).toBe(false)
    expect(store.storageError).toContain('Storage full')
    const beforeImport = store.exportProgress()
    expect(() => store.importProgress(original)).toThrow('Storage full')
    expect(store.exportProgress()).toBe(beforeImport)
  })

  it('resets only Divergence camos/mastery and never reads, overwrites or deletes any legacy save', () => {
    localStorage.setItem('singularity', 'production sentinel')
    localStorage.setItem('singularity-dev', 'development sentinel')
    const read = vi.spyOn(Storage.prototype, 'getItem')
    const write = vi.spyOn(Storage.prototype, 'setItem')
    const remove = vi.spyOn(Storage.prototype, 'removeItem')
    const store = useStore()
    store.getStoredProgress()
    getStoredLocale()
    store.toggleCamo('han-86', 'smoke', 'multiplayer')
    store.toggleMastery('dmz', 'chiral')
    store.togglePrestige('han-86', 'pyroclast')
    store.toggleFavorite('han-86')
    store.toggleWeaponCompleted('han-86', 'multiplayer')
    store.resetProgress()
    expect(store.save.weapons).toEqual({})
    expect(store.save.mastery).toEqual(emptySave().mastery)
    expect(store.save.prestige).toEqual({})
    expect(store.favorites).toEqual(['han-86'])
    store.importProgress(store.exportProgress())
    for (const spy of [read, write, remove]) {
      expect(spy.mock.calls.every(([calledKey]) => calledKey === key)).toBe(true)
    }
    vi.restoreAllMocks()
    expect(localStorage.getItem('singularity')).toBe('production sentinel')
    expect(localStorage.getItem('singularity-dev')).toBe('development sentinel')
  })

  it('completes Military up to the selected camo and resets only that Military suffix', () => {
    const store = useStore()
    store.toggleCamo('han-86', 'smoke', 'dmz')
    store.toggleCamo('han-86', 'gold', 'multiplayer')
    for (let i = 1; i <= 8; i++) expect(store.camoCompleted('han-86', `military-${i}`)).toBe(true)
    store.toggleCamo('han-86', 'military-3', 'warzone')
    for (let i = 1; i <= 8; i++) expect(store.camoCompleted('han-86', `military-${i}`)).toBe(i < 3)
    expect(store.camoCompleted('han-86', 'smoke')).toBe(true)
    expect(store.camoCompleted('han-86', 'gold')).toBe(true)
    expect(JSON.parse(localStorage.getItem(key)).weapons['han-86'].sharedCamos['military-8']).toBe(
      false
    )
  })

  it('bulk-completes/resets only the selected weapon and leaves mastery and Prestige independent', () => {
    const store = useStore()
    store.toggleCamo('test-seasonal', 'smoke', 'multiplayer')
    store.toggleMastery('dmz', 'chiral')
    store.togglePrestige('han-86', 'pyroclast')
    expect(store.toggleWeaponCompleted('han-86', 'multiplayer')).toBe(true)
    expect(store.weaponCompleted('han-86')).toBe(true)
    expect(Object.values(store.save.weapons['han-86'].sharedCamos)).toHaveLength(15)
    store.toggleWeaponCompleted('han-86', 'dmz')
    expect(store.camoRows(han, 'multiplayer').every((camo) => !camo.completed)).toBe(true)
    expect(store.camoCompleted('test-seasonal', 'smoke')).toBe(true)
    expect(store.save.mastery.dmz.chiral).toBe(true)
    expect(store.save.prestige['han-86'].pyroclast).toBe(true)
  })

  it('includes unpublished requirements in bulk completion and guards unreleased weapons', () => {
    const store = useStore()
    store.toggleWeaponCompleted('han-86', 'warzone')
    expect(store.weaponModeCompleted('han-86', 'warzone')).toBe(true)
    expect(store.camoCompleted('han-86', 'smoke')).toBe(true)
    expect(store.camoCompleted('han-86', 'gold')).toBe(true)
    expect(store.camoCompleted('han-86', 'military-8')).toBe(true)
    for (const id of ['test-future', 'test-unknown', 'test-delayed']) {
      expect(store.toggleWeaponCompleted(id, 'multiplayer')).toBe(false)
      expect(store.togglePrestige(id, 'pyroclast')).toBe(false)
      expect(store.toggleWeaponPrestige(id)).toBe(false)
    }
  })

  it('round-trips independent Prestige, preserves unknown IDs, and excludes it from shared percentage', () => {
    const store = useStore()
    store.togglePrestige('han-86', 'pyroclast-cascade')
    expect(store.prestigeRows(han).map((camo) => camo.completed)).toEqual([true, true, true, true])
    expect(store.overallProgress.percent).toBe(0)
    expect(store.save.mastery).toEqual(emptySave().mastery)
    const saved = JSON.parse(store.exportProgress())
    saved.prestige['not-yet-catalogued'] = { pyroclast: true }
    setActivePinia(createPinia())
    const fresh = useStore()
    fresh.importProgress(saved)
    expect(fresh.prestigeRows(han)[3].completed).toBe(true)
    expect(fresh.save.prestige['not-yet-catalogued'].pyroclast).toBe(true)
    fresh.toggleWeaponPrestige('han-86')
    expect(fresh.prestigeCompleted('han-86')).toBe(false)
    fresh.toggleWeaponPrestige('han-86')
    expect(fresh.prestigeCompleted('han-86')).toBe(true)
    fresh.toggleWeaponPrestige('han-86')
    expect(fresh.prestigeRows(han).every((camo) => !camo.completed)).toBe(true)
  })

  it('loads a Milestone 2 v1 save with no Prestige or new filter fields without rewriting it', () => {
    const previous = emptySave()
    delete previous.prestige
    delete previous.filters.favoritesOnly
    delete previous.filters.hideFilters
    previous.weapons['han-86'] = { sharedCamos: { smoke: true } }
    previous.mastery.dmz.chiral = true
    const raw = JSON.stringify(previous)
    localStorage.setItem(key, raw)
    const store = useStore()
    store.getStoredProgress()
    expect(store.loadError).toBe('')
    expect(store.camoCompleted('han-86', 'smoke')).toBe(true)
    expect(store.save.mastery.dmz.chiral).toBe(true)
    expect(store.save.prestige).toEqual({})
    expect(store.filters.favoritesOnly).toBe(false)
    expect(store.filters.hideFilters).toBe(false)
    expect(localStorage.getItem(key)).toBe(raw)
  })

  it('validates Prestige saves atomically', () => {
    const store = useStore()
    const before = store.exportProgress()
    expect(() =>
      store.importProgress({ ...emptySave(), prestige: { 'han-86': { pyroclast: 'true' } } })
    ).toThrow('prestige')
    expect(store.exportProgress()).toBe(before)
  })

  it('supports favourite filtering without changing progress totals', () => {
    const store = useStore()
    const total = store.overallProgress.total
    store.setFilters({ favoritesOnly: true, hideFilters: true })
    expect(store.filteredWeapons).toHaveLength(0)
    store.toggleFavorite('han-86')
    expect(store.filteredWeapons.map((weapon) => weapon.id)).toEqual(['han-86'])
    expect(store.overallProgress.total).toBe(total)
  })

  it('omits the Season 0 badge and preserves seasonal availability labels', () => {
    expect(weaponAvailability(han).label).toBe('')
    expect(weaponAvailability({ ...han, season: 2 }).label).toBe('Season 2')
    expect(weaponAvailability({ ...han, season: 2, releaseDate: null }).label).toBe(
      'Season 2 · Coming Soon'
    )
    expect(weaponAvailability({ ...han, season: 2, releaseDate: '2027-02-01' }).label).toContain(
      'Season 2 · Available'
    )
  })
})

describe('Prestige refinement compatibility and isolation', () => {
  it('persists independent weapon and camo flags through refresh and export/import', () => {
    const store = useStore()
    store.togglePrestige('han-86', 'pyroclast-terminus')
    store.togglePrestige('test-seasonal', 'pyroclast')
    store.toggleCamo('han-86', 'smoke', 'dmz')
    store.toggleMastery('multiplayer', 'mercurial-drift')
    const exported = store.exportProgress()
    setActivePinia(createPinia())
    const refreshed = useStore()
    refreshed.getStoredProgress()
    expect(refreshed.exportProgress()).toBe(exported)
    expect(refreshed.save.prestige['han-86']).toEqual({
      'pyroclast': true,
      'pyroclast-terminus': true,
    })
    expect(refreshed.save.prestige['test-seasonal']).toEqual({ pyroclast: true })
    refreshed.resetProgress()
    refreshed.importProgress(exported)
    expect(refreshed.exportProgress()).toBe(exported)
    const shared = JSON.stringify(refreshed.save.weapons)
    const mastery = JSON.stringify(refreshed.save.mastery)
    const seasonal = JSON.stringify(refreshed.save.prestige['test-seasonal'])
    refreshed.toggleWeaponPrestige('han-86')
    refreshed.toggleWeaponPrestige('han-86')
    expect(JSON.stringify(refreshed.save.weapons)).toBe(shared)
    expect(JSON.stringify(refreshed.save.mastery)).toBe(mastery)
    expect(JSON.stringify(refreshed.save.prestige['test-seasonal'])).toBe(seasonal)
  })

  it('includes unavailable requirements in bulk completion and allows suffix undo', () => {
    const store = useStore()
    expect(store.canTogglePrestige('test-seasonal', 'pyroclast-terminus')).toBe(true)
    expect(store.togglePrestige('test-seasonal', 'pyroclast-terminus')).toBe(true)
    store.toggleWeaponPrestige('test-seasonal')
    expect(store.save.prestige['test-seasonal']).toEqual({
      'pyroclast': true,
      'pyroclast-terminus': true,
      'pyroclast-scatter': true,
      'pyroclast-cascade': true,
    })
    expect(store.prestigeCompleted('test-seasonal')).toBe(true)
    expect(store.prestigeApplicableCompleted('test-seasonal')).toBe(true)
    store.toggleWeaponPrestige('test-seasonal')
    expect(
      Object.values(store.save.prestige['test-seasonal']).every((flag) => flag === false)
    ).toBe(true)
    const previous = emptySave()
    previous.prestige['test-seasonal'] = { 'pyroclast-terminus': true }
    store.importProgress(previous)
    expect(store.canTogglePrestige('test-seasonal', 'pyroclast-terminus')).toBe(true)
    expect(store.togglePrestige('test-seasonal', 'pyroclast-terminus')).toBe(true)
    expect(store.save.prestige['test-seasonal']['pyroclast-terminus']).toBe(false)
  })

  it('loads earlier v1 Prestige flags unchanged without evaluating the new conditions', () => {
    const previous = emptySave()
    previous.prestige['han-86'] = { 'pyroclast-terminus': true, 'pyroclast-cascade': false }
    const raw = JSON.stringify(previous)
    localStorage.setItem(key, raw)
    const store = useStore()
    store.getStoredProgress()
    expect(store.save.prestige).toEqual(previous.prestige)
    expect(localStorage.getItem(key)).toBe(raw)
    expect(store.prestigeRows(han)[1].challenge.description).toContain(
      'Weapon Prestige Master Level 73'
    )
    expect(store.prestigeRows(han).map((camo) => camo.completed)).toEqual([
      false,
      true,
      false,
      false,
    ])
  })

  it('unlocks seasonal Prestige only on release and respects unknown or delayed releases', () => {
    const store = useStore()
    for (const id of ['test-future', 'test-unknown', 'test-delayed']) {
      expect(store.canTogglePrestige(id, 'pyroclast')).toBe(false)
      expect(store.toggleWeaponPrestige(id)).toBe(false)
    }
    vi.setSystemTime(new Date('2027-01-01T12:00:00'))
    expect(store.togglePrestige('test-future', 'pyroclast')).toBe(true)
    expect(store.togglePrestige('test-delayed', 'pyroclast')).toBe(false)
    expect(store.togglePrestige('test-unknown', 'pyroclast')).toBe(false)
    expect(store.togglePrestige('han-86', 'unknown-camo')).toBe(false)
    expect(store.togglePrestige('unknown-weapon', 'pyroclast')).toBe(false)
  })
})

describe('Milestone 4 sequential interactions', () => {
  it.each([
    ['gold', 12],
    ['platinum', 13],
    ['harmonic-break', 14],
    ['divergence', 15],
  ])('%s completes the requested prefix in one persisted patch', (id, count) => {
    const store = useStore()
    store.togglePrestige('test-seasonal', 'pyroclast')
    const independent = JSON.stringify({
      prestige: store.save.prestige,
      mastery: store.save.mastery,
    })
    const write = vi.spyOn(Storage.prototype, 'setItem')
    const patches = []
    store.$subscribe((mutation) => patches.push(mutation.type), { flush: 'sync' })
    expect(store.toggleCamo('han-86', id, 'dmz')).toBe(true)
    expect(Object.values(store.save.weapons['han-86'].sharedCamos).filter(Boolean)).toHaveLength(
      count
    )
    expect(write).toHaveBeenCalledTimes(1)
    expect(patches).toEqual(['patch function'])
    expect(JSON.stringify({ prestige: store.save.prestige, mastery: store.save.mastery })).toBe(
      independent
    )
    expect(store.save.weapons['test-seasonal']).toBeUndefined()
    for (const mode of ['multiplayer', 'dmz', 'warzone'])
      expect(store.camoRows(han, mode).find((camo) => camo.id === id).completed).toBe(true)
    setActivePinia(createPinia())
    const fresh = useStore()
    fresh.getStoredProgress()
    expect(fresh.camoCompleted('han-86', id)).toBe(true)
  })

  it.each(['gold', 'platinum', 'harmonic-break', 'divergence'])(
    'resets only %s and later Completionist camos',
    (id) => {
      const store = useStore()
      store.toggleCamo('han-86', 'divergence', 'multiplayer')
      const chain = ['gold', 'platinum', 'harmonic-break', 'divergence']
      store.toggleCamo('han-86', id, 'warzone')
      expect(chain.map((camo) => store.camoCompleted('han-86', camo))).toEqual(
        chain.map((camo) => chain.indexOf(camo) < chain.indexOf(id))
      )
      expect(store.camoCompleted('han-86', 'military-8')).toBe(true)
      expect(store.camoCompleted('han-86', 'red')).toBe(true)
    }
  )

  it('keeps Special toggles independent of every other shared tier', () => {
    const store = useStore()
    store.toggleCamo('han-86', 'divergence', 'multiplayer')
    store.toggleCamo('han-86', 'smoke', 'dmz')
    expect(store.camoCompleted('han-86', 'smoke')).toBe(false)
    expect(store.camoCompleted('han-86', 'stormwave')).toBe(true)
    expect(store.camoCompleted('han-86', 'divergence')).toBe(true)
  })

  it('records unavailable shared prefixes atomically and permits suffix undo', () => {
    const store = useStore()
    const write = vi.spyOn(Storage.prototype, 'setItem')
    expect(store.toggleCamo('han-86', 'divergence', 'warzone')).toBe(true)
    expect(store.overallProgress.completed).toBe(15)
    expect(write).toHaveBeenCalledTimes(1)
    expect(store.progressionNotice).toBe('')
    store.importProgress({
      ...emptySave(),
      weapons: { 'han-86': { sharedCamos: { gold: true, divergence: true } } },
    })
    expect(store.toggleCamo('han-86', 'gold', 'warzone')).toBe(true)
    expect(store.camoCompleted('han-86', 'gold')).toBe(false)
    expect(store.camoCompleted('han-86', 'divergence')).toBe(false)
  })

  it('completes and resets Prestige prefixes/suffixes independently, saving once', () => {
    const store = useStore()
    store.toggleCamo('han-86', 'gold', 'multiplayer')
    const shared = JSON.stringify(store.save.weapons)
    const write = vi.spyOn(Storage.prototype, 'setItem')
    expect(store.togglePrestige('han-86', 'pyroclast-scatter')).toBe(true)
    expect(write).toHaveBeenCalledTimes(1)
    expect(store.prestigeRows(han).map((camo) => camo.completed)).toEqual([true, true, true, false])
    store.togglePrestige('han-86', 'pyroclast-cascade')
    expect(store.prestigeCompleted('han-86')).toBe(true)
    store.togglePrestige('han-86', 'pyroclast-terminus')
    expect(store.prestigeRows(han).map((camo) => camo.completed)).toEqual([
      true,
      false,
      false,
      false,
    ])
    store.togglePrestige('han-86', 'pyroclast')
    expect(store.prestigeRows(han).every((camo) => !camo.completed)).toBe(true)
    expect(JSON.stringify(store.save.weapons)).toBe(shared)
    expect(store.save.mastery).toEqual(emptySave().mastery)
    expect(store.save.prestige['test-seasonal']).toBeUndefined()
  })

  it('records an unavailable Prestige prefix and preserves suffix reset behaviour', () => {
    const store = useStore()
    store.togglePrestige('test-seasonal', 'pyroclast')
    expect(store.togglePrestige('test-seasonal', 'pyroclast-cascade')).toBe(true)
    expect(Object.values(store.save.prestige['test-seasonal']).every(Boolean)).toBe(true)
    expect(store.progressionNotice).toBe('')
    store.importProgress({
      ...emptySave(),
      prestige: {
        'test-seasonal': {
          'pyroclast': true,
          'pyroclast-terminus': true,
          'pyroclast-cascade': true,
        },
      },
    })
    expect(store.togglePrestige('test-seasonal', 'pyroclast-terminus')).toBe(true)
    expect(store.save.prestige['test-seasonal']).toMatchObject({
      'pyroclast': true,
      'pyroclast-terminus': false,
      'pyroclast-cascade': false,
    })
  })
})
