// @vitest-environment jsdom
import { beforeEach, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { emptySave } from '@/data/mw4/save'
import { storageKey } from '@/data/mw4/saveContract'
import { useStore } from '../store'

const key = storageKey(import.meta.env.PROD)
const legacy = {
  collectibles: {
    standalone: { 'gold-mosaic': true, 'future-camo': false },
    perWeapon: { 'war-spoils': { '50-gs': true, m4: false, 'future-weapon': true } },
  },
  collectibleEntitlements: { 'blackcell-season-1': true },
  collectibleProgress: { infiltrator: { multiplayer: 10 } },
}
const expectLegacy = (save) => expect(save).toMatchObject(legacy)

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

it('loads existing progress and round-trips legacy data through edits, storage and JSON backups', () => {
  const save = {
    ...emptySave(),
    ...legacy,
    weapons: { m4: { sharedCamos: { 'military-1': true } } },
    prestige: { m4: { pyroclast: true } },
  }
  save.mastery.dmz.chiral = true
  localStorage.setItem(key, JSON.stringify(save))
  const store = useStore()
  store.getStoredProgress()
  expect(store.loadError).toBe('')
  expect(store.camoCompleted('m4', 'military-1')).toBe(true)
  expect(store.save.prestige).toEqual(save.prestige)
  expect(store.save.mastery).toEqual(save.mastery)
  expectLegacy(store.save)

  store.setFilters({ search: 'm4' })
  expectLegacy(JSON.parse(localStorage.getItem(key)))

  const backup = store.exportProgress()
  const restored = useStore(createPinia())
  restored.importProgress(backup)
  expect(restored.exportProgress()).toBe(backup)
  expectLegacy(JSON.parse(localStorage.getItem(key)))
})

it('keeps legacy ownership when resetting tracker progress', () => {
  const store = useStore()
  store.importProgress({
    ...emptySave(),
    ...legacy,
    weapons: { m4: { sharedCamos: { 'military-1': true } } },
  })
  store.resetProgress()
  expect(store.camoCompleted('m4', 'military-1')).toBe(false)
  expectLegacy(JSON.parse(localStorage.getItem(key)))
})
