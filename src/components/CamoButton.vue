<template>
  <div
    ref="root"
    class="camo-control"
    :class="[camo.stage, { list, compact }]"
    @mouseenter="showDesktop"
    @mouseleave="scheduleClose">
    <button
      ref="tile"
      type="button"
      class="camo-button"
      :data-camo-id="camo.id"
      :class="[
        camo.stage,
        { 'completed': camo.completed, 'unavailable': disabled, 'table-indicator': indicator },
      ]"
      :disabled="locked"
      :aria-disabled="disabled || locked ? true : undefined"
      :aria-label="camoText(camo, weapon)"
      :aria-pressed="camo.completed"
      :aria-describedby="open ? tooltipId : undefined"
      :aria-expanded="pinned ? open : undefined"
      @focus="showDesktop"
      @blur="handleBlur"
      @pointerdown="rememberPointer"
      @click="activate"
      @keydown.esc.prevent="close"
      @keydown.arrow-down.prevent="pin">
      <span v-if="indicator" class="table-check" aria-hidden="true">
        <IconComponent v-if="camo.completed" name="check" fill="white" size="14" />
      </span>
      <span v-else class="inner" :class="{ completed: camo.completed }">
        <span class="thumbnail"><CamoImage :camo="camo" /></span>
        <IconComponent class="complete" name="check" fill="#10ac84" size="24" />
        <IconComponent class="remove" name="times" fill="#ee5253" size="24" />
        <span v-if="list" class="info">
          <strong>{{ camo.name }}</strong>
          <span v-if="listPrimary" class="list-primary">{{ listPrimary.text }}</span>
        </span>
      </span>
    </button>
    <Teleport to="body">
      <button
        v-if="open && pinned && mobile"
        class="popover-backdrop"
        aria-label="Dismiss challenge details"
        @click="close"></button>
      <section
        v-if="open"
        :id="tooltipId"
        ref="popover"
        class="camo-tooltip"
        :class="{ mobile: pinned && mobile }"
        :role="pinned ? 'dialog' : 'tooltip'"
        :aria-modal="pinned && mobile ? true : undefined"
        :aria-label="camo.name + ' requirements'"
        :style="position"
        @mouseenter="cancelClose"
        @mouseleave="scheduleClose"
        @focusin="cancelClose"
        @focusout="handleBlur"
        @keydown.tab="trapFocus"
        @keydown.esc.prevent="dismiss">
        <div class="tooltip-heading">
          <strong>{{ camo.name }}</strong
          ><button
            v-if="pinned"
            class="close-details"
            aria-label="Close challenge details"
            @click="dismiss">
            <IconComponent name="times" size="18" />
          </button>
        </div>
        <p class="camo-category">
          {{ stageName }}<template v-if="weapon"> · {{ weapon.name }}</template>
          <template v-if="modeName">
            ·
            <span class="mode-challenge-label" :class="'mode-' + mode"
              >{{ modeName }} challenges</span
            ></template
          >
        </p>
        <CamoRequirements :camo="camo" :weapon="weapon" />
        <button
          v-if="pinned"
          class="completion-action"
          :disabled="disabled || locked"
          @click.stop="toggleFromDetails">
          <IconComponent
            :name="camo.completed ? 'times' : 'check'"
            :fill="camo.completed ? '#ee5253' : '#10ac84'"
            size="20" />
          {{ camo.completed ? 'Mark incomplete' : 'Mark complete' }}
        </button>
      </section>
    </Teleport>
  </div>
</template>
<script setup>
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { camoText, camoRequirementRows } from '@/data/mw4/presentation'
import { modes } from '@/data/mw4/modes'
import CamoImage from './CamoImage.vue'
import CamoRequirements from './CamoRequirements.vue'
const props = defineProps({
  camo: { type: Object, required: true },
  weapon: { type: Object, default: null },
  mode: { type: String, default: '' },
  disabled: Boolean,
  locked: Boolean,
  list: Boolean,
  compact: Boolean,
  indicator: Boolean,
})
const emit = defineEmits(['toggle'])
const root = ref(null),
  tile = ref(null),
  popover = ref(null)
const open = ref(false),
  pinned = ref(false),
  mobile = ref(false),
  position = ref({})
const tooltipId = 'camo-details-' + getCurrentInstance().uid
let closeTimer,
  touchPointer = false,
  suppressFocus = false
