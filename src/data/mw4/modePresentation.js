import { modes } from './modes'
import { getWeaponCamos } from './catalog'

export function trackerModeContext(mode, weapons) {
  if (mode === 'multiplayer') return 'Complete camo challenges against players.'
  if (mode === 'dmz') return 'Earn the same shared camos through DMZ challenges.'
  const unavailable = weapons.some((weapon) =>
    getWeaponCamos(weapon, mode).some((camo) => camo.challenge?.status === 'unavailable')
  )
  return unavailable
    ? 'Complete supported Warzone challenges. Additional requirements may become available later.'
    : 'Complete camo challenges in ' + modes[mode].name + '.'
}
