<template>
  <small v-if="weapon.label" :tabindex="weapon.releaseDateLabel ? 0 : undefined">
    <span class="label-text">
      <span>{{ weapon.label }}</span>
      <span v-if="weapon.releaseDateLabel" class="release-date">{{ weapon.releaseDateLabel }}</span>
    </span>
  </small>
</template>

<script setup>
defineProps({ weapon: { type: Object, required: true } })
</script>

<style scoped>
.label-text {
  display: inline-grid;
}
.label-text > span {
  grid-area: 1 / 1;
}
.release-date {
  visibility: hidden;
}
small:is(:hover, :focus-visible) .label-text:has(.release-date) > span:first-child {
  visibility: hidden;
}
small:is(:hover, :focus-visible) .release-date {
  visibility: visible;
}
</style>
