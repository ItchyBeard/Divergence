<template>
  <fieldset
    class="mode-switch"
    aria-label="Challenge mode"
    :style="{ '--segment': modeIds.indexOf(modelValue) }">
    <span class="mode-selection" aria-hidden="true"></span>
    <label v-for="mode in modeIds" :key="mode" :title="modes[mode].name">
      <input
        type="radio"
        name="tracker-challenge-mode"
        :value="mode"
        :checked="modelValue === mode"
        :aria-label="modes[mode].name"
        @change="$emit('update:modelValue', mode)" />
      <span class="mode-label">
        <img v-if="modeIcons[mode]" :src="modeIcons[mode]" :alt="modes[mode].name" />
        <template v-else>{{ modes[mode].name }}</template>
      </span>
    </label>
  </fieldset>
</template>
<script setup>
import { modes, modeIds } from '@/data/mw4/modes'
import { modeIcons } from '@/data/mw4/modeNavigation'
defineProps({ modelValue: { type: String, required: true } })
defineEmits(['update:modelValue'])
</script>
<style scoped>
.mode-switch {
  --gap: 2px;
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  width: 230px;
  max-width: 100%;
  box-sizing: border-box;
  min-width: 0;
  margin: 0;
  padding: var(--gap);
  border: 1px solid #45454c;
  border-radius: 3px;
  background: #202020;
}
.mode-selection {
  position: absolute;
  top: var(--gap);
  bottom: var(--gap);
  left: var(--gap);
  width: calc((100% - 2 * var(--gap)) / 3);
  box-sizing: border-box;
  border: 1px solid var(--mode-accent, #8497ad);
  border-radius: 4px;
  background: linear-gradient(160deg, #3b3d45, #27282e);
  box-shadow:
    inset 0 1px #ffffff14,
    0 1px 4px #0006;
  transform: translateX(calc(var(--segment) * 100%));
  transition:
    transform 180ms ease,
    border-color 180ms ease;
  pointer-events: none;
}
label {
  position: relative;
  min-width: 0;
  cursor: pointer;
}
input {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
}
.mode-label {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 28px;
  padding: 0 4px;
  color: #b8bac4;
  font-size: 11px;
  font-weight: 500;
  border-radius: 4px;
}
input:checked + .mode-label {
  color: #fff;
  font-weight: 700;
}
label:hover .mode-label {
  color: #fff;
}
input:focus-visible + .mode-label {
  outline: 2px solid #fff;
  outline-offset: -3px;
}
img {
  display: block;
  max-width: 100%;
  height: 24px;
  object-fit: contain;
}
@media (prefers-reduced-motion: reduce) {
  .mode-selection {
    transition: none;
  }
}
@media (max-width: 600px), (pointer: coarse) {
  .mode-label {
    min-height: 38px;
  }
}
</style>
