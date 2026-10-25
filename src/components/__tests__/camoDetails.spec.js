// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import CamoButton from '../CamoButton.vue'
import CamoImage from '../CamoImage.vue'
import han from '@/data/weapons/assault-rifles/han-86.weapon'
import { getWeaponCamos } from '@/data/mw4/catalog'
import { camoCdnBase, camoImageUrl } from '@/data/mw4/artwork'
import { getPrestigeCamos } from '@/data/mw4/prestige'
import { validateWeapons } from '@/data/mw4/validate'
import m4 from '@/data/weapons/assault-rifles/m4.weapon'

let app, host
beforeEach(() => {
  host = document.createElement('div')
  document.body.appendChild(host)
})
afterEach(() => {
  app?.unmount()
  host.remove()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
function mount(component, props) {
  app = createApp(component, props)
  app.component('IconComponent', {
    props: ['name'],
    render() {
      return h('span', { 'data-icon': this.name })
    },
  })
  app.mount(host)
}
const smoke = () => ({
  ...getWeaponCamos(han, 'multiplayer').find((camo) => camo.id === 'smoke'),
  completed: false,
})
const settle = async () => {
  await nextTick()
  await nextTick()
}

describe('responsive challenge details', () => {
  it('attaches global tooltip listeners only while details are open', async () => {
    const add = vi.spyOn(window, 'addEventListener')
    const remove = vi.spyOn(window, 'removeEventListener')
    mount(CamoButton, { camo: smoke(), weapon: han, mode: 'multiplayer', indicator: true })
    expect(add.mock.calls.filter(([event]) => ['scroll', 'resize'].includes(event))).toHaveLength(0)
    host.querySelector('.camo-control').dispatchEvent(new MouseEvent('mouseenter'))
    await settle()
    expect(add.mock.calls.filter(([event]) => ['scroll', 'resize'].includes(event))).toHaveLength(2)
    host
      .querySelector('button')
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await settle()
    expect(
      remove.mock.calls.filter(([event]) => ['scroll', 'resize'].includes(event))
    ).toHaveLength(2)
    expect(host.querySelector('img')).toBeNull()
  })

  it.each(['special', 'prestige'])(
    'shows pending %s requirements on touch without exposing Level 999 while permitting manual completion',
    async (stage) => {
      vi.stubGlobal(
        'matchMedia',
        vi.fn(() => ({ matches: true }))
      )
      const toggle = vi.fn()
      const pendingWeapon = {
        ...m4,
        prestigeCamos: m4.prestigeCamos.map((entry) => ({
          ...entry,
          requirements: [{ type: 'unavailable', reason: 'Requirement pending.' }],
        })),
        specialCamos: m4.specialCamos.map((entry) => ({
          ...entry,
          unlockRequirements: [{ type: 'weapon_level', level: 999 }], // TODO: VERIFY synthetic level.
        })),
      }
      const camo =
        stage === 'special'
          ? getWeaponCamos(pendingWeapon, 'multiplayer').find((entry) => entry.stage === 'special')
          : getPrestigeCamos(pendingWeapon)[1]
      mount(CamoButton, { camo, weapon: pendingWeapon, mode: 'multiplayer', onToggle: toggle })
      const tile = host.querySelector('button')
      expect(tile.getAttribute('aria-label')).not.toContain('Level 999')
      tile.click()
      await settle()
      expect(document.querySelector('[role=dialog]').textContent).toContain('Requirement pending')
      expect(document.querySelector('[role=dialog]').textContent).not.toContain('Level 999')
      expect(document.querySelector('.completion-action').disabled).toBe(false)
      document.querySelector('.completion-action').click()
      expect(toggle).toHaveBeenCalledTimes(1)
    }
  )

  it('opens on desktop hover or keyboard focus without completing a camo and clamps to the viewport', async () => {
    const toggle = vi.fn()
    mount(CamoButton, { camo: smoke(), weapon: han, mode: 'multiplayer', onToggle: toggle })
    const tile = host.querySelector('button')
    vi.spyOn(tile, 'getBoundingClientRect').mockReturnValue({
      left: 1000,
      right: 1034,
      top: 730,
      bottom: 764,
      width: 34,
      height: 34,
    })
    host.querySelector('.camo-control').dispatchEvent(new MouseEvent('mouseenter'))
    await settle()
    let tooltip = document.querySelector('[role=tooltip]')
    expect(tooltip.textContent).toContain('Smoke')
    expect(tooltip.textContent).toContain('Special · HAN 86 · MP')
    expect(tooltip.textContent).toContain('20 kills while mounted')
    expect(tooltip.querySelector('.mode-challenge-label').textContent.trim()).toBe('MP challenges')
    expect(tooltip.textContent).toContain('Weapon Level 25')
    expect([...tooltip.querySelectorAll('dt')].map((node) => node.textContent)).toEqual([
      'Unlock',
      'Challenge',
    ])
    expect(tooltip.textContent).not.toMatch(
      /Also completes|Also clears|First complete|on this weapon/
    )
    expect(parseFloat(tooltip.style.left) + parseFloat(tooltip.style.width)).toBeLessThanOrEqual(
      window.innerWidth - 12
    )
    expect(toggle).not.toHaveBeenCalled()
    tile.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await settle()
    expect(document.querySelector('[role=tooltip]')).toBeNull()
    tile.focus()
    await settle()
    tooltip = document.querySelector('[role=tooltip]')
    expect(tooltip).not.toBeNull()
    expect(toggle).not.toHaveBeenCalled()
  })

  it('opens a touch popover, permits dismissal without completion, and uses an explicit completion action', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true }))
    )
    const toggle = vi.fn()
    mount(CamoButton, { camo: smoke(), weapon: han, mode: 'dmz', onToggle: toggle })
    host.querySelector('button').click()
    await settle()
    expect(toggle).not.toHaveBeenCalled()
    expect(document.querySelector('[role=dialog].mobile')).not.toBeNull()
    expect(document.querySelector('.mode-challenge-label').textContent.trim()).toBe(
      'DMZ challenges'
    )
    document.querySelector('[aria-label="Close challenge details"]').click()
    await settle()
    expect(toggle).not.toHaveBeenCalled()
    expect(document.querySelector('[role=dialog]')).toBeNull()
    host.querySelector('button').click()
    await settle()
    document.querySelector('.completion-action').click()
    await settle()
    expect(toggle).toHaveBeenCalledTimes(1)
    expect(document.querySelector('[role=dialog]')).toBeNull()
  })

  it.each(['multiplayer', 'dmz', 'warzone'])(
    'renders structured unlock counts and the selected %s challenge on touch',
    async (mode) => {
      vi.stubGlobal(
        'matchMedia',
        vi.fn(() => ({ matches: true }))
      )
      const weapon = JSON.parse(JSON.stringify(han))
      weapon.specialCamos[0].unlockRequirements = [{ type: 'weapon_unlocks', count: 12 }] // Synthetic, not production data.
      const camo = getWeaponCamos(weapon, mode).find((entry) => entry.id === 'smoke')
      const toggle = vi.fn()
      mount(CamoButton, { camo, weapon, mode, disabled: mode === 'warzone', onToggle: toggle })
      host.querySelector('button').click()
      await settle()
      const dialog = document.querySelector('[role=dialog]')
      expect([...dialog.querySelectorAll('dt')].map((node) => node.textContent)).toEqual([
        'Unlock',
        'Challenge',
      ])
      expect(dialog.textContent).toContain('Earn 12 weapon unlocks using the HAN 86.')
      expect(dialog.querySelectorAll('dd')[1].textContent).toContain(
        mode === 'multiplayer'
          ? '20 kills'
          : mode === 'dmz'
          ? '75 kills'
          : 'Unavailable: Not published'
      )
      expect(toggle).not.toHaveBeenCalled()
    }
  )

  it.each(['gold', 'pyroclast-terminus'])(
    'keeps %s details focused on requirements without shortcut explanations',
    async (id) => {
      const camo = [...getWeaponCamos(han, 'multiplayer'), ...getPrestigeCamos(han)].find(
        (entry) => entry.id === id
      )
      mount(CamoButton, { camo, weapon: han, mode: id === 'gold' ? 'multiplayer' : '' })
      host.querySelector('.camo-control').dispatchEvent(new MouseEvent('mouseenter'))
      await settle()
      const tooltip = document.querySelector('[role=tooltip]')
      expect(tooltip.textContent).not.toMatch(
        /Also completes|Also clears|First complete|Blocked if/
      )
      expect(tooltip.textContent).toContain(
        id === 'gold' ? 'All Military and Special camos' : 'Weapon Prestige Master Level 73'
      )
    }
  )

  it('shows unpublished requirements without allowing accidental completion', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true }))
    )
    const toggle = vi.fn()
    const camo = getWeaponCamos(han, 'warzone').find((camo) => camo.id === 'gold')
    mount(CamoButton, { camo, weapon: han, mode: 'warzone', disabled: true, onToggle: toggle })
    host.querySelector('button').click()
    await settle()
    expect(document.querySelector('[role=dialog]').textContent).toContain('Unavailable')
    expect(document.querySelector('.completion-action').disabled).toBe(true)
    expect(toggle).not.toHaveBeenCalled()
  })

  it('locks unreleased weapons even on touch', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true }))
    )
    mount(CamoButton, { camo: smoke(), weapon: han, locked: true, disabled: true })
    host.querySelector('button').click()
    await settle()
    expect(host.querySelector('button').disabled).toBe(true)
    expect(document.querySelector('[role=dialog]')).toBeNull()
  })
})

