<template>
  <div class="container gallery-view">
    <header class="gallery-heading">
      <h1>Camo Gallery</h1>
      <p>Explore weapon camos and track your personal collection.</p>
    </header>
    <div class="gallery-filters">
      <input
        v-model="filters.search"
        type="search"
        aria-label="Search camos"
        placeholder="Search camos, weapons or challenges" />
      <select v-model="filters.stage" aria-label="Camo category">
        <option value="">All camos</option>
        <option value="progression">Standard weapon progression</option>
        <option value="collectibles">Collectible camos</option>
        <option v-for="stage in galleryStages" :key="stage.id" :value="stage.id">
          {{ stage.name }}
        </option>
      </select>
      <select v-model="filters.category" aria-label="Weapon category">
        <option value="">All weapon categories</option>
        <option v-for="category in store.weaponCategories" :key="category.id" :value="category.id">
          {{ category.name }}
        </option>
      </select>
      <select v-model="filters.mode" aria-label="Gallery game mode">
        <option value="all">All modes</option>
        <option v-for="mode in modeIds" :key="mode" :value="mode">{{ modes[mode].name }}</option>
      </select>
      <select v-model="filters.status" aria-label="Unlock status">
        <option value="all">All ownership / progress</option>
        <option value="unlocked">Owned / unlocked somewhere</option>
        <option value="locked">Not owned / still to unlock</option>
      </select>
      <select v-model="filters.availability" aria-label="Camo availability">
        <option value="all">Any availability</option>
        <option value="available">Available</option>
        <option value="upcoming">Upcoming / unavailable</option>
        <option value="unknown">Unknown collectible availability</option>
      </select>
      <select v-model="filters.sort" aria-label="Gallery sort">
        <option value="name">Name (A–Z)</option>
        <option value="name-desc">Name (Z–A)</option>
        <option value="progress-desc">Highest progress</option>
        <option value="progress-asc">Lowest progress</option>
        <option value="stage">Camo type</option>
      </select>
    </div>
    <div class="collection-summary" aria-label="Collectible collection progress">
      <span>Collectibles: {{ collection.completed }}/{{ collection.total }} owned</span>
      <span v-for="entry in weaponCollections" :key="entry.key">
        {{ entry.name }}: {{ entry.progress.completed }}/{{ entry.progress.total }} unlocked
        {{ entry.camo.eligibilityComplete ? '' : '(supported subset)' }}
      </span>
    </div>
    <p class="result-count" role="status">
      {{ entries.length }} {{ entries.length === 1 ? 'camo' : 'camos' }}
    </p>
    <div class="gallery-grid">
      <button
        v-for="entry in entries"
        :key="entry.key"
        type="button"
        class="gallery-tile"
        :aria-label="'View ' + entry.name + ' details'"
        @click="openDetails(entry, $event)">
        <span class="gallery-art"><CamoImage :camo="entry.camo" /></span>
        <strong
          >{{ entry.name
          }}<span
            v-if="
              entry.kind === 'collectible' &&
              entry.camo.ownership === 'standalone' &&
              entry.progress.completed
            "
            class="owned-check"
            aria-hidden="true">
            ✓</span
          ></strong
        >
        <small
          >{{ stageName(entry.stage)
          }}<template v-if="entry.stage === 'mastery'">
            · {{ modes[entry.instances[0].mode].name }}</template
          ></small
        >
        <span class="gallery-progress"
          >{{ entry.progress.completed }}/{{ entry.progress.total }}
          {{
            entry.kind === 'collectible' && entry.camo.ownership === 'standalone'
              ? 'owned'
              : 'unlocked'
          }}
          <template
            v-if="
              entry.kind === 'collectible' &&
              entry.camo.ownership === 'weapon' &&
              !entry.camo.eligibilityComplete
            ">
            · supported subset</template
          ></span
        >
        <span v-if="entry.kind === 'collectible'" class="availability-label">{{
          collectibleAvailabilityLabels[entry.camo.availability]
        }}</span>
        <span class="gallery-progress-track" aria-hidden="true"
          ><span :style="{ width: entry.progress.percent + '%' }"></span
        ></span>
      </button>
    </div>
    <p v-if="!entries.length" class="empty-gallery">No camos match these filters.</p>
    <Teleport to="body">
      <div v-if="selected" class="gallery-backdrop" @click.self="closeDetails">
        <section
          ref="details"
          class="gallery-details"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gallery-detail-title"
          tabindex="-1"
          @keydown.esc.prevent="closeDetails"
          @keydown.tab="trapFocus">
          <header>
            <h2 id="gallery-detail-title">{{ selected.name }}</h2>
            <button type="button" aria-label="Close camo details" @click="closeDetails">×</button>
          </header>
          <div class="detail-preview">
            <span class="detail-art"><CamoImage :camo="selected.camo" /></span>
            <div>
              <p>{{ stageName(selected.stage) }}</p>
              <label v-if="selected.kind !== 'collectible' && selected.stage !== 'prestige'"
                >Challenge mode
                <select v-model="detailMode" aria-label="Detail game mode">
                  <option v-for="mode in detailModes" :key="mode" :value="mode">
                    {{ modes[mode].name }}
                  </option>
                </select></label
              >
            </div>
          </div>
          <div v-if="selected.kind === 'collectible'" class="collectible-details">
            <p>{{ selected.camo.requirement }}</p>
            <p>Availability: {{ collectibleAvailabilityLabels[selected.camo.availability] }}</p>
            <p v-if="selected.camo.requirementVerified === false" class="unavailable-status">
              {{ selected.camo.requirementNote }}
            </p>
            <p v-if="selected.camo.eligibilityNote" class="unavailable-status">
              {{ selected.camo.eligibilityNote }}
            </p>
            <div v-if="selected.camo.ownership === 'weapon'" class="weapon-ownership-groups">
              <section
                v-for="group in weaponOwnershipGroups"
                :key="group.id"
                class="weapon-ownership-category"
                :aria-label="group.name">
                <h3>
                  {{ group.name }}
                  <span
                    >{{ group.instances.filter((instance) => instance.completed).length }}/{{
                      group.instances.length
                    }}</span
                  >
                </h3>
                <div class="weapon-ownership-grid">
                  <WeaponOwnershipButton
                    v-for="instance in group.instances"
                    :key="instance.key"
                    :weapon="instance.weapon"
                    :owned="instance.completed"
                    :label="'Own ' + selected.name + ' for ' + instance.weapon.name"
                    :disabled="Boolean(store.loadError)"
                    @toggle="store.toggleCollectible(selected.camo.id, instance.weapon.id)" />
                </div>
              </section>
            </div>
            <div v-else class="unlock-list">
              <article v-for="instance in detailInstances" :key="instance.key" class="unlock-row">
                <div class="unlock-heading">
                  <strong>{{ instance.weapon?.name || selected.name }}</strong>
                  <span>{{ instance.completed ? 'Owned' : 'Not owned' }}</span>
                </div>
                <button
                  type="button"
                  class="ownership-toggle"
                  :aria-pressed="instance.completed"
                  :aria-label="
                    'Own ' + selected.name + (instance.weapon ? ' for ' + instance.weapon.name : '')
                  "
                  :disabled="Boolean(store.loadError)"
                  @click="store.toggleCollectible(selected.camo.id, instance.weapon?.id)">
                  {{ instance.completed ? 'Mark not owned' : 'Mark owned' }}
                </button>
              </article>
            </div>
          </div>
          <div v-else class="unlock-list">
            <article
              v-for="instance in detailInstances"
              :key="instance.key"
              class="unlock-row"
              :class="'mode-' + detailMode">
              <div class="unlock-heading">
                <strong>{{ instance.weapon?.name || modes[instance.mode].name }}</strong
                ><span>{{ instance.completed ? 'Unlocked' : 'Not unlocked' }}</span>
              </div>
              <small v-if="instance.label">{{ instance.label }}</small>
              <p class="challenge-mode">
                {{
                  selected.stage === 'prestige'
                    ? 'Weapon Prestige'
                    : modes[detailMode].name + ' challenges'
                }}
              </p>
              <template v-for="association in instance.associations" :key="association.camo.id">
                <CamoRequirements :camo="association.camo" :weapon="instance.weapon" />
                <RouterLink class="view-weapon" :to="galleryWeaponLocation(association)">{{
                  instance.weapon ? 'View Weapon' : 'View Mastery'
                }}</RouterLink>
              </template>
              <p v-if="!instance.available" class="unavailable-status">
                {{
                  instance.weapon && !weaponAvailability(instance.weapon, store.now).available
                    ? 'Upcoming weapon · tracking is locked.'
                    : 'Unlock requirements unavailable.'
                }}
              </p>
            </article>
          </div>
        </section>
      </div>
    </Teleport>
  </div>
