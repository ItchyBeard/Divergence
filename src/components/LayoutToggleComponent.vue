<template>
  <button
    class="layout-toggle"
    :aria-label="'Change layout (current: ' + layoutLabel + ')'"
    @click="toggleLayout()"
    :title="$t('filters.toggle_layout')">
    <IconComponent v-if="layout === 'grid'" name="apps" iconStyle="solid" size="18" />
    <IconComponent v-else-if="layout === 'list'" name="list-ul" size="18" />
    <IconComponent v-else name="table" size="18" />
    <span>{{ layoutLabel }}</span>
  </button>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { useStore } from '@/stores/store'

export default {
  computed: {
    ...mapState(useStore, ['preferences']),

    layout() {
      return this.preferences.layout
    },

    layoutLabel() {
      if (this.layout === 'grid') return this.$t('general.grid')
      if (this.layout === 'list') return this.$t('general.list')
      return this.$t('general.table')
    },
  },

  methods: {
    ...mapActions(useStore, ['setPreferences', 'storeProgress']),

    toggleLayout() {
      const preferences = JSON.parse(JSON.stringify(this.preferences))
      if (this.layout === 'grid') {
        preferences.layout = 'list'
      } else if (this.layout === 'list') {
        preferences.layout = 'table'
      } else {
        preferences.layout = 'grid'
      }
      this.updatePreferences(preferences)
    },

    updatePreferences(preferences) {
      this.setPreferences(preferences)
    },
  },
}
</script>

<style lang="scss" scoped>
.layout-toggle {
  align-items: center;
  background: $elevation-2-color;
  border: 2px solid $elevation-4-color;
  border-radius: $border-radius;
  color: rgba($text-color, 0.75);
  cursor: pointer;
  display: inline-flex;
  justify-content: center;
  padding: 5px 8px;
  transition: $transition;
  user-select: none;

  &:hover {
    background: $elevation-3-color;
  }

  @media (max-width: $tablet) {
    margin: 0 0 25px;
    padding: 15px 0;
    width: 100%;

    span {
      font-size: 16px !important;
    }
  }

  .icon-component {
    margin-right: 5px;
    opacity: 0.75;
    width: 18px;
  }

  span {
    font-size: 14px;
  }
}
</style>
