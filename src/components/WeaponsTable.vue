<template>
  <div
    class="table-container"
    role="region"
    aria-label="Weapon camo table — scroll horizontally"
    tabindex="0">
    <table class="camo-table" :style="{ '--camo-count': columns.length }">
      <caption class="sr-only">
        {{
          track === 'prestige' ? 'Weapon Prestige' : modes[mode].name + ' shared camos'
        }}
      </caption>
      <colgroup>
        <col class="weapon-column" />
        <col v-for="column in columns" :key="column.key" />
      </colgroup>
      <thead>
        <tr>
          <th scope="col" class="weapon-column">Weapon</th>
          <th
            v-for="column in columns"
            :key="column.key"
            scope="col"
            class="camo-header"
            :data-column-id="column.key">
            <span
              class="column-heading"
              tabindex="0"
              :aria-label="column.description"
              :title="column.description">
              <span v-if="column.special" class="special-header" aria-hidden="true"
                >Special<br />{{ column.position }}</span
              >
              <span v-else class="header-art"><CamoImage :camo="column.camo" /></span>
              <span class="header-tooltip" role="tooltip">{{ column.description }}</span>
            </span>
          </th>
        </tr>
      </thead>
      <tbody v-for="(weapons, category) in categories" :key="category">
        <tr class="category-row">
          <th :colspan="columns.length + 1" scope="rowgroup">
            <span>{{ category }}</span>
            <span v-if="category !== 'Favourites'" class="category-progress">{{
              categoryProgress(category)
            }}</span>
          </th>
        </tr>
        <tr
          v-for="weapon in weapons"
          :key="weapon.id"
          :data-weapon-id="weapon.id"
          class="weapon-row"
          :class="{ 'coming-soon': !weapon.available }">
          <th scope="row" class="weapon-column weapon-label">
            <div class="weapon-cell">
              <button
                class="favorite"
                :disabled="!weapon.available || !!store.loadError"
                :aria-label="'Favourite ' + weapon.name"
                :aria-pressed="store.isFavorite(weapon.id)"
                @click="store.toggleFavorite(weapon.id)">
                <IconComponent
                  name="star"
                  icon-style="solid"
                  :fill="store.isFavorite(weapon.id) ? '#feca57' : '#777'"
                  size="14" />
              </button>
              <div class="weapon-details">
                <WeaponName :weapon="weapon" :mode="mode" :track="track" compact /><small
                  v-if="weapon.label"
                  >{{ weapon.label }}</small
                >
              </div>
            </div>
          </th>
          <td v-for="camo in rows(weapon)" :key="camo.id" class="camo-cell">
            <CamoButton
              :camo="camo"
              :weapon="weapon"
              indicator
              :locked="!weapon.available"
              :mode="track === 'prestige' ? '' : mode"
              :disabled="
                track === 'prestige'
                  ? !store.canTogglePrestige(weapon.id, camo.id)
                  : !store.canToggleCamo(weapon.id, camo.id, mode)
              "
              @toggle="
                track === 'prestige'
                  ? store.togglePrestige(weapon.id, camo.id)
                  : store.toggleCamo(weapon.id, camo.id, mode)
              " />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useStore } from '@/stores/store'
import { militaryCamos, completionistCamos } from '@/data/mw4/camos'
import { prestigeCamos } from '@/data/mw4/prestige'
import { modes } from '@/data/mw4/modes'
import CamoButton from './CamoButton.vue'
import CamoImage from './CamoImage.vue'
import WeaponName from './WeaponName.vue'
const props = defineProps({
  track: { type: String, default: 'shared' },
  categories: { type: Object, required: true },
  mode: { type: String, required: true },
})
const store = useStore()
const categoryProgress = (name) => {
  const id = store.weaponCategories.find((category) => category.name === name)?.id
  const progress = store.categoryProgress(id, props.track === 'prestige')
  return `${progress.completed}/${progress.total}`
}
const rows = (weapon) =>
  props.track === 'prestige'
    ? store.prestigeRows(weapon)
    : store
        .camoRows(weapon, props.mode)
        .filter((camo) => !store.filters.hideMilitaryCamos || camo.stage !== 'military')
