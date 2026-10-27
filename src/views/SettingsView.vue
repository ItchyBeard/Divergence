<template>
  <div class="settings container">
    <div class="setting">
      <h3>
        <IconComponent name="cog" size="20" fill="currentColor" aria-hidden="true" />Weapon icons
      </h3>
      <p id="weapon-icons-help" class="subtitle">
        Show weapon silhouettes in card headers, coloured by your highest completed tier.
      </p>
      <label class="icon-toggle">
        <input
          type="checkbox"
          role="switch"
          aria-describedby="weapon-icons-help"
          :checked="store.preferences.weaponIcons"
          :disabled="Boolean(store.loadError)"
          @change="store.setPreferences({ weaponIcons: $event.target.checked })" />
        <span>Show weapon icons</span>
      </label>
    </div>
    <div class="setting">
      <h3>
        <IconComponent name="check-circle" size="20" fill="currentColor" aria-hidden="true" />Weapon
        completion indicator
      </h3>
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
      <h3>
        <IconComponent name="file-export" size="20" fill="currentColor" aria-hidden="true" />Export
        progress
      </h3>
      <p class="subtitle">
        Includes shared camos, mode mastery, Weapon Prestige, favourites, filters and preferences.
      </p>
      <div class="actions">
        <button
          class="brand-action"
          @click="downloadJsonFile(store.exportProgress(), 'divergence-mw4')">
          <IconComponent name="file-download" size="18" fill="currentColor" aria-hidden="true" />
          Download JSON
        </button>
        <button class="secondary" @click="copyExport">
          <IconComponent name="clipboard" size="18" fill="currentColor" aria-hidden="true" />Copy
          JSON
        </button>
      </div>
      <details>
        <summary>View JSON</summary>
        <textarea aria-label="Export progress JSON" :value="store.exportProgress()" readonly />
      </details>
      <button
        v-if="store.rawRecovery !== null"
        class="recovery-button secondary"
        @click="downloadJsonFile(store.rawRecovery, 'divergence-recovery')">
        Download stored data for recovery
      </button>
    </div>
    <div class="setting">
      <h3>
        <IconComponent name="file-import" size="20" fill="currentColor" aria-hidden="true" />Import
        progress
      </h3>
      <p class="subtitle">
        Replace Divergence progress with a Divergence export. Other games' saves are rejected.
      </p>
      <div class="actions">
        <button class="brand-action" @click="fileInput.click()">
          <IconComponent
            name="file-upload"
            size="18"
            fill="currentColor"
            aria-hidden="true" />Choose JSON File
        </button>
        <input
          id="import-file"
          ref="fileInput"
          type="file"
          accept=".json,application/json"
          hidden
          @change="readFile" />
      </div>
      <p v-if="fileName" class="file-name">Selected file: {{ fileName }}</p>
      <details>
        <summary>Paste JSON</summary>
        <textarea v-model="input" aria-label="Import progress JSON" @input="fileName = ''" />
      </details>
      <button
        ref="replaceButton"
        class="review-button secondary"
        :disabled="!input.trim()"
        @click="prepareImport">
        <IconComponent name="file-import" size="18" fill="currentColor" aria-hidden="true" />Replace
        Divergence progress
      </button>
      <div
        v-if="pendingImport !== null"
        ref="importConfirmation"
        class="import-confirmation"
        role="group"
        aria-labelledby="import-confirmation-heading"
        tabindex="-1">
        <h4 id="import-confirmation-heading">Replace your current progress?</h4>
        <p>
          This replaces your progress, favourites, filters and preferences with this backup.
          Download your current progress first if you want to keep it.
        </p>
        <div class="actions">
          <button class="secondary" @click="cancelImport">Cancel import</button>
          <button class="brand-action" @click="importSave">
            <IconComponent name="check" size="18" fill="currentColor" aria-hidden="true" />Confirm
            replace
          </button>
        </div>
      </div>
    </div>
    <p v-if="message" role="status" class="status-message">{{ message }}</p>
    <div class="setting danger">
      <h3>
        <IconComponent
          name="exclamation-triangle"
          size="20"
          fill="currentColor"
          aria-hidden="true" />Reset Divergence progress
      </h3>
      <p class="subtitle">
        Clear shared camos, mode mastery and Weapon Prestige. Favourites, filters and preferences
        are kept.
      </p>
      <button class="danger" @click="confirming = true">
        <IconComponent name="trash" size="18" fill="currentColor" aria-hidden="true" />Reset
        progress
      </button>
      <div v-if="confirming" role="alertdialog" aria-label="Confirm progress reset">
        <p>
          This clears your Divergence camo, mastery and Prestige records. Export a backup first if
          needed.
        </p>
        <button class="secondary" @click="confirming = false">Cancel</button
        ><button class="danger" @click="reset">
          <IconComponent name="trash" size="18" fill="currentColor" aria-hidden="true" />Confirm
          reset
        </button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch, nextTick } from 'vue'
