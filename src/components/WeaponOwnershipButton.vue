<template>
  <button
    type="button"
    class="weapon-ownership-button"
    :aria-label="label"
    :aria-pressed="owned"
    :title="weapon.name + (owned ? ' · Owned' : ' · Not owned')"
    :disabled="disabled"
    @click="$emit('toggle')">
    <svg v-if="silhouette && !failed" viewBox="0 0 56 28" aria-hidden="true" focusable="false">
      <defs>
        <mask
          :id="maskId"
          x="0"
          y="0"
          width="56"
          height="28"
          maskUnits="userSpaceOnUse"
          style="mask-type: alpha">
          <image
            :href="silhouette"
            width="56"
            height="28"
            preserveAspectRatio="xMidYMid meet"
            @error="failed = true" />
        </mask>
      </defs>
      <rect width="56" height="28" fill="currentColor" :mask="`url(#${maskId})`" />
    </svg>
    <span v-else class="weapon-initials" aria-hidden="true">{{ initials }}</span>
    <span class="weapon-hover-name" aria-hidden="true">{{ weapon.name }}</span>
    <span v-if="owned" class="ownership-check" aria-hidden="true">✓</span>
  </button>
</template>
<script setup>
import { computed, getCurrentInstance, ref, watch } from 'vue'
import { weaponSilhouetteUrl } from '@/data/mw4/artwork'

const props = defineProps({
  weapon: { type: Object, required: true },
  label: { type: String, required: true },
  owned: Boolean,
  disabled: Boolean,
})
defineEmits(['toggle'])
const silhouette = computed(() => weaponSilhouetteUrl(props.weapon.id))
const failed = ref(false)
const maskId = `ownership-weapon-${getCurrentInstance().uid}`
const initials = computed(() =>
  props.weapon.name
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 3)
    .join('')
)
watch(silhouette, () => {
  failed.value = false
})
</script>
<style scoped>
.weapon-ownership-button {
  position: relative;
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  padding: 5px;
  border: 1px solid #49404f;
  border-radius: 4px;
  background: #28232d;
  color: #bfb5c9;
  cursor: pointer;
}
.weapon-ownership-button[aria-pressed='true'] {
  border-color: #c5a1e5;
  background: #4a355c;
  color: #f0e4fa;
  box-shadow: inset 0 0 0 1px #a57ac5;
}
svg {
  width: 100%;
  height: 36px;
}
.weapon-initials {
  font-size: 14px;
  font-weight: 600;
}
.weapon-hover-name {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 5px;
  border-radius: inherit;
  background: #211a2af2;
  color: #fff;
  font-size: 10px;
  line-height: 1.2;
  overflow-wrap: anywhere;
  text-align: center;
  opacity: 0;
  pointer-events: none;
}
.weapon-ownership-button:hover .weapon-hover-name,
.weapon-ownership-button:focus-visible .weapon-hover-name {
  opacity: 1;
}
.weapon-ownership-button:focus-visible {
  outline: 2px solid #d6b7f0;
  outline-offset: 3px;
}
.ownership-check {
  position: absolute;
  top: 2px;
  right: 3px;
  color: #eddaff;
  font-size: 11px;
  line-height: 1;
  pointer-events: none;
}
.weapon-ownership-button:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
