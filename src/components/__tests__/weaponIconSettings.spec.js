import { beforeEach, afterEach, it, expect, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import SettingsView from '@/views/SettingsView.vue'
import WeaponName from '../WeaponName.vue'
import han from '@/data/weapons/assault-rifles/han-86.weapon'
import { useStore } from '@/stores/store'
import { emptySave, parseSave } from '@/data/mw4/save'

let app, host
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-25T12:00:00Z'))
  localStorage.clear()
  setActivePinia(createPinia())
  host = document.createElement('div')
  document.body.appendChild(host)
})
afterEach(() => {
  app?.unmount()
  host.remove()
  vi.useRealTimers()
})

it('starts disabled and does not render or request icon artwork until enabled in Settings', async () => {
  const pinia = createPinia()
  app = createApp({
    render: () =>
      h('div', [h(SettingsView), h(WeaponName, { weapon: { ...han, available: true } })]),
  })
  app.use(pinia)
  app.component('IconComponent', { render: () => h('span') })
  app.mount(host)
  const store = useStore(pinia)
  const toggle = host.querySelector('[role="switch"]')
  expect(toggle.checked).toBe(false)
  expect(host.querySelector('.weapon-silhouette')).toBeNull()
  toggle.click()
  await nextTick()
  expect(store.preferences.weaponIcons).toBe(true)
  expect(toggle.checked).toBe(true)
  expect(host.querySelector('mask image').getAttribute('href')).toContain('/weapon-han-86.png')
  expect(JSON.parse(localStorage.getItem('divergence:mw4:v1:dev')).preferences.weaponIcons).toBe(
    true
  )
  const progress = JSON.stringify(store.save.weapons)
  toggle.click()
  await nextTick()
  expect(store.preferences.weaponIcons).toBe(false)
  expect(host.querySelector('.weapon-silhouette')).toBeNull()
  expect(JSON.stringify(store.save.weapons)).toBe(progress)
})

it('defaults old saves to off without changing recorded completion', () => {
  const old = emptySave()
  delete old.preferences.weaponIcons
  old.prestige['han-86'] = { pyroclast: true }
  old.weapons['han-86'] = { sharedCamos: { gold: true } }
  const next = parseSave(old)
  expect(next.preferences.weaponIcons).toBe(false)
  expect(next.weapons).toEqual(old.weapons)
  expect(next.prestige).toEqual(old.prestige)
  expect(old.preferences).not.toHaveProperty('weaponIcons')
})

it.each([true, false])(
  'preserves %s through reload, export/import and progress reset',
  (enabled) => {
    const store = useStore()
    store.setPreferences({ weaponIcons: enabled })
    const exported = store.exportProgress()
    setActivePinia(createPinia())
    const reloaded = useStore()
    reloaded.getStoredProgress()
    expect(reloaded.preferences.weaponIcons).toBe(enabled)
    reloaded.importProgress(exported)
    expect(reloaded.preferences.weaponIcons).toBe(enabled)
    reloaded.resetProgress()
    expect(reloaded.preferences.weaponIcons).toBe(enabled)
  }
)

it.each(['true', 1, null])('rejects a non-boolean icon preference %s', (value) => {
  const save = emptySave()
  save.preferences.weaponIcons = value
  expect(() => parseSave(save)).toThrow('invalid preferences')
})
