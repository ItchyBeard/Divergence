// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import HomeView from '@/views/HomeView.vue'
import PrestigeView from '@/views/PrestigeView.vue'
import { useStore } from '@/stores/store'
import messages from '@/i18n/locales/en-GB.json'

vi.mock('@/data/weapons/index.js', async () => {
  const { default: han } = await import('@/data/weapons/assault-rifles/han-86.weapon')
  const alpha = { ...han, id: 'test-alpha', name: 'Test Alpha' }
  const bravo = {
    ...han,
    id: 'test-bravo',
    name: 'Test Bravo',
    category: 'submachine-guns',
    specialCamos: han.specialCamos.map((camo, index) => ({
      ...camo,
      id: 'bravo-special-' + index,
      name: 'Bravo Special ' + (index + 1),
    })),
  }
  const pending = {
    ...han,
    id: 'test-pending',
    name: 'Test Pending',
    specialCamos: han.specialCamos.map((camo) => ({
      ...camo,
      unlockRequirements: [{ type: 'weapon_unlocks', count: 999 }], // TODO: VERIFY synthetic count.
    })),
  }
  return {
    default: [
      alpha,
      bravo,
      pending,
      { ...han, id: 'test-future', name: 'Test Future', season: 2, releaseDate: '2027-01-01' },
      { ...han, id: 'test-unknown', name: 'Test Unknown', season: 3, releaseDate: null },
    ],
  }
})

let app, host, store, mode
async function mount(pinia = createPinia(), prestige = false) {
  store = useStore(pinia)
  mode = ref('multiplayer')
  app = createApp({
    render: () => (prestige ? h(PrestigeView) : h(HomeView, { mode: mode.value })),
  })
  app.use(pinia)
  app.use(createI18n({ locale: 'en-GB', messages: { 'en-GB': messages } }))
  app.component('IconComponent', {
    props: ['name', 'fill'],
    render() {
      return h('span', { 'data-icon': this.name, 'data-fill': this.fill })
    },
  })
  app.mount(host)
  await nextTick()
}
beforeEach(async () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-24T12:00:00Z'))
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false }))
  )
  localStorage.clear()
  host = document.createElement('div')
  document.body.appendChild(host)
  const pinia = createPinia()
  useStore(pinia).save.preferences.layout = 'table'
  await mount(pinia)
})
afterEach(() => {
  app.unmount()
  host.remove()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})
const row = (id = 'test-alpha') => host.querySelector('[data-weapon-id="' + id + '"]')
const cell = (camo, id) => row(id).querySelector('[data-camo-id="' + camo + '"]')
const ids = () =>
  [...host.querySelectorAll('[data-weapon-id]')].map((element) => element.dataset.weaponId)
async function click(button) {
  button.click()
  await nextTick()
  await nextTick()
}

