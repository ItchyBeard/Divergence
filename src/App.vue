<template>
  <div v-if="store.loadError || store.storageError" role="alert" class="storage-alert">
    {{
      store.loadError
        ? 'Stored Divergence data could not be loaded. Saving is paused to protect it. ' +
          store.loadError
        : store.storageError
    }}
    <router-link to="/settings">Open settings for recovery</router-link>
  </div>
  <NavigationComponent @toggleMobileNavigation="toggleMobileNavigation" />
  <MobileNavigationComponent
    :show="showMobileNavigation"
    @toggleMobileNavigation="toggleMobileNavigation" />

  <p v-if="store.progressionNotice" class="progression-notice" role="status">
    {{ store.progressionNotice }}
    <button aria-label="Dismiss progression message" @click="store.progressionNotice = ''">
      Dismiss
    </button>
  </p>
  <main>
    <router-view v-slot="{ Component }">
      <transition name="page-fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </main>

  <notifications position="top center">
    <template #body="props">
      <div class="notification" :class="props.item.type" @click="props.close">
        <p class="title">{{ props.item.title }}</p>
        <IconComponent class="remove" name="times" width="18" height="18" />
      </div>
    </template>
  </notifications>

  <FooterComponent />
  <AnalyticsConsent />
  <SupportBanner />
  <CompletionCelebration />
  <ProgressComponent />
</template>

<script>
import { useStore } from '@/stores/store'
import ProgressComponent from '@/components/ProgressComponent.vue'
import AnalyticsConsent from '@/components/AnalyticsConsent.vue'
import SupportBanner from '@/components/SupportBanner.vue'
import CompletionCelebration from '@/components/CompletionCelebration.vue'

import FooterComponent from '@/components/layout/FooterComponent.vue'
import MobileNavigationComponent from '@/components/layout/MobileNavigationComponent.vue'
import NavigationComponent from '@/components/layout/NavigationComponent.vue'

export default {
  components: {
    SupportBanner,
    CompletionCelebration,
    AnalyticsConsent,
    FooterComponent,
    ProgressComponent,
    MobileNavigationComponent,
    NavigationComponent,
  },

  data() {
    return {
      showMobileNavigation: false,
      store: useStore(),
      availabilityTimer: null,
    }
  },

  async beforeCreate() {
    const store = useStore()
    await store.getStoredProgress()
  },

  mounted() {
    this.availabilityTimer = setInterval(() => this.store.refreshAvailability(), 30000)
    window.addEventListener('focus', this.store.refreshAvailability)
  },
  beforeUnmount() {
    clearInterval(this.availabilityTimer)
    window.removeEventListener('focus', this.store.refreshAvailability)
  },
  watch: {
    $route() {
      this.showMobileNavigation = false
    },
  },

  methods: {
    toggleMobileNavigation() {
      this.showMobileNavigation = !this.showMobileNavigation
    },
  },
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
@import '@/scss/main';

#app {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>

<style scoped>
.storage-alert {
  padding: 14px;
  background: #623434;
  font-size: 13px;
  line-height: 1.5;
}
</style>

<style>
body {
  padding-bottom: calc(65px + env(safe-area-inset-bottom, 0px));
}
</style>

<style scoped>
.progression-notice {
  margin: 12px auto;
  padding: 10px 14px;
  max-width: 1100px;
  background: #302831;
  color: #eee;
  font-size: 13px;
}
.progression-notice button {
  margin-left: 12px;
  padding: 6px;
  color: white;
  background: transparent;
  border: 1px solid #877b8c;
  border-radius: 3px;
  cursor: pointer;
}
</style>
