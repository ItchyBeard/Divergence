import { challenge, warzoneUnavailable } from '../../mw4/challenges'

export default {
  id: 'rezi-12',
  name: 'REZI 12',
  category: 'shotguns',
  order: 1,
  season: 0,
  releaseDate: '2026-10-23',
  maxLevel: 59,
  maxWeaponUnlocks: 59,

  militaryUnlockLevels: [11, 18, 26, 30, 38, 42, 47, 54],
  specialCamos: [
    {
      id: 'struck-oil',
      name: 'Struck Oil',
      unlockRequirements: [{ type: 'weapon_level', level: 22 }],
      challenges: {
        multiplayer: challenge('point_blank_kills', 20, 'players'),

        dmz: challenge('point_blank_kills', 75, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'brushstroke',
      name: 'Brushstroke',
      unlockRequirements: [{ type: 'weapon_level', level: 42 }],
      challenges: {
        multiplayer: challenge('longshot_kills', 10, 'players'),

        dmz: challenge('longshot_kills', 50, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'white-pine',
      name: 'White Pine',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 22 }],
      challenges: {
        multiplayer: challenge('jumping_kills', 40, 'players'),

        dmz: challenge('jumping_kills', 100, 'enemies'),
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
        { type: 'player_prestige_master_level', level: 61 },
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
