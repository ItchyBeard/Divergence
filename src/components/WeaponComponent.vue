<template>
  <div
    class="weapon-wrapper"
    :class="{ favorite: store.isFavorite(weapon.id) }"
    :data-weapon-id="weapon.id">
    <div class="weapon" :class="{ 'label': !!weapon.label, 'coming-soon': !weapon.available }">
      <div class="name" :data-label="weapon.label || null">
        <WeaponName :weapon="weapon" :mode="mode" :track="track" />
      </div>
      <div
        v-for="(group, index) in groups"
        :key="index"
        class="progress"
        :style="{
          gridTemplateColumns:
            layout === 'grid' ? 'repeat(' + group.length + ', minmax(0, 1fr))' : '1fr',
        }">
        <CamoButton
          v-for="camo in group"
          :key="camo.id"
          :camo="camo"
          :weapon="weapon"
          :mode="track === 'prestige' ? '' : mode"
          :list="layout === 'list'"
          :locked="!weapon.available"
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
      </div>
    </div>
    <button
      class="favorite-icon"
      :disabled="!weapon.available || !!store.loadError"
      :aria-label="(store.isFavorite(weapon.id) ? 'Remove ' : 'Favourite ') + weapon.name"
      :aria-pressed="store.isFavorite(weapon.id)"
      @click="store.toggleFavorite(weapon.id)">
      <IconComponent
        name="star"
        :fill="store.isFavorite(weapon.id) ? '#feca57' : 'gray'"
        icon-style="solid"
        size="22" />
    </button>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useStore } from '@/stores/store'
import CamoButton from './CamoButton.vue'
import WeaponName from './WeaponName.vue'
const props = defineProps({
  weapon: { type: Object, required: true },
  mode: { type: String, default: 'multiplayer' },
  track: { type: String, default: 'shared' },
})
const store = useStore()
const layout = computed(() => store.preferences.layout)
const groups = computed(() => {
  if (props.track === 'prestige') return [store.prestigeRows(props.weapon)]
  const camos = store.camoRows(props.weapon, props.mode)
  return [
    store.filters.hideMilitaryCamos ? [] : camos.filter((camo) => camo.stage === 'military'),
    camos.filter((camo) => camo.stage !== 'military'),
  ].filter((group) => group.length)
})
</script>
<style lang="scss" scoped>
.weapon-wrapper {
  position: relative;
  .favorite-icon {
    cursor: pointer;
    opacity: 0;
    position: absolute;
    right: 0;
    top: 0;
    transition: $transition;
    transform: translate(50%, -50%);
    z-index: 2;
    border: 0;
    background: none;
    padding: 0;
  }
  &.favorite .favorite-icon,
  &:hover .favorite-icon,
  &:focus-within .favorite-icon {
    opacity: 1;
  }
  .favorite-icon:disabled {
    cursor: not-allowed;
    opacity: 0.25;
  }
  .weapon {
    position: relative;
    .name {
      position: relative;
    }
    .progress {
      display: grid;
      gap: 5px;
      margin-top: 5px;
    }
    &.label .name {
      margin-bottom: 14px;
      &::after {
        background: $purple;
        border: 3px solid $background-color;
        border-radius: 100px;
        bottom: 0;
        color: white;
        content: attr(data-label);
        font-size: 10px;
        font-weight: 500;
        left: 50%;
        padding: 4px 6px;
        position: absolute;
        transform: translate(-50%, 50%);
        z-index: 2;
        white-space: nowrap;
      }
    }
    &.coming-soon {
      :deep(.weapon-heading) {
        background: $elevation-1-color;
      }
      .name::after {
        background: $blue;
      }
    }
  }
  @media (max-width: $tablet) {
    .favorite-icon {
      opacity: 1;
    }
  }
  @media (max-width: 600px), (pointer: coarse) {
    .favorite-icon {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
