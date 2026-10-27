<template>
  <div class="share-wrapper" aria-hidden="true">
    <div class="off-screen-container">
      <div ref="card" class="share-card">
        <div class="card-header">
          <div class="logo-area">
            <div class="dynamic-icon"></div>
            <h1 class="brand-wordmark">Divergence</h1>
          </div>
          <div class="url">Modern Warfare 4 · {{ modes[mode].name }}</div>
        </div>
        <div class="stats-grid">
          <div
            v-for="camo in store.completionistStats"
            :key="camo.id"
            class="stat-box"
            :class="'completion-' + camo.id">
            <div class="tier-band" aria-hidden="true"></div>
            <div class="stat-info">
              <h3>{{ camo.name }}</h3>
              <div class="progress-text">{{ camo.completed }} / {{ camo.total }}</div>
              <div class="mini-track">
                <div
                  class="mini-fill"
                  :style="{
                    width: progressPercentage(camo.completed, camo.total) + '%',
                  }"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="card-footer">
          <p>
            Shared camos: {{ store.overallProgress.percent }}% · {{ modes[mode].name }} mastery:
            {{ store.masteryRows(mode).filter((camo) => camo.completed).length }}/{{
              modes[mode].mastery.length
            }}
          </p>
          <p>
            {{ store.releasedWeapons.length }} weapons ·
            {{ new Date(store.now).toLocaleDateString('en-GB') }}
          </p>
<!--          <p class="family-signature"><span class="brand-wordmark">CamoVault</span></p>-->
        </div>
      </div>
    </div>
  </div>
  <ModalComponent ref="preview" :max-width="960">
    <template #header>Share progress</template>
    <p v-if="busy" role="status">Generating progress image…</p>
    <p v-if="errorMessage" role="alert">{{ errorMessage }}</p>
    <img v-if="imageUrl" :src="imageUrl" alt="Divergence progress image" class="share-preview" />
    <template #footer>
      <a
        v-if="imageUrl"
        class="button"
        :href="imageUrl"
        :download="'divergence-' + mode + '-progress.png'"
        >Download PNG</a
      >
      &emsp;
      <button @click="preview.close()">Close</button>
    </template>
  </ModalComponent>
</template>
<script setup>
import { ref, nextTick } from 'vue'
import { useStore } from '@/stores/store'
import { modes } from '@/data/mw4/modes'
import { progressPercentage } from '@/data/mw4/launchRequirements'
import ModalComponent from './ModalComponent.vue'
defineProps({ mode: { type: String, required: true } })
const store = useStore()
const card = ref(null)
const busy = ref(false)
const preview = ref(null)
const imageUrl = ref('')
const errorMessage = ref('')
async function generateImage() {
  if (busy.value) return
  busy.value = true
  imageUrl.value = ''
  errorMessage.value = ''
  preview.value.open()
  try {
    store.refreshAvailability()
    await nextTick()
    await document.fonts?.ready
    const { default: html2canvas } = await import('html2canvas')
    const canvas = await html2canvas(card.value, {
      scale: 2,
      backgroundColor: '#121212',
      width: 1200,
      height: 630,
    })
    imageUrl.value = canvas.toDataURL('image/png')
  } catch (error) {
    errorMessage.value = 'Could not generate progress image: ' + error.message
  } finally {
    busy.value = false
  }
}
defineExpose({ generateImage })
</script>
<style lang="scss" scoped>
.share-wrapper {
  width: 0;
  height: 0;
  overflow: hidden;
}

.share-preview {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid #39393f;
  border-radius: 6px;
  box-sizing: border-box;
}
:deep(.modal) {
  margin-bottom: 0;
  max-height: 90vh;
  overflow-y: auto;
}

.off-screen-container {
  position: fixed;
  top: 0;
  left: -9999px;
  z-index: -9999;
}

.share-card {
  position: relative;
  width: 1200px;
  height: 630px;
  background: linear-gradient(145deg, #1b1b20, #121212 65%);
  color: white;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
  line-height: 1.35;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #35353b;
    padding-bottom: 22px;

    .logo-area {
      display: flex;
      align-items: center;
      gap: 16px;

      .dynamic-icon {
        width: 48px;
        height: 48px;
        border-radius: 10px;
        background: $divergence-gradient;
      }

      h1 {
        font-size: 48px;
        margin: 0;
        color: white;
      }
    }

    .url {
      font-size: 21px;
      color: #c8c8d0;
      font-weight: 500;
      white-space: nowrap;
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    flex-grow: 1;
    padding: 22px 0;
    min-height: 0;

    .stat-box {
      position: relative;
      background: #202024;
      padding: 24px;
      border-radius: 7px;
      display: flex;
      align-items: center;
      border: 1px solid #3b3b42;
      // Painted gradient bands export reliably; html2canvas distorts inset tier shadows.
      overflow: hidden;
      min-width: 0;

      .tier-band {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 6px;
        background: var(--completion-gradient);
      }

      .stat-info {
        flex-grow: 1;
        min-width: 0;

        h3 {
          margin: 0 0 10px;
          font-size: 27px;
          font-weight: 600;
        }
        .progress-text {
          font-size: 26px;
          color: #f1f1f4;
          margin-bottom: 14px;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
        }

        .mini-track {
          height: 12px;
          background: #111114;
          border-radius: 4px;
          width: 100%;
          overflow: hidden;

          .mini-fill {
            height: 100%;
            border-radius: 4px;
            background: var(--completion-gradient);
          }
        }
      }
    }
  }

  .card-footer {
    text-align: center;
    color: #bcbcc6;
    border-top: 1px solid #35353b;
    padding-top: 16px;
    font-size: 18px;
    font-weight: 500;
    p {
      margin: 4px 0;
    }

    .family-signature {
      // Use the existing bottom padding without moving the summary or progress cards.
      position: absolute;
      bottom: 12px;
      left: 40px;
      right: 40px;
      margin: 0;
      font-size: 12px;
      line-height: 16px;
      text-transform: uppercase;
      color: #b8adbf;
      opacity: 0.7;
    }
  }
}
</style>
