import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createMemoryHistory, createRouter, RouterView } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import MobileNavigationComponent from '@/components/layout/MobileNavigationComponent.vue'
import { routes } from '@/router'
import { useStore } from '@/stores/store'
import { emptySave, parseSave } from '@/data/mw4/save'
import { prestigeCamos } from '@/data/mw4/prestige'
import messages from '@/i18n/locales/en-GB.json'

vi.mock('@/data/weapons/index.js', async () => {
  const { default: weapon } = await import('@/data/weapons/assault-rifles/han-86.weapon')
  return {
    default: [
      weapon,
      { ...weapon, id: 'test-future', name: 'Future Weapon', season: 2, releaseDate: '2027-01-01' },
    ],
  }
})

let app, host, store, router
const ids = prestigeCamos.map((camo) => camo.id)
const settle = async () => {
  await nextTick()
  await nextTick()
  await nextTick()
}
async function mount({ layout = 'grid', reload = false, path } = {}) {
  const pinia = createPinia()
  store = useStore(pinia)
  if (reload) store.getStoredProgress()
  else store.setPreferences({ layout })
  if (path) {
    router = createRouter({ history: createMemoryHistory(), routes })
    await router.push(path)
    await router.isReady()
  }
  app = createApp(path ? { render: () => h(RouterView) } : HomeView)
  app.use(pinia).use(createI18n({ locale: 'en-GB', messages: { 'en-GB': messages } }))
  if (path) app.use(router)
  app.component('IconComponent', { render: () => h('span') })
  app.mount(host)
  await settle()
}
const card = (id = 'han-86') => host.querySelector(`[data-weapon-id="${id}"]`)
const camo = (id, weapon) => card(weapon).querySelector(`[data-camo-id="${id}"]`)
const checkbox = (name) =>
  [...host.querySelectorAll('label')]
    .find((label) => label.textContent.trim() === name)
    .querySelector('input')