</template>
<script setup>
import { computed, nextTick, onBeforeUnmount, reactive, ref, shallowRef } from 'vue'
import { RouterLink } from 'vue-router'
import catalog from '@/data/weapons/index.js'
import { useStore } from '@/stores/store'
import { modes, modeIds } from '@/data/mw4/modes'
import {
  getGallery,
  filterGallery,
  galleryInstances,
  galleryStages,
  galleryWeaponLocation,
  galleryProgress,
} from '@/data/mw4/gallery'
import { collectionSummary, collectibleAvailabilityLabels } from '@/data/mw4/collectibles'
import { weaponAvailability } from '@/data/mw4/availability'
import CamoImage from '@/components/CamoImage.vue'
import CamoRequirements from '@/components/CamoRequirements.vue'
import WeaponOwnershipButton from '@/components/WeaponOwnershipButton.vue'
import { categories } from '@/data/mw4/categories'

const store = useStore()
const records = getGallery(catalog)
const filters = reactive({
  search: '',
  stage: '',
  category: '',
  mode: 'all',
  status: 'all',
  availability: 'all',
  sort: 'name',
})
const entries = computed(() => filterGallery(records, store.save, { ...filters, now: store.now }))
const collection = computed(() => collectionSummary(store.save))
const weaponCollections = computed(() =>
  records
    .filter((entry) => entry.kind === 'collectible' && entry.camo.ownership === 'weapon')
    .map((entry) => ({
      ...entry,
      progress: galleryProgress({ ...entry, instances: galleryInstances(entry, store.save) }),
    }))
)
const selected = shallowRef(null),
  details = ref(null),
  detailMode = ref('multiplayer')
