<template>
  <div class="container tracker-view" :class="'mode-' + mode">
    <OverallProgressComponent />
    <FiltersComponent>
      <template #mode-switch
        ><TrackerModeSwitch :model-value="mode" @update:model-value="selectMode"
      /></template>
    </FiltersComponent>
    <WeaponsComponent :mode="mode" />
  </div>
</template>
<script setup>
import { computed, inject, watch } from 'vue'
import { routerKey } from 'vue-router'
import { resolveTrackerMode } from '@/data/mw4/modeNavigation'
import TrackerModeSwitch from '@/components/TrackerModeSwitch.vue'
import { useStore } from '@/stores/store'
import FiltersComponent from '@/components/FiltersComponent.vue'
import OverallProgressComponent from '@/components/OverallProgressComponent.vue'
import WeaponsComponent from '@/components/WeaponsComponent.vue'
const props = defineProps({ mode: { type: String, default: undefined } })
const store = useStore()
const router = inject(routerKey, null)
const mode = computed(() => resolveTrackerMode(props.mode, store.preferences.trackerMode))
watch(
  () => router?.currentRoute.value.query.prestige,
  (value) => {
    if (value !== '1') return
    store.setPreferences({ showPrestigeCamos: true })
    const route = router.currentRoute.value
    const query = { ...route.query }
    delete query.prestige
    router.replace({ path: route.path, query, hash: route.hash })
  },
  { immediate: true }
)
watch(
  mode,
  (value) => {
    // Only the routed tracker owns the saved mode; embedded previews remain read-only.
    if (router && value !== store.preferences.trackerMode)
      store.setPreferences({ trackerMode: value })
  },
  { immediate: true }
)
function selectMode(value) {
  if (router) {
    const route = router.currentRoute.value
    router.replace({ path: '/tracker', query: { ...route.query, mode: value }, hash: route.hash })
  } else store.setPreferences({ trackerMode: value })
}
</script>
<style scoped>
.tracker-view {
  text-align: center;
}
</style>
