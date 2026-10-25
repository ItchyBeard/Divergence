import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createApp, h, nextTick } from 'vue'
import { useStore } from '@/stores/store'
import { emptySave, parseSave } from '@/data/mw4/save'
import { prestigeCamos } from '@/data/mw4/prestige'
import PrestigeView from '@/views/PrestigeView.vue'

vi.mock('@/data/weapons/index.js', async () => {
  const { default: weapon } = await import('@/data/weapons/assault-rifles/han-86.weapon')
  return {
    default: [
      weapon,
      {
        ...weapon,
        id: 'pending-weapon',
        name: 'Pending Weapon',
        prestigeCamos: weapon.prestigeCamos.map((camo) => ({
          ...camo,
          requirements: camo.requirements.map((condition) =>
            condition.type === 'player_prestige_master_level'
              ? { ...condition, level: 999 }
              : condition
          ),
        })),
      },
    ],
  }
})
let app, host
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-25T12:00:00Z'))
  localStorage.clear()
  setActivePinia(createPinia())
})
afterEach(() => {
  app?.unmount()
  host?.remove()
  vi.restoreAllMocks()
  vi.useRealTimers()
})
const ids = prestigeCamos.map((camo) => camo.id)
const flags = (store, id = 'han-86') => store.save.prestige[id] || {}
const completed = (store, id = 'han-86') => ids.filter((camo) => flags(store, id)[camo] === true)
const legacySave = () => ({
  ...emptySave(),
  prestigeLevel: 250,
  prestigeAutomatic: { 'han-86': { 'pyroclast-terminus': true, 'pyroclast-scatter': true } },
  prestige: {
    'han-86': {
      'pyroclast': true,
      'pyroclast-terminus': true,
      'pyroclast-scatter': true,
      'pyroclast-cascade': false,
    },
    'pending-weapon': { 'pyroclast-cascade': true },
    'future-weapon': { 'pyroclast-scatter': true },
  },
})

describe('manual four-stage Prestige checklist', () => {
  it.each(ids.map((id, index) => [id, index + 1]))(
    'completing %s checks exactly its %i-stage prefix',
    (id, count) => {
      const store = useStore()
      expect(store.togglePrestige('han-86', id)).toBe(true)
      expect(completed(store)).toEqual(ids.slice(0, count))
      expect(flags(store, 'pending-weapon')).toEqual({})
      expect(store.save.weapons).toEqual({})
      expect(store.save.mastery).toEqual(emptySave().mastery)
      expect(store.celebrationPending).toBe(false)
    }
  )
  it.each(ids.map((id, index) => [id, index]))(
    'unchecking %s retains only its %i preceding stages',
    (id, count) => {
      const store = useStore()
      store.togglePrestige('han-86', 'pyroclast-cascade')
      store.togglePrestige('pending-weapon', 'pyroclast-cascade')
      const other = { ...flags(store, 'pending-weapon') }
      store.togglePrestige('han-86', id)
      expect(completed(store)).toEqual(ids.slice(0, count))
      expect(flags(store, 'pending-weapon')).toEqual(other)
    }
  )
  it('allows pending requirements and keeps thresholds informational', () => {
    const store = useStore()
    const weapon = store.weapons.find((entry) => entry.id === 'pending-weapon')
    expect(store.prestigeRows(weapon)[3].requirementPending).toBe(true)
    expect(store.togglePrestige(weapon.id, 'pyroclast-cascade')).toBe(true)
    expect(completed(store, weapon.id)).toEqual(ids)
    expect(store.prestigeRows(store.weapons[0])[1].challenge.description).toContain(
      'Weapon Prestige Master Level 73'
    )
  })
  it('keeps bulk toggles and Prestige sorting functional', () => {
    const store = useStore()
    store.togglePrestige('pending-weapon', 'pyroclast-scatter')
    store.setPreferences({ sortBy: 'closest' })
    expect(store.sortedWeapons('multiplayer', true)[0].id).toBe('pending-weapon')
    store.toggleWeaponPrestige('pending-weapon')
    expect(store.prestigeCompleted('pending-weapon')).toBe(true)
    store.toggleWeaponPrestige('pending-weapon')
    expect(completed(store, 'pending-weapon')).toEqual([])
  })
})

