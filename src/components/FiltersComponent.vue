<template>
  <div class="filters-component">
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
          class="compact-button"
          :aria-expanded="!store.filters.hideFilters"
          aria-controls="tracker-filters"
          :aria-label="store.filters.hideFilters ? 'Show filters' : 'Hide filters'"
          :title="store.filters.hideFilters ? 'Show filters' : 'Hide filters'"
          @click="store.setFilters({ hideFilters: !store.filters.hideFilters })">
          <IconComponent
            :name="store.filters.hideFilters ? 'filter' : 'filter-slash'"
            size="18" /><span>Filters</span>
        </button>
      </div>
    </div>
    <Transition name="fade"
      ><div v-if="!store.filters.hideFilters" id="tracker-filters" class="filter-options">
        <label
          v-for="(label, key) in switches"
          :key="key"
          class="filter-pill"
          :class="{ active: store.filters[key] }"
          ><input
            type="checkbox"
            :checked="store.filters[key]"
            @change="store.setFilters({ [key]: $event.target.checked })" /><span>{{
            label
          }}</span></label
        >
        <template v-if="!prestige"
          ><label
            v-for="camo in completionistCamos"
            :key="camo.id"
            class="filter-pill"
            :class="{ active: store.filters.hideCamoIds.includes(camo.id) }"
            ><input
              type="checkbox"
              :checked="store.filters.hideCamoIds.includes(camo.id)"
              @change="toggleStage(camo.id, $event.target.checked)" /><span
              >Hide {{ camo.name }}</span
            ></label
          ></template
        >
      </div></Transition
    >
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useStore } from '@/stores/store'
import { weaponSortOptions } from '@/data/mw4/tracker'
import { completionistCamos } from '@/data/mw4/camos'
import LayoutToggleComponent from './LayoutToggleComponent.vue'
const props = defineProps({ prestige: Boolean })
const store = useStore()
const switches = computed(() => ({
  ...(!props.prestige ? { hideMilitaryCamos: 'Hide Military camos' } : {}),
  hideUnreleased: 'Hide unreleased weapons',
  hideCompleted: 'Hide completed weapons',
}))
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
  text-align: left;
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
  align-items: center;
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
.filter-options {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 9px;
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
  .search-control {
    flex: 1;
    min-width: 120px;
    input {
      width: 100%;
    }
  }
  select {
    flex: 1;
    max-width: 50%;
  }
  .sort-control {
    flex: 1 1 190px;
    select {
      flex: 1;
    }
  }
  .toolbar-actions {
    width: 100%;
    margin-left: 0;
    justify-content: flex-end;
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
</style>
