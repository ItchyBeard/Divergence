<template>
  <dl class="camo-requirements">
    <div v-for="(row, index) in rows" :key="index" class="requirement-row">
      <dt>{{ row.label }}</dt>
      <dd>{{ row.text }}</dd>
    </div>
  </dl>
</template>
<script setup>
import { computed } from 'vue'
import { camoRequirementRows } from '@/data/mw4/presentation'
const props = defineProps({
  camo: { type: Object, required: true },
  weapon: { type: Object, default: null },
})
const rows = computed(() => camoRequirementRows(props.camo, props.weapon))
</script>
<style scoped>
.camo-requirements {
  margin: 0;
}
.requirement-row + .requirement-row {
  margin-top: 8px;
}
dt {
  color: #b9b2c6;
  font-size: 10px;
  font-weight: 600;
  line-height: 1.5;
}
dd {
  margin: 1px 0 0;
  line-height: 1.5;
  overflow-wrap: anywhere;
}
</style>