describe('classic table rendering and interactions', () => {
  it('uses artwork only in shared headers, neutral Special columns and compact per-weapon indicators', () => {
    expect(
      [...host.querySelectorAll('thead [data-column-id]')].map((header) => header.dataset.columnId)
    ).toEqual([
      ...Array.from({ length: 8 }, (_, index) => 'military-' + (index + 1)),
      'special-1',
      'special-2',
      'special-3',
      'gold',
      'platinum',
      'harmonic-break',
      'divergence',
    ])
    expect(host.querySelectorAll('thead img')).toHaveLength(12)
    expect(host.querySelectorAll('thead .special-header')).toHaveLength(3)
    expect(
      host.querySelector('[data-column-id="special-1"] [tabindex]').getAttribute('aria-label')
    ).toContain('vary by weapon')
    expect(host.querySelectorAll('tbody img')).toHaveLength(0)
    expect(row().querySelectorAll('.table-check')).toHaveLength(15)
    expect(row().querySelectorAll('.table-check [data-icon="check"]')).toHaveLength(0)
    expect(cell('bravo-special-0', 'test-bravo').getAttribute('aria-label')).toContain(
      'Bravo Special 1'
    )
    expect(cell('smoke').getAttribute('aria-label')).toContain('Reach Weapon Level 25')
    expect(row().querySelector('.weapon-heading').classList.contains('compact')).toBe(true)
    expect(host.querySelector('[role="region"]').getAttribute('tabindex')).toBe('0')
    expect(row().textContent).not.toContain('Launch')
    expect(host.querySelectorAll('tbody')).toHaveLength(2)
  })

  it('persists a Military prefix/suffix atomically and uses white checkmarks on completed squares', async () => {
    const write = vi.spyOn(Storage.prototype, 'setItem')
    await click(cell('military-8'))
    expect(write).toHaveBeenCalledTimes(1)
    expect(row().querySelectorAll('.table-check [data-icon="check"]')).toHaveLength(8)
    expect(cell('military-8').querySelector('[data-icon="check"]').dataset.fill).toBe('white')
    await click(cell('military-3'))
    expect(row().querySelectorAll('.table-check [data-icon="check"]')).toHaveLength(2)
    expect(store.overallProgress.completed).toBe(2)
    expect(store.save.weapons['test-bravo']).toBeUndefined()
    expect(store.save.prestige).toEqual({})
  })

  it('retains independent Specials and Completionist prefixes/suffixes with a small tier accent', async () => {
    await click(cell('smoke'))
    expect(Object.keys(store.save.weapons['test-alpha'].sharedCamos)).toEqual(['smoke'])
    await click(cell('divergence'))
    expect(row().querySelectorAll('.table-check [data-icon="check"]')).toHaveLength(15)
    expect(row().querySelector('.tier-accent').getAttribute('aria-label')).toBe(
      'Divergence unlocked'
    )
    await click(cell('platinum'))
    expect(row().querySelectorAll('.table-check [data-icon="check"]')).toHaveLength(12)
    expect(row().querySelector('.tier-accent').getAttribute('aria-label')).toBe('Gold unlocked')
    await click(cell('smoke'))
    expect(store.camoCompleted('test-alpha', 'gold')).toBe(true)
    expect(store.camoCompleted('test-alpha', 'smoke')).toBe(false)
    expect(Object.keys(store.save.weapons)).toEqual(['test-alpha'])
  })

  it('supports double-click, keyboard and explicit weapon completion actions', async () => {
    row()
      .querySelector('button.weapon-name')
      .dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))
    await nextTick()
    expect(store.weaponCompleted('test-alpha')).toBe(true)
    await click(row().querySelector('[aria-label="Reset Test Alpha"]'))
    expect(store.weaponCompleted('test-alpha')).toBe(false)
    row()
      .querySelector('button.weapon-name')
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await nextTick()
    expect(store.weaponCompleted('test-alpha')).toBe(true)
    expect(store.save.weapons['test-bravo']).toBeUndefined()
  })

  it('keeps pending requirements readable on touch while allowing manual completion and undo', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true }))
    )
    const target = cell('smoke', 'test-pending')
    expect(target.getAttribute('aria-disabled')).toBeNull()
    await click(target)
    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog.textContent).toContain('Requirement pending')
    expect(dialog.textContent).toContain('20 kills while mounted')
    expect(dialog.querySelector('.completion-action').disabled).toBe(false)
    expect(store.save.weapons['test-pending']).toBeUndefined()
    await click(dialog.querySelector('.completion-action'))
    expect(store.camoCompleted('test-pending', 'smoke')).toBe(true)
    await click(target)
    await click(document.querySelector('.completion-action'))
    expect(store.camoCompleted('test-pending', 'smoke')).toBe(false)
  })

  it('shares flags while switching MP, DMZ and Warzone requirements', async () => {
    await click(cell('smoke'))
    mode.value = 'dmz'
    await nextTick()
    expect(cell('smoke').getAttribute('aria-pressed')).toBe('true')
    expect(cell('smoke').getAttribute('aria-label')).toContain('75 kills')
    mode.value = 'warzone'
    await nextTick()
    expect(cell('smoke').getAttribute('aria-pressed')).toBe('true')
    expect(cell('smoke').getAttribute('aria-label')).toContain('Unavailable: Not published')
    expect(cell('stormwave').getAttribute('aria-disabled')).toBeNull()
    expect(store.canToggleCamo('test-alpha', 'stormwave', 'warzone')).toBe(true)
  })

  it('preserves seasonal labels, unknown dates, release locks and hide-unreleased filtering', async () => {
    expect(row('test-future').textContent).toContain('Season 2')
    expect(row('test-future').textContent).toContain('Available 1 Jan 2027')
    expect(row('test-unknown').textContent).toContain('Coming Soon')
    expect(
      [...row('test-future').querySelectorAll('button')].every((button) => button.disabled)
    ).toBe(true)
    await click(cell('military-8', 'test-future'))
    expect(store.save.weapons['test-future']).toBeUndefined()
    store.setFilters({ hideUnreleased: true })
    await nextTick()
    expect(row('test-future')).toBeNull()
    expect(row('test-unknown')).toBeNull()
  })

  it('keeps favourites, category/search filters and hidden Military columns aligned', async () => {
    await click(row('test-bravo').querySelector('[aria-label="Favourite Test Bravo"]'))
    store.setFilters({
      favoritesOnly: true,
      search: 'Bravo',
      category: 'submachine-guns',
      hideMilitaryCamos: true,
    })
    await nextTick()
    expect(ids()).toEqual(['test-bravo'])
    expect(host.querySelectorAll('thead [data-column-id]')).toHaveLength(7)
    expect(row('test-bravo').querySelectorAll('.table-indicator')).toHaveLength(7)
    expect(host.querySelector('tbody .category-row').textContent).toBe('Submachine Guns')
    store.save.weapons['test-bravo'] = { sharedCamos: { gold: true } }
    store.setFilters({ hideCamoIds: ['gold'] })
    await nextTick()
    expect(ids()).toEqual([])
  })

  it.each(['default', 'closest', 'least', 'name-asc', 'name-desc', 'released'])(
    'matches Grid and List ordering for %s sorting',
    async (sortBy) => {
      store.setPreferences({ sortBy, weaponGrouping: sortBy === 'closest' ? 'all' : 'category' })
      await nextTick()
      const expected = ids()
      store.setPreferences({ layout: 'grid' })
      await nextTick()
      expect(ids()).toEqual(expected)
      store.setPreferences({ layout: 'list' })
      await nextTick()
      expect(ids()).toEqual(expected)
    }
  )

  it('restores checked table state, favourites and layout from the existing v1 storage key', async () => {
    await click(cell('military-4'))
    await click(row().querySelector('[aria-label="Favourite Test Alpha"]'))
    store.setPreferences({ layout: 'table', sortBy: 'least' })
    const exported = store.exportProgress()
    app.unmount()
    const pinia = createPinia()
    useStore(pinia).getStoredProgress()
    await mount(pinia)
    expect(cell('military-4').getAttribute('aria-pressed')).toBe('true')
    expect(
      row().querySelector('[aria-label="Favourite Test Alpha"]').getAttribute('aria-pressed')
    ).toBe('true')
    expect(store.exportProgress()).toBe(exported)
    store.resetProgress()
    store.importProgress(exported)
    await nextTick()
    expect(cell('military-4').getAttribute('aria-pressed')).toBe('true')
    expect(Object.keys(localStorage)).toEqual(['divergence:mw4:v1:dev'])
  })

  it('uses the same compact table and independent sequential Prestige actions', async () => {
    app.unmount()
    const pinia = createPinia()
    useStore(pinia).save.preferences.layout = 'table'
    await mount(pinia, true)
    expect(host.querySelectorAll('thead img')).toHaveLength(4)
    await click(cell('pyroclast-scatter'))
    expect(store.save.prestige['test-alpha']).toEqual({
      'pyroclast': true,
      'pyroclast-terminus': true,
      'pyroclast-scatter': true,
    })
    expect(store.save.weapons).toEqual({})
    expect(store.overallProgress.completed).toBe(0)
  })
})
