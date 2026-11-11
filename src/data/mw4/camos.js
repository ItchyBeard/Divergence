import { challenge } from './challenges'
import { launchRequirements } from './launchRequirements'

export const militaryCamos = Array.from({ length: 8 }, (_, index) => ({
  id: `military-${index + 1}`,
  name: `Military Camo ${index + 1}`,
  stage: 'military',
}))

// Prerequisites describe eligibility only. Reading these never changes completion.
export const completionistCamos = [
  {
    id: 'gold',
    name: 'Gold',
    stage: 'completionist',
    prerequisite: { scope: 'weapon', stages: ['military', 'special'] },
    challenges: {
      multiplayer: challenge('eliminations_in_match', 15, 'players'),
      dmz: challenge('eliminations_in_match', 100, 'enemies'),
      warzone: {
        ...challenge('kills_in_match', 8, 'players'),
        description: 'Get 8 player kills in a single match',
      },
    },
  },
  {
    id: 'platinum',
    name: 'Platinum',
    stage: 'completionist',
    prerequisite: { scope: 'category', camoId: 'gold', countRule: 'goldRequired' },
    categoryRule: 'platinum',
  },
  {
    id: 'harmonic-break',
    name: 'Harmonic Break',
    stage: 'completionist',
    prerequisite: { scope: 'arsenal', camoId: 'platinum', count: launchRequirements.weapons },
    categoryRule: 'harmonicBreak',
  },
  {
    id: 'divergence',
    name: 'Divergence',
    stage: 'completionist',
    prerequisite: { scope: 'arsenal', camoId: 'harmonic-break', count: launchRequirements.weapons },
    award: 'prerequisite',
  },
]