const detailModes = computed(() =>
  selected.value?.stage === 'mastery'
    ? [...new Set(selected.value.associations.map((association) => association.mode))]
    : modeIds
)
const detailInstances = computed(() =>
  selected.value
    ? galleryInstances(selected.value, store.save, { mode: detailMode.value, now: store.now })
    : []
)
const weaponOwnershipGroups = computed(() =>
  categories
    .map((category) => ({
      ...category,
      instances: detailInstances.value
        .filter((instance) => instance.weapon?.category === category.id)
        .sort((a, b) => a.weapon.name.localeCompare(b.weapon.name, 'en-GB')),
    }))
    .filter((group) => group.instances.length)
)
const stageName = (id) => galleryStages.find((stage) => stage.id === id)?.name
let previousFocus, previousOverflow
async function openDetails(entry, event) {
  previousFocus = event.currentTarget
  previousOverflow = document.body.style.overflow
  selected.value = entry
  detailMode.value =
    entry.kind === 'collectible'
      ? entry.camo.mode || 'all'
      : entry.stage === 'mastery'
      ? entry.associations[0].mode
      : filters.mode === 'all'
      ? 'multiplayer'
      : filters.mode
  document.body.style.overflow = 'hidden'
  await nextTick()
  details.value?.querySelector('button')?.focus()
}
function closeDetails() {
  selected.value = null
  document.body.style.overflow = previousOverflow || ''
  if (previousFocus?.isConnected) previousFocus.focus()
  else document.querySelector('.gallery-filters input')?.focus()
}
function trapFocus(event) {
  const controls = [...details.value.querySelectorAll('button, select, a[href]')]
  const first = controls[0],
    last = controls.at(-1)
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}
onBeforeUnmount(() => {
  if (selected.value) document.body.style.overflow = previousOverflow || ''
})
</script>
<style lang="scss" scoped>
.gallery-view {
  text-align: left;
}
.gallery-heading h1 {
  font-size: 21px;
  font-weight: 600;
  margin: 0 0 6px;
}
.gallery-heading p {
  color: #aaa;
  font-size: 12px;
  margin-bottom: 18px;
}
.gallery-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}
.gallery-filters input,
select {
  min-height: 34px;
  min-width: 0;
  max-width: 100%;
  background: #202020;
  border: 1px solid #3c3c3c;
  color: #ddd;
  border-radius: 3px;
  font-size: 12px;
  padding: 6px 8px;
}
.gallery-filters input {
  flex: 1 1 230px;
}
.result-count {
  color: #999;
  font-size: 11px;
  margin: 12px 0;
}
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
  gap: 14px;
}
.gallery-tile {
  position: relative;
  display: block;
  width: 100%;
  border: 1px solid #303030;
  border-radius: 3px;
  padding: 0 0 9px;
  overflow: hidden;
  background: #1b1b1b;
  color: white;
  text-align: left;
  cursor: pointer;
  min-width: 0;
  strong,
  small,
  .gallery-progress {
    display: block;
    margin: 6px 8px 0;
    font-size: 11px;
    line-height: 1.4;
    overflow-wrap: anywhere;
  }
  strong {
    font-size: 12px;
    font-weight: 500;
  }
  small,
  .gallery-progress {
    color: #aaa;
    font-size: 10px;
  }
  &:hover {
    border-color: #8b749f;
  }
}
.gallery-progress-track {
  position: absolute;
  inset: auto 0 0;
  height: 4px;
  background: #353039;
  span {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, #9973bd, #d1b5ed);
  }
}
.owned-check {
  color: #d1b5ed;
}
.availability-label {
  display: block;
  margin: 4px 8px 0;
  font-size: 10px;
  color: #aaa;
}
.collection-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  margin-top: 14px;
  color: #cdb6df;
  font-size: 12px;
}
.collectible-details > p {
  margin-bottom: 10px;
}
.weapon-ownership-groups {
  display: grid;
  gap: 16px;
}
.weapon-ownership-category h3 {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 600;
  span {
    margin-left: 5px;
    color: #aaa;
    font-size: 11px;
    font-weight: 400;
  }
}
.weapon-ownership-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 64px);
  gap: 8px;
}
.ownership-toggle {
  margin-top: 8px;
  padding: 7px 12px;
  min-height: 36px;
  color: #eee;
  background: #392d43;
  border: 1px solid #8b749f;
  border-radius: 3px;
  cursor: pointer;
  &[aria-pressed='true'] {
    background: #594368;
  }
  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
}
.gallery-art {
  display: block;
  aspect-ratio: 1.15;
  width: 100%;
  overflow: hidden;
}
.gallery-art :deep(.missing-art) {
  font-size: 11px;
}
button:focus-visible,
a:focus-visible,
select:focus-visible,
input:focus-visible {
  outline: 2px solid #c2aadf;
  outline-offset: 2px;
}
.empty-gallery {
  margin: 35px 0;
  color: #aaa;
  font-size: 13px;
}
.gallery-backdrop {
  position: fixed;
  inset: 0;
  z-index: 150;
  background: #000a;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.gallery-details {
  background: #1c1c1f;
  color: #eee;
  border: 1px solid #4a424f;
  border-radius: 5px;
  padding: 18px;
  width: 600px;
  max-width: 100%;
  max-height: calc(100dvh - 40px);
  overflow: auto;
  text-align: left;
  font-size: 12px;
  line-height: 1.6;
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 15px;
  }
  h2 {
    font-size: 19px;
    font-weight: 600;
  }
  header button {
    color: #ddd;
    background: #29292d;
    border: 1px solid #444;
    border-radius: 3px;
    width: 36px;
    flex: 0 0 36px;
    padding: 0;
    min-width: 36px;
    min-height: 36px;
    font-size: 22px;
    cursor: pointer;
  }
}
.detail-preview {
  display: flex;
  gap: 18px;
  align-items: center;
  margin-bottom: 18px;
}
.detail-art {
  display: block;
  width: 160px;
  flex: 0 0 160px;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 3px;
}
.detail-preview select {
  display: block;
  margin-top: 5px;
}
.unlock-list {
  display: grid;
  gap: 10px;
}
.unlock-row {
  padding: 12px;
  border: 1px solid #353239;
  border-radius: 3px;
  p {
    margin: 6px 0;
  }
  small {
    color: #c5acd9;
  }
}
.unlock-heading {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  strong {
    font-size: 13px;
    font-weight: 600;
  }
  span {
    color: #bbb;
    font-size: 11px;
  }
}
.challenge-mode {
  color: var(--mode-accent, #c5acd9);
  font-weight: 500;
}
.unavailable-status {
  color: #aaa;
  font-size: 11px;
}
.view-weapon {
  display: inline-block;
  color: #e1d3f2;
  border: 1px solid #6c5a7c;
  border-radius: 3px;
  padding: 5px 9px;
  margin-top: 6px;
  text-decoration: none;
}
@media (max-width: 600px) {
  .gallery-filters select {
    flex: 1 1 125px;
    min-height: 44px;
  }
  .gallery-filters input {
    min-height: 44px;
  }
  .gallery-grid {
    gap: 10px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .gallery-backdrop {
    padding: 10px;
    align-items: flex-end;
  }
  .gallery-details {
    padding: 14px;
    max-height: calc(100dvh - 20px);
  }
  .detail-preview {
    gap: 12px;
  }
  .detail-art {
    width: 100px;
    flex-basis: 100px;
  }
  .gallery-details header button {
    width: 44px;
    flex-basis: 44px;
  }
  .gallery-details header button,
  .view-weapon {
    min-height: 44px;
  }
}
</style>
