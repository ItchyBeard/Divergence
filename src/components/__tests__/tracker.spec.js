// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import HomeView from '@/views/HomeView.vue'
import SettingsView from '@/views/SettingsView.vue'
import ShareProgressModal from '@/components/ShareProgressModal.vue'
import { useStore } from '@/stores/store'
import messages from '@/i18n/locales/en-GB.json'
import html2canvas from 'html2canvas'
import ProgressComponent from '@/components/ProgressComponent.vue'
import PrestigeView from '@/views/PrestigeView.vue'
import MasteryView from '@/views/MasteryView.vue'

// Isolate the single-card interaction fixture from the expanding production catalog.
vi.mock('@/data/weapons/index.js', async () => ({
  default: [(await import('@/data/weapons/assault-rifles/han-86.weapon')).default],
}))

vi.mock('html2canvas', () => ({
  default: vi.fn(async () => ({ toDataURL: () => 'data:image/png;base64,dGVzdA==' })),
}))
let app
let host
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-24T12:00:00'))
  localStorage.clear()
  host = document.createElement('div')
  document.body.appendChild(host)
})
afterEach(() => {
  app?.unmount()
  host.remove()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

function mount(component, props = {}) {
  const pinia = createPinia()
  app = createApp(component, props)
  app.use(pinia)
  app.use(createI18n({ locale: 'en-GB', messages: { 'en-GB': messages } }))
  app.component('IconComponent', { render: () => h('span') })
  app.directive('tippy', {})
  const vm = app.mount(host)
  return { store: useStore(pinia), vm }
}
const camo = (name) =>
  [...host.querySelectorAll('button.camo-button')].find((button) =>
    button.getAttribute('aria-label').startsWith(name + ' —')
  )
async function click(button) {
  button.click()
  await nextTick()
}

describe('MW4 tracker interface', () => {
  it('renders the compact 8/3/4 shared grid and switches challenge text across modes without losing flags', async () => {
    const mode = ref('multiplayer')
    const { store } = mount({ render: () => h(HomeView, { mode: mode.value }) })
    expect(host.querySelectorAll('.weapon-wrapper button.military')).toHaveLength(8)
    expect(host.querySelectorAll('.weapon-wrapper button.special')).toHaveLength(3)
    expect(host.querySelectorAll('.weapon-wrapper button.completionist')).toHaveLength(4)
    expect(camo('Smoke').getAttribute('aria-label')).toContain('20 kills')
    await click(camo('Smoke'))
    expect(store.save.weapons['han-86'].sharedCamos).toEqual({ smoke: true })
    expect(camo('Smoke').getAttribute('aria-pressed')).toBe('true')
    expect(store.overallProgress.completed).toBe(1)
    mode.value = 'dmz'
    await nextTick()
    expect(camo('Smoke').getAttribute('aria-label')).toContain('75 kills')
    expect(camo('Smoke').getAttribute('aria-pressed')).toBe('true')
    expect(host.querySelector('.mastery')).toBeNull()
    mode.value = 'warzone'
    await nextTick()
    expect(camo('Smoke').getAttribute('aria-pressed')).toBe('true')
    expect(camo('Stormwave').classList.contains('unavailable')).toBe(false)
    expect(camo('Stormwave').getAttribute('aria-label')).toContain('Unavailable')
  })

  it('keeps list/table layouts, favourites and search filters functional', async () => {
    const { store } = mount(HomeView, { mode: 'multiplayer' })
    await click(host.querySelector('button[aria-label="Favourite HAN 86"]'))
    store.setPreferences({ layout: 'list', favorites: true })
    await nextTick()
    expect(host.querySelectorAll('.weapon-wrapper')).toHaveLength(2)
    expect(host.querySelector('.weapon-wrapper .info').textContent).toContain('Reach Weapon Level')
    store.setPreferences({ layout: 'table', favorites: false })
    await nextTick()
    expect(host.querySelectorAll('.camo-table tbody .camo-button')).toHaveLength(15)
    store.setFilters({ hideMilitaryCamos: true })
    await nextTick()
    expect(host.querySelectorAll('.camo-table tbody .camo-button')).toHaveLength(7)
    const search = host.querySelector('input[type=search]')
    search.value = 'not a match'
    search.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()
    expect(host.textContent).toContain('No weapons match these filters.')
  })

  it('loads persisted MW4 completion into a newly mounted tracker', async () => {
    const { store } = mount(HomeView, { mode: 'multiplayer' })
    store.toggleCamo('han-86', 'red', 'multiplayer')
    app.unmount()
    const { store: refreshed } = mount(HomeView, { mode: 'dmz' })
    refreshed.getStoredProgress()
    await nextTick()
    expect(camo('Red').getAttribute('aria-pressed')).toBe('true')
    expect(camo('Red').getAttribute('aria-label')).toContain('50 times')
    expect(refreshed.overallProgress.completed).toBe(1)
  })

  it('imports and exports from Settings, and confirms/reset progress without resetting preferences', async () => {
    const { store } = mount(SettingsView)
    store.toggleCamo('han-86', 'smoke', 'multiplayer')
    store.setPreferences({ layout: 'list' })
    await nextTick()
    const exported = host.querySelector('[aria-label="Export progress JSON"]').value
    const button = (text) =>
      [...host.querySelectorAll('button')].find((entry) => entry.textContent === text)
    await click(button('Reset progress'))
    expect(store.camoCompleted('han-86', 'smoke')).toBe(true)
    await click(button('Confirm reset'))
    expect(store.camoCompleted('han-86', 'smoke')).toBe(false)
    expect(store.preferences.layout).toBe('list')
    const input = host.querySelector('[aria-label="Import progress JSON"]')
    input.value = exported
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()
    await click(button('Replace Divergence progress'))
    expect(store.camoCompleted('han-86', 'smoke')).toBe(true)
    expect(host.textContent).toContain('Progress imported.')
    input.value = '{bad'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()
    await click(button('Replace Divergence progress'))
    expect(store.camoCompleted('han-86', 'smoke')).toBe(true)
  })

  it('generates a share image with MW4 shared totals and selected mode mastery', async () => {
    const { store, vm } = mount(ShareProgressModal, { mode: 'dmz' })
    store.toggleCamo('han-86', 'gold', 'multiplayer')
    store.toggleMastery('dmz', 'chiral')
    await nextTick()
    await vm.generateImage()
    expect(html2canvas).toHaveBeenCalledWith(
      host.querySelector('.share-card'),
      expect.objectContaining({ width: 1200, height: 630 })
    )
    expect(host.textContent).toContain('Modern Warfare 4 · DMZ')
    expect(host.textContent).toContain('DMZ mastery: 1/3')
    const download = host.querySelector('a[download]')
    expect(download.download).toBe('divergence-dmz-progress.png')
    expect(download.href).toBe('data:image/png;base64,dGVzdA==')
    expect(host.querySelector('.share-preview').src).toBe(download.href)
    const sections = [...host.querySelectorAll('.share-card .stat-box')]
    expect(sections).toHaveLength(4)
    for (const [index, id] of ['gold', 'platinum', 'harmonic-break', 'divergence'].entries()) {
      expect(sections[index].classList.contains('completion-' + id)).toBe(true)
      expect(sections[index].querySelector('.tier-band')).not.toBeNull()
      expect(sections[index].querySelector('.mini-fill').style.background).toBe('')
      expect(sections[index].querySelector('.mini-fill').style.width).toBe(
        index === 0 ? '100%' : '0%'
      )
    }
    expect(sections[0].querySelector('.progress-text').textContent).toBe('1 / 1')
  })

  it('double-clicks a weapon name and offers a direct accessible bulk toggle', async () => {
    const { store } = mount(HomeView, { mode: 'multiplayer' })
    const name = host.querySelector('button.weapon-name')
    name.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))
    await nextTick()
    expect(store.weaponCompleted('han-86')).toBe(true)
    expect(host.querySelector('.weapon-heading.completed')).not.toBeNull()
    await click(host.querySelector('[aria-label="Reset HAN 86"]'))
    expect(store.weaponCompleted('han-86')).toBe(false)
    await click(host.querySelector('[aria-label="Complete HAN 86"]'))
    expect(store.weaponCompleted('han-86')).toBe(true)
  })

  it('updates the shared fixed-bar readout without including Prestige or mastery', async () => {
    const { store } = mount(ProgressComponent)
    store.toggleCamo('han-86', 'military-8', 'multiplayer')
    store.toggleMastery('dmz', 'chiral')
    store.togglePrestige('han-86', 'pyroclast')
    await nextTick()
    expect(host.querySelector('[role="progressbar"]').getAttribute('aria-valuenow')).toBe('53')
    expect(host.textContent).toContain('8/15')
    store.resetProgress()
    await nextTick()
    expect(host.querySelector('[role="progressbar"]').getAttribute('aria-valuenow')).toBe('0')
  })

  it('renders Prestige directly from the catalog without changing shared camos', async () => {
    const { store } = mount(PrestigeView)
    expect(host.querySelectorAll('.weapon-wrapper button.prestige')).toHaveLength(4)
    expect(host.querySelector('[data-weapon-id="han-86"]')).not.toBeNull()
    await click(camo('Pyroclast'))
    expect(store.save.prestige['han-86'].pyroclast).toBe(true)
    expect(store.overallProgress.percent).toBe(0)
    expect(store.save.weapons).toEqual({})
    expect(host.querySelector('.name').dataset.label).toBeUndefined()
  })

  it('retains independent mastery in a dedicated compact section', async () => {
    const { store } = mount(MasteryView)
    expect(host.querySelectorAll('section.mastery')).toHaveLength(3)
    await click(camo('Mercurial Drift'))
    await click(camo('Chiral'))
    await click(camo('Parallax'))
    expect(store.save.mastery.multiplayer['mercurial-drift']).toBe(true)
    expect(store.save.mastery.dmz.chiral).toBe(true)
    expect(store.save.mastery.warzone).toEqual({ parallax: true })
    expect(store.overallProgress.percent).toBe(0)
    expect(host.querySelectorAll('.mastery-entry')).toHaveLength(9)
    expect(host.querySelector('[data-mode="multiplayer"] .mode-count').textContent).toBe('1/3')
    expect(
      host.querySelector('[data-mode="dmz"] [role="progressbar"]').getAttribute('aria-valuenow')
    ).toBe('1')
    expect(host.querySelector('[data-mode="warzone"] .completion-state').textContent).toBe(
      'Completed'
    )
    expect(host.querySelector('.mastery-entry .prerequisite').textContent).toContain('Requires')
  })

  it('persists compact filter visibility and favourite-only filtering', async () => {
    const { store } = mount(HomeView, { mode: 'multiplayer' })
    const control = (name) => host.querySelector(`[aria-label="${name}"]`)
    await click(control('Hide filters'))
    expect(store.filters.hideFilters).toBe(true)
    await click(control('Show filters'))
    expect(store.filters.hideFilters).toBe(false)
    await click(control('Only favourites'))
    expect(host.textContent).toContain('No weapons match these filters.')
    store.toggleFavorite('han-86')
    await nextTick()
    expect(host.querySelector('[data-weapon-id="han-86"]')).not.toBeNull()
    expect(host.textContent).not.toMatch(
      /populated|catalog|manual checklist|placeholder|documentation/i
    )
  })
})

