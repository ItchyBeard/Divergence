import { inject, nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import { routeLocationKey } from 'vue-router'

export function useTrackerJump(root) {
  const route = inject(routeLocationKey, null)
  let timer,
    highlighted,
    generation = 0
  async function locate() {
    const current = ++generation
    await nextTick()
    if (current !== generation || !root.value) return
    clearTimeout(timer)
    highlighted?.classList.remove('weapon-jump-highlight')
    const weapon = route?.query.weapon,
      mode = route?.query.mode
    const target = [
      ...root.value.querySelectorAll(weapon ? '[data-weapon-id]' : '[data-mode]'),
    ].find((element) =>
      weapon ? element.dataset.weaponId === weapon : element.dataset.mode === mode
    )
    if (!target) return
    // Reveal the mobile checklist before focusing a Gallery destination inside it.
    const details = target.querySelector('details')
    if (details) details.open = true
    const camo = [...target.querySelectorAll('[data-camo-id]')].find(
      (element) => element.dataset.camoId === route?.query.camo
    )
    highlighted = camo || target
    highlighted.classList.add('weapon-jump-highlight')
    // A table's sticky name column can otherwise conceal the requested camo.
    const inTable = target.closest('.camo-table')
    const scrollTarget = inTable && camo ? camo : target
    scrollTarget.scrollIntoView?.({
      behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'center',
      inline: inTable ? 'center' : 'nearest',
    })
    ;(camo || target.querySelector('button'))?.focus({ preventScroll: true })
    timer = setTimeout(() => highlighted?.classList.remove('weapon-jump-highlight'), 2200)
  }
  onMounted(locate)
  watch(
    [
      () => route?.path,
      () => route?.query.weapon,
      () => route?.query.camo,
      () => (route?.path === '/mastery' ? route?.query.mode : undefined),
    ],
    locate,
    { flush: 'post' }
  )
  onBeforeUnmount(() => {
    generation++
    clearTimeout(timer)
    highlighted?.classList.remove('weapon-jump-highlight')
  })
  return route
}
