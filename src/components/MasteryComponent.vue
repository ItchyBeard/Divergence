<template>
  <section
    class="mastery"
    :class="'mode-' + mode"
    :data-mode="mode"
    :aria-labelledby="mode + '-mastery-heading'">
    <header>
      <h2 :id="mode + '-mastery-heading'">{{ modes[mode].name }} <span>Mastery</span></h2>
      <span class="mode-count">{{ completed }}/{{ rows.length }}</span>
    </header>
    <div
      class="mastery-progress"
      role="progressbar"
      :aria-label="modes[mode].name + ' Mastery progress'"
      :aria-valuenow="completed"
      :aria-valuemin="0"
      :aria-valuemax="rows.length">
      <span :style="{ width: (completed / rows.length) * 100 + '%' }"></span>
    </div>
    <div class="mastery-camos">
      <article
        v-for="camo in rows"
        :key="camo.id"
        class="mastery-entry"
        :class="{ completed: camo.completed }">
        <CamoButton
          :camo="camo"
          :mode="mode"
          :disabled="!!store.loadError"
          @toggle="store.toggleMastery(mode, camo.id)" />
        <div class="entry-info">
          <h3>{{ camo.name }}</h3>
          <span class="completion-state">{{
            camo.completed
              ? 'Completed'
              : camo.challenge.status === 'available'
              ? 'Not completed'
              : 'Unavailable'
          }}</span>
          <p>{{ challengeText(camo.challenge) }}</p>
          <p class="prerequisite"><span>Requires</span> {{ prerequisiteText(camo) }}</p>
        </div>
      </article>
    </div>
  </section>
</template>
<script setup>
import { computed } from 'vue'
import { useStore } from '@/stores/store'
import { modes } from '@/data/mw4/modes'
import { challengeText, prerequisiteText } from '@/data/mw4/presentation'
import CamoButton from './CamoButton.vue'
const props = defineProps({ mode: { type: String, required: true } })
const store = useStore()
const rows = computed(() => store.masteryRows(props.mode))
const completed = computed(() => rows.value.filter((camo) => camo.completed).length)
</script>
<style scoped>
section.mastery {
  min-width: 0;
  padding: 20px;
  border: 1px solid #36363c;
  border-top: 2px solid var(--mode-accent);
  border-radius: 6px;
  background: linear-gradient(160deg, #242428, #19191c);
}
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
h2 {
  margin: 0;
  font-size: 19px;
  line-height: 1.3;
  font-weight: 600;
  color: var(--mode-accent);
}
h2 span {
  display: block;
  margin-top: 3px;
  font-size: 12px;
  font-weight: 500;
  color: #bbb;
}
.mode-count {
  padding: 5px 9px;
  border-radius: 4px;
  background: #121214;
  color: #ddd;
  font-size: 14px;
  font-variant-numeric: tabular-nums;
}
.mastery-progress {
  height: 3px;
  margin: 17px 0 5px;
  border-radius: 3px;
  overflow: hidden;
  background: #39393f;
}
.mastery-progress > span {
  display: block;
  height: 100%;
  background: var(--mode-accent);
}
.mastery-entry {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 20px 0;
  border-bottom: 1px solid #ffffff0d;
}
.mastery-entry:last-child {
  border: 0;
  padding-bottom: 0;
}
.entry-info {
  min-width: 0;
  flex: 1;
}
h3 {
  margin: 0 0 6px;
  color: #eee;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.35;
}
p {
  margin: 9px 0 0;
  color: #d1d1d6;
  font-size: 13px;
  line-height: 1.65;
  overflow-wrap: anywhere;
}
.completion-state {
  color: #a5a5ae;
  font-size: 11px;
}
.completed .completion-state {
  color: #64c8a1;
}
.prerequisite {
  color: #a4a4ad;
  font-size: 12px;
}
.prerequisite > span {
  color: #c1b5cf;
}
.mastery-entry :deep(.camo-control) {
  flex: 0 0 72px;
  width: 72px;
  height: 72px;
  margin-top: 2px;
}
.mastery-entry :deep(.camo-button) {
  width: 100%;
  height: 100%;
  border-radius: 4px;
  overflow: hidden;
}
.mastery-entry :deep(.inner) {
  height: 100%;
}
@media (max-width: 600px) {
  section.mastery {
    padding: 16px;
  }
  .mastery-entry {
    gap: 12px;
  }
  .mastery-entry :deep(.camo-control) {
    flex-basis: 64px;
    width: 64px;
    height: 64px;
  }
}
</style>
