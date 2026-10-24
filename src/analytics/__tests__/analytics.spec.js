import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import html from '../../../index.html?raw'
import { createAnalytics, consentKey, consentLifetime } from '../index'
import AnalyticsConsent from '@/components/AnalyticsConsent.vue'

const id = 'G-Q3YGCRGKM2'
const template = html.match(/<template id="google-analytics-tag">[\s\S]*?<\/template>/)[0]
let service, router, win, app, host, reload
const events = () => (win.dataLayer || []).map((args) => [...args])
const views = () => events().filter((args) => args[0] === 'event')
const persist = (choice, expiresAt = Date.now() + consentLifetime) =>
  localStorage.setItem(consentKey, JSON.stringify({ choice, expiresAt }))

async function start({
  production = true,
  hostname = 'divergence.netlify.app',
  path = '/tracker',
} = {}) {
  win = {
    location: { hostname, origin: 'https://' + hostname },
    localStorage,
    setTimeout: window.setTimeout.bind(window),
    clearTimeout: window.clearTimeout.bind(window),
    addEventListener: window.addEventListener.bind(window),
    removeEventListener: window.removeEventListener.bind(window),
  }
  router = createRouter({
    history: createMemoryHistory(),
    routes: [
      ...['tracker', 'prestige', 'mastery', 'gallery', 'settings', 'about', 'requirements'].map(
        (name) => ({
          name,
          path: '/' + name,
          component: {},
        })
      ),
      { path: '/dmz', redirect: '/tracker?mode=dmz' },
      { path: '/:pathMatch(.*)*', name: '404', component: {} },
    ],
  })
  await router.push(path)
  await router.isReady()
  reload = vi.fn()
  service = createAnalytics({ production, win, doc: document, reload })
  service.start(router)
}

