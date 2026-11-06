import { challenge, warzoneUnavailable } from '../../mw4/challenges'

export default {
  id: 'oden',
  name: 'ODEN',
  category: 'assault-rifles',
  order: 5,
  season: 0,
  releaseDate: '2026-10-23',
  maxLevel: 65,
  maxWeaponUnlocks: 64,

  militaryUnlockCounts: [11, 20, 24, 32, 38, 45, 52, 58],
  specialCamos: [
    {
      id: 'dark-moss',
      name: 'Dark Moss',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 24 }],
      challenges: {
        multiplayer: {
          ...challenge('grenade_launcher_kills', 25, 'players'),
          description: 'Get 25 Player Kills with the Miri 40MM Grenade Launcher',
        },

        dmz: {
          ...challenge('grenade_launcher_kills', 75, 'enemies'),
          description: 'Get 75 Enemy Kills with the Miri 40MM Grenade Launcher',
        },
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'shale',
      name: 'Shale',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 43 }],
      challenges: {
        multiplayer: challenge('kills_without_reloading', 2, 'players', 10),

        dmz: challenge('kills_without_reloading', 2, 'enemies', 30),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'hot-rod',
      name: 'Hot Rod',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 64 }],
      challenges: {
        multiplayer: challenge('ads_kills', 100, 'players'),

        dmz: challenge('ads_kills', 250, 'enemies'),
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
        { type: 'player_prestige_master_level', level: 66 },
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
