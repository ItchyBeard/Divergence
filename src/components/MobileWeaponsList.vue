<template>
  <div class="mobile-weapons-list">
    <section v-for="(weapons, category) in categories" :key="category" class="mobile-category">
      <h2>
        {{ category }}
        <span v-if="category !== 'Favourites'">{{ categoryProgress(category) }}</span>
      </h2>
      <article
        v-for="weapon in weapons"
        :key="weapon.id"
        :data-weapon-id="weapon.id"
        class="mobile-weapon"
        :class="[
          'completion-' + store.weaponHeaderTier(weapon.id),
          { 'coming-soon': !weapon.available },
        ]">
        <button
          class="favorite"
          :aria-label="
            (store.isFavorite(weapon.id) ? 'Remove favourite ' : 'Favourite ') + weapon.name
          "
          :aria-pressed="store.isFavorite(weapon.id)"
          :disabled="!weapon.available || !!store.loadError"
          @click="store.toggleFavorite(weapon.id)">
          <IconComponent
            name="star"
            icon-style="solid"
            size="16"
            :fill="store.isFavorite(weapon.id) ? '#feca57' : '#777'" />
        </button>
        <details>
          <summary>
            <span class="weapon-title">
              <strong>{{ weapon.name }}</strong>
              <small v-if="weapon.label">{{ weapon.label }}</small>
            </span>
            <span class="weapon-progress">
              <span class="progress-count"
                >{{ progress(weapon).completed }}<span>/{{ progress(weapon).total }}</span></span
              >
              <progress
                :value="progress(weapon).completed"
                :max="progress(weapon).total || 1"
                :aria-label="weapon.name + ' camo progress'" />
            </span>
            <span class="expand-icon" aria-hidden="true">⌄</span>
          </summary>
          <div class="weapon-checklist">
            <div class="checklist-toolbar">
              <span>{{
                weapon.available ? 'Tap a camo for details' : 'Tracking locked until release'
              }}</span>
              <button
                :disabled="!weapon.available || !!store.loadError"
                :aria-label="
                  (store.weaponModeCompleted(weapon.id, mode) ? 'Reset ' : 'Complete ') +
                  weapon.name
                "
                @click="store.toggleWeaponCompleted(weapon.id, mode)">
                {{
                  store.weaponModeCompleted(weapon.id, mode) ? 'Reset weapon' : 'Complete weapon'
                }}
              </button>
            </div>
            <section v-for="group in groups(weapon)" :key="group.id" class="camo-group">
              <h3 class="sr-only">
                {{ group.name }}
                <span
                  >{{ group.camos.filter((camo) => camo.completed).length }}/{{
                    group.camos.length
                  }}</span
                >
              </h3>
              <div
                class="camo-checklist"
                :style="{ gridTemplateColumns: `repeat(${group.camos.length}, minmax(0, 1fr))` }">
                <div v-for="camo in group.camos" :key="camo.id" class="checklist-camo">
                  <CamoButton
                    :camo="camo"
                    :weapon="weapon"
                    :mode="camo.stage === 'prestige' ? '' : mode"
                    :locked="!weapon.available"
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
                </div>
              </div>
            </section>
          </div>
        </details>
      </article>
    </section>
  </div>
</template>
<script setup>
import { useStore } from '@/stores/store'
import CamoButton from './CamoButton.vue'

const props = defineProps({
  categories: { type: Object, required: true },
  mode: { type: String, required: true },
})
const store = useStore()
const progress = (weapon) => {
  const camos = store.camoRows(weapon, props.mode)
  return { completed: camos.filter((camo) => camo.completed).length, total: camos.length }
}
const categoryProgress = (name) => {
  const id = store.weaponCategories.find((category) => category.name === name)?.id
  const value = store.categoryProgress(id)
  return `${value.completed}/${value.total}`
}
const groups = (weapon) => {
  const camos = store.camoRows(weapon, props.mode)
  return [
    {
      id: 'military',
      name: 'Military',
      camos: store.filters.hideMilitaryCamos
        ? []
        : camos.filter((camo) => camo.stage === 'military'),
    },
    {
      id: 'special-completionist',
      name: 'Special and Completionist',
      camos: camos.filter((camo) => camo.stage !== 'military'),
    },
    {
      id: 'prestige',
      name: 'Weapon Prestige',
      camos: store.preferences.showPrestigeCamos ? store.prestigeRows(weapon) : [],
    },
  ].filter((group) => group.camos.length)
}
</script>
<style lang="scss" scoped>
.mobile-weapons-list {
  text-align: left;
  border: 1px solid #363636;
  border-radius: 4px;
}
.mobile-category > h2 {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  padding: 10px 12px;
  background: #161616;
  color: #ccc;
  font-size: 14px;
  span {
    color: #888;
    font-size: 12px;
  }
}
.mobile-weapon {
  position: relative;
  border-top: 1px solid #303030;
  background: #202020;
  min-width: 0;
}
.favorite {
  position: absolute;
  top: 7px;
  left: 0;
  width: 44px;
  height: 44px;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
}
button {
  cursor: pointer;
}
button:disabled {
  cursor: not-allowed;
  opacity: 0.35;
}
button:focus-visible,
summary:focus-visible {
  outline: 2px solid #c5b0e8;
  outline-offset: -3px;
}
summary {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 64px 16px;
  align-items: center;
  gap: 12px;
  min-height: 58px;
  padding: 10px 12px 10px 44px;
  cursor: pointer;
  list-style: none;
  &::-webkit-details-marker {
    display: none;
  }
}
.weapon-title {
  min-width: 0;
  padding-left: 9px;
  border-left: 3px solid #45404c;
  position: relative;
  &::before {
    content: '';
    position: absolute;
    left: -3px;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--completion-gradient);
  }
  strong {
    font-size: 12px;
    overflow-wrap: anywhere;
  }
  small {
    display: block;
    color: #b7a5d1;
    font-size: 9px;
    line-height: 1.4;
    margin-top: 4px;
  }
}
.weapon-progress {
  display: grid;
  gap: 5px;
}
.progress-count {
  color: #ddd;
  font-size: 12px;
  text-align: right;
  font-variant-numeric: tabular-nums;
  span {
    color: #888;
  }
}
progress {
  display: block;
  width: 100%;
  height: 3px;
  appearance: none;
  border: 0;
  border-radius: 3px;
  overflow: hidden;
  background: #38343e;
  &::-webkit-progress-bar {
    background: #38343e;
  }
  &::-webkit-progress-value {
    background: #b9a3e1;
  }
  &::-moz-progress-bar {
    background: #b9a3e1;
  }
}
.expand-icon {
  color: #aaa;
  text-align: center;
  font-size: 20px;
  line-height: 1;
}
details[open] {
  .expand-icon {
    transform: rotate(180deg);
  }
}
.weapon-checklist {
  padding: 0 12px 12px;
}
.checklist-toolbar {
  border-top: 1px solid #303030;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: #999;
  font-size: 10px;
  button {
    background: transparent;
    border: 0;
    color: #c7b6df;
    padding: 0;
    min-height: 44px;
    font: inherit;
  }
}
.camo-group {
  & + & {
    margin-top: 5px;
  }
}
.camo-checklist {
  display: grid;
  gap: 5px;
}
.checklist-camo {
  min-width: 0;
  :deep(.inner) {
    height: 44px;
    min-height: 44px;
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
.coming-soon .weapon-title {
  opacity: 0.55;
}
</style>
