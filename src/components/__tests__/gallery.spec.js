// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createMemoryHistory, createRouter, RouterView } from 'vue-router'
import GalleryView from '@/views/GalleryView.vue'
import HomeView from '@/views/HomeView.vue'
import { routes } from '@/router'
import MasteryView from '@/views/MasteryView.vue'
import { useStore } from '@/stores/store'
import messages from '@/i18n/locales/en-GB.json'

vi.mock('@/data/weapons/index.js', async () => {
  const { default: han } = await import('@/data/weapons/assault-rifles/han-86.weapon')
  // Synthetic unlock-count examples, never production weapon facts.
  const fixture = {
    ...han,
    specialCamos: han.specialCamos.map((camo) =>
      camo.id === 'smoke'
        ? { ...camo, unlockRequirements: [{ type: 'weapon_unlocks', count: 12 }] }
        : camo
    ),
  }
  return {
    default: [
      fixture,
      {
        ...fixture,
        id: 'test-future',
        name: 'Test Future',
        season: 2,
        releaseDate: '2027-01-01',
        specialCamos: fixture.specialCamos.map((camo) =>
          camo.id === 'smoke'
            ? { ...camo, unlockRequirements: [{ type: 'weapon_unlocks', count: 999 }] }
            : camo
        ), // TODO: VERIFY synthetic count.
      },
    ],
  }
})
let app, host, store, router
const settle = async () => {
  await vi.advanceTimersByTimeAsync(0)
  await nextTick()
  await nextTick()
  await nextTick()
}
beforeEach(async () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-24T12:00:00'))
  localStorage.clear()
  host = document.createElement('div')
  document.body.appendChild(host)
  const pinia = createPinia()
  router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/gallery', component: GalleryView },
      { path: '/', component: HomeView, props: { mode: 'multiplayer' } },
      { path: '/dmz', component: HomeView, props: { mode: 'dmz' } },
      { path: '/warzone', component: HomeView, props: { mode: 'warzone' } },
      ...routes.filter((route) => ['/prestige', '/tracker'].includes(route.path)),
      { path: '/mastery', component: MasteryView },
    ],
  })
  app = createApp({ render: () => h(RouterView) })
  app.use(pinia)
  app.use(router)
  app.use(createI18n({ locale: 'en-GB', messages: { 'en-GB': messages } }))
  app.component('IconComponent', { render: () => h('span') })
  app.directive('tippy', {})
  await router.push('/gallery')
  await router.isReady()
  app.mount(host)
  store = useStore(pinia)
  await settle()
})
afterEach(() => {
  app.unmount()
  host.remove()
  vi.restoreAllMocks()
  vi.useRealTimers()
})
async function open(name) {
  host.querySelector('[aria-label="View ' + name + ' details"]').click()
  await settle()
  return document.querySelector('[role=dialog]')
}
async function select(element, value) {
  element.value = value
  element.dispatchEvent(new Event('change', { bubbles: true }))
  await settle()
}

