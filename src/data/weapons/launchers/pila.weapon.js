import { challenge, warzoneUnavailable } from '../../mw4/challenges'

export default {
  id: 'pila',
  name: 'PILA',
  category: 'launchers',
  order: 1,
  season: 0,
  releaseDate: '2026-10-23',
  maxLevel: 46,

  militaryUnlockLevels: [6, 11, 16, 21, 26, 31, 36, 41],
  specialCamos: [
    {
      id: 'frontier',
      name: 'Frontier',
      unlockRequirements: [{ type: 'weapon_level', level: 16 }],
      challenges: {
        multiplayer: challenge('direct_shot_kills', 10, 'players'),

        dmz: challenge('direct_shot_kills', 25, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'sandwash',
      name: 'Sandwash',
      unlockRequirements: [{ type: 'weapon_level', level: 31 }],
      challenges: {
        multiplayer: challenge('double_kills', 5, 'players'),

        dmz: challenge('double_kills', 100, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'digital-fall',
      name: 'Digital Fall',
      unlockRequirements: [{ type: 'weapon_level', level: 46 }],
      challenges: {
        multiplayer: challenge('killstreaks_or_vehicles_destroyed', 30, 'equipment'),

        dmz: challenge('killstreaks_or_vehicles_destroyed', 50, 'equipment'),
        warzone: warzoneUnavailable(),
      },
    },
  ],
  prestigeCamos: [
    {
      id: 'pyroclast',
      requirements: [{ type: 'weapon_prestige', required: true }],
    },
    {
      id: 'pyroclast-terminus',
      requirements: [
        { type: 'weapon_prestige', required: true },
        { type: 'player_prestige_master_level', level: 47 },
      ],
    },
    {
      id: 'pyroclast-scatter',
      requirements: [
        { type: 'weapon_prestige', required: true },
        { type: 'player_prestige_master_level', level: 150 },
      ],
    },
    {
      id: 'pyroclast-cascade',
      requirements: [
        { type: 'weapon_prestige', required: true },
        { type: 'player_prestige_master_level', level: 250 },
      ],
    },
  ],
  exceptions: { challengeOverrides: [], notes: [] },
}
