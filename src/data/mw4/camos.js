import { challenge, warzoneUnavailable } from './challenges'

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
      warzone: warzoneUnavailable(),
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
    prerequisite: { scope: 'arsenal', camoId: 'platinum', count: 33 },
    categoryRule: 'harmonicBreak',
  },
  {
    id: 'divergence',
    name: 'Divergence',
    stage: 'completionist',
    prerequisite: { scope: 'arsenal', camoId: 'harmonic-break', count: 33 },
    award: 'prerequisite',
  },
]