describe('artwork and Prestige definitions', () => {
  it('resolves all supplied shared and Prestige filenames centrally and supports individual Special images', () => {
    const camos = [...getWeaponCamos(han, 'multiplayer'), ...getPrestigeCamos(han)]
    expect(camos).toHaveLength(19)
    for (const camo of camos) expect(camoImageUrl(camo)).toBe(camoCdnBase + camo.id + '.png')
    expect(camoImageUrl({ id: 'smoke', image: 'han-86-smoke.png' })).toBe(
      camoCdnBase + 'han-86-smoke.png'
    )
    expect(camoImageUrl({ id: 'bad', image: '../unrelated.png' })).toBeNull()
    expect(camoImageUrl({ id: 'parallax', stage: 'mastery' })).toBe(camoCdnBase + 'parallax.png')
    const weapon = JSON.parse(JSON.stringify(han))
    weapon.specialCamos[0].image = 'han-86-smoke.png'
    expect(validateWeapons([weapon])).toEqual([])
    weapon.specialCamos[0].image = '../unrelated.png'
    expect(validateWeapons([weapon]).join('\n')).toContain('image')
  })

  it('falls back to a neutral named tile on image failure, never to another camo', async () => {
    mount(CamoImage, { camo: smoke() })
    expect(host.querySelector('img').src).toBe(camoCdnBase + 'smoke.png')
    host.querySelector('img').dispatchEvent(new Event('error'))
    await settle()
    expect(host.querySelector('img')).toBeNull()
    expect(host.querySelector('.missing-art').textContent).toContain('Smoke')
    expect(host.querySelector('.missing-art').getAttribute('aria-label')).toContain(
      'artwork unavailable'
    )
  })

  it('retains the original check/times indicators and completion overlay classes', () => {
    mount(CamoButton, { camo: { ...smoke(), completed: true }, weapon: han })
    expect(host.querySelector('.inner.completed')).not.toBeNull()
    expect(host.querySelector('.complete[data-icon=check]')).not.toBeNull()
    expect(host.querySelector('.remove[data-icon=times]')).not.toBeNull()
    expect(host.textContent).not.toContain('✓')
  })

  it('shows weapon prestige and Weapon Prestige Master levels', () => {
    const camos = getPrestigeCamos(han)
    expect(camos[0].challenge.description).toBe('Prestige this weapon.')
    expect(camos[1].challenge.description).toBe(
      'Prestige this weapon. Reach Weapon Prestige Master Level 73.'
    )
    expect(camos[2].challenge.description).toContain('Weapon Prestige Master Level 150')
    expect(camos[3].challenge.description).toContain('Weapon Prestige Master Level 250')
    expect(camos.every((camo) => camo.challenge.status === 'available')).toBe(true)
  })
})

