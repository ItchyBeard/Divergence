import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createApp, h, nextTick } from 'vue'
import catalog from '@/data/weapons/index.js'
import { getWeaponCamos } from '@/data/mw4/catalog'
import { launchRequirements, progressPercentage } from '@/data/mw4/launchRequirements'
import { emptySave, parseSave } from '@/data/mw4/save'
import { prerequisiteText } from '@/data/mw4/presentation'
import { modes } from '@/data/mw4/modes'
import { useStore } from '../store'
import OverallProgressComponent from '@/components/OverallProgressComponent.vue'
import ShareProgressModal from '@/components/ShareProgressModal.vue'
import WeaponsComponent from '@/components/WeaponsComponent.vue'
import ProgressComponent from '@/components/ProgressComponent.vue'
import html2canvas from 'html2canvas'

// A controlled launch roster; seasonal fixtures never enter the production catalog.
vi.mock('@/data/weapons/index.js', async () => {
  const actual = await vi.importActual('@/data/weapons/index.js')
  return { default: actual.default.filter((weapon) => weapon.season === 0) }
})
vi.mock('html2canvas', () => ({
  default: vi.fn(async () => ({ toDataURL: () => 'data:image/png;base64,dGVzdA==' })),
}))
const baseline = [...catalog]
const ar = baseline.filter((weapon) => weapon.category === 'assault-rifles')
let app, host
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-25T12:00:00Z'))
  catalog.splice(0, catalog.length, ...baseline)
  localStorage.clear()
  setActivePinia(createPinia())
})
afterEach(() => {
  app?.unmount()
  host?.remove()
  vi.restoreAllMocks()
  vi.useRealTimers()
})
function addWeapons(count, overrides = {}) {
  const additions = Array.from({ length: count }, (_, i) => ({
    ...ar[0],
    id: `seasonal-${i}`,
    name: `Seasonal ${i}`,
    season: 1,
    ...overrides,
  }))
  catalog.push(...additions)
  return additions
}
function completedSave(weapons) {
  const save = emptySave()
  save.weapons = Object.fromEntries(
    weapons.map((weapon) => [
      weapon.id,
      {
        sharedCamos: Object.fromEntries(
          getWeaponCamos(weapon, 'multiplayer').map((camo) => [camo.id, true])
        ),
      },
    ])
  )
  return save
}
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

