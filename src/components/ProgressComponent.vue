<template>
  <Transition name="slide-up" appear
    ><div class="bars">
      <div
        class="progress"
        role="progressbar"
        aria-label="Shared camo progress"
        :aria-valuenow="store.overallProgress.percent"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuetext="
          store.overallProgress.completed +
          '/' +
          store.overallProgress.total +
          ' recorded camos; progression uses the best ' +
          launchRequirements.weapons +
          ' released weapons'
        "
        :title="
          'Recorded shared camos against the fixed launch target. Progression uses your best ' +
          launchRequirements.weapons +
          ' released weapons.'
        ">
        <div class="bar" :style="{ width: store.overallProgress.percent + '%' }"></div>
        <span class="progress-label"
          >Divergence: <strong>{{ store.overallProgress.percent }}%</strong
          ><span class="progress-count">
            · {{ store.overallProgress.completed }}/{{ store.overallProgress.total }}</span
          ></span
        >
      </div>
    </div></Transition
  >
</template>
<script setup>
import { useStore } from '@/stores/store'
import { launchRequirements } from '@/data/mw4/launchRequirements'
const store = useStore()
</script>
<style lang="scss" scoped>
.bars {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 50;
  overflow: hidden;
  user-select: none;
  background: $elevation-4-color;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
.progress {
  height: 35px;
  position: relative;
  width: 100%;
  background: $elevation-4-color;
}
.bar {
  height: 100%;
  background: $divergence-gradient;
  background-size: cover;
  transition: width $transition;
}
.progress-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  white-space: nowrap;
  text-shadow: 0 1px 2px #000;
  strong {
    font-weight: 600;
  }
  .progress-count {
    opacity: 0.7;
  }
}
</style>
