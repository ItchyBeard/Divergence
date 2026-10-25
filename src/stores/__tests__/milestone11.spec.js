import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import catalog from '@/data/weapons/index.js'
import { getWeaponCamos as sharedCamos } from '@/data/mw4/catalog'
import { useStore } from '../store'
import { emptySave, parseSave } from '@/data/mw4/save'
import { eligiblePrestigeCamos } from '@/data/mw4/prestigeAutomation'
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
const flags = (store) => store.save.prestige['han-86'] || {}

describe('Prestige Level ownership', () => {
  it('starts blank and requires evidence of weapon prestige before applying levels', () => {
    const store = useStore()
    expect(store.save.prestigeLevel).toBeNull()
    store.setPrestigeLevel('150')
    expect(flags(store)).toEqual({})
    store.togglePrestige('han-86', 'pyroclast')
    expect(flags(store)).toEqual({
      'pyroclast': true,
      'pyroclast-terminus': true,
      'pyroclast-scatter': true,
    })
    expect(store.save.prestigeAutomatic['han-86']).toEqual({
      'pyroclast-terminus': true,
      'pyroclast-scatter': true,
    })
    expect(store.save.prestige.future).toBeUndefined()
    expect(store.overallProgress.completed).toBe(0)
    expect(store.celebrationPending).toBe(false)
  })
  it('increases, decreases and clears only automatically owned stages', () => {
    const store = useStore()
    store.togglePrestige('han-86', 'pyroclast-terminus')
    store.setPrestigeLevel(150)
    store.setPrestigeLevel(250)
    expect(flags(store)['pyroclast-cascade']).toBe(true)
    store.setPrestigeLevel(100)
    expect(flags(store)['pyroclast-terminus']).toBe(true)
    expect(flags(store)['pyroclast-scatter']).toBe(false)
    expect(flags(store)['pyroclast-cascade']).toBe(false)
    store.setPrestigeLevel('')
    expect(flags(store).pyroclast).toBe(true)
    expect(flags(store)['pyroclast-terminus']).toBe(true)
  })
  it('keeps manual chain toggles and bulk completion/reset working', () => {
    const store = useStore()
    store.togglePrestige('han-86', 'pyroclast')
    store.setPrestigeLevel(150)
    store.togglePrestige('han-86', 'pyroclast-scatter')
    expect(flags(store)['pyroclast-scatter']).toBe(false)
    store.setPrestigeLevel(150)
    expect(flags(store)['pyroclast-scatter']).toBe(false)
    store.togglePrestige('han-86', 'pyroclast-scatter')
    store.setPrestigeLevel('')
    expect(flags(store)['pyroclast-scatter']).toBe(true)
    expect(flags(store)['pyroclast-terminus']).toBe(true)
    store.toggleWeaponPrestige('han-86')
    store.setPrestigeLevel(0)
    expect(store.prestigeCompleted('han-86')).toBe(true)
    store.toggleWeaponPrestige('han-86')
    expect(Object.values(flags(store)).some(Boolean)).toBe(false)
  })
  it('reads weapon-specific levels and never infers unknown or additional conditions', () => {
    const weapon = {
      ...han,
      prestigeCamos: [
        { id: 'pyroclast', requirements: [{ type: 'player_prestige_master_level', level: 1 }] },
        {
          id: 'pyroclast-terminus',
          requirements: [{ type: 'player_prestige_master_level', level: 125 }],
        },
        {
          id: 'pyroclast-scatter',
          requirements: [{ type: 'player_prestige_master_level', level: 999 }],
        },
        {
          id: 'pyroclast-cascade',
          requirements: [
            { type: 'player_prestige_master_level', level: 150 },
            { type: 'player_level', level: 55 },
          ],
        },
      ],
    }
    expect(eligiblePrestigeCamos(weapon, 124, {})).toEqual([])
    expect(eligiblePrestigeCamos(weapon, 2000, {})).toEqual(['pyroclast-terminus'])
    expect(eligiblePrestigeCamos({ ...weapon, releaseDate: null }, 2000, {})).toEqual([])
  })
  it.each(['-1', '1.5', '1e2', 'NaN', Infinity, '9007199254740992'])(
    'rejects invalid level %s',
    (level) => {
      const store = useStore()
      expect(store.setPrestigeLevel(level)).toBe(false)
      expect(store.save.prestigeLevel).toBeNull()
    }
  )
  it('round-trips ownership through reload/import/export and resets it', () => {
    const store = useStore()
    store.togglePrestige('han-86', 'pyroclast-terminus')
    store.setPrestigeLevel(150)
    const exported = store.exportProgress()
    setActivePinia(createPinia())
    const refreshed = useStore()
    refreshed.getStoredProgress()
    expect(refreshed.save.prestigeLevel).toBe(150)
    expect(refreshed.exportProgress()).toBe(exported)
    refreshed.resetProgress()
    expect(refreshed.save.prestigeLevel).toBeNull()
    expect(refreshed.save.prestigeAutomatic).toEqual({})
    refreshed.importProgress(exported)
    refreshed.setPrestigeLevel('')
    expect(flags(refreshed)['pyroclast-terminus']).toBe(true)
    expect(flags(refreshed)['pyroclast-scatter']).toBe(false)
  })
  it('preserves every existing manual flag when old saves gain optional metadata', () => {
    const old = emptySave()
    for (const key of [
      'prestigeLevel',
      'prestigeAutomatic',
      'firstCamoTracked',
      'completedAt',
      'celebrationHandled',
    ])
      delete old[key]
    old.prestige['han-86'] = { 'pyroclast': true, 'pyroclast-scatter': true }
    const store = useStore()
    store.importProgress(old)
    store.setPrestigeLevel(150)
    store.setPrestigeLevel('')
    expect(flags(store)['pyroclast-scatter']).toBe(true)
    expect(parseSave(old).prestigeLevel).toBeNull()
  })
  it('sorts Prestige using its own instantly updated completion', () => {
    const store = useStore()
    store.setPreferences({ sortBy: 'closest' })
    store.togglePrestige('seasonal', 'pyroclast')
    store.setPrestigeLevel(150)
    expect(store.sortedWeapons('multiplayer', true)[0].id).toBe('seasonal')
  })
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
      store.setPrestigeLevel(500)
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
  it.each([
    { prestigeLevel: -1 },
    { prestigeAutomatic: [] },
    { firstCamoTracked: 'invalid' },
    { completedAt: 12 },
    { celebrationHandled: 'yes' },
  ])('rejects malformed metadata %j', (patch) => {
    expect(() => parseSave({ ...emptySave(), ...patch })).toThrow()
  })
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