async function toggle(name) {
  checkbox(name).click()
  await settle()
}
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-29T12:00:00Z'))
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false }))
  )
  localStorage.clear()
  host = document.createElement('div')
  document.body.appendChild(host)
})
afterEach(() => {
  app?.unmount()
  host.remove()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe.each(['grid', 'table', 'list'])('unified Prestige in %s', (layout) => {
  it('defaults off, adds exactly four camos per weapon, and hides them without clearing progress', async () => {
    await mount({ layout })
    expect(store.preferences.showPrestigeCamos).toBe(false)
    expect(checkbox('Show Prestige camos').checked).toBe(false)
    expect(host.querySelectorAll('button.prestige')).toHaveLength(0)
    const before = card().querySelectorAll('.camo-button').length
    await toggle('Show Prestige camos')
    for (const id of ['han-86', 'test-future']) {
      expect(
        [...card(id).querySelectorAll('button.prestige')].map((el) => el.dataset.camoId)
      ).toEqual(ids)
      expect(card(id).querySelectorAll('.camo-button')).toHaveLength(before + 4)
    }
    if (layout === 'grid') {
      const row = card().querySelector('.prestige-progress')
      expect(row.style.gridTemplateColumns).toBe('repeat(4, minmax(0, 1fr))')
      expect(row.querySelectorAll('.thumbnail img')).toHaveLength(4)
    }
    if (layout === 'table') {
      expect(card().querySelectorAll('.prestige-start')).toHaveLength(1)
      expect(card().querySelectorAll('.thumbnail img')).toHaveLength(19)
    }
    camo('pyroclast-cascade').click()
    await settle()
    const saved = JSON.stringify(store.save.prestige)
    await toggle('Show Prestige camos')
    expect(host.querySelectorAll('button.prestige')).toHaveLength(0)
    expect(card().querySelectorAll('.camo-button')).toHaveLength(before)
    expect(JSON.stringify(store.save.prestige)).toBe(saved)
    await toggle('Show Prestige camos')
    expect(card().querySelectorAll('button.prestige.completed')).toHaveLength(4)
  })

  it('uses sequential completion and undo without changing base progress or release restrictions', async () => {
    await mount({ layout })
    await toggle('Show Prestige camos')
    store.toggleCamo('han-86', 'smoke', 'multiplayer')
    await settle()
    const shared = JSON.stringify(store.save.weapons)
    const totals = { ...store.overallProgress }
    const tiers = JSON.stringify(store.completionistStats)
    const tableProgress = card().querySelector('progress')?.outerHTML
    camo('pyroclast-cascade').click()
    await settle()
    expect(card().querySelectorAll('button.prestige.completed')).toHaveLength(4)
    expect(camo('pyroclast-terminus').getAttribute('aria-label')).toContain(
      'Weapon Prestige Master Level 73'
    )
    camo('pyroclast-terminus').click()
    await settle()
    expect(card().querySelectorAll('button.prestige.completed')).toHaveLength(1)
    expect(store.save.prestige['han-86']['pyroclast-cascade']).toBe(false)
    expect(JSON.stringify(store.save.weapons)).toBe(shared)
    expect(store.overallProgress).toEqual(totals)
    expect(totals.total).toBe(495)
    expect(JSON.stringify(store.completionistStats)).toBe(tiers)
    expect(store.celebrationPending).toBe(false)
    expect(card().querySelector('progress')?.outerHTML).toBe(tableProgress)
    expect(camo('pyroclast', 'test-future').disabled).toBe(true)
    camo('pyroclast', 'test-future').click()
    expect(store.togglePrestige('test-future', 'pyroclast')).toBe(false)
    expect(store.save.prestige['test-future']).toBeUndefined()
  })
})

it('retains existing filters, their panel state, and the Prestige preference after remount and export/import', async () => {
  await mount()
  await toggle('Show Prestige camos')
  await toggle('Hide Military camos')
  await toggle('Hide unreleased weapons')
  expect(host.querySelectorAll('button.military')).toHaveLength(0)
  expect(card('test-future')).toBeNull()
  expect(card().querySelectorAll('button.prestige')).toHaveLength(4)
  await toggle('Hide Gold')
  store.toggleWeaponCompleted('han-86', 'multiplayer')
  await settle()
  expect(card()).toBeNull()
  await toggle('Hide Gold')
  expect(card()).not.toBeNull()
  await toggle('Hide completed weapons')
  expect(card()).toBeNull()
  await toggle('Hide completed weapons')
  expect(card()).not.toBeNull()
  const filters = { ...store.filters, hideCamoIds: [...store.filters.hideCamoIds] }
  host.querySelector('[aria-controls="tracker-filters"]').click()
  await settle()
  const exported = store.exportProgress()
  app.unmount()
  await mount({ reload: true })
  expect(store.filters).toEqual({ ...filters, hideFilters: true })
  expect(store.preferences.showPrestigeCamos).toBe(true)
  expect(card().querySelectorAll('button.prestige')).toHaveLength(4)
  store.resetProgress()
  store.importProgress(exported)
  expect(store.exportProgress()).toBe(exported)
})

it('migrates an old save with Prestige hidden without altering camo flags or achievement metadata', () => {
  const old = emptySave()
  delete old.preferences.showPrestigeCamos
  old.prestige['han-86'] = { 'pyroclast': true, 'pyroclast-terminus': true }
  old.weapons['han-86'] = { sharedCamos: { smoke: true } }
  old.completedAt = '2026-10-28T12:00:00Z'
  old.celebrationHandled = true
  const source = JSON.stringify(old)
  expect(parseSave(source)).toEqual({
    ...old,
    preferences: { ...old.preferences, showPrestigeCamos: false },
  })
  expect(JSON.stringify(old)).toBe(source)
  expect(() => parseSave({ ...old, preferences: { showPrestigeCamos: 'true' } })).toThrow(
    'preferences'
  )
})

it('exposes native accessible controls, collapses with Escape and restores focus to Filters', async () => {
  await mount()
  const button = host.querySelector('[aria-controls="tracker-filters"]')
  const panel = host.querySelector('#tracker-filters')
  expect(button.tagName).toBe('BUTTON')
  expect(button.getAttribute('aria-expanded')).toBe('true')
  expect([...panel.querySelectorAll('legend')].map((el) => el.textContent)).toEqual([
    'Display options',
    'Completionist visibility',
  ])
  const control = checkbox('Show Prestige camos')
  control.focus()
  expect(document.activeElement).toBe(control)
  control.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  await settle()
  expect(store.filters.hideFilters).toBe(true)
  expect(panel.hasAttribute('inert')).toBe(true)
  expect(panel.getAttribute('aria-hidden')).toBe('true')
  expect(button.getAttribute('aria-expanded')).toBe('false')
  expect(document.activeElement).toBe(button)
  button.click()
  await settle()
  expect(panel.hasAttribute('inert')).toBe(false)
  expect(button.getAttribute('aria-expanded')).toBe('true')
})

it('dismisses the overlay on an outside pointer press without stealing focus', async () => {
  await mount()
  const control = checkbox('Show Prestige camos')
  control.dispatchEvent(new Event('pointerdown', { bubbles: true }))
  await settle()
  expect(store.filters.hideFilters).toBe(false)
  const outside = camo('smoke')
  outside.focus()
  outside.dispatchEvent(new Event('pointerdown', { bubbles: true }))
  await settle()
  expect(store.filters.hideFilters).toBe(true)
  expect(document.activeElement).toBe(outside)
})

it('uses the existing sorting preferences from the mobile Filters panel', async () => {
  await mount()
  const options = host.querySelector('.mobile-sort-options')
  const sort = options.querySelector('[aria-label="Sort by"]')
  sort.value = 'closest'
  sort.dispatchEvent(new Event('change', { bubbles: true }))
  await settle()
  expect(store.preferences.sortBy).toBe('closest')
  const grouping = options.querySelector('[aria-label="Weapon grouping"]')
  grouping.value = 'all'
  grouping.dispatchEvent(new Event('change', { bubbles: true }))
  await settle()
  expect(store.preferences.weaponGrouping).toBe('all')
  expect(host.querySelector('.layout-toggle').getAttribute('aria-label')).toContain('Change layout')
  app.unmount()
  await mount({ reload: true })
  expect(store.preferences).toMatchObject({ sortBy: 'closest', weaponGrouping: 'all' })
})

it('keeps touch details and manual completion working for pending Prestige requirements', async () => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: true }))
  )
  await mount()
  await toggle('Show Prestige camos')
  camo('pyroclast-cascade').click()
  await settle()
  const dialog = document.querySelector('[role="dialog"]')
  expect(dialog.classList.contains('mobile')).toBe(true)
  expect(dialog.getAttribute('aria-modal')).toBe('true')
  expect(store.save.prestige).toEqual({})
  dialog.querySelector('.completion-action').click()
  await settle()
  expect(card().querySelectorAll('button.prestige.completed')).toHaveLength(4)
  expect(document.querySelector('[role="dialog"]')).toBeNull()
})

