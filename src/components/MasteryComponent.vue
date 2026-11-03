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
    <ol class="mastery-camos" aria-label="Mastery tiers in unlock order">
      <li v-for="(camo, index) in rows" :key="camo.id" class="mastery-step">
        <div v-if="index > 0" class="progression-connector" aria-hidden="true">
          <svg viewBox="0 0 60 28" fill="none">
            <path class="connector-chevron" d="M2 3L30 15L58 3V13L30 26L2 13Z" />
          </svg>
        </div>
        <article
          class="mastery-entry"
          :class="['tier-' + (index + 1), { completed: camo.completed }]">
          <CamoButton
            :camo="camo"
            :mode="mode"
            :show-details="false"
            :disabled="!!store.loadError"
            @toggle="store.toggleMastery(mode, camo.id)" />
          <div class="entry-info">
            <span class="tier-label"
              >Tier {{ index + 1 }} <span aria-hidden="true">·</span> {{ tierNames[index] }}</span
            >
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
      </li>
    </ol>
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
const tierNames = ['Foundation', 'Advanced', 'Ultimate']
</script>
<style scoped>
section.mastery {
  display: flex;
  flex-direction: column;
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
.mastery-camos {
  display: grid;
  grid-template-rows: repeat(3, 1fr);
  gap: 32px;
  flex: 1;
  list-style: none;
  padding: 0;
  margin: 14px 0 0;
}
.mastery-step {
  position: relative;
  min-width: 0;
}
.mastery-entry {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  height: 100%;
  box-sizing: border-box;
  padding: 12px 8px;
  border: 1px solid transparent;
  border-radius: 4px;
}
.tier-2 {
  background: #ffffff03;
}
.tier-3 {
  border-color: var(--mode-accent);
  background: linear-gradient(135deg, #ffffff09, #ffffff02);
}
.tier-label {
  display: block;
  margin-bottom: 7px;
  color: var(--mode-accent);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  line-height: 1.5;
}
.progression-connector {
  position: absolute;
  top: -30px;
  inset-inline: 8px;
  display: flex;
  align-items: center;
  gap: 14px;
  height: 28px;
  color: var(--mode-accent);
  pointer-events: none;
}
.progression-connector::before,
.progression-connector::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, currentColor);
  opacity: 0.3;
}
.progression-connector::after {
  transform: scaleX(-1);
}
.progression-connector svg {
  flex: 0 0 60px;
  width: 60px;
  height: 100%;
}
.connector-chevron {
  fill: currentColor;
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
  .mastery-camos {
    grid-template-rows: none;
  }
  .mastery-entry :deep(.camo-control) {
    flex-basis: 64px;
    width: 64px;
    height: 64px;
  }
}
</style>
