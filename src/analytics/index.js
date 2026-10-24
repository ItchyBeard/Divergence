import { ref } from 'vue'

export const consentKey = 'divergence.analytics-consent.v1'
export const consentLifetime = 180 * 24 * 60 * 60 * 1000
const cookiePrefix = 'divergence_analytics'
const pages = {
  tracker: ['/tracker', 'Camo Tracker'],
  prestige: ['/prestige', 'Weapon Prestige'],
  mastery: ['/mastery', 'Mastery'],
  gallery: ['/gallery', 'Camo Gallery'],
  settings: ['/settings', 'Settings'],
  about: ['/about', 'About'],
  requirements: ['/requirements', 'Requirements'],
}

export function createAnalytics({
  production = import.meta.env.PROD,
  win = window,
  doc = document,
  now = () => Date.now(),
  reload = () => win.location.reload(),
} = {}) {
  const enabled =
    production &&
    !['localhost', '127.0.0.1', '[::1]', '::1'].includes(win.location.hostname) &&
    !win.location.hostname.startsWith('deploy-preview-')
  const choice = ref(null)
  const panelOpen = ref(false)
  let router, script, measurementId, lastPage, expiresAt, expiryTimer, removeHook

  function readChoice() {
    try {
      const saved = JSON.parse(win.localStorage.getItem(consentKey))
      return saved &&
        ['accepted', 'rejected'].includes(saved.choice) &&
        Number.isFinite(saved.expiresAt) &&
        saved.expiresAt > now() &&
        saved.expiresAt <= now() + consentLifetime
        ? saved
        : null
    } catch {
      return null
    }
  }

  function clearCookies() {
    const domains = win.location.hostname.split('.')
    const cookies = doc.cookie.split(';').map((cookie) => cookie.trim().split('=')[0])
    for (const name of cookies.filter((name) => name.startsWith(cookiePrefix + '_ga'))) {
      const expired = `${name}=; Max-Age=0; Path=/; SameSite=Lax`
      doc.cookie = expired
      for (let i = 0; i < domains.length - 1; i++) {
        doc.cookie = `${expired}; Domain=${domains.slice(i).join('.')}`
      }
    }
  }

  function stop() {
    if (measurementId) win['ga-disable-' + measurementId] = true
    const wasLoaded = Boolean(script)
    script?.remove()
    script = null
    lastPage = null
    if (win.dataLayer) win.dataLayer.length = 0
    clearCookies()
    // Reload only after a previously loaded tag is revoked, removing its runtime/listeners.
    if (wasLoaded) reload()
  }

  function loadTag() {
    if (script) return true
    const template = doc.getElementById('google-analytics-tag')
    const tag = template?.content.querySelector('script')
    if (!tag) return false
    measurementId = new URL(tag.src).searchParams.get('id')
    if (!/^G-[A-Z0-9]+$/.test(measurementId)) return false
    win['ga-disable-' + measurementId] = false
    win.dataLayer = []
    win.gtag = function () {
      win.dataLayer.push(arguments)
    }
    win.gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    })
    win.gtag('js', new Date())
    const [path, title] = pages[router.currentRoute.value.name] || ['/not-found', 'Page not found']
    win.gtag('config', measurementId, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_prefix: cookiePrefix,
      cookie_expires: consentLifetime / 1000,
      cookie_update: false,
      // Also sanitize defaults used by GA's own session/engagement events.
      page_location: win.location.origin + path,
      page_referrer: '',
      page_title: `${title} · Divergence`,
      ignore_referrer: true,
    })
    script = doc.createElement('script')
    script.async = true
    script.src = tag.src
    script.dataset.divergenceAnalytics = ''
    script.onerror = () => {
      win['ga-disable-' + measurementId] = true
      script?.remove()
      script = null
      lastPage = null
      win.dataLayer.length = 0
    }
    doc.head.appendChild(script)
    return true
  }

  function track(route) {
    if (!enabled || choice.value !== 'accepted') return
    if (expiresAt <= now()) {
      choice.value = null
      panelOpen.value = true
      stop()
      return
    }
    const [path, title] = pages[route.name] || ['/not-found', 'Page not found']
    if (path === lastPage || !loadTag()) return
    lastPage = path
    const page = {
      page_location: win.location.origin + path,
      page_title: `${title} · Divergence`,
      page_referrer: '',
    }
    win.gtag('set', page)
    win.gtag('event', 'page_view', { ...page, send_to: measurementId })
  }

  function scheduleExpiry() {
    win.clearTimeout(expiryTimer)
    if (!expiresAt) return
    // Browsers limit timer delays to a signed 32-bit integer.
    expiryTimer = win.setTimeout(
      () => {
        if (expiresAt > now()) return scheduleExpiry()
        choice.value = null
        panelOpen.value = true
        stop()
      },
      Math.min(expiresAt - now(), 2147483647)
    )
  }

  function choose(value) {
    if (!enabled || !['accepted', 'rejected'].includes(value)) return
    choice.value = value
    expiresAt = now() + consentLifetime
    try {
      win.localStorage.setItem(consentKey, JSON.stringify({ choice: value, expiresAt }))
    } catch {
      // A choice still applies for this visit if browser storage is unavailable.
    }
    panelOpen.value = false
    scheduleExpiry()
    if (value === 'accepted') track(router.currentRoute.value)
    else stop()
  }

  function syncChoice() {
    const saved = readChoice()
    choice.value = saved?.choice || null
    expiresAt = saved?.expiresAt
    panelOpen.value = !saved
    scheduleExpiry()
    if (choice.value === 'accepted') track(router.currentRoute.value)
    else stop()
  }

  function storageChanged(event) {
    if (event.key === consentKey || event.key === null) syncChoice()
  }

  return {
    enabled,
    choice,
    panelOpen,
    choose,
    start(instance) {
      if (!enabled || router) return
      router = instance
      syncChoice()
      removeHook = router.afterEach((to, from, failure) => {
        if (!failure) track(to)
      })
      win.addEventListener('storage', storageChanged)
    },
    dispose() {
      removeHook?.()
      win.clearTimeout(expiryTimer)
      win.removeEventListener('storage', storageChanged)
    },
  }
}

export const analytics = createAnalytics()
