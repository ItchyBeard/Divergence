<template>
  <div ref="root" class="filters-component">
    <div class="filter-toolbar">
      <label class="search-control"
        ><IconComponent name="search" size="17" /><input
          aria-label="Search weapons"
          placeholder="Search weapons"
          type="search"
          :value="store.filters.search"
          @input="store.setFilters({ search: $event.target.value })"
      /></label>
      <select
        aria-label="Weapon category"
        :value="store.filters.category || ''"
        @change="store.setFilters({ category: $event.target.value || null })">
        <option value="">All categories</option>
        <option v-for="category in store.weaponCategories" :key="category.id" :value="category.id">
          {{ category.name }}
        </option>
      </select>
      <label class="sort-control"
        >Sort by
        <select
          aria-label="Sort by"
          :value="store.preferences.sortBy"
          @change="store.setPreferences({ sortBy: $event.target.value })">
          <option v-for="option in weaponSortOptions" :key="option.id" :value="option.id">
            {{ option.name }}
          </option>
        </select>
      </label>
      <select
        v-if="store.preferences.sortBy === 'closest'"
        class="grouping-control"
        aria-label="Weapon grouping"
        :value="store.preferences.weaponGrouping"
        @change="store.setPreferences({ weaponGrouping: $event.target.value })">
        <option value="category">By category</option>
        <option value="all">All weapons</option>
      </select>
      <div class="toolbar-actions">
        <slot name="mode-switch"></slot>
        <button
          class="compact-button"
          :class="{ active: store.filters.favoritesOnly }"
          :aria-pressed="store.filters.favoritesOnly"
          aria-label="Only favourites"
          title="Only favourites"
          @click="store.setFilters({ favoritesOnly: !store.filters.favoritesOnly })">
          <IconComponent
            name="star"
            :fill="store.filters.favoritesOnly ? '#feca57' : '#aaa'"
            icon-style="solid"
            size="18" />
        </button>
        <LayoutToggleComponent />
        <button
          ref="filtersButton"
          class="compact-button filters-toggle"
          :aria-expanded="!store.filters.hideFilters"
          aria-controls="tracker-filters"
          :aria-label="store.filters.hideFilters ? 'Show filters' : 'Hide filters'"
          :title="store.filters.hideFilters ? 'Show filters' : 'Hide filters'"
          @click="store.setFilters({ hideFilters: !store.filters.hideFilters })">
          <IconComponent
            :name="store.filters.hideFilters ? 'filter' : 'filter-slash'"
            size="18" /><span class="action-text">Filters</span>
        </button>
      </div>
    </div>
    <Transition name="filters-expand">
      <div
        v-show="!store.filters.hideFilters"
        id="tracker-filters"
        class="filter-panel-collapse"
        role="region"
        aria-label="Tracker filters"
        :aria-hidden="store.filters.hideFilters"
        :inert="store.filters.hideFilters ? '' : undefined"
        @keydown.esc.stop.prevent="closeFilters">
        <div class="filter-panel-clip">
          <div class="filter-options">
            <div class="mobile-sort-options">
              <label class="sort-control">
                Sort by
                <select
                  aria-label="Sort by"
                  :value="store.preferences.sortBy"
                  @change="store.setPreferences({ sortBy: $event.target.value })">
                  <option v-for="option in weaponSortOptions" :key="option.id" :value="option.id">
                    {{ option.name }}
                  </option>
                </select>
              </label>
              <label v-if="store.preferences.sortBy === 'closest'" class="sort-control">
                Grouping
                <select
                  aria-label="Weapon grouping"
                  :value="store.preferences.weaponGrouping"
                  @change="store.setPreferences({ weaponGrouping: $event.target.value })">
                  <option value="category">By category</option>
                  <option value="all">All weapons</option>
                </select>
              </label>
            </div>
            <fieldset>
              <legend>Display options</legend>
              <div class="filter-group">
                <label class="filter-pill" :class="{ active: store.preferences.showPrestigeCamos }">
                  <input
                    type="checkbox"
                    :checked="store.preferences.showPrestigeCamos"
                    @change="store.setPreferences({ showPrestigeCamos: $event.target.checked })" />
                  <span>Show Prestige camos</span>
                </label>
                <label
                  v-for="(label, key) in switches"
                  :key="key"
                  class="filter-pill"
                  :class="{ active: store.filters[key] }">
                  <input
                    type="checkbox"
                    :checked="store.filters[key]"
                    @change="store.setFilters({ [key]: $event.target.checked })" />
                  <span>{{ label }}</span>
                </label>
              </div>
            </fieldset>
            <fieldset>
              <legend>Completionist visibility</legend>
              <div class="filter-group">
                <label
                  v-for="camo in completionistCamos"
                  :key="camo.id"
                  class="filter-pill"
                  :class="{ active: store.filters.hideCamoIds.includes(camo.id) }">
                  <input
                    type="checkbox"
                    :checked="store.filters.hideCamoIds.includes(camo.id)"
                    @change="toggleStage(camo.id, $event.target.checked)" />
                  <span>Hide {{ camo.name }}</span>
                </label>
              </div>
            </fieldset>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useStore } from '@/stores/store'
