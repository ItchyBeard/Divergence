<template>
  <ModalComponent ref="modal" :max-width="560" @closed="stopConfetti">
    <template #header>Divergence completed!</template>
    <div class="celebration">
      <p>
        Congratulations on completing the Divergence camo grind! You've worked through every weapon
        and earned your place among the completionists.
      </p>
      <dl>
        <div>
          <dt>First camo tracked</dt>
          <dd>{{ formatDate(store.save.firstCamoTracked) }}</dd>
        </div>
        <div>
          <dt>Divergence completed</dt>
          <dd>{{ formatDate(store.save.completedAt) }}</dd>
        </div>
      </dl>
      <p class="thanks">Thanks for tracking with Divergence and supporting future updates.</p>
      <a :href="donationUrl" target="_blank" rel="noopener noreferrer">🍺 Buy me a beer</a>
    </div>
  </ModalComponent>
</template>
<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { useStore } from '@/stores/store'
import ModalComponent from './ModalComponent.vue'
import { confettiBurst } from '@/utils/confetti'
import { donationUrl } from '@/utils/support'
const store = useStore()
const modal = ref(null)
let cleanup = () => {}
const stopConfetti = () => cleanup()
const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Not recorded'
watch(
  () => store.celebrationPending,
  (pending) => {
    if (!pending) return
    store.celebrationPending = false
    modal.value.open()
    stopConfetti()
    cleanup = confettiBurst()
  }
)
onBeforeUnmount(stopConfetti)
</script>
<style scoped>
.celebration {
  line-height: 1.65;
  font-size: 14px;
}
dl {
  display: grid;
  gap: 16px;
  margin: 24px 0;
}
dl div {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
}
dt,
.thanks {
  color: #b8adbf;
}
dd {
  font-weight: 600;
}
a {
  display: inline-block;
  margin-top: 16px;
  color: #d6bdea;
}
</style>
