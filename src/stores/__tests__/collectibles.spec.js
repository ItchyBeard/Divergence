// @vitest-environment jsdom
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useStore } from '../store'
import { collectiblesById } from '@/data/mw4/collectibles'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-28T12:00:00'))
  localStorage.clear()
  setActivePinia(createPinia())
})
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('independent collectible ownership', () => {
  it('allows owning expired rewards while preserving recovery locks and rejecting invalid IDs', () => {
    const store = useStore()
    const camo = collectiblesById.litmus
    const original = camo.availability
    camo.availability = 'unobtainable'
    try {
      expect(store.toggleCollectible('litmus')).toBe(true)
    } finally {
      camo.availability = original
    }
    expect(store.toggleCollectible('constructor')).toBe(false)
    store.loadError = 'Invalid save; recovery required'
    expect(store.toggleCollectible('litmus')).toBe(false)
    expect(store.save.collectibles.standalone.litmus).toBe(true)
  })
  it('toggles and immediately persists standalone flags independently through refresh', () => {
    const store = useStore()
    expect(store.toggleCollectible('litmus')).toBe(true)
    expect(store.toggleCollectible('hajin')).toBe(true)
    expect(store.toggleCollectible('litmus')).toBe(true)
    expect(store.save.collectibles.standalone).toEqual({ litmus: false, hajin: true })
    setActivePinia(createPinia())
    const restored = useStore()
    restored.getStoredProgress()
    expect(restored.save.collectibles).toEqual(store.save.collectibles)
    expect(restored.save.weapons).toEqual({})
    expect(restored.save.firstCamoTracked).toBeNull()
  })

  it('tracks War Spoils per weapon without changing another weapon or any standard flag', () => {
    const store = useStore()
    store.toggleCamo('50-gs', 'military-1', 'dmz')
    const standard = JSON.stringify(store.save.weapons)
    expect(store.toggleCollectible('war-spoils', '50-gs')).toBe(true)
    expect(store.toggleCollectible('war-spoils', 'm4')).toBe(true)
    expect(store.toggleCollectible('war-spoils', '50-gs')).toBe(true)
    expect(store.save.collectibles.perWeapon['war-spoils']).toEqual({
      '50-gs': false,
      'm4': true,
    })
    expect(JSON.stringify(store.save.weapons)).toBe(standard)
    setActivePinia(createPinia())
    const restored = useStore()
    restored.getStoredProgress()
    expect(restored.save.collectibles.perWeapon['war-spoils']).toEqual({
      '50-gs': false,
      'm4': true,
    })
    expect(store.toggleCollectible('war-spoils', 'han-86')).toBe(true)
    expect(store.toggleCollectible('war-spoils', 'unknown-weapon')).toBe(false)
    expect(store.toggleCollectible('war-spoils')).toBe(false)
    expect(store.toggleCollectible('litmus', '50-gs')).toBe(false)
    expect(store.toggleCollectible('unknown')).toBe(false)
  })

  it('includes both ownership units in export/import and clears them on full reset', () => {
    const store = useStore()
    store.toggleCamo('m4', 'military-1', 'multiplayer')
    store.toggleCollectible('locked-down')
    store.toggleCollectible('war-spoils', '50-gs')
    const backup = store.exportProgress()
    store.resetProgress()
    expect(store.save.collectibles).toEqual({ standalone: {}, perWeapon: {} })
    store.importProgress(backup)
    expect(store.exportProgress()).toBe(backup)
    expect(store.camoCompleted('m4', 'military-1')).toBe(true)
    const old = JSON.parse(backup)
    delete old.collectibles
    store.importProgress(old)
    expect(store.save.collectibles).toEqual({ standalone: {}, perWeapon: {} })
    expect(store.camoCompleted('m4', 'military-1')).toBe(true)
  })

  it('keeps the 495-camo target, every other progression unit and achieved completion unchanged', () => {
    const store = useStore()
    for (const weapon of store.releasedWeapons)
      store.toggleWeaponCompleted(weapon.id, 'multiplayer')
    expect(store.overallProgress).toEqual({ completed: 495, total: 495, percent: 100 })
    expect(store.launchCompleted).toBe(true)
    store.celebrationPending = false
    const before = JSON.stringify({
      progress: store.overallProgress,
      completionist: store.completionistStats,
      prestige: store.save.prestige,
      mastery: store.save.mastery,
      completedAt: store.save.completedAt,
      firstCamoTracked: store.save.firstCamoTracked,
    })
    store.toggleCollectible('prestige-master')
    store.toggleCollectible('war-spoils', '50-gs')
    expect(
      JSON.stringify({
        progress: store.overallProgress,
        completionist: store.completionistStats,
        prestige: store.save.prestige,
        mastery: store.save.mastery,
        completedAt: store.save.completedAt,
        firstCamoTracked: store.save.firstCamoTracked,
      })
    ).toBe(before)
    expect(store.launchCompleted).toBe(true)
    expect(store.celebrationPending).toBe(false)
  })
})
