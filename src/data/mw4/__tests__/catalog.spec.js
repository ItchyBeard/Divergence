// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { createServer } from 'vite'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import { join, relative, isAbsolute } from 'node:path'
import { createServer as createHttpServer } from 'node:http'
import weapons, { weaponsById } from '../../weapons/index'
import han from '../../weapons/assault-rifles/han-86.weapon'
import { createWeaponCatalog, getWeaponCamos } from '../catalog'
import { validateWeapons, validateChallenge } from '../validate'
import { categories } from '../categories'
import { completionistCamos } from '../camos'
import { modes, modeIds } from '../modes'
import { storageKey } from '../saveContract'

const copy = () => JSON.parse(JSON.stringify(han))

async function removeTemporaryCatalog(root) {
  const withinTemp = relative(tmpdir(), root)
  if (!withinTemp || withinTemp.startsWith('..') || isAbsolute(withinTemp)) {
    throw new Error(`Refusing to remove temporary catalog outside temp directory: ${root}`)
  }
  await rm(root, { recursive: true, force: true })
}

describe('MW4 catalog', () => {
  it('discovers the official example and resolves eight Military, three Special and four Completionist camos', () => {
    expect(weaponsById['han-86']).toBe(han)
    expect(weapons).toContain(han)
    expect(validateWeapons(weapons)).toEqual([])
    for (const mode of modeIds) {
      const camos = getWeaponCamos(han, mode)
      expect(camos).toHaveLength(15)
      expect(camos.filter((camo) => camo.stage === 'military')).toHaveLength(8)
      expect(camos.filter((camo) => camo.stage === 'special')).toHaveLength(3)
      expect(camos.filter((camo) => camo.stage === 'completionist')).toHaveLength(4)
    }
  })

  it('changes requirements by mode while preserving shared camo identity and inputs', () => {
    const before = JSON.stringify(han)
    const mp = getWeaponCamos(han, 'multiplayer')
    const dmz = getWeaponCamos(han, 'dmz')
    expect(mp.map((camo) => camo.id)).toEqual(dmz.map((camo) => camo.id))
    expect(mp.find((camo) => camo.id === 'smoke').challenge.amount).toBe(20)
    expect(dmz.find((camo) => camo.id === 'smoke').challenge.amount).toBe(75)
    expect(mp.find((camo) => camo.id === 'red').challenge).toMatchObject({ amount: 3, times: 15 })
    expect(dmz.find((camo) => camo.id === 'red').challenge.times).toBe(50)
    expect(mp.find((camo) => camo.id === 'platinum').prerequisite.count).toBe(8)
    expect(mp.find((camo) => camo.id === 'harmonic-break').prerequisite.count).toBe(33)
    expect(JSON.stringify(han)).toBe(before)
    expect(mp.every((camo) => !('completed' in camo))).toBe(true)
  })

  it('keeps unknown Warzone requirements explicit and mastery separate', () => {
    const camos = getWeaponCamos(han, 'warzone')
    for (const camo of camos.filter((entry) => entry.stage !== 'military' && !entry.award)) {
      expect(camo.challenge.status).toBe('unavailable')
      expect(camo.challenge).not.toHaveProperty('amount')
    }
    const ids = new Set()
    for (const mode of modeIds) {
      expect(modes[mode].mastery).toHaveLength(3)
      for (const camo of modes[mode].mastery) {
        expect(ids.has(camo.id)).toBe(false)
        ids.add(camo.id)
        expect(validateChallenge(camo.challenge)).toEqual([])
      }
    }
    expect(modes.warzone.mastery.every((camo) => camo.challenge.status === 'unavailable')).toBe(
      true
    )
    expect(() => getWeaponCamos(han, 'zombies')).toThrow('Unknown MW4 mode')
  })

  it('validates shared challenges and never treats the partial catalog as the full arsenal', () => {
    for (const category of categories) {
      for (const rule of ['platinum', 'harmonicBreak']) {
        for (const mode of modeIds)
          expect(validateChallenge(category[rule].challenges[mode])).toEqual([])
      }
    }
    expect(completionistCamos.find((camo) => camo.id === 'divergence')).toMatchObject({
      award: 'prerequisite',
      prerequisite: { scope: 'arsenal', count: 33 },
    })
    expect(categories.map((category) => category.goldRequired)).toEqual([8, 5, 2, 3, 3, 3, 4, 4, 1])
    const shotgun = categories.find((category) => category.id === 'shotguns')
    expect(shotgun.harmonicBreak.challenges.multiplayer).toMatchObject({ amount: 2, times: 25 })
    expect(shotgun.harmonicBreak.challenges.dmz).toMatchObject({ amount: 2, times: 50 })
    const lmg = categories.find((category) => category.id === 'light-machine-guns')
    expect(lmg.platinum.challenges.dmz).toMatchObject({
      type: 'kills_without_damage', amount: 3, times: 50,
    })
    const launcher = categories.find((category) => category.id === 'launchers')
    expect(launcher.harmonicBreak.challenges.multiplayer).toMatchObject({
      type: 'kills_in_match', amount: 10, times: 7,
    })
    expect(categories.find((category) => category.id === 'melee').harmonicBreak.challenges.dmz.status)
      .toBe('unavailable')
  })

  it('orders by category, order, name and ID regardless of import enumeration order', () => {
    const a = { ...copy(), id: 'test-a', name: 'Same' }
    const b = { ...copy(), id: 'test-b', name: 'Same' }
    const c = { ...copy(), id: 'test-c', order: 1, name: 'AAA' }
    const d = { ...copy(), id: 'test-d', category: 'pistols' }
    const entries = [a, b, c, d].map((weapon) => [
      `./${weapon.category}/${weapon.id}.weapon.js`,
      weapon,
    ])
    const forward = createWeaponCatalog(Object.fromEntries(entries))
    expect(forward.map((weapon) => weapon.id)).toEqual(['test-a', 'test-b', 'test-c', 'test-d'])
    expect(createWeaponCatalog(Object.fromEntries(entries.reverse()))).toEqual(forward)
    expect(() => createWeaponCatalog({ './pistols/test.weapon.js': han })).toThrow(
      'folder must match'
    )
    expect(() =>
      createWeaponCatalog({
        './assault-rifles/a.weapon.js': han,
        './assault-rifles/b.weapon.js': han,
      })
    ).toThrow('duplicate ID')
  })

  it('applies a documented exception only to its camo and mode', () => {
    const weapon = copy()
    weapon.exceptions.challengeOverrides.push({
      camoId: 'smoke',
      mode: 'dmz',
      challenge: { ...han.specialCamos[0].challenges.dmz, amount: 1 },
      reason: 'Synthetic test only',
    })
    expect(validateWeapons([weapon])).toEqual([])
    const baseline = getWeaponCamos(han, 'dmz')
    const result = getWeaponCamos(weapon, 'dmz')
    expect(result.filter((camo) => camo.id !== 'smoke')).toEqual(
      baseline.filter((camo) => camo.id !== 'smoke')
    )
    expect(result.find((camo) => camo.id === 'smoke').challenge.amount).toBe(1)
    expect(getWeaponCamos(weapon, 'multiplayer')).toEqual(getWeaponCamos(han, 'multiplayer'))
  })

  it('registers a newly created weapon file through the real Vite glob without registry edits', async () => {
    // Use a temporary catalog mirror so no fixture can leak into a running app or production build.
    const root = await mkdtemp(join(tmpdir(), 'divergence-discovery-'))
    let server
    try {
      const { cp, mkdir } = await import('node:fs/promises')
      const dataPath = fileURLToPath(new URL('../..', import.meta.url))
      await cp(dataPath, join(root, 'data'), { recursive: true })
      const weapon = { ...copy(), id: 'test-new-file', name: 'Synthetic discovery fixture' }
      await mkdir(join(root, 'data/weapons/assault-rifles'), { recursive: true })
      await writeFile(
        join(root, 'data/weapons/assault-rifles/test-new-file.weapon.js'),
        `export default ${JSON.stringify(weapon)}`
      )
      server = await createServer({
        root,
        configFile: false,
        // Attach HMR to an unbound HTTP server: this SSR-only test opens no ports.
        server: { middlewareMode: true, hmr: { server: createHttpServer() } },
        optimizeDeps: { disabled: true },
        appType: 'custom',
      })
      const discovered = await server.ssrLoadModule('/data/weapons/index.js')
      expect(discovered.weaponsById['test-new-file']).toMatchObject({ id: 'test-new-file' })
      expect(discovered.weaponsById['han-86']).toBeDefined()
      expect(discovered.weapons).toHaveLength(weapons.length + 1)
    } finally {
      if (server) await server.close()
      await removeTemporaryCatalog(root)
    }
  }, 20000)

  it('reserves MW4-only save keys and keeps progress out of definitions', () => {
    expect(storageKey(true)).toBe('divergence:mw4:v1')
    expect(storageKey()).toBe('divergence:mw4:v1:dev')
    expect(han).not.toHaveProperty('progress')
  })
})

