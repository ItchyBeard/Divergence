<template>
  <div class="overall-progress-component">
    <div
      v-for="camo in store.completionistStats"
      :key="camo.id"
      class="counter"
      :class="'completion-' + camo.id">
      <div class="counter-label">
        <span class="camo-round"><CamoImage :camo="camo" /></span>
        <p>
          <span>{{ camo.name }}</span
          ><strong>{{ camo.completed }}/{{ camo.total }}</strong>
        </p>
      </div>
      <div
        class="progress-track"
        role="progressbar"
        :aria-label="camo.name + ' unlocked'"
        :aria-valuenow="percentage(camo)"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuetext="camo.completed + '/' + camo.total + ' weapons'">
        <div class="progress-fill" :style="{ width: percentage(camo) + '%' }"></div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useStore } from '@/stores/store'
import CamoImage from './CamoImage.vue'
import { progressPercentage } from '@/data/mw4/launchRequirements'
const store = useStore()
const percentage = (camo) => progressPercentage(camo.completed, camo.total)
</script>
<style lang="scss" scoped>
.overall-progress-component {
  display: flex;
  justify-content: center;
  gap: 28px;
  padding: 10px 0;
  margin-bottom: 20px;
}
.counter {
  flex: 0 1 180px;
  min-width: 0;
}
.counter-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin-bottom: 8px;
  font-size: 12px;
  p {
    display: flex;
    gap: 5px;
    align-items: center;
    margin: 0;
  }
  strong {
    font-weight: 600;
    white-space: nowrap;
  }
}
.camo-round {
  flex: 0 0 22px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid #8c8c8c;
}
.progress-track {
  height: 5px;
  border-radius: 4px;
  background: #2c2c2c;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--completion-gradient);
  transition: width 0.25s ease;
}
@media (max-width: 600px) {
  .overall-progress-component {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px 16px;
    padding: 0;
    margin-bottom: 12px;
  }
  .counter-label {
    justify-content: flex-start;
    min-height: 20px;
    margin-bottom: 5px;
    font-size: 10px;
    gap: 5px;
    p {
      flex-wrap: wrap;
      gap: 3px;
    }
  }
  .camo-round {
    flex-basis: 20px;
    width: 20px;
    height: 20px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .progress-fill {
    transition: none;
  }
}
</style>
