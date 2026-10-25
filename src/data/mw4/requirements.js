// Reserved for maxLevel, numeric Special unlock prerequisites and Weapon Prestige Master level.
// Other challenge amounts retain their ordinary numeric meaning.
export const UNKNOWN_REQUIREMENT = 999
export const requirementPending = (value) => value === UNKNOWN_REQUIREMENT
export const pendingRequirementText = 'Requirement pending.'

const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const positive = (value) => Number.isSafeInteger(value) && value > 0

// Legacy definitions can still be read; new definitions use unlockRequirements.
// The new structure always wins, so an old level cannot bypass a pending condition.
export function specialUnlockRequirements(camo) {
  if (Object.hasOwn(camo, 'unlockRequirements')) return camo.unlockRequirements
  if (Object.hasOwn(camo, 'unlockLevel')) return [{ type: 'weapon_level', level: camo.unlockLevel }]
  return [{ type: 'unavailable', reason: pendingRequirementText }]
}

export function validateSpecialUnlockRequirement(value, maxLevel, path = 'unlock requirement') {
  const fail = (message) => [path + ': ' + message]
  if (!object(value)) return fail('expected a requirement object')
  let allowed
  if (value.type === 'weapon_unlocks' || value.type === 'weapon_level') {
    const field = value.type === 'weapon_unlocks' ? 'count' : 'level'
    allowed = ['type', field]
    if (!positive(value[field])) return fail(field + ' must be a positive integer or 999 (pending)')
    // Unlock counts and maximum weapon levels measure different things.
    if (
      field === 'level' &&
      !requirementPending(value.level) &&
      !requirementPending(maxLevel) &&
      value.level > maxLevel
    )
      return fail('level must be within maxLevel')
  } else if (value.type === 'unavailable') {
    allowed = ['type', 'reason']
    if (typeof value.reason !== 'string' || !value.reason.trim())
      return fail('unavailable requirements require a reason')
  } else return fail('unrecognised Special unlock requirement type')
  return Object.keys(value)
    .filter((key) => !allowed.includes(key))
    .map((key) => path + ': unexpected field ' + key)
}

export function specialUnlockPending(camo) {
  const requirements = specialUnlockRequirements(camo)
  return (
    !Array.isArray(requirements) ||
    !requirements.length ||
    requirements.some(
      (condition) =>
        validateSpecialUnlockRequirement(condition).length ||
        condition.type === 'unavailable' ||
        (condition.type === 'weapon_unlocks' && requirementPending(condition.count)) ||
        (condition.type === 'weapon_level' && requirementPending(condition.level))
    )
  )
}
