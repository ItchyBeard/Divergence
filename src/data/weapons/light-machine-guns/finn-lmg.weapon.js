import { challenge, warzoneUnavailable } from '../../mw4/challenges'

export default {
  id: 'finn-lmg',
  name: 'FINN LMG',
  category: 'light-machine-guns',
  order: 0,
  season: 0,
  releaseDate: '2026-10-23',
  maxLevel: 58,
  maxWeaponUnlocks: 58,

  militaryUnlockLevels: [12, 18, 24, 31, 37, 42, 48, 53],
  specialCamos: [
    {
      id: 'desert-tactics',
      name: 'Desert Tactics',
      unlockRequirements: [{ type: 'weapon_level', level: 18 }],
      challenges: {
        multiplayer: challenge('point_blank_kills', 20, 'players'),

        dmz: challenge('point_blank_kills', 75, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'green-tiger',
      name: 'Green Tiger',
      unlockRequirements: [{ type: 'weapon_level', level: 38 }],
      challenges: {
        multiplayer: challenge('kills_without_reloading', 2, 'players', 10),

        dmz: challenge('kills_without_reloading', 2, 'enemies', 30),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'thunderhead',
      name: 'Thunderhead',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 36 }],
      challenges: {
        multiplayer: challenge('longshot_kills', 30, 'players'),

        dmz: challenge('longshot_kills', 100, 'enemies'),
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
