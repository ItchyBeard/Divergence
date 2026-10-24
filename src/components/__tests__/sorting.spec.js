// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import messages from '@/i18n/locales/en-GB.json'
import HomeView from '@/views/HomeView.vue'
import { useStore } from '@/stores/store'
import { getWeaponCamos } from '@/data/mw4/catalog'
import { camoApplicable } from '@/data/mw4/tracker'

vi.mock('@/data/weapons/index.js', async () => {
  const { default: han } = await import('@/data/weapons/assault-rifles/han-86.weapon')
  return {
    default: [
      { ...han, id: 'test-alpha', name: 'Test Alpha' },
      { ...han, id: 'test-bravo', name: 'Test Bravo' },
      { ...han, id: 'test-charlie', name: 'Test Charlie', category: 'submachine-guns' },
      { ...han, id: 'test-delta', name: 'Test Delta', category: 'submachine-guns' },
    ],
  }
})
let app, host, store
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-24T12:00:00'))
  localStorage.clear()
  host = document.createElement('div')
  document.body.appendChild(host)
  const pinia = createPinia()
  app = createApp(HomeView, { mode: 'multiplayer' })
  app.use(pinia)
  app.use(createI18n({ locale: 'en-GB', messages: { 'en-GB': messages } }))
  app.directive('tippy', {})
  app.component('IconComponent', { render: () => h('span') })
  app.mount(host)
  store = useStore(pinia)
  for (const [id, count] of [
    ['test-alpha', 2],
    ['test-charlie', 10],
    ['test-delta', Infinity],
  ]) {
    const weapon = store.weapons.find((entry) => entry.id === id)
    const camos = getWeaponCamos(weapon, 'multiplayer')
    const selected = count === Infinity ? camos : camos.filter(camoApplicable).slice(0, count)
    store.save.weapons[id] = {
      sharedCamos: Object.fromEntries(selected.map((camo) => [camo.id, true])),
    }
  }
})
afterEach(() => {
  app.unmount()
  host.remove()
  vi.restoreAllMocks()
  vi.useRealTimers()
})
const ids = (root = host) =>
  [...root.querySelectorAll('[data-weapon-id]')].map((entry) => entry.dataset.weaponId)
async function select(label, value) {
  const input = host.querySelector('[aria-label="' + label + '"]')
  input.value = value
  input.dispatchEvent(new Event('change', { bubbles: true }))
  await nextTick()
}

describe('sorting controls and category integration', () => {
  it('keeps catalog category order and ranks within groups, or globally in the same layout', async () => {
    await select('Sort by', 'closest')
    expect(ids()).toEqual(['test-alpha', 'test-bravo', 'test-charlie', 'test-delta'])
    expect(
      [...host.querySelectorAll('section.category h2 span:first-child')].map(
        (node) => node.textContent
      )
    ).toEqual(['Assault Rifles', 'Submachine Guns'])
    await select('Weapon grouping', 'all')
    expect(ids()).toEqual(['test-charlie', 'test-alpha', 'test-bravo', 'test-delta'])
    expect(host.querySelectorAll('section.category')).toHaveLength(1)
    expect(host.querySelectorAll('[data-weapon-id]')).toHaveLength(4)
    store.setPreferences({ layout: 'list' })
    await nextTick()
    expect(ids()).toEqual(['test-charlie', 'test-alpha', 'test-bravo', 'test-delta'])
    store.setPreferences({ layout: 'table' })
    await nextTick()
    expect(host.querySelectorAll('tbody')).toHaveLength(1)
    expect(
      [...host.querySelectorAll('tbody button.weapon-name')].map((node) => node.textContent.trim())
    ).toEqual(['Test Charlie', 'Test Alpha', 'Test Bravo', 'Test Delta'])
  })

  it('applies search, category, completion, favourites and individual camo filters before sorting', async () => {
    await select('Sort by', 'closest')
    await select('Weapon grouping', 'all')
    store.setFilters({ category: 'submachine-guns', search: 'Test', hideCompleted: true })
    await nextTick()
    expect(ids()).toEqual(['test-charlie'])
    store.setFilters({ category: null, search: '', hideCompleted: false, favoritesOnly: true })
    store.toggleFavorite('test-charlie')
    store.toggleFavorite('test-bravo')
    await nextTick()
    expect(ids()).toEqual(['test-charlie', 'test-bravo'])
    store.save.weapons['test-charlie'].sharedCamos.gold = true
    store.setFilters({ hideCamoIds: ['gold'] })
    await nextTick()
    expect(ids()).toEqual(['test-bravo'])
  })

  it('retains sorting through refresh, export/import and progress reset without changing keys', async () => {
    await select('Sort by', 'closest')
    await select('Weapon grouping', 'all')
    const snapshot = store.exportProgress()
    const read = vi.spyOn(Storage.prototype, 'getItem')
    const write = vi.spyOn(Storage.prototype, 'setItem')
    const fresh = useStore(createPinia())
    fresh.getStoredProgress()
    expect(fresh.preferences).toMatchObject({ sortBy: 'closest', weaponGrouping: 'all' })
    fresh.resetProgress()
    expect(fresh.preferences).toMatchObject({ sortBy: 'closest', weaponGrouping: 'all' })
    fresh.importProgress(snapshot)
    expect(fresh.exportProgress()).toBe(snapshot)
    for (const spy of [read, write])
      expect(spy.mock.calls.every(([key]) => key === 'divergence:mw4:v1:dev')).toBe(true)
  })
})
