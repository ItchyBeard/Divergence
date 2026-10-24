// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createMemoryHistory, createRouter, RouterView } from 'vue-router'
import { routes } from '@/router'
import NavigationComponent from '@/components/layout/NavigationComponent.vue'
import { useStore } from '@/stores/store'
import { emptySave, parseSave } from '@/data/mw4/save'
import { galleryWeaponLocation, buildGallery } from '@/data/mw4/gallery'
import han from '@/data/weapons/assault-rifles/han-86.weapon'
import messages from '@/i18n/locales/en-GB.json'

vi.mock('@/data/weapons/index.js', async () => ({
  default: [(await import('@/data/weapons/assault-rifles/han-86.weapon')).default],
}))
let app, host, router, store
const settle = async () => {
  await nextTick()
  await new Promise((resolve) => setTimeout(resolve, 0))
  await nextTick()
}
async function mount(path = '/tracker', saved) {
  const pinia = createPinia()
  setActivePinia(pinia)
  store = useStore(pinia)
  if (saved) store.importProgress(JSON.stringify(saved))
  router = createRouter({ history: createMemoryHistory(), routes })
  await router.push(path)
  await router.isReady()
  app = createApp({ render: () => h('div', [h(NavigationComponent), h(RouterView)]) })
  app
    .use(pinia)
    .use(router)
    .use(createI18n({ locale: 'en-GB', messages: { 'en-GB': messages } }))
  app.component('IconComponent', { render: () => h('span') })
  app.mount(host)
  await settle()
}
async function select(mode) {
  host.querySelector('input[value="' + mode + '"]').click()
  await settle()
}
beforeEach(() => {
  localStorage.clear()
  host = document.createElement('div')
  document.body.appendChild(host)
})
afterEach(() => {
  app?.unmount()
  host.remove()
  vi.restoreAllMocks()
})

describe('unified Camo Tracker navigation', () => {
  it('switches requirements and accents without remounting, scrolling or changing progression and filters', async () => {
    const save = emptySave()
    save.weapons['han-86'] = { sharedCamos: { smoke: true } }
    save.prestige['han-86'] = { pyroclast: true }
    save.mastery.dmz.chiral = true
    save.filters.search = 'HAN'
    save.filters.category = 'assault-rifles'
    save.preferences.sortBy = 'closest'
    save.favorites = ['han-86']
    await mount('/tracker?weapon=han-86&camo=smoke', save)
    const root = host.querySelector('.tracker-view')
    const scrolling = vi.fn()
    const originalScroll = HTMLElement.prototype.scrollIntoView
    HTMLElement.prototype.scrollIntoView = scrolling
    try {
      for (const mode of ['dmz', 'warzone', 'multiplayer']) {
        await select(mode)
        expect(host.querySelector('.tracker-view')).toBe(root)
        expect(root.classList.contains('mode-' + mode)).toBe(true)
        expect(host.querySelector('input[value="' + mode + '"]').checked).toBe(true)
        expect(store.save.weapons).toEqual(save.weapons)
        expect(store.save.prestige).toEqual(save.prestige)
        expect(store.save.mastery).toEqual(save.mastery)
        expect(store.filters).toEqual(save.filters)
        expect(store.favorites).toEqual(save.favorites)
        expect(store.preferences.sortBy).toBe('closest')
        expect(router.currentRoute.value.query).toMatchObject({
          weapon: 'han-86',
          camo: 'smoke',
          mode,
        })
        const label =
          host.querySelector('[data-camo-id="smoke"] button')?.getAttribute('aria-label') ||
          host.querySelector('button[data-camo-id="smoke"]').getAttribute('aria-label')
        expect(label).toContain(
          mode === 'dmz' ? '75 kills' : mode === 'warzone' ? 'Unavailable' : '20 kills'
        )
      }
      expect(scrolling).not.toHaveBeenCalled()
    } finally {
      HTMLElement.prototype.scrollIntoView = originalScroll
    }
  })

  it('persists mode in the existing v1 preference and restores it on refresh, import and reset', async () => {
    await mount()
    await select('dmz')
    const exported = store.exportProgress()
    expect(JSON.parse(localStorage.getItem('divergence:mw4:v1:dev')).preferences.trackerMode).toBe(
      'dmz'
    )
    app.unmount()
    app = null
    await mount('/tracker', parseSave(exported))
    store.getStoredProgress()
    expect(host.querySelector('input[value="dmz"]').checked).toBe(true)
    expect(parseSave(exported).preferences.trackerMode).toBe('dmz')
    store.resetProgress()
    await settle()
    expect(host.querySelector('input[value="dmz"]').checked).toBe(true) // Reset retains preferences.
    const old = emptySave()
    delete old.preferences.trackerMode
    expect(parseSave(old).preferences.trackerMode).toBe('multiplayer')
    expect(() => parseSave({ ...old, preferences: { trackerMode: 'zombies' } })).toThrow(
      'preferences'
    )
  })

  it.each([
    ['/', 'multiplayer'],
    ['/multiplayer', 'multiplayer'],
    ['/dmz', 'dmz'],
    ['/warzone', 'warzone'],
  ])('redirects %s while retaining query targets and hash', async (path, mode) => {
    await mount(path + '?weapon=han-86&camo=smoke#target')
    expect(router.currentRoute.value.path).toBe('/tracker')
    expect(router.currentRoute.value.query).toEqual({ weapon: 'han-86', camo: 'smoke', mode })
    expect(router.currentRoute.value.hash).toBe('#target')
    expect(store.preferences.trackerMode).toBe(mode)
  })

  it('preserves Gallery mode and weapon/camo highlighting through legacy destination redirects', async () => {
    await mount('/gallery')
    const smoke = buildGallery([han]).find(
      (entry) => entry.id === 'smoke' || entry.name === 'Smoke'
    )
    await router.push(galleryWeaponLocation(smoke.associations.find((a) => a.mode === 'dmz')))
    await settle()
    expect(router.currentRoute.value.path).toBe('/tracker')
    expect(store.preferences.trackerMode).toBe('dmz')
    expect(
      host.querySelector('[data-weapon-id="han-86"] [data-camo-id="smoke"].weapon-jump-highlight')
    ).not.toBeNull()
    expect(host.querySelector('input[value="dmz"]').checked).toBe(true)
  })

  it('offers one tracker link and three named native radio controls with the utilities intact', async () => {
    await mount('/tracker?mode=warzone')
    expect([...host.querySelectorAll('.nav-links a')].map((a) => a.textContent.trim())).toEqual([
      'Camo Tracker',
      'Weapon Prestige',
      'Mastery',
      'Camo Gallery',
      '',
    ])
    expect(host.querySelector('[aria-label="Settings"]')).not.toBeNull()
    expect(host.querySelector('[aria-label="Download progress image"]')).not.toBeNull()
    expect(
      [...host.querySelectorAll('.mode-switch input')].map((input) =>
        input.getAttribute('aria-label')
      )
    ).toEqual(['MP', 'DMZ', 'WZ'])
    expect([...host.querySelectorAll('.mode-label')].map((label) => label.textContent.trim()))
      .toEqual(['MP', 'DMZ', 'WZ'])
    expect(host.querySelectorAll('.mode-switch img')).toHaveLength(0)
    expect(host.querySelector('[aria-label="Challenge mode"]')).not.toBeNull()
  })
})
