<template>
  <div v-if="service.enabled" class="analytics-preferences container">
    <button ref="opener" class="preferences-button" @click="open">Analytics preferences</button>
    <section
      v-if="panelOpen"
      class="analytics-panel"
      role="region"
      aria-labelledby="analytics-heading"
      @keydown.esc="close">
      <h2 id="analytics-heading">Optional analytics</h2>
      <p>
        Allow Google Analytics cookies to measure page visits? Google receives usage and
        device/network information. We never send your tracker progress or saved data. Your choice
        is remembered on this browser for six months. Rejecting does not affect the tracker.
      </p>
      <a
        href="https://policies.google.com/technologies/partner-sites"
        target="_blank"
        rel="noopener noreferrer">
        How Google uses this information
      </a>
      <p v-if="choice === 'accepted'">Rejecting now reloads this page to stop Analytics.</p>
      <div class="analytics-actions">
        <button ref="reject" @click="choose('rejected')">Reject analytics</button>
        <button @click="choose('accepted')">Accept analytics</button>
        <button v-if="choice" @click="close">Close</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { nextTick, ref } from 'vue'
import { analytics } from '@/analytics'

const props = defineProps({ service: { type: Object, default: () => analytics } })
const { choice, panelOpen } = props.service
const opener = ref(null)
const reject = ref(null)
async function open() {
  panelOpen.value = true
  await nextTick()
  reject.value?.focus()
}
async function close() {
  if (!choice.value) return
  panelOpen.value = false
  await nextTick()
  opener.value?.focus()
}
async function choose(value) {
  props.service.choose(value)
  await nextTick()
  opener.value?.focus()
}
</script>

<style scoped>
.analytics-preferences {
  text-align: center;
  margin-bottom: 16px;
}
.analytics-preferences button {
  background: #262626;
  color: #fff;
  border: 1px solid #706a7c;
  border-radius: 3px;
  padding: 10px 12px;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
}
.analytics-preferences .preferences-button {
  background: transparent;
}
.analytics-preferences button:focus-visible,
.analytics-preferences a:focus-visible {
  outline: 2px solid #ac91db;
  outline-offset: 3px;
}
.analytics-panel {
  position: fixed;
  z-index: 1000;
  left: 12px;
  right: 12px;
  bottom: calc(65px + env(safe-area-inset-bottom, 0px));
  margin: 0 auto;
  max-width: 540px;
  max-height: 65vh;
  overflow-y: auto;
  background: #1c1c1c;
  border: 1px solid #706a7c;
  border-radius: 3px;
  padding: 16px;
  text-align: left;
  box-shadow: 0 6px 24px #0008;
}
.analytics-panel h2 {
  font-size: 16px;
  font-weight: 600;
}
.analytics-panel p,
.analytics-panel a {
  font-size: 13px;
  line-height: 1.5;
  margin-top: 8px;
}
.analytics-panel a {
  color: #c7b5e5;
  display: inline-block;
}
.analytics-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
</style>
