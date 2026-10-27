<template>
  <transition name="fade"
    ><nav v-if="show" class="mobile">
      <div class="header">
        <router-link to="/tracker" class="logo"
          ><div class="icon"></div>
          <p class="brand-wordmark">Divergence</p></router-link
        ><button aria-label="Close navigation" @click="$emit('toggleMobileNavigation')">×</button>
      </div>
      <div>
        <router-link class="mode-link" :class="'mode-' + currentMode" to="/tracker"
          >Camo Tracker</router-link
        >
        <router-link to="/prestige">Weapon Prestige</router-link>
        <router-link to="/mastery">Mastery</router-link>
        <router-link to="/gallery">Camo Gallery</router-link>
      </div>
      <div class="footer">
        <router-link to="/settings">Settings</router-link
        ><router-link to="/about">About</router-link
        ><router-link to="/requirements">Requirements</router-link>
        <button @click="share.generateImage()">Download progress image</button>
      </div>
      <ShareProgressModal ref="share" :mode="currentMode" /></nav
  ></transition>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { resolveTrackerMode } from '@/data/mw4/modeNavigation'
import { useStore } from '@/stores/store'
import ShareProgressModal from '@/components/ShareProgressModal.vue'
defineProps({ show: Boolean })
defineEmits(['toggleMobileNavigation'])
const share = ref(null)
const route = useRoute()
const store = useStore()
const currentMode = computed(() =>
  resolveTrackerMode(route.query.mode, store.preferences.trackerMode)
)
</script>

<style scoped>
.mobile {
  inset: 0;
  height: 100dvh;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-bottom: calc(40px + env(safe-area-inset-bottom, 0px));
}
.header button {
  min-width: 44px;
  min-height: 44px;
}
.mode-link.router-link-exact-active {
  color: var(--mode-accent);
  box-shadow: 0 2px var(--mode-accent);
}
</style>