describe('weapon validation', () => {
  it('rejects duplicate IDs', () => {
    expect(validateWeapons([copy(), copy()]).join('\n')).toContain('duplicate ID han-86')
  })

  it.each([
    [
      'missing name',
      (weapon) => {
        delete weapon.name
      },
      'name',
    ],
    [
      'missing season',
      (weapon) => {
        delete weapon.season
      },
      'season',
    ],
    [
      'missing release date',
      (weapon) => {
        delete weapon.releaseDate
      },
      'releaseDate',
    ],
    [
      'invalid date',
      (weapon) => {
        weapon.releaseDate = '2026-02-30'
      },
      'releaseDate',
    ],
    [
      'invalid category',
      (weapon) => {
        weapon.category = 'toString'
      },
      'category',
    ],
    [
      'missing military level',
      (weapon) => {
        weapon.militaryUnlockLevels.pop()
      },
      'militaryUnlockLevels',
    ],
    [
      'unordered levels',
      (weapon) => {
        weapon.militaryUnlockLevels[1] = 10
      },
      'militaryUnlockLevels',
    ],
    [
      'missing special camo',
      (weapon) => {
        weapon.specialCamos.pop()
      },
      'specialCamos',
    ],
    [
      'duplicate camo',
      (weapon) => {
        weapon.specialCamos[1].id = 'smoke'
      },
      'duplicate camo ID',
    ],
    [
      'level exceeds maximum',
      (weapon) => {
        weapon.specialCamos[0].unlockLevel = 73
      },
      'unlockLevel',
    ],
    [
      'missing mode',
      (weapon) => {
        delete weapon.specialCamos[0].challenges.dmz
      },
      'dmz',
    ],
    [
      'unknown mode',
      (weapon) => {
        weapon.specialCamos[0].challenges.zombies = {}
      },
      'invalid mode',
    ],
    [
      'zero amount',
      (weapon) => {
        weapon.specialCamos[0].challenges.dmz.amount = 0
      },
      'amount',
    ],
    [
      'string amount',
      (weapon) => {
        weapon.specialCamos[0].challenges.dmz.amount = '75'
      },
      'amount',
    ],
    [
      'invalid repetitions',
      (weapon) => {
        weapon.specialCamos[0].challenges.dmz.times = -1
      },
      'times',
    ],
    [
      'malformed type',
      (weapon) => {
        weapon.specialCamos[0].challenges.dmz.type = 'not a type'
      },
      'type',
    ],
    [
      'unknown status',
      (weapon) => {
        weapon.specialCamos[0].challenges.dmz.status = 'done'
      },
      'status',
    ],
    [
      'guessed unavailable count',
      (weapon) => {
        weapon.specialCamos[0].challenges.warzone.amount = 0
      },
      'unexpected field',
    ],
    [
      'missing unavailable reason',
      (weapon) => {
        delete weapon.specialCamos[0].challenges.warzone.reason
      },
      'reason',
    ],
    [
      'unknown exception',
      (weapon) => {
        weapon.exceptions.challengeOverrides.push({
          camoId: 'typo',
          mode: 'dmz',
          reason: 'Test',
          challenge: {},
        })
      },
      'camoId',
    ],
    [
      'non-array specials with exception',
      (weapon) => {
        weapon.specialCamos = {}
        weapon.exceptions.challengeOverrides = [{}]
      },
      'specialCamos',
    ],
    [
      'missing exceptions',
      (weapon) => {
        delete weapon.exceptions
      },
      'exceptions',
    ],
  ])('detects %s', (_, mutate, expected) => {
    const weapon = copy()
    mutate(weapon)
    expect(validateWeapons([weapon]).join('\n')).toContain(expected)
  })

  it('handles malformed roots and explicit unknown release dates', () => {
    expect(validateWeapons(null)).not.toEqual([])
    expect(validateWeapons([null, {}, 'bad'])).not.toEqual([])
    expect(validateWeapons([{ ...copy(), releaseDate: null }])).toEqual([])
    expect(validateChallenge(null)).not.toEqual([])
    expect(validateWeapons([{ ...copy(), releaseStatus: 'delayed' }])).toEqual([])
    expect(validateWeapons([{ ...copy(), releaseStatus: 'invented' }]).join('\n')).toContain(
      'releaseStatus'
    )
  })

  it('accepts a new documented objective in one weapon file without a type registration list', () => {
    const weapon = copy()
    weapon.specialCamos[0].challenges.multiplayer = {
      status: 'available',
      type: 'synthetic_objective',
      amount: 1,
      target: 'players',
      description: 'Synthetic test objective; never shipped as real weapon data.',
    }
    expect(validateWeapons([weapon])).toEqual([])
  })
})