describe('read-only Gallery and weapon navigation', () => {
  it('renders unique lazy-loaded designs and accessible, dismissible requirements without saving', async () => {
    expect(host.querySelectorAll('.gallery-tile')).toHaveLength(35)
    for (const img of host.querySelectorAll('.gallery-grid img'))
      expect(img.loading || img.getAttribute('loading')).toBe('lazy')
    const before = store.exportProgress()
    const write = vi.spyOn(Storage.prototype, 'setItem')
    const dialog = await open('Smoke')
    expect(dialog.textContent).toContain('20 kills while mounted')
    expect(dialog.querySelector('.camo-requirements').textContent).toContain(
      'Earn 12 weapon unlocks using the HAN 86.'
    )
    expect(
      [...dialog.querySelector('.camo-requirements').querySelectorAll('dt')].map(
        (node) => node.textContent
      )
    ).toEqual(['Unlock', 'Challenge'])
    expect(dialog.textContent).toContain('Requirement pending')
    expect(dialog.textContent).not.toMatch(/999|Also completes|Also clears|First complete/)
    expect(dialog.textContent).toContain('Test Future')
    expect(dialog.textContent).toContain('Season 2')
    expect(document.activeElement.getAttribute('aria-label')).toBe('Close camo details')
    expect(dialog.querySelector('.completion-action')).toBeNull()
    await select(dialog.querySelector('[aria-label="Detail game mode"]'), 'dmz')
    expect(dialog.textContent).toContain('DMZ challenges')
    expect(dialog.textContent).toContain('75 kills while mounted')
    await select(dialog.querySelector('[aria-label="Detail game mode"]'), 'warzone')
    expect(dialog.textContent).toContain('Unavailable: Not published')
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await settle()
    expect(document.querySelector('[role=dialog]')).toBeNull()
    expect(document.activeElement.getAttribute('aria-label')).toBe('View Smoke details')
    expect(store.exportProgress()).toBe(before)
    expect(write).not.toHaveBeenCalled()
    expect(document.body.style.overflow).toBe('')
  })
  it('shows per-weapon shared flags and independent Prestige/mastery state reactively', async () => {
    store.toggleCamo('han-86', 'smoke', 'dmz')
    store.togglePrestige('han-86', 'pyroclast')
    store.toggleMastery('dmz', 'chiral')
    await settle()
    expect(host.querySelector('[aria-label="View Smoke details"]').textContent).toContain(
      '1/2 unlocked'
    )
    let dialog = await open('Smoke')
    expect(
      [...dialog.querySelectorAll('.unlock-heading span')].map((node) => node.textContent)
    ).toEqual(['Unlocked', 'Not unlocked'])
    dialog.querySelector('button').click()
    await settle()
    dialog = await open('Pyroclast')
    expect(dialog.textContent).toContain('Prestige this weapon.')
    expect(dialog.querySelector('.unlock-heading span').textContent).toBe('Unlocked')
    dialog.querySelector('button').click()
    await settle()
    dialog = await open('Chiral')
    expect(dialog.querySelector('.unlock-heading span').textContent).toBe('Unlocked')
    expect(dialog.querySelector('img').src).toContain('/chiral.png')
    expect(store.save.weapons['test-future']).toBeUndefined()
  })
  it.each(['grid', 'list', 'table'])(
    'jumps to a filtered-out weapon in %s layout without changing filters or progress',
    async (layout) => {
      store.setPreferences({ layout })
      store.setFilters({
        search: 'no-match',
        category: 'submachine-guns',
        favoritesOnly: true,
        hideCompleted: true,
      })
      const before = store.exportProgress()
      const dialog = await open('Smoke')
      await select(dialog.querySelector('select'), 'dmz')
      dialog.querySelector('a').click()
      await settle()
      await router.isReady()
      await settle()
      expect(router.currentRoute.value.path).toBe('/dmz')
      expect(router.currentRoute.value.query).toEqual({ weapon: 'han-86', camo: 'smoke' })
      expect(host.querySelector('[data-weapon-id="han-86"]')).not.toBeNull()
      expect(host.querySelector('[data-camo-id="smoke"].weapon-jump-highlight')).not.toBeNull()
      expect(host.querySelector('.toolbar-actions input[value="dmz"]').checked).toBe(true)
      const expected = JSON.parse(before)
      expected.preferences.trackerMode = 'dmz'
      expect(JSON.parse(store.exportProgress())).toEqual(expected)
      await vi.advanceTimersByTimeAsync(2300)
      expect(host.querySelector('.weapon-jump-highlight')).toBeNull()
    }
  )
  it('allows viewing an upcoming weapon while preserving release locks', async () => {
    const dialog = await open('Smoke')
    dialog.querySelectorAll('a')[1].click()
    await settle()
    await settle()
    const card = host.querySelector('[data-weapon-id="test-future"]')
    expect(card.querySelector('.coming-soon')).not.toBeNull()
    expect(card.querySelector('button.camo-button').disabled).toBe(true)
    expect(store.toggleCamo('test-future', 'smoke', 'multiplayer')).toBe(false)
    expect(store.save.weapons['test-future']).toBeUndefined()
  })
  it('jumps to existing Prestige and mode mastery sections with the original stable IDs', async () => {
    let dialog = await open('Pyroclast Terminus')
    expect(dialog.textContent).toContain('Weapon Prestige Master Level 73')
    dialog.querySelector('a').click()
    await settle()
    await settle()
    expect(router.currentRoute.value.path).toBe('/tracker')
    expect(store.preferences.showPrestigeCamos).toBe(true)
    expect(
      host.querySelector('[data-camo-id="pyroclast-terminus"].weapon-jump-highlight')
    ).not.toBeNull()
    await router.push('/gallery')
    await settle()
    dialog = await open('Chiral')
    dialog.querySelector('a').click()
    await settle()
    await settle()
    expect(router.currentRoute.value.path).toBe('/mastery')
    expect(
      host.querySelector('[data-mode="dmz"] [data-camo-id="chiral"].weapon-jump-highlight')
    ).not.toBeNull()
    expect(store.save.mastery.dmz).toEqual({})
  })
  it('filters by stage and mode and traps focus inside the detail dialog', async () => {
    await select(host.querySelector('[aria-label="Camo category"]'), 'mastery')
    await select(host.querySelector('[aria-label="Gallery game mode"]'), 'warzone')
    expect(host.querySelectorAll('.gallery-tile')).toHaveLength(3)
    const dialog = await open('Parallax')
    expect(dialog.textContent).toContain('Unlock requirements unavailable')
    expect(dialog.querySelector('.detail-art img').getAttribute('src')).toBe(
      'https://cdn.itchy-beard.co.uk/divergence/camouflages/parallax.png'
    )
    expect(dialog.querySelector('.detail-art img').getAttribute('alt')).toBe('Parallax')
    // Image fallback remains independent of challenge availability.
    dialog.querySelector('.detail-art img').dispatchEvent(new Event('error'))
    await settle()
    expect(dialog.querySelector('.detail-art img').getAttribute('src')).toBe(
      'https://cdn.itchy-beard.co.uk/divergence/camouflages/_missing.png'
    )
    dialog.querySelector('.detail-art img').dispatchEvent(new Event('error'))
    await settle()
    expect(dialog.querySelector('.detail-art img')).toBeNull()
    expect(dialog.querySelector('[aria-label="Parallax artwork unavailable"]')).not.toBeNull()
    const controls = [...dialog.querySelectorAll('button,select,a[href]')]
    controls.at(-1).focus()
    controls
      .at(-1)
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }))
    expect(document.activeElement).toBe(controls[0])
  })
})
