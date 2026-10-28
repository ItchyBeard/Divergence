import { prestigeCamos, validatePrestigeRequirement } from './prestige'
import { categoriesById } from './categories'
import { militaryCamos, completionistCamos } from './camos'
import { modeIds } from './modes'
import { requirementPending, validateSpecialUnlockRequirement } from './requirements'

const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const text = (value) => typeof value === 'string' && value.trim().length > 0
const id = (value) => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
const positive = (value) => Number.isSafeInteger(value) && value > 0

export function validateChallenge(value, path = 'challenge') {
  const errors = []
  const fail = (message) => errors.push(`${path}: ${message}`)
  if (!object(value)) return [`${path}: expected a challenge object`]
  const allowed =
    value.status === 'unavailable'
      ? ['status', 'reason']
      : ['status', 'type', 'amount', 'target', 'times', 'description']
  Object.keys(value).forEach((key) => {
    if (!allowed.includes(key)) fail(`unexpected field ${key}`)
  })
  if (value.status === 'unavailable') {
    if (!text(value.reason)) fail('unavailable challenges require a reason')
  } else if (value.status === 'available') {
    // Open vocabulary lets a new weapon introduce an objective in its own file.
    if (typeof value.type !== 'string' || !/^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/.test(value.type))
      fail('invalid challenge type; expected a snake_case objective ID')
    if (!positive(value.amount)) fail('amount must be a positive integer')
    if (!['players', 'enemies', 'weapon', 'dog-tags', 'equipment'].includes(value.target))
      fail('invalid target')
    if ('times' in value && !positive(value.times)) fail('times must be a positive integer')
    if ('description' in value && !text(value.description)) fail('description must be nonempty')
  } else {
    fail('status must be available or unavailable')
  }
  return errors
}

