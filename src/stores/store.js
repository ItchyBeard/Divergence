import {
  camoTogglePlan,
  sharedCompletion,
  sortWeapons,
  completionHeaderTier,
} from '@/data/mw4/tracker'
import { defineStore } from 'pinia'
import catalog from '@/data/weapons/index.js'
import { getWeaponCamos } from '@/data/mw4/catalog'
import { modes, modeIds } from '@/data/mw4/modes'
import { completionistCamos } from '@/data/mw4/camos'
import { categoriesById } from '@/data/mw4/categories'
import { weaponAvailability } from '@/data/mw4/availability'
import { emptySave, parseSave } from '@/data/mw4/save'
import { storageKey } from '@/data/mw4/saveContract'
import { getPrestigeCamos } from '@/data/mw4/prestige'

const key = storageKey(import.meta.env.PROD)
const sharedFlags = (save, id) => {
  // Read even an absent key so Vue tracks creation of the first record reactively.
  const record = save.weapons[id]
  return Object.hasOwn(save.weapons, id) ? record.sharedCamos : {}
}
const filtered = (store, prestige = false) =>
  store.weapons.filter((weapon) => {
    const filters = store.filters
    return (
      (!filters.category || weapon.category === filters.category) &&
      weapon.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      (!filters.hideUnreleased || weapon.available) &&
      (!filters.favoritesOnly || store.isFavorite(weapon.id)) &&
      (!filters.hideCompleted ||
        !(prestige ? store.prestigeCompleted(weapon.id) : store.weaponCompleted(weapon.id))) &&
      (prestige || !filters.hideCamoIds.some((id) => weapon.sharedCamos[id] === true))
    )
  })