describe('fixed launch progression', () => {
  it('records the actual original 33-weapon distribution independently of registered seasonal weapons', () => {
    expect(baseline).toHaveLength(33)
    expect(
      Object.fromEntries(
        Object.keys(launchRequirements.categories).map((category) => [
          category,
          baseline.filter((weapon) => weapon.category === category).length,
        ])
      )
    ).toEqual(launchRequirements.categories)
    expect(
      Object.values(launchRequirements.categories).reduce((sum, count) => sum + count, 0)
    ).toBe(33)
    const store = useStore()
    expect(store.overallProgress).toEqual({ completed: 0, total: 495, percent: 0 })
    expect(store.completionistStats.every((entry) => entry.total === 33)).toBe(true)
  })
  it('allows any eight of nine ARs, including a seasonal replacement, then displays 9/8', () => {
    const [seasonal] = addWeapons(1)
    const store = useStore()
    store.importProgress(completedSave([...ar.slice(1), seasonal]))
    expect(store.camoCompleted(ar[0].id, 'divergence')).toBe(false)
    expect(store.categoryProgress('assault-rifles')).toEqual({ completed: 8, total: 8 })
    expect(
      getWeaponCamos(seasonal, 'multiplayer').find((camo) => camo.id === 'platinum').prerequisite
        .count
    ).toBe(8)
    store.toggleWeaponCompleted(ar[0].id, 'multiplayer')
    expect(store.categoryProgress('assault-rifles')).toEqual({ completed: 9, total: 8 })
    store.setFilters({ search: seasonal.name, hideCompleted: true })
    expect(store.categoryProgress('assault-rifles')).toEqual({ completed: 9, total: 8 })
    expect(store.completionistStats[0]).toMatchObject({ completed: 9, total: 33 })
  })
  it.each([34, 40, 50])(
    'accepts seasonal substitutes and over-completion with %i registered weapons',
    (size) => {
      const seasonal = addWeapons(size - 33)
      const store = useStore()
      store.importProgress(completedSave([...baseline.slice(1), seasonal[0]]))
      expect(store.launchCompleted).toBe(true)
      expect(store.overallProgress).toEqual({ completed: 495, total: 495, percent: 100 })
      store.importProgress(completedSave(catalog))
      expect(store.overallProgress).toEqual({ completed: size * 15, total: 495, percent: 100 })
      for (const stat of store.completionistStats)
        expect(stat).toMatchObject({ completed: size, total: 33 })
    }
  )
  it('does not aggregate partial extra weapons into a false completion', () => {
    const seasonal = addWeapons(17)
    const store = useStore()
    const save = completedSave(baseline.slice(0, 32))
    for (const weapon of [baseline[32], ...seasonal])
      save.weapons[weapon.id] = { sharedCamos: { 'military-1': true } }
    store.importProgress(save)
    expect(store.overallProgress).toEqual({ completed: 498, total: 495, percent: 97 })
    expect(store.launchCompleted).toBe(false)
    expect(store.celebrationPending).toBe(false)
    // Even rounding the last missing camo must not claim 100%.
    save.weapons[baseline[32].id] = completedSave([baseline[32]]).weapons[baseline[32].id]
    save.weapons[baseline[32].id].sharedCamos.divergence = false
    store.importProgress(save)
    expect(store.overallProgress.percent).toBe(99)
    expect(store.launchCompleted).toBe(false)
  })
  it('excludes unreleased saved progress without moving targets', () => {
    const future = addWeapons(1, { releaseDate: '2027-01-01' })
    const store = useStore()
    store.importProgress(completedSave([...baseline.slice(1), ...future]))
    expect(store.overallProgress).toEqual({ completed: 480, total: 495, percent: 97 })
    expect(store.completionistStats[0]).toMatchObject({ completed: 32, total: 33 })
    expect(store.launchCompleted).toBe(false)
    vi.setSystemTime(new Date('2027-01-02T12:00:00Z'))
    store.refreshAvailability()
    expect(store.overallProgress.percent).toBe(100)
    expect(store.celebrationPending).toBe(false)
  })
  it('celebrates crossing 33 once and preserves the achievement and save through catalog expansion', () => {
    const store = useStore()
    store.importProgress(completedSave(baseline.slice(1)))
    store.toggleWeaponCompleted(baseline[0].id, 'multiplayer')
    expect(store.celebrationPending).toBe(true)
    const date = store.save.completedAt
    const exported = store.exportProgress()
    expect(parseSave(exported)).toEqual(store.save)
    store.celebrationPending = false
    addWeapons(17)
    vi.setSystemTime(new Date('2026-10-26T12:00:00Z'))
    store.refreshAvailability()
    expect(store.overallProgress).toEqual({ completed: 495, total: 495, percent: 100 })
    expect(store.save.completedAt).toBe(date)
    expect(store.celebrationPending).toBe(false)
    store.toggleWeaponCompleted('seasonal-0', 'dmz')
    expect(store.completionistStats[3]).toMatchObject({ completed: 34, total: 33 })
    expect(store.celebrationPending).toBe(false)
    setActivePinia(createPinia())
    const refreshed = useStore()
    refreshed.getStoredProgress()
    expect(refreshed.save.completedAt).toBe(date)
    expect(refreshed.celebrationPending).toBe(false)
  })
  it('celebrates a seasonal weapon crossing the original requirement while a launch weapon stays incomplete', () => {
    const [seasonal] = addWeapons(1)
    const store = useStore()
    store.importProgress(completedSave(baseline.slice(1)))
    store.toggleWeaponCompleted(seasonal.id, 'multiplayer')
    expect(store.weaponCompleted(baseline[0].id)).toBe(false)
    expect(store.overallProgress.percent).toBe(100)
    expect(store.launchCompleted).toBe(true)
    expect(store.celebrationPending).toBe(true)
  })
  it('keeps Mastery prerequisites fixed and never automatically ticks an unearned camo', () => {
    const [seasonal] = addWeapons(1)
    const store = useStore()
    store.importProgress(completedSave(baseline))
    expect(store.save.weapons[seasonal.id]).toBeUndefined()
    expect(store.save.mastery.dmz).toEqual({})
    expect(prerequisiteText(modes.dmz.mastery[0])).toBe('Divergence on 33 weapons.')
    expect(
      getWeaponCamos(seasonal, 'dmz').find((camo) => camo.id === 'harmonic-break').prerequisite
        .count
    ).toBe(33)
    expect(store.toggleCamo(seasonal.id, 'gold', 'warzone')).toBe(true)
  })
  it.each([
    [6, 8, 75],
    [8, 8, 100],
    [9, 8, 100],
    [34, 33, 100],
  ])('caps fill for %i/%i at %i percent', (completed, total, expected) => {
    expect(progressPercentage(completed, total)).toBe(expected)
  })
})

describe('consistent app and PNG counters', () => {
  it('renders real 34/33 totals and capped bars in the tracker and captured PNG card', async () => {
    addWeapons(1)
    let share
    const { store } = mount({
      render: () =>
        h('div', [
          h(OverallProgressComponent),
          h(ShareProgressModal, {
            mode: 'dmz',
            ref: (vm) => {
              share = vm
            },
          }),
          h(ProgressComponent),
        ]),
    })
    store.importProgress(completedSave(catalog))
    await nextTick()
    expect([...host.querySelectorAll('.counter strong')].map((node) => node.textContent)).toEqual(
      Array(4).fill('34/33')
    )
    expect(
      [...host.querySelectorAll('.progress-fill, .mini-fill')].every(
        (node) => node.style.width === '100%'
      )
    ).toBe(true)
    expect([...host.querySelectorAll('.progress-text')].map((node) => node.textContent)).toEqual(
      Array(4).fill('34 / 33')
    )
    expect(host.querySelector('.progress-count').textContent).toContain('510/495')
    await share.generateImage()
    expect(html2canvas).toHaveBeenCalledWith(
      host.querySelector('.share-card'),
      expect.objectContaining({ width: 1200, height: 630 })
    )
    expect(host.querySelector('a[download]').getAttribute('download')).toBe(
      'divergence-dmz-progress.png'
    )
  })
  it.each(['grid', 'table'])(
    'shows fixed category counters in %s, including under filters',
    async (layout) => {
      addWeapons(1)
      const { store } = mount(WeaponsComponent)
      store.importProgress(completedSave(catalog))
      store.setPreferences({ layout })
      store.setFilters({ category: 'assault-rifles', search: 'Seasonal' })
      await nextTick()
      const counter =
        layout === 'table'
          ? host.querySelector('.category-progress')
          : host.querySelector('h2 span:last-child')
      expect(counter.textContent).toBe('9/8')
    }
  )
})