describe('deployed-save compatibility', () => {
  it.each([null, 0, 150, 250])(
    'imports the obsolete level %s without inferring or clearing progress',
    (level) => {
      const store = useStore()
      const old = legacySave()
      old.prestigeLevel = level
      const backup = JSON.stringify(old)
      store.importProgress(old)
      expect(store.save.prestige).toEqual(old.prestige)
      expect(JSON.stringify(old)).toBe(backup)
      expect(store.save).not.toHaveProperty('prestigeLevel')
      expect(store.save).not.toHaveProperty('prestigeAutomatic')
      store.setFilters({ search: 'HAN' })
      expect(store.save.prestige).toEqual(old.prestige)
      const exported = JSON.parse(store.exportProgress())
      expect(exported).not.toHaveProperty('prestigeLevel')
      expect(exported).not.toHaveProperty('prestigeAutomatic')
      expect(exported.prestige).toEqual(old.prestige)
    }
  )
  it('loads an old browser save without clearing automatic flags, and writes clean metadata on the next save', () => {
    const old = legacySave()
    old.weapons['han-86'] = { sharedCamos: { smoke: true } }
    old.mastery.dmz.chiral = true
    old.favorites = ['han-86']
    old.completedAt = '2026-10-24T12:00:00Z'
    old.celebrationHandled = true
    localStorage.setItem('divergence:mw4:v1:dev', JSON.stringify(old))
    const store = useStore()
    store.getStoredProgress()
    expect(store.loadError).toBe('')
    expect(store.save.prestige).toEqual(old.prestige)
    expect(store.save.weapons).toEqual(old.weapons)
    expect(store.save.mastery).toEqual(old.mastery)
    expect(store.save.completedAt).toBe(old.completedAt)
    expect(store.save.favorites).toEqual(old.favorites)
    store.storeProgress()
    const stored = JSON.parse(localStorage.getItem('divergence:mw4:v1:dev'))
    expect(stored).toEqual(store.save)
    setActivePinia(createPinia())
    const reloaded = useStore()
    reloaded.getStoredProgress()
    expect(reloaded.save).toEqual(stored)
    reloaded.resetProgress()
    expect(reloaded.save.prestige).toEqual({})
    expect(reloaded.save).not.toHaveProperty('prestigeLevel')
  })
  it('never uses a legacy level to complete any stage after importing or clicking base Pyroclast', () => {
    const store = useStore()
    store.importProgress({ ...emptySave(), prestigeLevel: 1000, prestigeAutomatic: {} })
    expect(store.save.prestige).toEqual({})
    store.togglePrestige('han-86', 'pyroclast')
    expect(completed(store)).toEqual(['pyroclast'])
    expect(flags(store, 'pending-weapon')).toEqual({})
    expect(store.setPrestigeLevel).toBeUndefined()
  })
  it('still validates real progress and rejects unrelated unknown fields', () => {
    expect(() => parseSave({ ...legacySave(), unrelated: 1 })).toThrow('unknown top-level')
    expect(() =>
      parseSave({ ...legacySave(), prestige: { 'han-86': { pyroclast: 'true' } } })
    ).toThrow()
  })
})

it.each(['grid', 'table'])(
  'shows four manual Prestige thumbnails per weapon in %s with no level controls',
  async (layout) => {
    const pinia = createPinia()
    host = document.createElement('div')
    document.body.appendChild(host)
    app = createApp(PrestigeView)
    app.use(pinia)
    app.config.globalProperties.$t = (key) => key
    app.component('IconComponent', { render: () => h('span') })
    const store = useStore(pinia)
    store.setPreferences({ layout })
    app.mount(host)
    expect(host.querySelector('input[type="number"]')).toBeNull()
    expect(host.querySelector('[aria-label="Prestige Level"]')).toBeNull()
    const row = (id) => host.querySelector(`[data-weapon-id="${id}"]`)
    const camo = (id, name) => row(id).querySelector(`[aria-label^="${name} —"]`)
    expect(row('han-86').querySelectorAll('button.prestige')).toHaveLength(4)
    camo('han-86', 'Pyroclast Cascade').click()
    await nextTick()
    expect(completed(store)).toEqual(ids)
    expect(completed(store, 'pending-weapon')).toEqual([])
    camo('han-86', 'Pyroclast Terminus').click()
    await nextTick()
    expect(completed(store)).toEqual(['pyroclast'])
    camo('pending-weapon', 'Pyroclast Cascade').click()
    await nextTick()
    expect(completed(store, 'pending-weapon')).toEqual(ids)
    expect(camo('han-86', 'Pyroclast Terminus').getAttribute('aria-label')).toContain(
      'Weapon Prestige Master Level 73'
    )
  }
)
