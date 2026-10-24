<template>
  <div class="settings container">
    <div class="setting">
      <h3>Weapon completion indicator</h3>
      <p class="subtitle">Choose which shared camo is counted beside each weapon category.</p>
      <label
        >Completion target<select
          aria-label="Completion target"
          :value="store.preferences.completionTarget"
          @change="store.setPreferences({ completionTarget: $event.target.value })">
          <option v-for="camo in completionistCamos" :key="camo.id" :value="camo.id">
            {{ camo.name }}
          </option>
        </select></label
      >
    </div>
    <div class="setting">
      <h3>Export progress</h3>
      <p class="subtitle">
        Includes shared camos, mode mastery, Weapon Prestige, favourites, filters and preferences.
      </p>
      <textarea aria-label="Export progress JSON" :value="store.exportProgress()" readonly />
      <div class="actions">
        <button @click="copyExport">Copy JSON</button
        ><button @click="downloadJsonFile(store.exportProgress(), 'divergence-mw4')">
          Download JSON
        </button>
      </div>
      <button
        v-if="store.rawRecovery !== null"
        @click="downloadJsonFile(store.rawRecovery, 'divergence-recovery')">
        Download stored data for recovery
      </button>
    </div>
    <div class="setting">
      <h3>Import progress</h3>
      <p class="subtitle">
        Replace Divergence progress with a Divergence export. Other games' saves are rejected.
      </p>
      <textarea v-model="input" aria-label="Import progress JSON" />
      <div class="actions">
        <button :disabled="!input" @click="importSave">Replace Divergence progress</button
        ><label class="button" for="import-file">Choose JSON file</label
        ><input id="import-file" type="file" accept=".json,application/json" @change="readFile" />
      </div>
    </div>
    <p v-if="message" role="status" class="status-message">{{ message }}</p>
    <div class="setting danger">
      <h3>Reset Divergence progress</h3>
      <p class="subtitle">
        Clear shared camos, mode mastery and Weapon Prestige. Favourites, filters and preferences
        are kept.
      </p>
      <button class="danger" @click="confirming = true">Reset progress</button>
      <div v-if="confirming" role="alertdialog" aria-label="Confirm progress reset">
        <p>
          This clears your Divergence camo, mastery and Prestige records. Export a backup first if
          needed.
        </p>
        <button @click="confirming = false">Cancel</button
        ><button class="danger" @click="reset">Confirm reset</button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useStore } from '@/stores/store'
import { completionistCamos } from '@/data/mw4/camos'
import { downloadJsonFile } from '@/utils/utils'
const store = useStore()
const input = ref('')
const message = ref('')
const confirming = ref(false)
async function copyExport() {
  try {
    await navigator.clipboard.writeText(store.exportProgress())
    message.value = 'Copied progress JSON.'
  } catch (error) {
    message.value = 'Copy failed: ' + error.message
  }
}
function importSave() {
  try {
    store.importProgress(input.value)
    message.value = 'Progress imported.'
  } catch (error) {
    message.value = error.message
  }
}
async function readFile(event) {
  try {
    const file = event.target.files[0]
    if (file) {
      input.value = await file.text()
      message.value = 'File loaded. Review it, then choose Replace Divergence progress.'
    }
  } catch (error) {
    message.value = error.message
  }
}
function reset() {
  try {
    store.resetProgress()
    confirming.value = false
    message.value = 'Divergence progress reset.'
  } catch (error) {
    message.value = error.message
  }
}
</script>
<style lang="scss" scoped>
.setting {
  $setting-background-color: $elevation-2-color;
  $setting-border-color: $elevation-4-color;

  background-color: $setting-background-color;
  border: 2px solid $setting-border-color;
  border-radius: $border-radius;
  padding: 25px;

  + .setting {
    margin-top: 30px;
  }

  &.danger {
    background-color: rgba($red, 0.15);
    border-color: rgba($red, 0.3);

    button {
      @media (max-width: $tablet) {
        width: 100%;
      }
    }
  }

  h3 {
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 10px;

    @media (max-width: $tablet) {
      margin-top: 0;
    }
  }

  p {
    &.subtitle {
      font-size: 14px;
      margin-bottom: 15px;
    }

    &.danger {
      align-items: center;
      color: $red;
      display: flex;
      font-size: 13px;
      font-weight: 500;
      margin-top: 15px;

      .icon-component {
        margin-right: 10px;
      }
    }
  }

  textarea {
    margin-bottom: 20px;
  }

  .select {
    display: inline-block;
    margin-top: 25px;

    label {
      font-weight: 600;
    }
  }

  .actions {
    display: flex;

    @media (max-width: $mobile) {
      flex-direction: column;
    }

    > button,
    > span,
    > label {
      @media (max-width: $tablet) {
        width: 50%;

        > button {
          width: 100%;
        }
      }

      @media (max-width: $mobile) {
        width: 100%;
      }
    }
  }

  .button {
    margin-left: 15px;

    @media (max-width: $mobile) {
      margin-left: 0;
      margin-top: 15px;
    }

    .loader {
      margin-left: 8px;
    }
  }

  button {
    + button {
      margin-left: 15px;

      @media (max-width: $mobile) {
        margin-left: 0;
        margin-top: 15px;
      }
    }

    span,
    .icon-component {
      pointer-events: none;
    }
  }
}

.textarea-wrapper {
  position: relative;

  &::before {
    content: attr(data-placeholder);
    font-size: 14px;
    left: 50%;
    opacity: 0.5;
    position: absolute;
    pointer-events: none;
    top: 50%;
    transform: translate(-50%, -50%);
    white-space: nowrap;
  }
}

input#import {
  display: none;
}
</style>

<style scoped>
select {
  margin: 12px;
  padding: 8px;
  background: #282828;
  color: white;
}
input[type='file'] {
  display: block;
  margin: 15px 0;
}
.status-message {
  padding: 15px;
  background: #252525;
}
[role='alertdialog'] {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ee5253;
}
[role='alertdialog'] p {
  margin-bottom: 15px;
}
</style>
