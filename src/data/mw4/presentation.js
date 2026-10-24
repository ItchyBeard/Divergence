import { categoriesById } from './categories'
import {
  requirementPending,
  pendingRequirementText,
  specialUnlockRequirements,
} from './requirements'
import { completionistCamos } from './camos'
import { modes } from './modes'

const objectives = {
  mounted_kills: 'kills while mounted',
  silenced_kills: 'kills using a silencer',
  kills_without_dying: 'kills without dying',
  kills_without_damage: 'kills without taking damage',
  eliminations_in_match: 'eliminations in a single match',
  headshots: 'headshots',
  double_kills: 'double kills',
  kills_from_behind: 'kills from behind',
  hipfire_kills: 'hipfire kills',
  prone_kills: 'kills while prone',
  kills_without_reloading: 'kills without reloading',
  kills_without_releasing_trigger: 'kills without releasing the trigger',
  one_shot_kills: 'one-shot kills',
  kills: 'kills',
  kills_in_match: 'kills in a match',
  tier_3_plus_kills: 'Tier 3+ enemy kills',
  lt_dog_tags_exfil_in_deployment: 'LT dog tags exfiled in a single deployment',
  legendary_weapon_kills_max_level_operator:
    'kills using Legendary Weapons on a Max Level Operator',
}

export function challengeText(challenge) {
  if (!challenge || challenge.status === 'unavailable')
    return `Unavailable: ${challenge?.reason || 'Not published.'}`
  if (challenge.description) return challenge.description
  if (challenge.type === 'weapon_level')
    return requirementPending(challenge.amount)
      ? pendingRequirementText
      : `Reach Weapon Level ${challenge.amount}`
  if (challenge.type === 'weapon_unlocks')
    return requirementPending(challenge.amount)
      ? pendingRequirementText
      : `Earn ${challenge.amount} weapon unlocks`
  const target =
    challenge.target === 'players'
      ? ' against players'
      : challenge.target === 'enemies'
      ? ' against enemies'
      : ''
  const repeat = challenge.times === undefined ? '' : `, ${challenge.times} times`
  return `${challenge.amount} ${
    objectives[challenge.type] || challenge.type.replaceAll('_', ' ')
  }${target}${repeat}`
}

export function specialUnlockText(requirement, weapon) {
  if (!requirement || typeof requirement !== 'object') return pendingRequirementText
  if (requirement.type === 'unavailable') return requirement.reason || pendingRequirementText
  if (requirement.type === 'weapon_unlocks')
    return requirementPending(requirement.count)
      ? pendingRequirementText
      : `Earn ${requirement.count} weapon unlocks using ${
          weapon?.name ? 'the ' + weapon.name : 'this weapon'
        }.`
  if (requirement.type === 'weapon_level')
    return requirementPending(requirement.level)
      ? pendingRequirementText
      : `Reach Weapon Level ${requirement.level}.`
  return pendingRequirementText
}

export function prerequisiteText(camo, weapon) {
  if (
    camo.stage === 'special' ||
    Object.hasOwn(camo, 'unlockRequirements') ||
    Object.hasOwn(camo, 'unlockLevel')
  ) {
    const requirements = specialUnlockRequirements(camo)
    return Array.isArray(requirements) && requirements.length
      ? requirements.map((requirement) => specialUnlockText(requirement, weapon)).join(' ')
      : pendingRequirementText
  }
  const rule = camo.prerequisite
  if (!rule) return ''
  const name =
    [...completionistCamos, ...Object.values(modes).flatMap((mode) => mode.mastery)].find(
      (entry) => entry.id === rule.camoId
    )?.name || rule.camoId?.replaceAll('-', ' ')
  let summary
  if (rule.stages)
    summary = `All ${rule.stages
      .map((stage) => stage[0].toUpperCase() + stage.slice(1))
      .join(' and ')} camos.`
  else if (rule.scope === 'category')
    summary = `Gold on ${rule.count ?? 'all required'} ${categoriesById[weapon.category].name}.`
  else if (rule.scope === 'arsenal' && rule.count) summary = `${name} on ${rule.count} weapons.`
  else if (rule.scope === 'arsenal') summary = 'Divergence across the arsenal.'
  else summary = `${name} in this mode.`
  return summary + (camo.requirementPending ? ' ' + pendingRequirementText : '')
}

// One rendering contract for tracker details, list summaries, Gallery and ARIA text.
export function camoRequirementRows(camo, weapon) {
  const prerequisite = prerequisiteText(camo, weapon)
  const challenge = challengeText(camo.challenge)
  if (camo.stage === 'special')
    return [
      { label: 'Unlock', text: prerequisite },
      { label: 'Challenge', text: challenge },
    ]
  return [
    ...(!camo.award
      ? [
          {
            label:
              camo.stage === 'military' || camo.stage === 'prestige' ? 'Requirement' : 'Challenge',
            text: challenge,
          },
        ]
      : []),
    ...(prerequisite ? [{ label: 'Requires', text: prerequisite }] : []),
  ]
}

export function camoText(camo, weapon) {
  return [camo.name, ...camoRequirementRows(camo, weapon).map((row) => row.label + ': ' + row.text)]
    .filter(Boolean)
    .join(' — ')
}
