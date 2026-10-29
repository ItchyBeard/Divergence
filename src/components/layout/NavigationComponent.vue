<template>
  <nav class="container">
    <router-link to="/tracker" class="logo"
      ><div class="icon"></div>
      <p class="brand-wordmark">Divergence</p></router-link
    >
    <div class="nav-links">
      <router-link class="mode-link" :class="'mode-' + currentMode" to="/tracker"
        >Camo Tracker</router-link
      >
      <router-link to="/mastery">Mastery</router-link>
      <router-link to="/gallery">Camo Gallery</router-link>
      <a href="https://discord.gg/HswvED9v6a" class="icon"><IconComponent name="discord" /></a>
      <button
        class="icon-btn"
        title="Download progress image"
        aria-label="Download progress image"
        @click="share.generateImage()">
        <IconComponent name="download-alt" />
      </button>
      <router-link to="/settings" class="icon-btn settings" aria-label="Settings">
        <IconComponent name="cog" />
      </router-link>
    </div>
    <button
      class="mobile-nav-toggle icon-btn"
      aria-label="Open navigation"
      @click="$emit('toggleMobileNavigation')">
      <IconComponent name="bars" />
    </button>
    <ShareProgressModal ref="share" :mode="currentMode" />
  </nav>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { resolveTrackerMode } from '@/data/mw4/modeNavigation'
import { useStore } from '@/stores/store'
import ShareProgressModal from '@/components/ShareProgressModal.vue'
defineEmits(['toggleMobileNavigation'])
const share = ref(null)
const route = useRoute()
const store = useStore()
const currentMode = computed(() =>
  resolveTrackerMode(route.query.mode, store.preferences.trackerMode)
)
</script>
<style lang="scss" scoped>
nav.container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-links {
  display: flex;
  align-items: center;
  margin-left: auto;
  gap: 18px;

  a {
    text-decoration: none;
    color: #9ca3af;
    font-weight: 500;
    transition: color 0.2s;

    &:hover,
    &.router-link-active {
      color: white;
    }
  }
}

.disabled-link-wrapper {
  display: inline-block;
  opacity: 0.3;
  cursor: not-allowed;
}

.disabled-link {
  pointer-events: none;
  color: inherit;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  transition:
    color 0.2s,
    transform 0.1s;

  &:hover {
    color: white;
  }

  &:active {
    transform: scale(0.95);
  }

  :deep(svg) {
    width: 20px;
    height: 20px;
    fill: currentColor;
  }
}

.mobile-nav-toggle {
  display: none;
  cursor: pointer;
  color: white;

  :deep(svg) {
    width: 24px;
    height: 24px;
    fill: currentColor;
  }
}

@media (max-width: $tablet) {
  .nav-links {
    display: none;
  }

  .mobile-nav-toggle {
    display: block;
    min-width: 44px;
    min-height: 44px;
  }
}
@media (max-width: 600px) {
  nav.container {
    padding: 16px 0 18px;
  }
}
</style>

<style scoped>
.mode-link.router-link-exact-active {
  color: var(--mode-accent);
  box-shadow: 0 2px var(--mode-accent);
}
</style>