describe('reactive shared header gradients', () => {
  it('changes through all tiers and resets across all modes without Prestige/mastery influence', async () => {
    const mode = ref('multiplayer')
    const { store } = mount({ render: () => h(HomeView, { mode: mode.value }) })
    const tier = () => host.querySelector('.weapon-heading').dataset.completionTier
    expect(tier()).toBe('default')
    store.togglePrestige('han-86', 'pyroclast-cascade')
    store.toggleMastery('multiplayer', 'mercurial-drift')
    await nextTick()
    expect(tier()).toBe('default')
    for (const id of ['gold', 'platinum', 'harmonic-break', 'divergence']) {
      store.toggleCamo('han-86', id, 'multiplayer')
      await nextTick()
      expect(tier()).toBe(id)
      for (const selectedMode of ['dmz', 'warzone', 'multiplayer']) {
        mode.value = selectedMode
        await nextTick()
        expect(tier()).toBe(id)
      }
    }
    for (const [id, next] of [
      ['divergence', 'harmonic-break'],
      ['harmonic-break', 'platinum'],
      ['platinum', 'gold'],
      ['gold', 'default'],
    ]) {
      store.toggleCamo('han-86', id, 'warzone')
      await nextTick()
      expect(tier()).toBe(next)
    }
    store.toggleCamo('han-86', 'divergence', 'dmz')
    store.toggleWeaponCompleted('han-86', 'multiplayer')
    await nextTick()
    expect(tier()).toBe('default')
  })
})

