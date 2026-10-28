<template>
  <img
    v-if="!fallbackFailed"
    :src="src"
    :alt="camo.name"
    :aria-label="usingFallback ? camo.name + ' artwork unavailable' : undefined"
    loading="lazy"
    @error="imageFailed" />
  <span
    v-else
    class="missing-art"
    role="img"
    :aria-label="camo.name + ' artwork unavailable'"></span>
</template>
<script setup>
import { computed, ref, watch } from 'vue'
import { camoImageUrl, missingCamoImageUrl } from '@/data/mw4/artwork'
const props = defineProps({ camo: { type: Object, required: true } })
const artwork = computed(() => camoImageUrl(props.camo))
const failed = ref(false)
const fallbackFailed = ref(false)
const usingFallback = computed(
  () => failed.value || !artwork.value || artwork.value === missingCamoImageUrl
)
const src = computed(() => (usingFallback.value ? missingCamoImageUrl : artwork.value))
function imageFailed() {
  if (usingFallback.value) fallbackFailed.value = true
  else failed.value = true
}
watch(artwork, () => {
  failed.value = false
  fallbackFailed.value = false
})
</script>
<style lang="scss" scoped>
img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.missing-art {
  display: block;
  height: 100%;
  width: 100%;
  background: #303030;
}
</style>