describe('Prestige requirement details on touch', () => {
  it('shows player-level conditions before an explicit completion action', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true }))
    )
    const toggle = vi.fn()
    mount(CamoButton, { camo: getPrestigeCamos(han)[1], weapon: han, onToggle: toggle })
    host.querySelector('button').click()
    await settle()
    const dialog = document.querySelector('[role=dialog]')
    expect(dialog.textContent).toContain('Prestige this weapon.')
    expect(dialog.textContent).toContain('Weapon Prestige Master Level 73')
    expect(toggle).not.toHaveBeenCalled()
    document.querySelector('.completion-action').click()
    expect(toggle).toHaveBeenCalledTimes(1)
  })

  it('keeps unpublished Prestige conditions readable without allowing completion', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true }))
    )
    const weapon = JSON.parse(JSON.stringify(han))
    weapon.prestigeCamos[1].requirements[1] = {
      type: 'unavailable',
      reason: 'Threshold not published.',
    }
    const toggle = vi.fn()
    mount(CamoButton, {
      camo: getPrestigeCamos(weapon)[1],
      weapon,
      disabled: true,
      onToggle: toggle,
    })
    host.querySelector('button').click()
    await settle()
    expect(document.querySelector('[role=dialog]').textContent).toContain(
      'Threshold not published.'
    )
    expect(document.querySelector('.completion-action').disabled).toBe(true)
    document.querySelector('[aria-label="Close challenge details"]').click()
    expect(toggle).not.toHaveBeenCalled()
  })
})