describe('mode context and compact Completionist milestones', () => {
  it.each([
    ['multiplayer', 'MP'],
    ['dmz', 'DMZ'],
    ['warzone', 'WZ'],
  ])('presents %s challenges with a restrained mode accent', async (mode, name) => {
    mount(HomeView, { mode })
    expect(host.querySelector('.tracker-view').classList.contains('mode-' + mode)).toBe(true)
    expect(host.querySelector('.mode-heading')).toBeNull()
    expect(host.querySelector('.toolbar-actions .mode-switch')).not.toBeNull()
    expect(host.querySelector('input[value="' + mode + '"]').getAttribute('aria-label')).toBe(name)
    expect(host.querySelector('input[value="' + mode + '"]').checked).toBe(true)
  })
  it('renders four circular official icons and tier-coloured, reactive progress bars', async () => {
    const { store } = mount(HomeView, { mode: 'multiplayer' })
    const counters = [...host.querySelectorAll('.overall-progress-component .counter')]
    expect(counters).toHaveLength(4)
    const ids = ['gold', 'platinum', 'harmonic-break', 'divergence']
    counters.forEach((counter, index) => {
      expect(counter.classList.contains('completion-' + ids[index])).toBe(true)
      expect(counter.querySelector('.camo-round img').src).toContain('/' + ids[index] + '.png')
      expect(counter.querySelector('[role=progressbar]').getAttribute('aria-valuenow')).toBe('0')
    })
    store.toggleCamo('han-86', 'platinum', 'multiplayer')
    await nextTick()
    expect(counters[0].querySelector('.progress-fill').style.width).toBe('100%')
    expect(counters[1].querySelector('[role=progressbar]').getAttribute('aria-valuenow')).toBe(
      '100'
    )
    expect(counters[2].querySelector('[role=progressbar]').getAttribute('aria-valuenow')).toBe('0')
  })
})
