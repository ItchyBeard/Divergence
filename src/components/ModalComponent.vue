<template>
  <div v-show="active" class="modal-container">
    <transition name="fade">
      <div v-if="showBackdrop" v-show="show" class="backdrop" @click.self="close()"></div>
    </transition>
    <transition name="fadeInUp">
      <div
        v-show="show"
        ref="dialog"
        class="modal"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="showHeader ? titleId : undefined"
        :aria-label="showHeader ? undefined : 'Dialog'"
        tabindex="-1"
        :style="{ maxWidth: `${maxWidth}px` }">
        <div v-if="showHeader" :class="`modal-header ${mode}`">
          <h5 :id="titleId">
            <slot name="header"></slot>
          </h5>
          <button class="modal-close" aria-label="Close dialog" @click="close()">
            <IconComponent name="times" size="18" />
          </button>
        </div>
        <div class="modal-body">
          <slot></slot>
        </div>
        <div class="modal-footer">
          <slot name="footer">
            <button @click="close()">{{ $t('general.close') }}</button>
          </slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  emits: ['closed'],
  props: {
    showBackdrop: {
      type: Boolean,
      required: false,
      default: true,
    },

    showHeader: {
      type: Boolean,
      required: false,
      default: true,
    },

    maxWidth: {
      type: Number,
      required: false,
      default: 650,
    },

    mode: {
      type: String,
      required: false,
      default: 'multiplayer',
    },
  },

  data() {
    return {
      active: false,
      show: false,
      openTimer: null,
      closeTimer: null,
      previousFocus: null,
    }
  },
  computed: {
    titleId() {
      return `modal-title-${this.$.uid}`
    },
  },
  beforeUnmount() {
    clearTimeout(this.openTimer)
    clearTimeout(this.closeTimer)
    document.removeEventListener('keydown', this.handleKeydown)
    if (this.active) this.previousFocus?.focus?.()
  },

  methods: {
    open() {
      if (this.active) return
      clearTimeout(this.closeTimer)
      this.previousFocus = document.activeElement
      this.active = true
      document.addEventListener('keydown', this.handleKeydown)
      this.openTimer = setTimeout(async () => {
        this.show = true
        await this.$nextTick()
        this.$refs.dialog?.focus()
      }, 100)
    },

    close() {
      if (!this.active) return
      clearTimeout(this.openTimer)
      this.show = false
      document.removeEventListener('keydown', this.handleKeydown)
      this.previousFocus?.focus?.()
      this.$emit('closed')
      this.closeTimer = setTimeout(() => {
        this.active = false
      }, 300)
    },
    handleKeydown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        this.close()
        return
      }
      if (event.key !== 'Tab') return
      const controls = [
        ...this.$refs.dialog.querySelectorAll(
          'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]'
        ),
      ]
      const first = controls[0],
        last = controls.at(-1)
      if (!controls.length) {
        event.preventDefault()
        this.$refs.dialog.focus()
        return
      }
      if (
        event.shiftKey &&
        (document.activeElement === first || !controls.includes(document.activeElement))
      ) {
        event.preventDefault()
        last.focus()
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || !controls.includes(document.activeElement))
      ) {
        event.preventDefault()
        first.focus()
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.modal-container {
  align-items: center;
  display: flex;
  justify-content: center;
  height: 100%;
  left: 0;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 100;

  .backdrop {
    background: rgba(black, 0.5);
    display: block;
    height: 100%;
    left: 0;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 1;
  }

  .modal {
    background: $elevation-4-color;
    border-radius: $border-radius;
    box-shadow: 0px 5px 10px 0px rgba(black, 0.5);
    margin-bottom: 20vh;
    overflow: hidden;
    max-height: 85vh;
    overflow-y: auto;
    position: relative;
    width: 90%;
    z-index: 2;

    .modal-header {
      background-image: $divergence-gradient;

      align-items: center;
      border-bottom: 1px solid $elevation-6-color;
      display: flex;
      justify-content: space-between;
      padding: 5px 5px 5px 15px;

      h5 {
        align-items: center;
        display: flex;
        font-size: 18px;
      }

      .icon-component {
        cursor: pointer;
        opacity: 0.5;
        padding: 15px;
        transition: $transition;

        &:hover {
          opacity: 0.75;
        }
      }
    }

    .modal-body {
      padding: 15px 15px 30px;
      text-align: left;
    }

    .modal-footer {
      align-items: center;
      border-top: 1px solid $elevation-6-color;
      display: flex;
      justify-content: flex-end;
      padding: 15px;

      :deep(button + button) {
        margin-left: 15px;
      }
    }
  }
}
.modal-close {
  width: auto;
  flex-shrink: 0;
  min-width: 44px;
  min-height: 44px;
  background: transparent;
  border: 0;
  color: inherit;
  padding: 0;
}
@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active,
  .fadeInUp-enter-active,
  .fadeInUp-leave-active {
    transition: none !important;
    animation: none !important;
  }
}
</style>
