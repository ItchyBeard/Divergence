import { beforeEach, afterEach, it, expect, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { createPinia } from 'pinia'
import WeaponName from '../WeaponName.vue'
import han from '@/data/weapons/assault-rifles/han-86.weapon'
import { useStore } from '@/stores/store'
import { weaponSilhouetteUrl } from '@/data/mw4/artwork'

let app, host
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-25T12:00:00Z'))
  localStorage.clear()
  host = document.createElement('div')
  document.body.appendChild(host)
})
afterEach(() => {
  app?.unmount()
  host.remove()
  vi.useRealTimers()
})
function mount(props = {}) {
  const pinia = createPinia()
  app = createApp(WeaponName, { weapon: { ...han, available: true }, ...props })
  app.use(pinia)
  app.component('IconComponent', { render: () => h('span') })
  useStore(pinia).setPreferences({ weaponIcons: true })
  app.mount(host)
  return useStore(pinia)
}

it.each(['han-86', 'axion', '50-gs', 'fss-carbon-edge-1095', 'rpg-8'])(
  'resolves the shared artwork naming convention for %s',
  (id) => {
    expect(weaponSilhouetteUrl(id)).toBe(
      `https://cdn.itchy-beard.co.uk/divergence/weapons/weapon-${id}.png`
    )
  }
)
it.each(['../han-86', '', undefined])('ignores an invalid artwork ID %s', (id) => {
  expect(weaponSilhouetteUrl(id)).toBeNull()
})
it('requests artwork for a weapon beyond the initial HAN trial', () => {
  mount({ weapon: { ...han, id: 'axion', name: 'AXION', available: true } })
  expect(host.querySelector('mask image').getAttribute('href')).toBe(weaponSilhouetteUrl('axion'))
  expect(host.querySelector('svg').getAttribute('aria-hidden')).toBe('true')
})
it('removes missing silhouettes without affecting the title, completion control or saved progress', async () => {
  const store = mount()
  const before = store.exportProgress()
  host.querySelector('mask image').dispatchEvent(new Event('error'))
  await nextTick()
  expect(host.querySelector('.weapon-silhouette')).toBeNull()
  expect(host.querySelector('.weapon-name').textContent).toBe('HAN 86')
  expect(host.querySelector('[aria-label="Complete HAN 86"]')).not.toBeNull()
  expect(store.exportProgress()).toBe(before)
})
it('keeps table headings compact without requesting a silhouette', () => {
  mount({ compact: true })
  expect(host.querySelector('.weapon-silhouette')).toBeNull()
})
it('uses a solid colour for the highest earned tier, then restores white when reset', async () => {
  const store = mount()
  const fill = () => host.querySelector('.weapon-silhouette g rect').getAttribute('fill')
  expect(fill()).toBe('#ffffff')
  for (const [id, colour] of [
    ['gold', '#e5b75e'],
    ['platinum', '#d6e0e9'],
    ['harmonic-break', '#ef8296'],
    ['divergence', '#cbb8f2'],
  ]) {
    store.toggleCamo('han-86', id, 'multiplayer')
    await nextTick()
    expect(fill()).toBe(colour)
    expect(host.querySelector('pattern')).toBeNull()
    expect(host.querySelectorAll('image')).toHaveLength(1) // Only the silhouette mask; no camo texture requests.
  }
  store.toggleCamo('han-86', 'gold', 'multiplayer')
  await nextTick()
  expect(fill()).toBe('#ffffff')
})