import { weaponSortOptions } from '@/data/mw4/tracker'
import { completionistCamos } from '@/data/mw4/camos'
import LayoutToggleComponent from './LayoutToggleComponent.vue'
const store = useStore()
const root = ref(null)
const filtersButton = ref(null)
const switches = {
  hideMilitaryCamos: 'Hide Military camos',
  hideUnreleased: 'Hide unreleased weapons',
  hideCompleted: 'Hide completed weapons',
}
function closeFilters() {
  store.setFilters({ hideFilters: true })
  filtersButton.value?.focus()
}
function dismissOutside(event) {
  if (!store.filters.hideFilters && !root.value?.contains(event.target)) {
    store.setFilters({ hideFilters: true })
  }
}
onMounted(() => document.addEventListener('pointerdown', dismissOutside))
onBeforeUnmount(() => document.removeEventListener('pointerdown', dismissOutside))
function toggleStage(id, checked) {
  store.setFilters({
    hideCamoIds: checked
      ? [...store.filters.hideCamoIds, id]
      : store.filters.hideCamoIds.filter((entry) => entry !== id),
  })
}
</script>
<style lang="scss" scoped>
.filters-component {
  margin: 22px 0 28px;
  position: relative;
  text-align: left;
  z-index: 10;
}
.filter-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.search-control {
  display: flex;
  align-items: center;
  gap: 7px;
  background: $elevation-2-color;
  border: 1px solid $elevation-4-color;
  padding: 0 9px;
  border-radius: 3px;
  height: 34px;
  input {
    width: 160px;
    min-width: 0;
    color: white;
    background: transparent;
    border: 0;
    padding: 6px 0;
    font-size: 12px;
  }
}
select {
  height: 34px;
  color: #ddd;
  background: $elevation-2-color;
  border: 1px solid $elevation-4-color;
  border-radius: 3px;
  padding: 5px 8px;
  font-size: 12px;
  max-width: 230px;
}
.sort-control {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #aaa;
  font-size: 12px;
  select {
    min-width: 0;
    max-width: 100%;
  }
}
select:focus-visible,
input:focus-visible,
button:focus-visible {
  outline: 2px solid #c2aadf;
  outline-offset: 2px;
}
.toolbar-actions {
  margin-left: auto;
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  justify-content: flex-end;
  gap: 8px;
  :deep(.layout-toggle) {
    margin: 0;
    width: auto;
    min-height: 34px;
    padding: 5px 8px;
    font-size: 12px;
  }
}
.compact-button {
  width: auto;
  display: inline-flex;
  gap: 5px;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  min-height: 34px;
  padding: 5px 8px;
  border: 1px solid $elevation-4-color;
  border-radius: 3px;
  background: $elevation-2-color;
  color: #bbb;
  cursor: pointer;
  font-size: 12px;
  &.active {
    border-color: #8e6fbd;
  }
}
.filters-toggle {
  position: relative;
  &[aria-expanded='true'] {
    z-index: 2;
    border-bottom-color: $elevation-2-color;
    border-radius: 3px 3px 0 0;
    margin-bottom: -1px;
  }
}
.filter-panel-collapse {
  display: grid;
  grid-template-rows: 1fr;
  width: min(100%, 640px);
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1;
  box-shadow: 0 12px 28px #0006;
}
.filter-panel-clip {
  min-height: 0;
  overflow: hidden;
}
.filter-options {
  background: $elevation-2-color;
  border: 1px solid $elevation-4-color;
  border-radius: 3px 0 3px 3px;
  padding: 14px;
  max-height: min(70dvh, 480px);
  overflow-y: auto;
  overscroll-behavior: contain;
  display: grid;
  gap: 14px;
  fieldset {
    min-width: 0;
    border: 0;
    padding: 0;
    margin: 0;
  }
  legend {
    color: #ccc;
    font-size: 12px;
    font-weight: 600;
    padding: 0;
    margin-bottom: 8px;
  }
}
.filter-group {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}
.mobile-sort-options {
  display: none;
}
.filters-expand-enter-active,
.filters-expand-leave-active {
  transition:
    grid-template-rows 200ms ease,
    opacity 200ms ease;
}
.filters-expand-enter-from,
.filters-expand-leave-to {
  grid-template-rows: 0fr;
  opacity: 0;
}
.filter-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 28px;
  border-radius: 3px;
  padding: 3px 7px;
  border: 1px solid $elevation-3-color;
  color: #aaa;
  background: $elevation-1-color;
  font-size: 11px;
  cursor: pointer;
  input {
    accent-color: #9271be;
    margin: 0;
  }
  &.active {
    border-color: #79618f;
    color: white;
  }
}
@media (max-width: 600px) {
  .filters-component {
    margin: 12px 0 18px;
  }
  .filter-toolbar {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .search-control {
    min-width: 0;
    input {
      width: 100%;
    }
  }
  .filter-toolbar > select {
    width: 100%;
    min-width: 0;
    max-width: none;
  }
  .filter-toolbar > .sort-control,
  .filter-toolbar > .grouping-control {
    display: none;
  }
  .mobile-sort-options {
    display: grid;
    gap: 8px;
    padding-bottom: 12px;
    border-bottom: 1px solid $elevation-4-color;
    .sort-control {
      display: grid;
      grid-template-columns: 64px minmax(0, 1fr);
    }
    select {
      width: 100%;
      max-width: none;
    }
  }
  .toolbar-actions {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: minmax(0, 1fr) repeat(3, 44px);
    gap: 6px;
    width: 100%;
    margin-left: 0;
    :deep(.mode-switch) {
      width: 100%;
    }
    :deep(.layout-toggle) {
      padding: 0;
      .icon-component {
        margin-right: 0;
      }
      > span {
        display: none;
      }
    }
    .action-text {
      display: none;
    }
  }
  .compact-button {
    padding: 0;
  }
}
@media (max-width: 600px), (pointer: coarse) {
  .compact-button,
  select,
  .search-control,
  .toolbar-actions :deep(.layout-toggle) {
    min-height: 44px;
    height: auto;
  }
  .filter-pill {
    min-height: 40px;
    padding: 6px 9px;
  }
}
@media (max-width: 380px) {
  .filter-group {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (prefers-reduced-motion: reduce) {
  .filters-expand-enter-active,
  .filters-expand-leave-active {
    transition: none;
  }
}
</style>