it.each(['grid', 'table'])(
  'redirects old Prestige URLs and focuses their camo in %s',
  async (layout) => {
    await mount({ layout, path: '/prestige?weapon=han-86&camo=pyroclast-terminus&mode=dmz#target' })
    await vi.advanceTimersByTimeAsync(0)
    await settle()
    expect(router.currentRoute.value.path).toBe('/tracker')
    expect(router.currentRoute.value.query).toEqual({
      weapon: 'han-86',
      camo: 'pyroclast-terminus',
      mode: 'dmz',
    })
    expect(router.currentRoute.value.hash).toBe('#target')
    expect(store.preferences.showPrestigeCamos).toBe(true)
    expect(camo('pyroclast-terminus').classList.contains('weapon-jump-highlight')).toBe(true)
    expect(document.activeElement).toBe(camo('pyroclast-terminus'))
    await toggle('Show Prestige camos')
    expect(store.preferences.showPrestigeCamos).toBe(false)
    expect(router.currentRoute.value.query.prestige).toBeUndefined()
  }
)

it('keeps Mastery and Gallery in mobile navigation and removes the standalone Prestige link', async () => {
  await mount({ path: '/tracker' })
  app.unmount()
  app = createApp(MobileNavigationComponent, { show: true })
  app.use(createPinia()).use(router)
  app.component('IconComponent', { render: () => h('span') })
  app.mount(host)
  expect(host.querySelector('a[href="/prestige"]')).toBeNull()
  expect(host.querySelector('a[href="/mastery"]')).not.toBeNull()
  expect(host.querySelector('a[href="/gallery"]')).not.toBeNull()
})