export const useStore = defineStore('divergence-mw4', {
  state: () => ({
    save: emptySave(),
    now: Date.now(),
    loadError: '',
    storageError: '',
    rawRecovery: null,
    progressionNotice: '',
  }),
  getters: {
    weapons: (state) =>
      catalog.map((weapon) => ({
        ...weapon,
        ...weaponAvailability(weapon, state.now),
        sharedCamos: sharedFlags(state.save, weapon.id),
      })),
    filters: (state) => state.save.filters,
    preferences: (state) => state.save.preferences,
    favorites: (state) => state.save.favorites,
    weaponCategories: () =>
      [...new Set(catalog.map((weapon) => weapon.category))].map((id) => ({
        id,
        name: categoriesById[id].name,
      })),
    releasedWeapons() {
      return this.weapons.filter((weapon) => weapon.available)
    },
    filteredWeapons() {
      return filtered(this)
    },
    filteredPrestigeWeapons() {
      return filtered(this, true)
    },
    overallProgress() {
      let total = 0
      let completed = 0
      for (const weapon of this.releasedWeapons) {
        const camos = getWeaponCamos(weapon, 'multiplayer')
        total += camos.length
        completed += camos.filter((camo) => weapon.sharedCamos[camo.id] === true).length
      }
      return { completed, total, percent: total ? Math.round((completed / total) * 100) : 0 }
    },
    completionistStats() {
      return completionistCamos.map((camo) => {
        const applicable = this.releasedWeapons.filter((weapon) =>
          getWeaponCamos(weapon, 'multiplayer').some((entry) => entry.id === camo.id)
        )
        return {
          ...camo,
          completed: applicable.filter((weapon) => weapon.sharedCamos[camo.id] === true).length,
          total: applicable.length,
        }
      })
    },
  },
  actions: {
    sortedWeapons(mode = 'multiplayer', prestige = false) {
      return sortWeapons(
        prestige ? this.filteredPrestigeWeapons : this.filteredWeapons,
        this.preferences.sortBy,
        (weapon) => sharedCompletion(weapon, getWeaponCamos(weapon, mode), weapon.sharedCamos),
        catalog.map((weapon) => weapon.id)
      )
    },
    refreshAvailability() {
      this.now = Date.now()
    },
    getStoredProgress() {
      try {
        const raw = localStorage.getItem(key)
        if (raw !== null) this.save = parseSave(raw)
        this.loadError = ''
        this.rawRecovery = null
      } catch (error) {
        this.loadError = error.message
        try {
          this.rawRecovery = localStorage.getItem(key)
        } catch {
          /* Storage may be disabled. */
        }
      }
      this.refreshAvailability()
    },
    storeProgress() {
      if (this.loadError) return false
      try {
        localStorage.setItem(key, JSON.stringify(this.save))
        this.storageError = ''
        return true
      } catch (error) {
        this.storageError = 'Progress could not be saved: ' + error.message
        return false
      }
    },
    exportProgress() {
      return JSON.stringify(this.save, null, 2)
    },
    importProgress(input) {
      const next = parseSave(input)
      // Write first: rejected files and storage failures must leave the current save intact.
      localStorage.setItem(key, JSON.stringify(next))
      this.save = next
      this.loadError = ''
      this.storageError = ''
      this.rawRecovery = null
      this.progressionNotice = ''
      this.refreshAvailability()
    },
    resetProgress() {
      const next = {
        ...this.save,
        weapons: {},
        prestige: {},
        mastery: emptySave().mastery,
        beganGrind: null,
      }
      localStorage.setItem(key, JSON.stringify(next))
      this.save = next
      this.loadError = ''
      this.storageError = ''
      this.rawRecovery = null
      this.progressionNotice = ''
    },
    isFavorite(id) {
      return this.favorites.includes(id)
    },
    weaponCompleted(id) {
      const weapon = catalog.find((entry) => entry.id === id)
      return Boolean(
        weapon &&
          getWeaponCamos(weapon, 'multiplayer').every((camo) => this.camoCompleted(id, camo.id))
      )
    },
    weaponHeaderTier(id) {
      return completionHeaderTier(sharedFlags(this.save, id))
    },
    camoCompleted(id, camoId) {
      return sharedFlags(this.save, id)[camoId] === true
    },
    camoRows(weapon, mode) {
      return getWeaponCamos(weapon, mode).map((camo) => ({
        ...camo,
        completed: this.camoCompleted(weapon.id, camo.id),
      }))
    },
    canToggleCamo(id, camoId, mode) {
      const weapon = catalog.find((entry) => entry.id === id)
      if (
        this.loadError ||
        !weapon ||
        !modeIds.includes(mode) ||
        !weaponAvailability(weapon).available
      )
        return false
      const camo = getWeaponCamos(weapon, mode).find((entry) => entry.id === camoId)
      return Boolean(camo)
    },
    toggleCamo(id, camoId, mode) {
      if (!this.canToggleCamo(id, camoId, mode)) return false
      const weapon = catalog.find((entry) => entry.id === id)
      const plan = camoTogglePlan(getWeaponCamos(weapon, mode), camoId, sharedFlags(this.save, id))
      this.progressionNotice = ''
      this.$patch((state) => {
        state.save.weapons[id] = {
          sharedCamos: { ...sharedFlags(state.save, id), ...plan.changes },
        }
        state.save.beganGrind ||= new Date().toISOString()
      })
      return this.storeProgress()
    },
    weaponModeCompleted(id, mode) {
      const weapon = catalog.find((entry) => entry.id === id)
      if (!weapon || !modeIds.includes(mode)) return false
      return getWeaponCamos(weapon, mode).every((camo) => this.camoCompleted(id, camo.id))
    },
    toggleWeaponCompleted(id, mode) {
      const weapon = catalog.find((entry) => entry.id === id)
      if (
        this.loadError ||
        !weapon ||
        !modeIds.includes(mode) ||
        !weaponAvailability(weapon).available
      )
        return false
      this.progressionNotice = ''
      const complete = !this.weaponModeCompleted(id, mode)
      const rows = getWeaponCamos(weapon, mode)
      this.$patch((state) => {
        state.save.weapons[id] = {
          sharedCamos: {
            ...sharedFlags(state.save, id),
            ...Object.fromEntries(rows.map((camo) => [camo.id, complete])),
          },
        }
        state.save.beganGrind ||= new Date().toISOString()
      })
      return this.storeProgress()
    },
    prestigeRows(weapon) {
      const flags = this.save.prestige[weapon.id]
      return getPrestigeCamos(weapon).map((camo) => ({
        ...camo,
        completed: flags?.[camo.id] === true,
      }))
    },
    prestigeCompleted(id) {
      const weapon = catalog.find((entry) => entry.id === id)
      return Boolean(weapon && this.prestigeRows(weapon).every((camo) => camo.completed))
    },
    prestigeApplicableCompleted(id) {
      const weapon = catalog.find((entry) => entry.id === id)
      if (!weapon) return false
      return this.prestigeRows(weapon).every((camo) => camo.completed)
    },
    canTogglePrestige(id, camoId) {
      const weapon = catalog.find((entry) => entry.id === id)
      if (this.loadError || !weapon || !weaponAvailability(weapon).available) return false
      const camo = this.prestigeRows(weapon).find((entry) => entry.id === camoId)
      return Boolean(camo)
    },
    togglePrestige(id, camoId) {
      if (!this.canTogglePrestige(id, camoId)) return false
      const weapon = catalog.find((entry) => entry.id === id)
      const flags = this.save.prestige[id] || {}
      const plan = camoTogglePlan(getPrestigeCamos(weapon), camoId, flags, true)
      this.progressionNotice = ''
      this.$patch((state) => {
        state.save.prestige[id] = { ...flags, ...plan.changes }
      })
      return this.storeProgress()
    },
    toggleWeaponPrestige(id) {
      const weapon = catalog.find((entry) => entry.id === id)
      if (this.loadError || !weapon || !weaponAvailability(weapon).available) return false
      this.progressionNotice = ''
      const rows = this.prestigeRows(weapon)
      const complete = !this.prestigeApplicableCompleted(id)
      this.$patch((state) => {
        state.save.prestige[id] = {
          ...state.save.prestige[id],
          ...Object.fromEntries(rows.map((camo) => [camo.id, complete])),
        }
      })
      return this.storeProgress()
    },
    masteryRows(mode) {
      return modes[mode].mastery.map((camo) => ({
        ...camo,
        completed: this.save.mastery[mode][camo.id] === true,
      }))
    },
    toggleMastery(mode, id) {
      if (this.loadError || !modeIds.includes(mode)) return false
      const camo = modes[mode].mastery.find((entry) => entry.id === id)
      if (!camo) return false
      this.save.mastery[mode][id] = !this.save.mastery[mode][id]
      return this.storeProgress()
    },
    toggleFavorite(id) {
      const weapon = catalog.find((entry) => entry.id === id)
      if (this.loadError || !weapon || !weaponAvailability(weapon).available) return false
      this.save.favorites = this.isFavorite(id)
        ? this.favorites.filter((entry) => entry !== id)
        : [...this.favorites, id]
      return this.storeProgress()
    },
    unfavoriteAll() {
      if (this.loadError) return false
      this.save.favorites = []
      return this.storeProgress()
    },
    setFilters(patch) {
      if (this.loadError) return false
      this.save.filters = parseSave({
        ...this.save,
        filters: { ...this.filters, ...patch },
      }).filters
      return this.storeProgress()
    },
    setPreferences(patch) {
      if (this.loadError) return false
      this.save.preferences = parseSave({
        ...this.save,
        preferences: { ...this.preferences, ...patch },
      }).preferences
      return this.storeProgress()
    },
  },
})
