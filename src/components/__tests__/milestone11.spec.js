import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { createPinia } from 'pinia'
import SupportBanner from '../SupportBanner.vue'
import CompletionCelebration from '../CompletionCelebration.vue'
import ModalComponent from '../ModalComponent.vue'
import PrestigeView from '@/views/PrestigeView.vue'
import catalog from '@/data/weapons/index.js'
import { getWeaponCamos as sharedCamos } from '@/data/mw4/catalog'
import { useStore } from '@/stores/store'
import { confettiBurst } from '@/utils/confetti'
import { supportDelay, supportStorageKey, donationUrl } from '@/utils/support'

vi.mock('@/data/weapons/index.js', async () => {
  const { default: weapon } = await import('@/data/weapons/assault-rifles/han-86.weapon')
  return {
    default: [
      weapon,
      ...Array.from({ length: 32 }, (_, i) => ({ ...weapon, id: `baseline-${i}` })),
    ],
  }
})
let app, host, context
function mount(component, props = {}) {
  host = document.createElement('div')
  document.body.appendChild(host)
  const pinia = createPinia()
  app = createApp(component, props)
  app.use(pinia)
  app.component('IconComponent', { render: () => h('span') })
  app.config.globalProperties.$t = () => 'Close'
  const vm = app.mount(host)
  return { vm, store: useStore(pinia) }
}
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-25T12:00:00Z'))
  localStorage.clear()
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false }))
  )
  vi.spyOn(performance, 'now').mockImplementation(() => Date.now())
  vi.stubGlobal('requestAnimationFrame', (callback) =>
    setTimeout(() => callback(performance.now()), 16)
  )
  vi.stubGlobal('cancelAnimationFrame', clearTimeout)
  context = {
    clearRect: vi.fn(),
    save: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    fillRect: vi.fn(),
    restore: vi.fn(),
  }
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context)
})
afterEach(() => {
  app?.unmount()
  host?.remove()
  document.querySelectorAll('canvas').forEach((canvas) => canvas.remove())
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})
const advance = async (time) => {
  await vi.advanceTimersByTimeAsync(time)
  await nextTick()
}

describe('support notice', () => {
  it('waits the original 15 seconds, remembers dismissal and survives remounts', async () => {
    mount(SupportBanner)
    expect(host.querySelector('aside')).toBeNull()
    await advance(supportDelay - 1)
    expect(host.querySelector('aside')).toBeNull()
    await advance(1)
    expect(host.querySelector('aside a').href).toBe(donationUrl)
    host.querySelector('button').click()
    await nextTick()
    expect(localStorage.getItem(supportStorageKey)).toBe('dismissed')
    app.unmount()
    host.remove()
    mount(SupportBanner)
    await advance(supportDelay * 2)
    expect(host.querySelector('aside')).toBeNull()
  })
  it('also remembers having shown the notice and cancels pending work on unmount', async () => {
    mount(SupportBanner)
    await advance(supportDelay)
    expect(localStorage.getItem(supportStorageKey)).toBe('shown')
    app.unmount()
    host.remove()
    mount(SupportBanner)
    await advance(supportDelay)
    expect(host.querySelector('aside')).toBeNull()
    app.unmount()
    host.remove()
    localStorage.clear()
    mount(SupportBanner)
    app.unmount()
    await advance(supportDelay)
    expect(localStorage.getItem(supportStorageKey)).toBeNull()
  })
})

describe('celebration accessibility and motion', () => {
  it('opens only for an achievement, formats real dates, traps focus, closes on Escape and restores focus', async () => {
    const { store } = mount(CompletionCelebration)
    const opener = document.createElement('button')
    document.body.appendChild(opener)
    opener.focus()
    store.toggleCamo('han-86', 'smoke', 'multiplayer')
    await nextTick()
    expect(host.querySelector('[role=dialog]').style.display).toBe('none')
    completeOtherWeapons(store.save)
    store.toggleCamo('han-86', 'divergence', 'dmz')
    await nextTick()
    await advance(100)
    const dialog = host.querySelector('[role=dialog]')
    expect(document.activeElement).toBe(dialog)
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    expect(document.getElementById(dialog.getAttribute('aria-labelledby')).textContent).toContain(
      'Divergence completed!'
    )
    expect(host.querySelectorAll('dd')[0].textContent).toBe('25 October 2026')
    expect(host.querySelectorAll('dd')[1].textContent).toBe('25 October 2026')
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    )
    expect(document.activeElement.getAttribute('aria-label')).toBe('Close dialog')
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true })
    )
    expect(document.activeElement.textContent).toBe('Close')
    expect(document.querySelector('canvas')).not.toBeNull()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await advance(300)
    expect(document.activeElement).toBe(opener)
    expect(document.querySelector('canvas')).toBeNull()
    expect(store.celebrationPending).toBe(false)
    opener.remove()
  })
  it('shows unavailable history and still opens the modal under reduced motion, without confetti', async () => {
    window.matchMedia.mockReturnValue({ matches: true })
    const { store } = mount(CompletionCelebration)
    store.save.beganGrind = '2026-10-24T12:00:00Z'
    completeOtherWeapons(store.save)
    store.toggleCamo('han-86', 'divergence', 'multiplayer')
    await nextTick()
    await advance(100)
    expect(host.querySelector('dd').textContent).toBe('Not recorded')
    expect(host.querySelector('[role=dialog]').style.display).toBe('')
    expect(document.querySelector('canvas')).toBeNull()
  })
  it('cleans up animation automatically and cancels it safely', async () => {
    const stop = confettiBurst()
    const canvas = document.querySelector('canvas')
    expect(canvas.style.pointerEvents).toBe('none')
    await advance(4100)
    expect(document.querySelector('canvas')).toBeNull()
    expect(context.fillRect).toHaveBeenCalled()
    stop()
    expect(vi.getTimerCount()).toBe(0)
  })
  it('cancels modal open timers when closed or unmounted', async () => {
    const { vm } = mount(ModalComponent)
    vm.open()
    vm.close()
    await advance(500)
    expect(vm.active).toBe(false)
    expect(vm.show).toBe(false)
    vm.open()
    app.unmount()
    await advance(500)
    expect(vi.getTimerCount()).toBe(0)
  })
})

it('renders a blank compact Prestige input and updates immediately on input', async () => {
  const { store } = mount(PrestigeView)
  const input = host.querySelector('[aria-label="Prestige Level"]')
  expect(input.value).toBe('')
  expect(input.closest('.toolbar-actions')).not.toBeNull()
  store.togglePrestige('han-86', 'pyroclast')
  input.value = '150'
  input.dispatchEvent(new Event('input', { bubbles: true }))
  await nextTick()
  expect(store.save.prestigeLevel).toBe(150)
  const scatter = host.querySelector('[aria-label^="Pyroclast Scatter —"]')
  expect(scatter.getAttribute('aria-pressed')).toBe('true')
  input.value = ''
  input.dispatchEvent(new Event('input', { bubbles: true }))
  await nextTick()
  expect(scatter.getAttribute('aria-pressed')).toBe('false')
})

function completeOtherWeapons(save) {
  for (const weapon of catalog.filter((entry) => entry.id.startsWith('baseline-'))) {
    save.weapons[weapon.id] = {
      sharedCamos: Object.fromEntries(
        sharedCamos(weapon, 'multiplayer').map((camo) => [camo.id, true])
      ),
    }
  }
}
