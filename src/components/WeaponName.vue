<template>
  <div
    class="weapon-heading"
    :class="['completion-' + tier, { completed, compact }]"
    :data-completion-tier="tier"
    :title="hint">
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
import { computed } from 'vue'
import { useStore } from '@/stores/store'
import { completionistCamos } from '@/data/mw4/camos'
const props = defineProps({
  weapon: { type: Object, required: true },
  mode: { type: String, default: 'multiplayer' },
  track: { type: String, default: 'shared' },
  compact: Boolean,
})
const store = useStore()
const completed = computed(() =>
  props.track === 'prestige'
    ? store.prestigeApplicableCompleted(props.weapon.id)
    : store.weaponModeCompleted(props.weapon.id, props.mode)
)
const tier = computed(() => store.weaponHeaderTier(props.weapon.id))
const tierName = computed(() => completionistCamos.find((camo) => camo.id === tier.value)?.name)
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
</style>
