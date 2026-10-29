import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createMemoryHistory, createRouter, RouterView } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { routes } from '@/router'
import { useStore } from '@/stores/store'
import messages from '@/i18n/locales/en-GB.json'

vi.mock('@/data/weapons/index.js', async () => {
  const { default: weapon } = await import('@/data/weapons/assault-rifles/han-86.weapon')
  return {
    default: [
      weapon,
      { ...weapon, id: 'test-second', name: 'Second Weapon' },
      { ...weapon, id: 'test-future', name: 'Future Weapon', season: 2, releaseDate: '2027-01-01' },
    ],
  }
})

let app, host, store, narrow, listeners, media
const settle = async () => {
  await nextTick()
  await vi.advanceTimersByTimeAsync(0)
  await nextTick()
}
async function mount(path) {
  const pinia = createPinia()
  store = useStore(pinia)
  store.setPreferences({ layout: 'table' })
  let router
  if (path) {
    router = createRouter({ history: createMemoryHistory(), routes })
    await router.push(path)
    await router.isReady()
  }
  app = createApp(path ? { render: () => h(RouterView) } : HomeView)
  app.use(pinia).use(createI18n({ locale: 'en-GB', messages: { 'en-GB': messages } }))
  if (router) app.use(router)
  app.component('IconComponent', {
    props: ['name'],
    render() {
      return h('span', { 'data-icon': this.name })
    },
  })
  app.mount(host)
  await settle()
}
const row = (id = 'han-86') => host.querySelector(`[data-weapon-id="${id}"]`)
const camo = (id, weapon) => row(weapon).querySelector(`[data-camo-id="${id}"]`)
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-29T12:00:00Z'))
  localStorage.clear()
  narrow = true
  listeners = new Set()
  media = {
    get matches() {
      return narrow
    },
    addEventListener: vi.fn((event, callback) => listeners.add(callback)),
    removeEventListener: vi.fn((event, callback) => listeners.delete(callback)),
  }
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query) =>
      query === '(max-width: 600px)'
        ? media
        : { matches: query.includes('pointer: coarse') && narrow }
    )
  )
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

it('uses expandable, independent weapon rows with the existing camo artwork and completion overlays', async () => {
  await mount()
  expect(host.querySelector('.camo-table')).toBeNull()
  expect(host.querySelector('.table-container')).toBeNull()
  expect(host.querySelectorAll('details')).toHaveLength(3)
  const first = row().querySelector('details')
  const second = row('test-second').querySelector('details')
  expect(first.open).toBe(false)
  first.querySelector('summary').click()
  second.querySelector('summary').click()
  await settle()
  expect(first.open).toBe(true)
  expect(second.open).toBe(true)
  first.querySelector('summary').click()
  expect(first.open).toBe(false)
  expect(second.open).toBe(true)
  expect(row().querySelectorAll('.thumbnail img')).toHaveLength(15)
  expect(row().querySelectorAll('.table-check')).toHaveLength(0)
  expect(camo('smoke').querySelector('.complete')).not.toBeNull()
  expect([...row().querySelectorAll('.camo-group h3')].map((el) => el.textContent.trim())).toEqual([
    'Military 0/8',
    'Special and Completionist 0/7',
  ])
  expect(row().querySelector('progress').max).toBe(15)
  expect(row().querySelectorAll('.checklist-camo > span')).toHaveLength(0)
  expect(
    [...row().querySelectorAll('.camo-group h3')].every((el) => el.classList.contains('sr-only'))
  ).toBe(true)
  expect(row().querySelector('.camo-checklist').style.gridTemplateColumns).toBe(
    'repeat(8, minmax(0, 1fr))'
  )
})

it('keeps mobile touch details, shared completion, counts and stored progress working', async () => {
  await mount()
  row().querySelector('summary').click()
  camo('smoke').click()
  await settle()
  const dialog = document.querySelector('[role="dialog"]')
  expect(dialog.classList.contains('mobile')).toBe(true)
  expect(store.save.weapons).toEqual({})
  dialog.querySelector('.completion-action').click()
  await settle()
  expect(camo('smoke').getAttribute('aria-pressed')).toBe('true')
  expect(row().querySelector('progress').value).toBe(1)
  expect(store.overallProgress.completed).toBe(1)
  expect(
    JSON.parse(localStorage.getItem('divergence:mw4:v1:dev')).weapons['han-86'].sharedCamos.smoke
  ).toBe(true)
  expect(row('test-second').querySelector('progress').value).toBe(0)
})

it('keeps Prestige sequential and independent, applies visibility filters and preserves release locks', async () => {
  await mount()
  store.setPreferences({ showPrestigeCamos: true })
  store.setFilters({ hideMilitaryCamos: true })
  await settle()
  expect(row().querySelectorAll('button.military')).toHaveLength(0)
  expect(row().querySelectorAll('button.prestige')).toHaveLength(4)
  expect(row().querySelectorAll('.thumbnail img')).toHaveLength(11)
  row().querySelector('summary').click()
  camo('pyroclast-cascade').click()
  await settle()
  document.querySelector('.completion-action').click()
  await settle()
  expect(row().querySelectorAll('button.prestige.completed')).toHaveLength(4)
  expect(row().querySelector('progress').value).toBe(0)
  expect(store.overallProgress.completed).toBe(0)
  expect(store.overallProgress.total).toBe(495)
  expect(camo('pyroclast', 'test-future').disabled).toBe(true)
  expect(row('test-future').querySelector('small').textContent).toContain('2027')
  row().querySelector('.checklist-toolbar button').click()
  await settle()
  expect(store.weaponCompleted('han-86')).toBe(true)
  expect(row().querySelectorAll('button.prestige.completed')).toHaveLength(4)
  store.setFilters({ hideUnreleased: true, hideCompleted: true })
  await settle()
  expect(row()).toBeNull()
  expect(row('test-future')).toBeNull()
  expect(row('test-second')).not.toBeNull()
})

it('switches to the desktop table at the breakpoint without losing completion and cleans up its listener', async () => {
  await mount()
  store.togglePrestige('han-86', 'pyroclast')
  store.toggleCamo('han-86', 'smoke', 'multiplayer')
  const before = store.exportProgress()
  narrow = false
  for (const listener of listeners) listener({ matches: false })
  await settle()
  expect(host.querySelector('.mobile-weapons-list')).toBeNull()
  expect(host.querySelector('.camo-table')).not.toBeNull()
  expect(camo('smoke').getAttribute('aria-pressed')).toBe('true')
  narrow = true
  for (const listener of listeners) listener({ matches: true })
  await settle()
  expect(host.querySelector('.camo-table')).toBeNull()
  expect(host.querySelector('.mobile-weapons-list')).not.toBeNull()
  expect(camo('smoke').getAttribute('aria-pressed')).toBe('true')
  expect(store.exportProgress()).toBe(before)
  app.unmount()
  app = null
  expect(listeners.size).toBe(0)
})

it('opens and focuses the requested mobile Prestige checklist after a legacy Gallery link', async () => {
  await mount('/prestige?weapon=han-86&camo=pyroclast-terminus')
  expect(store.preferences.showPrestigeCamos).toBe(true)
  expect(row().querySelector('details').open).toBe(true)
  expect(row('test-second').querySelector('details').open).toBe(false)
  expect(document.activeElement).toBe(camo('pyroclast-terminus'))
  expect(camo('pyroclast-terminus').classList.contains('weapon-jump-highlight')).toBe(true)
})
