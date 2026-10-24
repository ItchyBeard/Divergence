<template>
  <img v-if="src && !failed" :src="src" :alt="camo.name" loading="lazy" @error="failed = true" />
  <span v-else class="missing-art" :aria-label="camo.name + ' artwork unavailable'">
    <IconComponent name="image-slash" size="16" /><span>{{ camo.name }}</span>
  </span>
</template>
<script setup>
import { computed, ref, watch } from 'vue'
import { camoImageUrl } from '@/data/mw4/artwork'
const props = defineProps({ camo: { type: Object, required: true } })
const src = computed(() => camoImageUrl(props.camo))
const failed = ref(false)
watch(src, () => {
  failed.value = false
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
  display: flex;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 2px;
  padding: 2px;
  background: #303030;
  color: #aaa;
  font-size: 8px;
  line-height: 1.1;
  overflow: hidden;
}
</style>