const stageName = computed(
  () =>
    ({
      military: 'Military',
      special: 'Special',
      completionist: 'Completionist',
      prestige: 'Weapon Prestige',
      mastery: 'Mode Mastery',
    })[props.camo.stage]
)
const modeName = computed(() => modes[props.mode]?.name || '')
const requirementRows = computed(() => camoRequirementRows(props.camo, props.weapon))
const listPrimary = computed(
  () =>
    requirementRows.value.find((row) => row.label === 'Challenge') ||
    requirementRows.value.find((row) => row.label === 'Requirement') ||
    requirementRows.value[0]
)
const coarse = () =>
  window.matchMedia?.('(max-width: 600px), (hover: none), (pointer: coarse)').matches || false
function locate() {
  if (!tile.value || !open.value || (pinned.value && mobile.value)) return
  const rect = tile.value.getBoundingClientRect()
  const width = Math.min(320, window.innerWidth - 24)
  const height = popover.value?.offsetHeight || 200
  const left = Math.max(
    12,
    Math.min(rect.left + rect.width / 2 - width / 2, window.innerWidth - width - 12)
  )
  const top = Math.max(
    12,
    Math.min(
      rect.top >= height + 20 ? rect.top - height - 10 : rect.bottom + 10,
      window.innerHeight - height - 12
    )
  )
  position.value = {
    left: left + 'px',
    top: top + 'px',
    width: width + 'px',
    maxHeight: 'calc(100dvh - 24px)',
  }
}
function cancelClose() {
  clearTimeout(closeTimer)
}
async function showDesktop() {
  if (props.locked || suppressFocus || coarse() || touchPointer) return
  cancelClose()
  open.value = true
  await nextTick()
  locate()
}
function close() {
  cancelClose()
  open.value = false
  pinned.value = false
}
function scheduleClose() {
  if (!pinned.value) {
    cancelClose()
    closeTimer = setTimeout(close, 0)
  }
}
function handleBlur(event) {
  if (root.value?.contains(event.relatedTarget) || popover.value?.contains(event.relatedTarget))
    return
  scheduleClose()
}
function rememberPointer(event) {
  touchPointer = event.pointerType === 'touch' || event.pointerType === 'pen'
}
async function pin() {
  if (props.locked) return
  cancelClose()
  mobile.value = coarse() || touchPointer
  pinned.value = true
  open.value = true
  if (mobile.value) position.value = {}
  await nextTick()
  locate()
  popover.value?.querySelector('button')?.focus()
}
function activate() {
  if (touchPointer || coarse()) {
    pin()
    return
  }
  if (!props.disabled && !props.locked) emit('toggle')
}
function dismiss() {
  close()
  suppressFocus = true
  tile.value?.focus()
  nextTick(() => {
    suppressFocus = false
  })
}
function trapFocus(event) {
  if (!pinned.value) return
  const buttons = [...popover.value.querySelectorAll('button:not(:disabled)')]
  const first = buttons[0],
    last = buttons.at(-1)
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}
function toggleFromDetails() {
  if (!props.disabled && !props.locked) {
    emit('toggle')
    dismiss()
  }
}
function outside(event) {
  if (!root.value?.contains(event.target) && !popover.value?.contains(event.target)) close()
}
function scrolled(event) {
  if (event.target instanceof Node && popover.value?.contains(event.target)) return
  if (pinned.value) locate()
  else close()
}
function removeListeners() {
  document.removeEventListener('pointerdown', outside)
  window.removeEventListener('resize', locate)
  window.removeEventListener('scroll', scrolled, true)
}
watch(open, (visible) => {
  if (!visible) return removeListeners()
  document.addEventListener('pointerdown', outside)
  window.addEventListener('resize', locate)
  window.addEventListener('scroll', scrolled, true)
})
onBeforeUnmount(() => {
  cancelClose()
  removeListeners()
})
</script>
<style lang="scss" scoped>
.camo-control {
  position: relative;
  min-width: 0;
}
.camo-button {
  width: 100%;
  display: block;
  padding: 0;
  border: 0;
  border-radius: $border-radius;
  color: white;
  background: $elevation-2-color;
  cursor: pointer;
  .inner {
    display: flex;
    align-items: center;
    position: relative;
    overflow: hidden;
    border-radius: $border-radius;
    height: 34px;
  }
  .thumbnail {
    height: 100%;
    width: 100%;
    transition: opacity $transition;
    display: block;
  }
  .icon-component {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
    pointer-events: none;
    transition: opacity $transition;
    z-index: 2;
    filter: drop-shadow(0 1px 2px #000);
  }
  &.completed {
    .thumbnail,
    .info {
      opacity: 0.25;
    }
    .complete {
      opacity: 1;
    }
  }
  @media (hover: hover) {
    &:not(.unavailable):not(:disabled):hover {
      .thumbnail,
      .info {
        opacity: 0.25;
      }
      .complete {
        opacity: 1;
      }
    }
    &.completed:not(.unavailable):not(:disabled):hover {
      .complete {
        opacity: 0;
      }
      .remove {
        opacity: 1;
      }
    }
  }
  &.unavailable:not(.completed) .thumbnail {
    opacity: 0.4;
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
  &:focus-visible {
    outline: 2px solid #ccb4ed;
    outline-offset: 2px;
  }
  .info {
    padding: 4px 8px;
    text-align: left;
    flex: 1;
    transition: opacity $transition;
    min-width: 0;
    strong {
      display: block;
      font-size: 11px;
      font-weight: 500;
    }
    span {
      display: block;
      color: #aaa;
      font-size: 10px;
      line-height: 1.3;
    }
  }
}
.list .camo-button {
  .inner {
    min-height: 68px;
    height: auto;
    gap: 12px;
    padding: 10px 12px;
  }
  .thumbnail {
    width: 48px;
    height: 48px;
    flex: 0 0 48px;
    align-self: center;
    border-radius: 3px;
    overflow: hidden;
  }
  .icon-component {
    left: 36px;
  }
  .info {
    padding: 0;
    opacity: 1;
    strong {
      color: #eee;
      font-size: 14px;
      font-weight: 600;
      line-height: 1.5;
      margin-bottom: 2px;
    }
    .list-primary {
      color: #ccc;
      font-size: 13px;
      line-height: 1.5;
    }
  }
  &.completed .info,
  &:not(.unavailable):not(:disabled):hover .info {
    opacity: 1;
  }
}
.list .camo-button.military,
.list .camo-button.special,
.list .camo-button.completionist {
  .inner {
    min-height: 56px;
    padding: 6px 10px;
    gap: 10px;
  }
  .thumbnail {
    width: 36px;
    height: 36px;
    flex-basis: 36px;
  }
  .icon-component {
    left: 28px;
  }
  .info strong {
    font-size: 13px;
  }
  .info .list-primary {
    font-size: 12px;
  }
}
.compact .inner {
  height: 30px;
}
.camo-button.table-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 30px;
  background: transparent;
  border-radius: 0;
  .table-check {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border: 2px solid $elevation-3-color;
    border-radius: 4px;
    background: transparent;
    .icon-component {
      position: static;
      z-index: auto;
      transform: none;
      opacity: 1;
      filter: none;
    }
  }
  &.completed .table-check {
    background: #8634b5;
    border-color: #452c45;
  }
  &.unavailable:not(.completed) .table-check {
    opacity: 0.45;
    background: $elevation-1-color;
  }
  &:disabled {
    opacity: 0.5;
  }
  @media (hover: hover) {
    &:not(.unavailable):not(:disabled):hover .table-check {
      border-color: #777;
    }
  }
  @media (max-width: 600px), (pointer: coarse) {
    min-height: 44px;
  }
}
.popover-backdrop {
  touch-action: none;
  position: fixed;
  inset: 0;
  border: 0;
  padding: 0;
  background: #0009;
  z-index: 1000;
}
.camo-tooltip {
  position: fixed;
  z-index: 1001;
  padding: 14px;
  background: #232327;
  color: #eee;
  border: 1px solid #47434e;
  border-radius: 5px;
  box-shadow: 0 6px 28px #0009;
  text-align: left;
  font-size: 12px;
  line-height: 1.6;
  overflow: auto;
  .tooltip-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    strong {
      font-size: 14px;
      font-weight: 600;
    }
  }
  .camo-category {
    font-size: 10px;
    color: #b7a5d1;
    margin: 3px 0 9px;
  }
  button {
    font: inherit;
    border: 1px solid #555;
    border-radius: 3px;
    color: white;
    background: #303035;
    cursor: pointer;
  }
  .completion-action {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    min-height: 34px;
    width: 100%;
    margin-top: 12px;
    padding: 5px 10px;
  }
  .completion-action:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .close-details {
    border: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
  }
  &.mobile {
    overscroll-behavior: contain;
    left: 12px;
    right: 12px;
    bottom: calc(12px + env(safe-area-inset-bottom, 0px));
    top: auto;
    width: auto;
    max-height: calc(85dvh - env(safe-area-inset-bottom, 0px));
    padding: 18px;
    font-size: 14px;
    .completion-action,
    .close-details {
      min-height: 44px;
    }
  }
}
@media (max-width: 600px), (pointer: coarse) {
  .camo-control:not(.compact) .inner {
    min-height: 40px;
  }
}
</style>

<style scoped>
.mode-challenge-label {
  color: var(--mode-accent);
  font-weight: 600;
}
</style>
