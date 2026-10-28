// @vitest-environment jsdom
import { beforeEach, afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import GalleryView from '@/views/GalleryView.vue'
import { useStore } from '@/stores/store'
import catalog from '@/data/weapons/index'

let app, host, store
const settle = async () => {
  await nextTick()
  await nextTick()
}
const card = (name) => host.querySelector(`[aria-label="View ${name} details"]`)
async function select(label, value) {
  const control = host.querySelector(`[aria-label="${label}"]`)
  control.value = value
  control.dispatchEvent(new Event('change', { bubbles: true }))
  await settle()
}
async function open(name) {
  card(name).click()
  await settle()
  return document.querySelector('[role="dialog"]')
}
beforeEach(async () => {
  localStorage.clear()
  host = document.createElement('div')
  document.body.appendChild(host)
  const pinia = createPinia()
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:pathMatch(.*)*', component: GalleryView }],
  })
  await router.push('/gallery')
  await router.isReady()
  app = createApp(GalleryView)
  app.use(pinia).use(router)
  app.component('IconComponent', { render: () => h('span') })
  app.mount(host)
  store = useStore(pinia)
  await settle()
})
afterEach(() => {
  app.unmount()
  host.remove()
})

describe('collectible Gallery interactions', () => {
  it('offers alphabetical and progress sorting and updates order as ownership changes', async () => {
    const names = () =>
      [...host.querySelectorAll('.gallery-tile strong')].map((node) =>
        node.textContent.trim().replace(/\s*✓$/, '')
      )
    expect(host.querySelector('[aria-label="Gallery sort"]').value).toBe('name')
    await select('Camo category', 'collectible-special')
    expect(names()).toEqual(['Litmus', 'Locked Down', 'Prestige Master'])
    await select('Gallery sort', 'progress-desc')
    store.toggleCollectible('prestige-master')
    await settle()
    expect(names()).toEqual(['Prestige Master', 'Litmus', 'Locked Down'])
    await select('Gallery sort', 'progress-asc')
    expect(names()).toEqual(['Litmus', 'Locked Down', 'Prestige Master'])
    await select('Gallery sort', 'name-desc')
    expect(names()).toEqual(['Prestige Master', 'Locked Down', 'Litmus'])
  })
  it('keeps focus in the Gallery when ownership filtering removes the invoking card', async () => {
    await select('Camo category', 'collectibles')
    await select('Unlock status', 'locked')
    const dialog = await open('Litmus')
    dialog.querySelector('.ownership-toggle').click()
    await settle()
    expect(card('Litmus')).toBeNull()
    dialog.querySelector('[aria-label="Close camo details"]').click()
    await settle()
    expect(document.activeElement.getAttribute('aria-label')).toBe('Search camos')
  })
  it('toggles ownership, updates counts, checkmarks and bars, and restores keyboard focus', async () => {
    expect(host.querySelector('.collection-summary').textContent).toContain(
      'Collectibles: 0/6 owned'
    )
    const dialog = await open('Litmus')
    expect(dialog.textContent).toContain('Get 1,500 Operator Kills during the MW4 Beta')
    const toggle = dialog.querySelector('.ownership-toggle')
    expect(toggle.getAttribute('aria-pressed')).toBe('false')
    expect(card('Litmus').querySelector('.gallery-progress-track span').style.width).toBe('0%')
    toggle.click()
    await settle()
    expect(toggle.getAttribute('aria-pressed')).toBe('true')
    expect(card('Litmus').textContent).toContain('1/1 owned')
    expect(card('Litmus').querySelector('.owned-check')).not.toBeNull()
    expect(card('Litmus').querySelector('.gallery-progress-track span').style.width).toBe('100%')
    expect(host.querySelector('.collection-summary').textContent).toContain(
      'Collectibles: 1/6 owned'
    )
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await settle()
    expect(document.activeElement).toBe(card('Litmus'))
    await select('Camo category', 'collectibles')
    await select('Unlock status', 'unlocked')
    expect(host.querySelectorAll('.gallery-tile')).toHaveLength(1)
    await select('Unlock status', 'locked')
    expect(card('Litmus')).toBeNull()
    expect(host.querySelectorAll('.gallery-tile')).toHaveLength(6)
  })

  it('shows one War Spoils card and toggles supported weapons without counting manuals', async () => {
    expect(host.querySelectorAll('[aria-label="View War Spoils details"]')).toHaveLength(1)
    const dialog = await open('War Spoils')
    expect(dialog.textContent).toContain('Extract 3 Weapon Manuals for this weapon in DMZ.')
    expect(dialog.textContent).not.toContain('Supported subset')
    expect(dialog.querySelectorAll('.weapon-ownership-button')).toHaveLength(catalog.length)
    const groups = [...dialog.querySelectorAll('.weapon-ownership-category')]
    expect(groups).toHaveLength(new Set(catalog.map((weapon) => weapon.category)).size)
    expect(groups[0].getAttribute('aria-label')).toBe('Assault Rifles')
    expect(dialog.querySelectorAll('.unlock-row')).toHaveLength(0)
    expect(dialog.querySelector('input[type=number]')).toBeNull()
    const toggles = [...dialog.querySelectorAll('.weapon-ownership-button')]
    const toggle = toggles.find(
      (button) => button.getAttribute('aria-label') === 'Own War Spoils for .50 GS'
    )
    expect(toggle.title).toBe('.50 GS · Not owned')
    expect(toggle.querySelector('.weapon-hover-name').textContent).toBe('.50 GS')
    expect(toggle.querySelector('image').getAttribute('href')).toBe(
      'https://cdn.itchy-beard.co.uk/divergence/weapons/weapon-50-gs.png'
    )
    toggles.at(-1).focus()
    toggles
      .at(-1)
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }))
    expect(document.activeElement.getAttribute('aria-label')).toBe('Close camo details')
    toggle.click()
    await settle()
    expect(store.save.collectibles.perWeapon['war-spoils']['50-gs']).toBe(true)
    expect(toggle.getAttribute('aria-pressed')).toBe('true')
    expect(toggle.querySelector('.ownership-check')).not.toBeNull()
    expect(
      toggles
        .find((button) => button.getAttribute('aria-label') === 'Own War Spoils for M4')
        .getAttribute('aria-pressed')
    ).toBe('false')
    toggle.querySelector('image').dispatchEvent(new Event('error'))
    await settle()
    expect(toggle.querySelector('svg')).toBeNull()
    expect(toggle.querySelector('.weapon-initials')).not.toBeNull()
    expect(toggle.getAttribute('aria-label')).toBe('Own War Spoils for .50 GS')
    toggle.click()
    await settle()
    expect(store.save.collectibles.perWeapon['war-spoils']['50-gs']).toBe(false)
    expect(toggle.getAttribute('aria-pressed')).toBe('false')
    toggle.click()
    await settle()
    expect(card('War Spoils').textContent).toContain(`1/${catalog.length} unlocked`)
    expect(host.querySelector('.collection-summary').textContent).toContain(
      'Collectibles: 0/6 owned'
    )
    expect(store.overallProgress.total).toBe(495)
  })

  it('uses missing-image fallback for unuploaded artwork and preserves compact progress markup', async () => {
    const image = card('Locked Down').querySelector('img')
    expect(image.getAttribute('src')).toBe(
      'https://cdn.itchy-beard.co.uk/divergence/camouflages/locked-down.png'
    )
    image.dispatchEvent(new Event('error'))
    await settle()
    expect(card('Locked Down').querySelector('img').getAttribute('src')).toBe(
      'https://cdn.itchy-beard.co.uk/divergence/camouflages/_missing.png'
    )
    expect(
      card('Locked Down').querySelector('[aria-label="Locked Down artwork unavailable"]')
    ).not.toBeNull()
    expect(card('Locked Down').querySelector('.gallery-progress-track')).not.toBeNull()
    await select('Camo category', 'collectible-promotional')
    expect(host.querySelectorAll('.gallery-tile')).toHaveLength(2)
    await select('Camo availability', 'available')
    expect(host.querySelectorAll('.gallery-tile')).toHaveLength(0)
    await select('Camo availability', 'all')
    expect(host.querySelectorAll('.gallery-tile')).toHaveLength(2)
  })
})