import { useStore } from '@/stores/store'
import { completionistCamos } from '@/data/mw4/camos'
import { downloadJsonFile } from '@/utils/utils'
import { parseSave } from '@/data/mw4/save'
const store = useStore()
const input = ref('')
const message = ref('')
const confirming = ref(false)
const fileInput = ref(null)
const fileName = ref('')
const pendingImport = ref(null)
const importConfirmation = ref(null)
const replaceButton = ref(null)
watch(input, () => {
  pendingImport.value = null
})
async function copyExport() {
  try {
    await navigator.clipboard.writeText(store.exportProgress())
    message.value = 'Copied progress JSON.'
  } catch (error) {
    message.value = 'Copy failed: ' + error.message
  }
}
async function prepareImport() {
  try {
    parseSave(input.value)
    pendingImport.value = input.value
    message.value = ''
    await nextTick()
    importConfirmation.value?.focus()
  } catch (error) {
    pendingImport.value = null
    message.value = error.message
  }
}
async function cancelImport() {
  pendingImport.value = null
  await nextTick()
  replaceButton.value?.focus()
}
function importSave() {
  if (pendingImport.value === null) return
  try {
    store.importProgress(pendingImport.value)
    pendingImport.value = null
    replaceButton.value?.focus()
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
      fileName.value = file.name
      message.value = 'File loaded. Review it, then choose Replace Divergence progress.'
    }
  } catch (error) {
    message.value = error.message
  } finally {
    event.target.value = ''
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
.settings {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 30px;

  @media (max-width: 800px) {
    grid-template-columns: minmax(0, 1fr);
  }
}

.settings > .danger,
.status-message {
  grid-column: 1 / -1;
}

.icon-toggle {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 14px;
  input {
    appearance: none;
    width: 40px;
    height: 24px;
    margin: 0;
    flex-shrink: 0;
    border: 1px solid #746b80;
    border-radius: 20px;
    background: #35313b;
    cursor: pointer;
    &::before {
      content: '';
      display: block;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      margin: 3px;
      background: #ddd7e5;
    }
    &:checked {
      background: $divergence-gradient;
      border-color: #bfa5df;
      &::before {
        transform: translateX(16px);
        background: #fff;
      }
    }
    &:focus-visible {
      outline: 2px solid #d2b7ef;
      outline-offset: 3px;
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}
.setting {
  $setting-background-color: $elevation-2-color;
  $setting-border-color: $elevation-4-color;

  background-color: $setting-background-color;
  border: 2px solid $setting-border-color;
  border-radius: $border-radius;
  padding: 25px;
  min-width: 0;

  &.danger {
    background-color: rgba($red, 0.15);
    border-color: rgba($red, 0.3);

    h3 .icon-component {
      color: $red;
    }

    button {
      @media (max-width: $tablet) {
        width: 100%;
      }
    }
  }

  h3 {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 10px;

    .icon-component {
      color: #bfa5df;
      flex-shrink: 0;
    }

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

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;

    @media (max-width: $mobile) {
      flex-direction: column;
    }
  }

  details {
    margin-top: 18px;
    border-top: 1px solid $elevation-4-color;
    padding-top: 16px;
  }

  summary {
    cursor: pointer;
    font-size: 14px;
    color: #bfa5df;

    &:hover {
      color: white;
    }
  }

  .review-button,
  .recovery-button {
    margin-top: 18px;
  }

  .file-name {
    margin-top: 12px;
    font-size: 14px;
    overflow-wrap: anywhere;
  }

  .import-confirmation {
    margin-top: 20px;
    padding: 16px;
    border: 1px solid #877b8c;
    border-radius: $border-radius;

    h4 {
      margin: 0 0 12px;
      font-size: 16px;
    }

    p {
      margin-bottom: 16px;
      font-size: 14px;
    }
  }

  button {
    .icon-component {
      flex-shrink: 0;
      margin-right: 8px;
    }

    &.brand-action {
      background: #625788;
      border: 1px solid #b9a3e1;
      color: white;

      &:hover:not(:disabled) {
        background: #756a9b;
        opacity: 1;
      }
    }

    &.secondary {
      background: rgba(#ac91db, 0.1);
      border: 1px solid rgba(#ac91db, 0.35);
      color: #ddd7e5;

      &:disabled {
        color: rgba(#ddd7e5, 0.45);
        border-color: rgba(#ac91db, 0.15);
      }
    }
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

.actions > button + button {
  margin: 0;
}
</style>

<style scoped>
select {
  margin: 12px;
  padding: 8px;
  background: #282828;
  color: white;
  max-width: 100%;
  border: 1px solid #756a9b;
}
.status-message {
  padding: 15px;
  background: #252525;
  border-left: 3px solid #ac91db;
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
