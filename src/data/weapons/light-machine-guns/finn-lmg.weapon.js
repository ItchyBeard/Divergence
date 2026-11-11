import { challenge } from '../../mw4/challenges'

export default {
  id: 'finn-lmg',
  name: 'FINN LMG',
  category: 'light-machine-guns',
  order: 0,
  season: 0,
  releaseDate: '2026-10-23',
  maxLevel: 58,
  maxWeaponUnlocks: 58,

  militaryUnlockCounts: [11, 17, 23, 30, 36, 41, 47, 52],
  specialCamos: [
    {
      id: 'desert-tactics',
      name: 'Desert Tactics',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 17 }],
      challenges: {
        multiplayer: challenge('point_blank_kills', 20, 'players'),

        dmz: challenge('point_blank_kills', 75, 'enemies'),
        warzone: {
          ...challenge('point_blank_kills', 10, 'players'),
          description: 'Get 10 point blank kills against Players',
        },
      },
    },
    {
      id: 'green-tiger',
      name: 'Green Tiger',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 37 }],
      challenges: {
        multiplayer: challenge('kills_without_reloading', 2, 'players', 10),

        dmz: challenge('kills_without_reloading', 2, 'enemies', 30),
        warzone: {
          ...challenge('kills_without_reloading', 2, 'players', 5),
          description: 'Get 2 Kills without Reloading 5 times against Players',
        },
      },
    },
    {
      id: 'thunderhead',
      name: 'Thunderhead',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 36 }],
      challenges: {
        multiplayer: challenge('longshot_kills', 30, 'players'),

        dmz: challenge('longshot_kills', 100, 'enemies'),
        warzone: challenge('longshot_kills', 15, 'players'),
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
        { type: 'player_prestige_master_level', level: 60 },
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
