// @vitest-environment jsdom
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useStore } from '../store'
import { weaponsById } from '@/data/weapons/index'
import { emptySave } from '@/data/mw4/save'
import { getWeaponCamos } from '@/data/mw4/catalog'

// Synthetic missing information remains independent of the populated production catalog.
vi.mock('@/data/weapons/index.js', async (importOriginal) => {
  const original = await importOriginal()
  const weapons = original.default.map((weapon) =>
    weapon.id === 'm4'
      ? {
          ...weapon,
          specialCamos: weapon.specialCamos.map((camo) => ({
            ...camo,
            unlockRequirements: [{ type: 'weapon_level', level: 999 }], // TODO: VERIFY synthetic level.
          })),
          prestigeCamos: weapon.prestigeCamos.map((camo) => ({
            ...camo,
            requirements: camo.requirements.map((condition) =>
              condition.type === 'player_prestige_master_level'
                ? { ...condition, level: 999 }
                : condition
            ), // TODO: VERIFY synthetic threshold.
          })),
        }
      : weapon
  )
  weapons.push({ ...weapons[0], id: 'test-future', releaseDate: '2027-01-01', season: 2 })
  return { default: weapons, weaponsById: Object.fromEntries(weapons.map((w) => [w.id, w])) }
})
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-24T12:00:00Z'))
  localStorage.clear()
  setActivePinia(createPinia())
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('manual completion independently of requirement information', () => {
  it('persists confirmed .50 GS progress, Prestige and unrelated flags using v1 saves', () => {
    const store = useStore()
    store.toggleCamo('han-86', 'smoke', 'multiplayer')
    const unrelated = JSON.stringify(store.save.weapons['han-86'])
    expect(store.toggleCamo('50-gs', 'military-8', 'dmz')).toBe(true)
    expect(store.toggleCamo('50-gs', 'red-tiger', 'multiplayer')).toBe(true)
    expect(store.togglePrestige('50-gs', 'pyroclast-scatter')).toBe(true)
    expect(store.save.prestige['50-gs']).toEqual({
      'pyroclast': true,
      'pyroclast-terminus': true,
      'pyroclast-scatter': true,
    })
    expect(JSON.stringify(store.save.weapons['han-86'])).toBe(unrelated)
    const exported = store.exportProgress()
    setActivePinia(createPinia())
    const refreshed = useStore()
    refreshed.getStoredProgress()
    expect(refreshed.exportProgress()).toBe(exported)
    refreshed.importProgress(exported)
    for (const mode of ['multiplayer', 'dmz', 'warzone'])
      expect(
        refreshed.camoRows(weaponsById['50-gs'], mode).filter((c) => c.completed)
      ).toHaveLength(9)
    expect(refreshed.save.version).toBe(1)
    expect(refreshed.save.mastery).toEqual(emptySave().mastery)
  })
  it('tracks pending/unpublished shared camos and complete prefixes atomically across every mode', () => {
    const store = useStore()
    const id = weaponsById.m4.specialCamos[0].id
    const write = vi.spyOn(Storage.prototype, 'setItem')
    expect(store.canToggleCamo('m4', id, 'warzone')).toBe(true)
    expect(store.toggleCamo('m4', id, 'warzone')).toBe(true)
    expect(store.overallProgress.completed).toBe(1)
    write.mockClear()
    expect(store.toggleCamo('m4', 'gold', 'warzone')).toBe(true)
    expect(write).toHaveBeenCalledTimes(1)
    expect(store.overallProgress.completed).toBe(12)
    expect(store.weaponHeaderTier('m4')).toBe('gold')
    expect(store.progressionNotice).toBe('')
    expect(store.toggleCamo('m4', 'divergence', 'dmz')).toBe(true)
    for (const mode of ['multiplayer', 'dmz', 'warzone']) {
      expect(store.camoRows(weaponsById.m4, mode).every((c) => c.completed)).toBe(true)
      expect(getWeaponCamos(weaponsById.m4, mode).filter((c) => c.requirementPending)).toHaveLength(
        7
      )
    }
    expect(store.toggleCamo('m4', 'platinum', 'multiplayer')).toBe(true)
    expect(store.weaponHeaderTier('m4')).toBe('gold')
    expect(store.overallProgress.completed).toBe(12)
    expect(Object.keys(store.save.weapons)).toEqual(['m4'])
    expect(store.save.prestige).toEqual({})
    expect(store.save.mastery).toEqual(emptySave().mastery)
  })
  it('counts imported pending flags, preserves them on refresh, and resets without changing preferences', () => {
    const store = useStore(),
      save = emptySave()
    const id = weaponsById.m4.specialCamos[0].id
    save.weapons.m4 = { sharedCamos: { [id]: true, gold: true } }
    save.weapons['han-86'] = { sharedCamos: { smoke: true } }
    save.prestige.m4 = { 'pyroclast-terminus': true }
    store.importProgress(JSON.stringify(save))
    expect(JSON.parse(store.exportProgress())).toEqual(save)
    expect(store.overallProgress).toMatchObject({ completed: 3, total: 495 })
    expect(store.completionistStats.find((c) => c.id === 'gold')).toMatchObject({
      completed: 1,
      total: 33,
    })
    store.getStoredProgress()
    expect(store.save.weapons.m4.sharedCamos[id]).toBe(true)
    expect(store.toggleCamo('m4', id, 'dmz')).toBe(true)
    expect(store.togglePrestige('m4', 'pyroclast-terminus')).toBe(true)
    expect(store.save.weapons['han-86']).toEqual(save.weapons['han-86'])
    store.resetProgress()
    expect(store.save.weapons).toEqual({})
    expect(store.save.prestige).toEqual({})
    expect(store.preferences).toEqual(save.preferences)
  })
  it('keeps pending Prestige, mode Mastery and shared progress independent, and locks unreleased weapons', () => {
    const store = useStore(),
      write = vi.spyOn(Storage.prototype, 'setItem')
    expect(store.togglePrestige('m4', 'pyroclast-cascade')).toBe(true)
    expect(write).toHaveBeenCalledTimes(1)
    expect(Object.values(store.save.prestige.m4)).toEqual([true, true, true, true])
    expect(store.togglePrestige('m4', 'pyroclast-terminus')).toBe(true)
    expect(Object.values(store.save.prestige.m4)).toEqual([true, false, false, false])
    expect(store.toggleWeaponPrestige('m4')).toBe(true)
    expect(Object.values(store.save.prestige.m4).every(Boolean)).toBe(true)
    expect(store.toggleMastery('warzone', 'parallax')).toBe(true)
    expect(store.save.mastery.warzone.parallax).toBe(true)
    expect(store.save.mastery.multiplayer).toEqual({})
    expect(store.save.weapons).toEqual({})
    expect(store.overallProgress.completed).toBe(0)
    write.mockClear()
    expect(store.toggleCamo('test-future', 'gold', 'warzone')).toBe(false)
    expect(store.toggleWeaponCompleted('test-future', 'dmz')).toBe(false)
    expect(store.toggleWeaponPrestige('test-future')).toBe(false)
    expect(write).not.toHaveBeenCalled()
    expect(store.toggleWeaponCompleted('m4', 'warzone')).toBe(true)
    expect(store.weaponCompleted('m4')).toBe(true)
  })
  it('preserves earlier v1 saves without Prestige and accesses only the existing Divergence key', () => {
    const old = emptySave()
    delete old.prestige
    const store = useStore(),
      read = vi.spyOn(Storage.prototype, 'getItem'),
      write = vi.spyOn(Storage.prototype, 'setItem')
    store.importProgress(JSON.stringify(old))
    store.getStoredProgress()
    expect(store.save.prestige).toEqual({})
    expect(read.mock.calls.every(([key]) => key === 'divergence:mw4:v1:dev')).toBe(true)
    expect(write.mock.calls.every(([key]) => key === 'divergence:mw4:v1:dev')).toBe(true)
  })
})
