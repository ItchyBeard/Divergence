<template>
  <div ref="root">
    <div class="container">
      <section v-if="store.preferences.favorites" class="category">
        <h2>
          <span>Favourites</span
          ><button v-if="favorites.length" @click="store.unfavoriteAll()">Remove all</button>
        </h2>
        <WeaponsTable
          v-if="store.preferences.layout === 'table' && favorites.length"
          :categories="{ Favourites: favorites }"
          :mode="mode" />
        <div v-else class="weapons">
          <WeaponComponent
            v-for="weapon in favorites"
            :key="weapon.id"
            :weapon="weapon"
            :mode="mode" />
        </div>
        <p v-if="!favorites.length">
          Use the star on a weapon to add a favourite. Current filters also apply here.
        </p>
      </section>
      <WeaponsTable
        v-if="store.preferences.layout === 'table'"
        :categories="grouped"
        :mode="mode" />
      <template v-else>
        <section v-for="(weapons, category) in grouped" :key="category" class="category">
          <h2>
            <span>{{ category }}</span
            ><span>{{ categoryProgress(category) }}</span>
          </h2>
          <div class="weapons">
            <WeaponComponent
              v-for="weapon in weapons"
              :key="weapon.id"
              :weapon="weapon"
              :mode="mode" />
          </div>
        </section>
      </template>
    </div>
    <div v-if="!visibleWeapons.length" class="finished-placeholder">
      <p>No weapons match these filters.</p>
    </div>
  </div>
</template>
<script setup>
import { computed, ref } from 'vue'
import { useTrackerJump } from '@/composables/useTrackerJump'
import { useStore } from '@/stores/store'
import { categoriesById } from '@/data/mw4/categories'
import WeaponComponent from './WeaponComponent.vue'
import WeaponsTable from './WeaponsTable.vue'
const props = defineProps({
  mode: { type: String, default: 'multiplayer' },
})
const store = useStore()
const root = ref(null)
const route = useTrackerJump(root)
const visibleWeapons = computed(() => {
  const visible = store.sortedWeapons(props.mode)
  // A Gallery jump reveals only its target; saved visibility filters remain intact.
  const target = store.weapons.find((weapon) => weapon.id === route?.query.weapon)
  return target && !visible.some((weapon) => weapon.id === target.id)
    ? [...visible, target]
    : visible
})
const grouped = computed(() => {
  if (store.preferences.sortBy === 'closest' && store.preferences.weaponGrouping === 'all')
    return { 'All weapons': visibleWeapons.value }
  return Object.fromEntries(
    store.weaponCategories
      .map((category) => [
        categoriesById[category.id].name,
        visibleWeapons.value.filter((weapon) => weapon.category === category.id),
      ])
      .filter(([, weapons]) => weapons.length)
  )
})
const favorites = computed(() =>
  visibleWeapons.value.filter((weapon) => store.isFavorite(weapon.id))
)
const categoryProgress = (name) => {
  const id = store.weaponCategories.find((category) => category.name === name)?.id
  const progress = store.categoryProgress(id)
  return `${progress.completed}/${progress.total}`
}
</script>
<style lang="scss" scoped>
.container {
  width: 100%;

  .category {
    cursor: default;

    + .category {
      margin-top: 40px;

      @media (max-width: $tablet) {
        margin-top: 40px;
      }
    }

    h2 {
      align-items: center;
      display: inline-flex;
      justify-content: space-between;
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 25px;
      width: 100%;

      span:first-child {
        cursor: pointer;
        user-select: none;
      }

      span:last-child:not(:first-child) {
        color: $elevation-9-color;
        font-size: 18px;
        margin-left: 10px;

        &.action {
          color: $elevation-9-color;
          cursor: pointer;
          font-size: 14px;
          transition: $transition;

          &:hover {
            color: lighten($elevation-9-color, 10%);
          }
        }
      }

      @media (max-width: $tablet) {
        margin-bottom: 20px;
      }
    }

    .weapons {
      display: grid;
      gap: 30px;
      grid-template-columns: repeat(4, 1fr);
      width: 100%;

      @media (max-width: $tablet) {
        grid-template-columns: 1fr;
      }
    }
  }
}

.finished-placeholder {
  color: darken(white, 50%);
  margin-top: 10vh;
  text-align: center;
  width: 100%;

  p {
    font-size: 22px;
    line-height: 1.7;

    @media (max-width: $tablet) {
      font-size: 24px;
    }
  }
}
</style>
