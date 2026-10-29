<template>
  <MobileWeaponsList v-if="mobile" :categories="categories" :mode="mode" />
  <div
    v-else
    class="table-container"
    role="region"
    aria-label="Weapon camo table — scroll horizontally"
    tabindex="0">
    <table class="camo-table" :style="{ '--camo-count': camoCount }">
      <caption class="sr-only">
        {{
          modes[mode].name + ' shared camos'
        }}
        {{
          store.preferences.showPrestigeCamos ? ' and Weapon Prestige' : ''
        }}
      </caption>
      <colgroup>
        <col class="weapon-column" />
        <col v-for="index in camoCount" :key="index" />
        <col class="progress-column" />
      </colgroup>
      <tbody v-for="(weapons, category) in categories" :key="category">
        <tr class="category-row">
          <th :colspan="camoCount + 2" scope="rowgroup">
            <div class="category-label">
              <span>{{ category }}</span>
              <span v-if="category !== 'Favourites'" class="category-progress">{{
                categoryProgress(category)
              }}</span>
            </div>
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
                <WeaponName :weapon="weapon" :mode="mode" compact /><small v-if="weapon.label">{{
                  weapon.label
                }}</small>
              </div>
            </div>
          </th>
          <td
            v-for="camo in rows(weapon)"
            :key="camo.id"
            class="camo-cell"
            :class="{ 'prestige-start': camo.id === 'pyroclast' }">
            <CamoButton
              :camo="camo"
              :weapon="weapon"
              :locked="!weapon.available"
              :mode="camo.stage === 'prestige' ? '' : mode"
              :disabled="
                camo.stage === 'prestige'
                  ? !store.canTogglePrestige(weapon.id, camo.id)
                  : !store.canToggleCamo(weapon.id, camo.id, mode)
              "
              @toggle="
                camo.stage === 'prestige'
                  ? store.togglePrestige(weapon.id, camo.id)
                  : store.toggleCamo(weapon.id, camo.id, mode)
              " />
          </td>
          <td class="progress-column">
            <div class="weapon-progress">
              <span class="progress-count"
                >{{ progress(weapon).completed }}<span>/{{ progress(weapon).total }}</span></span
              >
              <progress
                :value="progress(weapon).completed"
                :max="progress(weapon).total || 1"
                :aria-label="weapon.name + ' camo progress'" />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { useStore } from '@/stores/store'
import { modes } from '@/data/mw4/modes'
import CamoButton from './CamoButton.vue'
import WeaponName from './WeaponName.vue'
import MobileWeaponsList from './MobileWeaponsList.vue'
const props = defineProps({
  categories: { type: Object, required: true },
  mode: { type: String, required: true },
})
const store = useStore()
const mobileQuery = window.matchMedia?.('(max-width: 600px)')
const mobile = ref(mobileQuery?.matches || false)
const updateMobile = (event) => {
  mobile.value = event.matches
}
mobileQuery?.addEventListener?.('change', updateMobile)
onBeforeUnmount(() => mobileQuery?.removeEventListener?.('change', updateMobile))
const categoryProgress = (name) => {
  const id = store.weaponCategories.find((category) => category.name === name)?.id
  const progress = store.categoryProgress(id)
  return `${progress.completed}/${progress.total}`
}
const rows = (weapon) => [
  ...store
    .camoRows(weapon, props.mode)
    .filter((camo) => !store.filters.hideMilitaryCamos || camo.stage !== 'military'),
  ...(store.preferences.showPrestigeCamos ? store.prestigeRows(weapon) : []),
]
const progress = (weapon) => {
  const camos = store.camoRows(weapon, props.mode)
  return { completed: camos.filter((camo) => camo.completed).length, total: camos.length }
}
const camoCount = computed(() =>
  Math.max(
    1,
    ...Object.values(props.categories)
      .flat()
      .map((weapon) => rows(weapon).length)
  )
)
</script>
<style lang="scss" scoped>
.category-progress {
  margin-left: 16px;
  color: #aaa;
  font-variant-numeric: tabular-nums;
}
.table-container {
  --weapon-width: 220px;
  --camo-width: 42px;
  --progress-width: 104px;
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
  min-width: calc(
    var(--weapon-width) + var(--camo-count) * var(--camo-width) + var(--progress-width)
  );
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
  thead th {
    height: 34px;
    color: #aaa;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .camos-heading {
    text-align: left;
    padding-left: 4px;
  }
  .camo-cell {
    padding: 7px 3px;
  }
  .prestige-start {
    border-left: 1px solid #62516f;
  }
  .progress-column {
    width: var(--progress-width);
    padding: 0 14px;
  }
  .weapon-progress {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 7px 0;
  }
  .progress-count {
    font-size: 12px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    text-align: right;
    span {
      color: #999;
      font-size: 10px;
      font-weight: 400;
    }
  }
  progress {
    display: block;
    appearance: none;
    width: 100%;
    height: 4px;
    border: 0;
    border-radius: 3px;
    overflow: hidden;
    background: #363636;
    color: $green;
    &::-webkit-progress-bar {
      background: #363636;
    }
    &::-webkit-progress-value {
      background: $green;
      border-radius: 3px;
    }
    &::-moz-progress-bar {
      background: $green;
      border-radius: 3px;
    }
  }
  .category-row th {
    padding: 8px 16px;
    font-size: 16px;
    text-align: left;
    color: #bbb;
    background: #161616;
  }
  .category-label {
    display: inline-flex;
    align-items: center;
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
