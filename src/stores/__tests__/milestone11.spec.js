import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import catalog from '@/data/weapons/index.js'
import { getWeaponCamos as sharedCamos } from '@/data/mw4/catalog'
import { useStore } from '../store'
import { emptySave, parseSave } from '@/data/mw4/save'
import { getWeaponCamos } from '@/data/mw4/catalog'
import han from '@/data/weapons/assault-rifles/han-86.weapon'

vi.mock('@/data/weapons/index.js', async () => {
  const { default: weapon } = await import('@/data/weapons/assault-rifles/han-86.weapon')
  return {
    default: [
      weapon,
      ...Array.from({ length: 32 }, (_, i) => ({ ...weapon, id: `baseline-${i}` })),
      { ...weapon, id: 'future', releaseDate: '2027-01-01' },
      { ...weapon, id: 'seasonal', season: 1 },
    ],
  }
})
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-25T12:00:00Z'))
  localStorage.clear()
  setActivePinia(createPinia())
})
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})
describe('shared launch achievement', () => {
  it('retains an earlier recorded Prestige or Mastery camo date without celebrating those pages', () => {
    const store = useStore()
    store.togglePrestige('han-86', 'pyroclast')
    const first = store.save.firstCamoTracked
    expect(first).toBe('2026-10-25T12:00:00.000Z')
    vi.setSystemTime(new Date('2026-10-26T12:00:00Z'))
    completeOtherWeapons(store.save)
    store.toggleCamo('han-86', 'divergence', 'multiplayer')
    expect(store.save.firstCamoTracked).toBe(first)
    expect(store.save.completedAt).toBe('2026-10-26T12:00:00.000Z')
    store.resetProgress()
    store.toggleMastery('dmz', 'chiral')
    expect(store.save.firstCamoTracked).toBe('2026-10-26T12:00:00.000Z')
    expect(store.celebrationPending).toBe(false)
  })
  it.each(['toggleCamo', 'toggleWeaponCompleted'])(
    'records genuine completion once through %s',
    (method) => {
      const store = useStore()
      store.toggleCamo('han-86', 'smoke', 'dmz')
      const first = store.save.firstCamoTracked
      vi.setSystemTime(new Date('2026-10-26T12:00:00Z'))
      completeOtherWeapons(store.save)
      if (method === 'toggleCamo') store.toggleCamo('han-86', 'divergence', 'warzone')
      else store.toggleWeaponCompleted('han-86', 'multiplayer')
      expect(store.launchCompleted).toBe(true)
      expect(store.overallProgress.percent).toBe(100) // Any 33 complete released weapons satisfy the fixed grind.
      expect(store.celebrationPending).toBe(true)
      expect(store.save.completedAt).toBe('2026-10-26T12:00:00.000Z')
      expect(first).toBe('2026-10-25T12:00:00.000Z')
      store.celebrationPending = false
      completeOtherWeapons(store.save)
      store.toggleCamo('han-86', 'divergence', 'multiplayer')
      vi.setSystemTime(new Date('2026-10-27T12:00:00Z'))
      completeOtherWeapons(store.save)
      store.toggleCamo('han-86', 'divergence', 'dmz')
      expect(store.celebrationPending).toBe(false)
      expect(store.save.completedAt).toBe('2026-10-26T12:00:00.000Z')
      store.setFilters({ search: 'something' })
      store.setPreferences({ trackerMode: 'dmz', layout: 'table' })
      expect(store.celebrationPending).toBe(false)
      const exported = store.exportProgress()
      store.importProgress(exported)
      expect(store.save.firstCamoTracked).toBe(first)
      expect(store.save.completedAt).toBe('2026-10-26T12:00:00.000Z')
      expect(store.celebrationPending).toBe(false)
      setActivePinia(createPinia())
      const refreshed = useStore()
      refreshed.getStoredProgress()
      expect(refreshed.celebrationPending).toBe(false)
    }
  )
  it('does not invent history or celebrate imported completed legacy saves, even after re-completion', () => {
    const store = useStore()
    const imported = emptySave()
    imported.weapons['han-86'] = {
      sharedCamos: Object.fromEntries(
        getWeaponCamos(han, 'multiplayer').map((camo) => [camo.id, true])
      ),
    }
    completeOtherWeapons(imported)
    store.importProgress(imported)
    expect(store.celebrationPending).toBe(false)
    expect(store.save.completedAt).toBeNull()
    expect(store.save.firstCamoTracked).toBeNull()
    completeOtherWeapons(store.save)
    store.toggleCamo('han-86', 'divergence', 'multiplayer')
    completeOtherWeapons(store.save)
    store.toggleCamo('han-86', 'divergence', 'multiplayer')
    expect(store.celebrationPending).toBe(false)
    expect(store.save.completedAt).toBeNull()
  })
  it('uses unavailable first-camo history for old partial saves and clears dates on reset', () => {
    const store = useStore()
    const imported = emptySave()
    imported.beganGrind = '2026-10-24T12:00:00Z'
    imported.weapons['han-86'] = { sharedCamos: { smoke: true } }
    completeOtherWeapons(imported)
    store.importProgress(imported)
    completeOtherWeapons(store.save)
    store.toggleCamo('han-86', 'divergence', 'multiplayer')
    expect(store.save.firstCamoTracked).toBeNull()
    expect(store.save.completedAt).not.toBeNull()
    store.resetProgress()
    expect(store.save.completedAt).toBeNull()
    expect(store.save.celebrationHandled).toBe(false)
    expect(store.celebrationPending).toBe(false)
  })
  it.each([{ firstCamoTracked: 'invalid' }, { completedAt: 12 }, { celebrationHandled: 'yes' }])(
    'rejects malformed metadata %j',
    (patch) => {
      expect(() => parseSave({ ...emptySave(), ...patch })).toThrow()
    }
  )
})

function completeOtherWeapons(save) {
  for (const weapon of catalog.filter((entry) => entry.id.startsWith('baseline-'))) {
    save.weapons[weapon.id] = {
      sharedCamos: Object.fromEntries(
        sharedCamos(weapon, 'multiplayer').map((camo) => [camo.id, true])
      ),
    }
  }
}
