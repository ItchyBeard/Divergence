<template>
  <div
    class="weapon-heading"
    :class="['completion-' + tier, { completed, compact }]"
    :data-completion-tier="tier"
    :title="hint">
    <svg
      v-if="
        store.preferences.weaponIcons && !compact && silhouette && failedSilhouette !== silhouette
      "
      class="weapon-silhouette"
      :class="{ 'tier-unlocked': tier !== 'default' }"
      viewBox="0 0 56 28"
      aria-hidden="true"
      focusable="false">
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
            @error="failedSilhouette = silhouette" />
        </mask>
      </defs>
      <g :mask="`url(#${maskId})`">
        <rect width="56" height="28" :fill="silhouetteColor" />
      </g>
    </svg>
    <span
      v-if="compact"
      class="tier-accent"
      :role="tier !== 'default' ? 'img' : undefined"
      :aria-hidden="tier === 'default' ? true : undefined"
      :aria-label="tier !== 'default' ? tierName + ' unlocked' : undefined"></span>
    <button
      class="weapon-name"
      :disabled="locked"
      :aria-label="weapon.name"
      @dblclick.prevent="toggle"
      @keydown.enter.prevent="toggle"
      @keydown.space.prevent="toggle">
      {{ weapon.name }}
    </button>
    <button
      class="weapon-completion"
      :disabled="locked"
      :aria-label="actionLabel"
      :title="actionLabel"
      @click="toggle">
      <IconComponent
        :name="completed ? 'times' : 'check'"
        :fill="completed ? '#ee5253' : '#10ac84'"
        size="19" />
    </button>
  </div>
</template>
<script setup>
import { computed, ref, getCurrentInstance } from 'vue'
import { useStore } from '@/stores/store'
import { completionistCamos } from '@/data/mw4/camos'
import { weaponSilhouetteUrl } from '@/data/mw4/artwork'
const props = defineProps({
  weapon: { type: Object, required: true },
  mode: { type: String, default: 'multiplayer' },
  track: { type: String, default: 'shared' },
  compact: Boolean,
})
const store = useStore()
const silhouette = computed(() => weaponSilhouetteUrl(props.weapon.id))
const failedSilhouette = ref('')
const maskId = `weapon-silhouette-${getCurrentInstance().uid}`
const completed = computed(() =>
  props.track === 'prestige'
    ? store.prestigeApplicableCompleted(props.weapon.id)
    : store.weaponModeCompleted(props.weapon.id, props.mode)
)
const tier = computed(() => store.weaponHeaderTier(props.weapon.id))
const tierName = computed(() => completionistCamos.find((camo) => camo.id === tier.value)?.name)
const silhouetteColor = computed(
  () =>
    ({
      'gold': '#e5b75e',
      'platinum': '#d6e0e9',
      'harmonic-break': '#ef8296',
      'divergence': '#cbb8f2',
    })[tier.value] || '#ffffff'
)
const locked = computed(() => !props.weapon.available || !!store.loadError)
const actionLabel = computed(
  () =>
    `${completed.value ? 'Reset' : 'Complete'} ${props.weapon.name}${
      props.track === 'prestige' ? ' prestige' : ''
    }`
)
const hint = computed(
  () =>
    `Double-click to ${
      completed.value ? 'reset' : 'complete'
    } this weapon. Keyboard: Enter or Space.`
)
function toggle() {
  if (!locked.value) {
    if (props.track === 'prestige') store.toggleWeaponPrestige(props.weapon.id)
    else store.toggleWeaponCompleted(props.weapon.id, props.mode)
  }
}
</script>
<style lang="scss" scoped>
.weapon-heading {
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
  background: $elevation-3-color;
  border-radius: $border-radius;
  // Inset borders keep dimensions identical at every tier. Static layers respect reduced motion.
  box-shadow: inset 0 0 0 1px transparent;
  .weapon-silhouette {
    position: absolute;
    left: 29px;
    top: 50%;
    width: 56px;
    height: 28px;
    object-fit: contain;
    transform: translate(-50%, -50%) scaleX(-1) rotate(90deg);
    opacity: 0.65;
    pointer-events: none;
    user-select: none;
    transition:
      filter 0.18s ease,
      opacity 0.18s ease;
  }
  .weapon-silhouette.tier-unlocked {
    opacity: 1;
    filter: drop-shadow(0 1px 1px #0005);
  }
  &:hover .weapon-silhouette:not(.tier-unlocked),
  &:focus-within .weapon-silhouette:not(.tier-unlocked) {
    // Muted lavender from the Divergence brand palette, tinting the existing alpha artwork.
    filter: brightness(0) saturate(100%) invert(65%) sepia(28%) saturate(630%) hue-rotate(219deg)
      brightness(96%) contrast(91%);
    opacity: 1;
  }
  &:not(.compact):not(.completion-default) {
    background: var(--completion-gradient);
    box-shadow: var(--completion-shadow);
  }
  button:focus-visible {
    outline: 2px solid #eee;
    outline-offset: -4px;
    border-radius: $border-radius;
  }

  button {
    color: white;
    border: 0;
    background: transparent;
    cursor: pointer;
  }
  .weapon-name {
    flex: 1;
    padding: 25px 30px;
    font-size: 14px;
    font-weight: 600;
    user-select: none;
    min-width: 0;
  }
  .weapon-completion {
    position: absolute;
    right: 3px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 34px;
    padding: 0;
    opacity: 0.6;
  }
  &:hover .weapon-completion,
  &:focus-within .weapon-completion {
    opacity: 1;
  }
  button:disabled {
    cursor: not-allowed;
    opacity: 0.3;
  }
  @media (max-width: 600px), (pointer: coarse) {
    .weapon-completion {
      width: 44px;
      height: 44px;
      opacity: 1;
    }
    .weapon-name {
      padding: 22px 44px;
    }
  }
}
.weapon-heading.compact {
  background: transparent;
  box-shadow: none;
  border-radius: 0;
  min-height: 30px;
  .tier-accent {
    flex: 0 0 3px;
    height: 18px;
    border-radius: 1px;
    background: var(--completion-gradient);
    margin-right: 4px;
  }
  .weapon-name {
    padding: 3px 2px;
    text-align: left;
    justify-content: flex-start;
    font-size: 12px;
    line-height: 1.3;
    font-weight: 500;
    overflow-wrap: anywhere;
  }
  .weapon-completion {
    position: static;
    transform: none;
    flex: 0 0 26px;
    width: 26px;
    height: 30px;
    margin-left: 2px;
  }
  button:focus-visible {
    outline-offset: -1px;
  }
  @media (max-width: 600px), (pointer: coarse) {
    min-height: 44px;
    .weapon-name {
      min-height: 44px;
    }
    .weapon-completion {
      flex-basis: 30px;
      width: 30px;
      height: 44px;
    }
  }
}
@media (prefers-reduced-motion: reduce) {
  .weapon-heading .weapon-silhouette {
    transition: none;
  }
}
</style>
