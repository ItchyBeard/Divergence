<template>
  <div ref="root" class="container mastery-view">
    <h1>Mode Mastery</h1>
    <div class="mastery-sections">
      <MasteryComponent v-for="mode in modeIds" :key="mode" :mode="mode" />
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useTrackerJump } from '@/composables/useTrackerJump'
import { modeIds } from '@/data/mw4/modes'
import MasteryComponent from '@/components/MasteryComponent.vue'
const root = ref(null)
useTrackerJump(root)
</script>
<style scoped>
h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 8px 0 22px;
}
.mastery-sections {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  align-items: start;
}
@media (max-width: 1050px) {
  .mastery-sections {
    grid-template-columns: 1fr;
  }
}
</style>