export function validateWeapons(weapons) {
  if (!Array.isArray(weapons)) return ['weapons: expected an array']
  const errors = []
  const seen = new Set()
  weapons.forEach((weapon, index) => {
    const path = `weapons[${index}](${weapon?.id || '?'})`
    const fail = (field, message) => errors.push(`${path}.${field}: ${message}`)
    if (!object(weapon)) {
      errors.push(`${path}: expected a weapon object`)
      return
    }
    const allowed = [
      'id',
      'name',
      'category',
      'season',
      'releaseDate',
      'releaseStatus',
      'maxLevel',
      'maxWeaponUnlocks',
      'order',
      'source',
      'militaryUnlockLevels',
      'militaryUnlockCounts',
      'specialCamos',
      'prestigeCamos',
      'exceptions',
    ]
    Object.keys(weapon).forEach((key) => {
      if (!allowed.includes(key)) fail(key, 'unexpected field')
    })
    if (!id(weapon.id)) fail('id', 'expected a stable kebab-case ID')
    if (seen.has(weapon.id)) fail('id', `duplicate ID ${weapon.id}`)
    seen.add(weapon.id)
    if (!text(weapon.name)) fail('name', 'required')
    if (!Object.hasOwn(categoriesById, weapon.category)) fail('category', 'invalid category')
    if (!Number.isSafeInteger(weapon.season) || weapon.season < 0)
      fail('season', 'expected a nonnegative integer')
    // null explicitly means unannounced; missing or impossible dates are errors.
    if (
      weapon.releaseDate !== null &&
      (typeof weapon.releaseDate !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(weapon.releaseDate) ||
        !Number.isFinite(Date.parse(weapon.releaseDate)) ||
        new Date(weapon.releaseDate).toISOString().slice(0, 10) !== weapon.releaseDate)
    ) {
      fail('releaseDate', 'expected a real YYYY-MM-DD date or null')
    }
    if (!positive(weapon.maxLevel)) fail('maxLevel', 'expected a positive integer')
    if (
      'maxWeaponUnlocks' in weapon &&
      (!positive(weapon.maxWeaponUnlocks) || requirementPending(weapon.maxWeaponUnlocks))
    )
      fail('maxWeaponUnlocks', 'expected a known positive integer; omit when unknown')
    if ('releaseStatus' in weapon && !['scheduled', 'delayed'].includes(weapon.releaseStatus))
      fail('releaseStatus', 'expected scheduled or delayed')
    if ('order' in weapon && (!Number.isSafeInteger(weapon.order) || weapon.order < 0))
      fail('order', 'expected a nonnegative integer')
    if ('source' in weapon && (!text(weapon.source) || !/^https:\/\//.test(weapon.source)))
      fail('source', 'expected an HTTPS source URL')
    // A weapon declares exactly one unit. Counts are never inferred from levels or capped by them.
    const usesCounts = Object.hasOwn(weapon, 'militaryUnlockCounts')
    const militaryField = usesCounts ? 'militaryUnlockCounts' : 'militaryUnlockLevels'
    if (usesCounts && Object.hasOwn(weapon, 'militaryUnlockLevels'))
      fail(militaryField, 'declare either unlock counts or unlock levels, not both')
    if (weapon[militaryField] === null) {
      // Explicitly unpublished thresholds; missing fields and partial arrays still fail.
    } else if (!Array.isArray(weapon[militaryField]) || weapon[militaryField].length !== 8) {
      fail(militaryField, 'expected eight unlock ' + (usesCounts ? 'counts' : 'levels'))
    } else {
      weapon[militaryField].forEach((level, i, levels) => {
        if (
          !positive(level) ||
          requirementPending(level) ||
          (!usesCounts && !requirementPending(weapon.maxLevel) && level > weapon.maxLevel) ||
          (i > 0 && level <= levels[i - 1])
        ) {
          fail(
            `${militaryField}[${i}]`,
            usesCounts
              ? 'counts must be known positive integers and increase'
              : 'levels must increase and stay within maxLevel'
          )
        }
      })
    }
    const camoIds = new Set([...militaryCamos, ...completionistCamos].map((camo) => camo.id))
    if (!Array.isArray(weapon.specialCamos) || weapon.specialCamos.length !== 3) {
      fail('specialCamos', 'expected exactly three Special camos')
    }
    if (Array.isArray(weapon.specialCamos))
      weapon.specialCamos.forEach((camo, i) => {
        const field = `specialCamos[${i}]`
        if (!object(camo)) return fail(field, 'expected a camo object')
        Object.keys(camo).forEach((key) => {
          if (
            !['id', 'name', 'unlockLevel', 'unlockRequirements', 'challenges', 'image'].includes(
              key
            )
          )
            fail(`${field}.${key}`, 'unexpected field')
        })
        if (!id(camo.id) || camoIds.has(camo.id))
          fail(`${field}.id`, 'invalid or duplicate camo ID')
        camoIds.add(camo.id)
        if (
          'image' in camo &&
          (typeof camo.image !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*\.png$/.test(camo.image))
        )
          fail(`${field}.image`, 'expected a PNG basename')
        if (!text(camo.name)) fail(`${field}.name`, 'required')
        if (Array.isArray(camo.unlockRequirements))
          camo.unlockRequirements.forEach((condition) => {
            if (
              condition?.type === 'weapon_unlocks' &&
              !requirementPending(condition.count) &&
              weapon.maxWeaponUnlocks !== undefined &&
              condition.count > weapon.maxWeaponUnlocks
            )
              fail(`${field}.unlockRequirements`, 'count must be within maxWeaponUnlocks')
          })
        if (
          'unlockLevel' in camo &&
          (!positive(camo.unlockLevel) ||
            (!requirementPending(camo.unlockLevel) &&
              !requirementPending(weapon.maxLevel) &&
              camo.unlockLevel > weapon.maxLevel))
        )
          fail(`${field}.unlockLevel`, 'must be within maxLevel')
        if (Object.hasOwn(camo, 'unlockRequirements')) {
          if (!Array.isArray(camo.unlockRequirements) || !camo.unlockRequirements.length)
            fail(`${field}.unlockRequirements`, 'expected nonempty structured conditions')
          else
            camo.unlockRequirements.forEach((condition, j) =>
              errors.push(
                ...validateSpecialUnlockRequirement(
                  condition,
                  weapon.maxLevel,
                  `${path}.${field}.unlockRequirements[${j}]`
                )
              )
            )
        } else if (!Object.hasOwn(camo, 'unlockLevel'))
          fail(`${field}.unlockRequirements`, 'required; use an unavailable condition when unknown')
        if (!object(camo.challenges)) return fail(`${field}.challenges`, 'required mode challenges')
        Object.keys(camo.challenges).forEach((mode) => {
          if (!modeIds.includes(mode)) fail(`${field}.challenges.${mode}`, 'invalid mode')
        })
        modeIds.forEach((mode) =>
          errors.push(
            ...validateChallenge(camo.challenges[mode], `${path}.${field}.challenges.${mode}`)
          )
        )
      })
    if (
      !Array.isArray(weapon.prestigeCamos) ||
      weapon.prestigeCamos.length !== prestigeCamos.length
    ) {
      fail('prestigeCamos', 'expected exactly four Prestige camos')
    }
    const prestigeIds = new Set()
    if (Array.isArray(weapon.prestigeCamos))
      weapon.prestigeCamos.forEach((camo, i) => {
        const field = 'prestigeCamos[' + i + ']'
        if (!object(camo)) return fail(field, 'expected a camo object')
        Object.keys(camo).forEach((key) => {
          if (!['id', 'requirements'].includes(key)) fail(field + '.' + key, 'unexpected field')
        })
        if (!prestigeCamos.some((entry) => entry.id === camo.id) || prestigeIds.has(camo.id))
          fail(field + '.id', 'unrecognised or duplicate Prestige camo ID')
        prestigeIds.add(camo.id)
        if (!Array.isArray(camo.requirements) || !camo.requirements.length)
          return fail(
            field + '.requirements',
            'expected nonempty conditions; use an explicit unavailable requirement when unknown'
          )
        camo.requirements.forEach((condition, j) =>
          errors.push(
            ...validatePrestigeRequirement(
              condition,
              path + '.' + field + '.requirements[' + j + ']'
            )
          )
        )
      })
    if (!object(weapon.exceptions)) {
      fail('exceptions', 'required; use { challengeOverrides: [], notes: [] } when empty')
      return
    }
    Object.keys(weapon.exceptions).forEach((key) => {
      if (!['challengeOverrides', 'notes'].includes(key))
        fail(`exceptions.${key}`, 'unexpected field')
    })
    if (
      !Array.isArray(weapon.exceptions.notes) ||
      weapon.exceptions.notes.some((note) => !text(note))
    )
      fail('exceptions.notes', 'expected an array of nonempty strings')
    const overrides = weapon.exceptions.challengeOverrides
    if (!Array.isArray(overrides)) return fail('exceptions.challengeOverrides', 'expected an array')
    const overrideKeys = new Set()
    overrides.forEach((override, i) => {
      const field = `exceptions.challengeOverrides[${i}]`
      if (!object(override)) return fail(field, 'expected an override object')
      Object.keys(override).forEach((key) => {
        if (!['camoId', 'mode', 'challenge', 'reason'].includes(key))
          fail(`${field}.${key}`, 'unexpected field')
      })
      const overrideableIds = [
        ...completionistCamos.filter((camo) => !camo.award),
        ...(Array.isArray(weapon.specialCamos) ? weapon.specialCamos : []),
      ].map((camo) => camo?.id)
      if (!overrideableIds.includes(override.camoId))
        fail(`${field}.camoId`, 'unknown or non-challenge camo')
      if (!modeIds.includes(override.mode)) fail(`${field}.mode`, 'invalid mode')
      if (!text(override.reason)) fail(`${field}.reason`, 'required')
      const key = `${override.camoId}:${override.mode}`
      if (overrideKeys.has(key)) fail(field, 'duplicate override')
      overrideKeys.add(key)
      errors.push(...validateChallenge(override.challenge, `${path}.${field}.challenge`))
    })
  })
  return errors
}

export function assertValidWeapons(weapons) {
  const errors = validateWeapons(weapons)
  if (errors.length) throw new Error(`Invalid MW4 weapon definitions:\n${errors.join('\n')}`)
}
