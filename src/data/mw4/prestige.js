import { requirementPending, pendingRequirementText } from './requirements'

// Shared identities and artwork only. Unlock conditions belong to each weapon.
export const prestigeCamos = [
  { id: 'pyroclast', name: 'Pyroclast', image: 'pyroclast.png' },
  { id: 'pyroclast-terminus', name: 'Pyroclast Terminus', image: 'pyroclast-terminus.png' },
  { id: 'pyroclast-scatter', name: 'Pyroclast Scatter', image: 'pyroclast-scatter.png' },
  { id: 'pyroclast-cascade', name: 'Pyroclast Cascade', image: 'pyroclast-cascade.png' },
]

const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const text = (value) => typeof value === 'string' && value.trim().length > 0
const positive = (value) => Number.isSafeInteger(value) && value > 0
const jsonValue = (value) =>
  value === null ||
  typeof value === 'boolean' ||
  typeof value === 'string' ||
  (typeof value === 'number' && Number.isFinite(value)) ||
  (Array.isArray(value) && value.every(jsonValue)) ||
  (object(value) && Object.values(value).every(jsonValue))

// New documented conditions can use a snake_case type, description and structured
// parameters without adding a central weapon exception or requirement registry.
export function validatePrestigeRequirement(value, path = 'requirement') {
  const fail = (message) => [path + ': ' + message]
  if (!object(value)) return fail('expected a requirement object')
  let allowed
  switch (value.type) {
    case 'weapon_prestige':
      allowed = ['type', 'required']
      if (value.required !== true) return fail('weapon_prestige requires required: true')
      break
    case 'player_prestige_master_level':
    case 'player_level':
      allowed = ['type', 'level']
      if (!positive(value.level)) return fail('level must be a positive integer')
      break
    case 'unavailable':
      allowed = ['type', 'reason']
      if (!text(value.reason)) return fail('unavailable requirements require a reason')
      break
    default:
      allowed = ['type', 'description', 'parameters']
      if (
        typeof value.type !== 'string' ||
        !/^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/.test(value.type) ||
        !text(value.description) ||
        !object(value.parameters) ||
        !Object.keys(value.parameters).length ||
        !jsonValue(value.parameters)
      )
        return fail(
          'documented custom conditions require a snake_case type, description and nonempty JSON parameters'
        )
  }
  return Object.keys(value)
    .filter((key) => !allowed.includes(key))
    .map((key) => path + ': unexpected field ' + key)
}

function requirementText(requirement) {
  switch (requirement.type) {
    case 'weapon_prestige':
      return 'Prestige this weapon.'
    case 'player_prestige_master_level':
      return requirementPending(requirement.level)
        ? pendingRequirementText
        : 'Reach overall player Prestige Master Level ' + requirement.level + '.'
    case 'player_level':
      return 'Reach overall player Level ' + requirement.level + '.'
    case 'unavailable':
      return requirement.reason
    default:
      return requirement.description
  }
}

export function getPrestigeCamos(weapon) {
  return prestigeCamos.map((camo) => {
    const requirements = weapon.prestigeCamos?.find((entry) => entry.id === camo.id)?.requirements
    const valid =
      Array.isArray(requirements) &&
      requirements.length > 0 &&
      requirements.every((condition) => validatePrestigeRequirement(condition).length === 0)
    const description = valid
      ? requirements.map(requirementText).join(' ')
      : 'Unlock requirements not published.'
    const pending =
      valid &&
      requirements.some(
        (condition) =>
          condition.type === 'player_prestige_master_level' && requirementPending(condition.level)
      )
    const available =
      valid && !pending && requirements.every((condition) => condition.type !== 'unavailable')
    return {
      ...camo,
      stage: 'prestige',
      requirements,
      requirementPending: Boolean(pending),
      challenge: available
        ? { status: 'available', description }
        : { status: 'unavailable', reason: description },
    }
  })
}