beforeEach(() => {
  localStorage.clear()
  document.head.innerHTML = template
  document.body.innerHTML = ''
})
afterEach(() => {
  app?.unmount()
  app = null
  service?.dispose()
  document.head.innerHTML = ''
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('consent-gated production Google Analytics', () => {
  it('keeps the standard tag inert before a choice, including route changes', async () => {
    await start()
    await router.push('/gallery')
    expect(service.panelOpen.value).toBe(true)
    expect(document.head.querySelector('script')).toBeNull()
    expect(win.gtag).toBeUndefined()
    expect(document.cookie).toBe('')
    expect(localStorage.length).toBe(0)
  })

  it.each([
    { production: false },
    { hostname: 'localhost' },
    { hostname: '127.0.0.1' },
    { hostname: '[::1]' },
    { hostname: 'deploy-preview-12--divergence.netlify.app' },
  ])('never loads or reads consent in a non-production environment: %j', async (options) => {
    persist('accepted')
    const read = vi.spyOn(Storage.prototype, 'getItem')
    await start(options)
    service.choose('accepted')
    await router.push('/gallery')
    expect(read).not.toHaveBeenCalled()
    expect(document.head.querySelector('script')).toBeNull()
    expect(win.gtag).toBeUndefined()
  })

  it('remembers rejection and never contacts Google', async () => {
    await start()
    service.choose('rejected')
    expect(JSON.parse(localStorage.getItem(consentKey)).choice).toBe('rejected')
    service.dispose()
    await start()
    await router.push('/mastery')
    expect(service.panelOpen.value).toBe(false)
    expect(views()).toEqual([])
    expect(document.head.querySelector('script')).toBeNull()
  })

  it('loads once on acceptance and sends one current page view without backfilling visits', async () => {
    await start()
    await router.push('/gallery?search=private#weapon')
    service.choose('accepted')
    service.choose('accepted')
    expect(document.head.querySelectorAll('script')).toHaveLength(1)
    expect(document.head.querySelector('script').src).toBe(
      'https://www.googletagmanager.com/gtag/js?id=' + id
    )
    expect(views()).toHaveLength(1)
    expect(views()[0]).toEqual([
      'event',
      'page_view',
      {
        page_location: 'https://divergence.netlify.app/gallery',
        page_title: 'Camo Gallery · Divergence',
        page_referrer: '',
        send_to: id,
      },
    ])
    expect(events().find((event) => event[0] === 'config')[2]).toMatchObject({
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      page_location: 'https://divergence.netlify.app/gallery',
      cookie_prefix: 'divergence_analytics',
    })
    expect(events()[0]).toEqual([
      'consent',
      'default',
      {
        analytics_storage: 'granted',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      },
    ])
  })

  it('uses restored consent for exactly one initial view, then one per successful page navigation', async () => {
    persist('accepted')
    await start({ path: '/dmz' })
    service.start(router)
    await router.push('/tracker?mode=warzone&weapon=han-86#smoke')
    await router.push('/tracker?mode=warzone&weapon=han-86#smoke')
    expect(views()).toHaveLength(1)
    await router.push('/prestige')
    await router.push('/mastery')
    await router.push('/gallery')
    await router.push('/settings')
    await router.push('/tracker')
    expect(views().map((event) => event[2].page_location.split('/').pop())).toEqual([
      'tracker',
      'prestige',
      'mastery',
      'gallery',
      'settings',
      'tracker',
    ])
  })

  it('ignores aborted navigation', async () => {
    persist('accepted')
    await start()
    router.beforeEach(() => false)
    await router.push('/gallery')
    expect(views()).toHaveLength(1)
  })

  it('does not transmit unknown URLs, searches, fragments, tracker saves or legacy saves', async () => {
    persist('accepted')
    localStorage.setItem('divergence-mw4-v1', 'PRIVATE_PROGRESS')
    localStorage.setItem('singularity', 'PRIVATE_LEGACY_PROGRESS')
    const read = vi.spyOn(Storage.prototype, 'getItem')
    await start({ path: '/unknown-person@example.com?token=SECRET#PRIVATE' })
    expect(read.mock.calls).toEqual([[consentKey]])
    expect(JSON.stringify(events())).not.toMatch(/PRIVATE|SECRET|example\.com|unknown-person/)
    expect(views()[0][2].page_location).toBe('https://divergence.netlify.app/not-found')
    expect(localStorage.getItem('divergence-mw4-v1')).toBe('PRIVATE_PROGRESS')
    expect(localStorage.getItem('singularity')).toBe('PRIVATE_LEGACY_PROGRESS')
  })

  it.each([
    'bad json',
    JSON.stringify({ choice: 'accepted', expiresAt: 0 }),
    JSON.stringify({ choice: 'maybe', expiresAt: Date.now() + 10000 }),
  ])('fails closed for malformed/expired consent: %s', async (value) => {
    localStorage.setItem(consentKey, value)
    await start()
    expect(service.choice.value).toBeNull()
    expect(views()).toEqual([])
  })

  it('continues without analytics when storage is blocked, allowing a visit-only choice', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    await start()
    expect(views()).toEqual([])
    service.choose('accepted')
    expect(views()).toHaveLength(1)
  })

  it('revokes immediately, clears only its own cookies/queued events and reloads to unload GA', async () => {
    persist('accepted')
    await start()
    document.cookie = 'divergence_analytics_ga=test; Path=/'
    document.cookie = 'divergence_analytics_ga_Q3YGCRGKM2=test; Path=/'
    document.cookie = 'essential=test; Path=/'
    service.choose('rejected')
    expect(win['ga-disable-' + id]).toBe(true)
    expect(reload).toHaveBeenCalledOnce()
    expect(document.head.querySelector('script')).toBeNull()
    expect(win.dataLayer).toHaveLength(0)
    expect(document.cookie).not.toContain('divergence_analytics_ga')
    expect(document.cookie).toContain('essential=test')
    await router.push('/gallery')
    expect(views()).toEqual([])
    // An explicit new consent can resume tracking on the current page.
    service.choose('accepted')
    expect(views()).toHaveLength(1)
    document.cookie = 'essential=; Max-Age=0; Path=/'
  })

  it('honours withdrawal in another tab', async () => {
    persist('accepted')
    await start()
    persist('rejected')
    window.dispatchEvent(new StorageEvent('storage', { key: consentKey }))
    expect(service.choice.value).toBe('rejected')
    expect(win['ga-disable-' + id]).toBe(true)
    expect(views()).toEqual([])
  })

  it('expires consent while the page stays open', async () => {
    vi.useFakeTimers()
    persist('accepted', Date.now() + 1000)
    await start()
    vi.advanceTimersByTime(1001)
    expect(service.choice.value).toBeNull()
    expect(service.panelOpen.value).toBe(true)
    expect(win['ga-disable-' + id]).toBe(true)
    expect(views()).toEqual([])
  })

  it('fails harmlessly when the tag is blocked and can retry after navigation', async () => {
    persist('accepted')
    await start()
    document.head.querySelector('script').dispatchEvent(new Event('error'))
    expect(win.dataLayer).toHaveLength(0)
    expect(win['ga-disable-' + id]).toBe(true)
    await router.push('/gallery')
    expect(views()).toHaveLength(1)
  })

  it('offers keyboard/touch accept, reject and persistent preference controls', async () => {
    await start()
    host = document.createElement('div')
    document.body.appendChild(host)
    app = createApp({ render: () => h(AnalyticsConsent, { service }) })
    app.mount(host)
    const button = (text) =>
      [...host.querySelectorAll('button')].find((el) => el.textContent === text)
    expect(host.querySelector('[role="region"]')).not.toBeNull()
    button('Reject analytics').click()
    await nextTick()
    expect(service.choice.value).toBe('rejected')
    expect(host.querySelector('[role="region"]')).toBeNull()
    button('Analytics preferences').click()
    await nextTick()
    expect(document.activeElement).toBe(button('Reject analytics'))
    button('Close').click()
    await nextTick()
    expect(service.choice.value).toBe('rejected')
    button('Analytics preferences').click()
    await nextTick()
    button('Accept analytics').click()
    await nextTick()
    expect(service.choice.value).toBe('accepted')
    expect(views()).toHaveLength(1)
  })
})
