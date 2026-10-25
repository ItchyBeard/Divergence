<template>
  <Transition name="support-slide">
    <aside v-if="visible" class="support-banner" aria-label="Support Divergence">
      <span aria-hidden="true">🍺</span>
      <p>Enjoying Divergence? If this tracker helps, consider supporting future updates.</p>
      <a :href="donationUrl" target="_blank" rel="noopener noreferrer">Buy me a beer</a>
      <button aria-label="Dismiss support banner" @click="dismiss">×</button>
    </aside>
  </Transition>
</template>
<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { donationUrl, supportDelay, supportStorageKey } from '@/utils/support'
const visible = ref(false)
let timer
const remember = (value) => {
  try {
    localStorage.setItem(supportStorageKey, value)
  } catch {
    /* Optional notice storage. */
  }
}
function dismiss() {
  visible.value = false
  remember('dismissed')
}
onMounted(() => {
  try {
    if (localStorage.getItem(supportStorageKey)) return
  } catch {
    return
  }
  timer = setTimeout(() => {
    // Another tab may have already shown/dismissed the notice.
    try {
      if (localStorage.getItem(supportStorageKey)) return
    } catch {
      return
    }
    remember('shown')
    visible.value = true
  }, supportDelay)
})
onBeforeUnmount(() => clearTimeout(timer))
</script>
<style scoped>
.support-banner {
  position: fixed;
  top: calc(12px + env(safe-area-inset-top, 0px));
  left: 50%;
  transform: translateX(-50%);
  width: min(860px, calc(100% - 24px));
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid #79618f;
  border-radius: 6px;
  background: #211e27;
  color: #c9c1cf;
  box-shadow: 0 5px 24px #0006;
  font-size: 12px;
  line-height: 1.5;
}
p {
  flex: 1;
}
a {
  padding: 6px 9px;
  border: 1px solid #79618f;
  border-radius: 4px;
  color: #e0ceee;
  white-space: nowrap;
}
button {
  width: auto;
  padding: 0;
  background: transparent;
  border: 0;
  color: #c9c1cf;
  cursor: pointer;
  font-size: 22px;
  min-width: 32px;
  min-height: 32px;
}
.support-slide-enter-active,
.support-slide-leave-active {
  transition:
    transform 0.35s ease,
    opacity 0.35s ease;
}
.support-slide-enter-from,
.support-slide-leave-to {
  transform: translate(-50%, -130%);
  opacity: 0;
}
@media (max-width: 550px) {
  .support-banner {
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px 12px;
  }
  p {
    flex-basis: calc(100% - 36px);
  }
  a {
    margin-left: 26px;
  }
  button {
    margin-left: auto;
  }
}
@media (prefers-reduced-motion: reduce) {
  .support-slide-enter-active,
  .support-slide-leave-active {
    transition: none;
  }
}
</style>