const columns = computed(() => {
  const weapon = Object.values(props.categories).flat()[0]
  if (!weapon) return []
  const sharedColumn = (camo) => ({ key: camo.id, description: camo.name, camo })
  if (props.track === 'prestige') return prestigeCamos.map(sharedColumn)
  return [
    ...(store.filters.hideMilitaryCamos ? [] : militaryCamos.map(sharedColumn)),
    ...weapon.specialCamos.map((_, index) => ({
      key: 'special-' + (index + 1),
      special: true,
      position: index + 1,
      description: 'Special ' + (index + 1) + ' — camo and requirements vary by weapon.',
    })),
    ...completionistCamos.map(sharedColumn),
  ]
})
</script>
<style lang="scss" scoped>
.category-progress {
  margin-left: 16px;
  color: #aaa;
  font-variant-numeric: tabular-nums;
}
.table-container {
  --weapon-width: 220px;
  --camo-width: 40px;
  max-width: 100%;
  overflow-x: auto;
  scroll-padding-inline-start: calc(var(--weapon-width) + 4px);
  scroll-padding-inline-end: 4px;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
  background: $elevation-1-color;
  border: 1px solid #363636;
  border-radius: 3px;
  &:focus-visible {
    outline: 2px solid #c5b0e8;
    outline-offset: 2px;
  }
  @media (max-width: 600px), (pointer: coarse) {
    --weapon-width: 180px;
    --camo-width: 44px;
  }
}
.camo-table {
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  width: 100%;
  min-width: calc(var(--weapon-width) + var(--camo-count) * var(--camo-width));
  margin: 0;
  overflow: visible;
  thead,
  tbody {
    border: 0;
  }
  th,
  td {
    padding: 0;
    text-align: center;
    vertical-align: middle;
    border: 0;
    border-right: 1px solid #303030;
    border-bottom: 1px solid #303030;
    line-height: 1.3;
  }
  .weapon-column {
    width: var(--weapon-width);
    text-align: left;
    position: sticky;
    left: 0;
    z-index: 3;
    background: #202020;
    border-right-color: #414141;
  }
  thead {
    background: #242424;
  }
  thead .weapon-column {
    padding: 0 10px;
    font-size: 11px;
    font-weight: 600;
  }
  .camo-header {
    height: 42px;
    position: relative;
  }
  .camo-cell {
    position: relative;
    z-index: 0;
  }
  .column-heading {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    min-height: 36px;
    &:focus-visible {
      outline: 2px solid #c5b0e8;
      outline-offset: -1px;
    }
  }
  .header-art {
    display: block;
    width: 28px;
    height: 28px;
    overflow: hidden;
    border-radius: 3px;
  }
  .special-header {
    width: 28px;
    height: 28px;
    border: 1px solid #5b5064;
    border-radius: 3px;
    display: grid;
    align-content: center;
    color: #c3b1d1;
    font-size: 8px;
    font-weight: 500;
    line-height: 1.1;
  }
  .header-tooltip {
    visibility: hidden;
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: max-content;
    max-width: 170px;
    padding: 6px 8px;
    border: 1px solid #56505e;
    border-radius: 3px;
    background: #27252b;
    color: #eee;
    font-size: 11px;
    font-weight: 400;
    z-index: 5;
    pointer-events: none;
    white-space: normal;
  }
  .column-heading:hover .header-tooltip,
  .column-heading:focus-visible .header-tooltip {
    visibility: visible;
  }
  .camo-header:last-child .header-tooltip {
    left: auto;
    right: 0;
    transform: none;
  }
  .category-row th {
    padding: 4px 8px;
    font-size: 11px;
    font-weight: 600;
    text-align: left;
    color: #bbb;
    background: #161616;
  }
  .category-row span {
    position: sticky;
    left: 8px;
  }
  .weapon-cell {
    display: flex;
    align-items: center;
    gap: 3px;
    padding: 0 4px;
  }
  .weapon-details {
    flex: 1;
    min-width: 0;
  }
  .favorite {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 0 0 22px;
    min-height: 30px;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
  }
  .favorite:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  .favorite:focus-visible {
    outline: 2px solid #c5b0e8;
    outline-offset: -1px;
  }
  small {
    display: block;
    margin: 0 0 3px 2px;
    color: #c5acd9;
    font-size: 9px;
    font-weight: 400;
  }
  .weapon-row:hover {
    td,
    .weapon-column {
      background: #282828;
    }
  }
  .coming-soon .weapon-label {
    color: #888;
  }
  @media (max-width: 600px), (pointer: coarse) {
    .favorite {
      min-height: 44px;
      flex-basis: 26px;
    }
  }
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
