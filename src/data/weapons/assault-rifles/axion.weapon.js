import { challenge, warzoneUnavailable } from '../../mw4/challenges'

export default {
  id: 'axion',
  name: 'AXION',
  category: 'assault-rifles',
  order: 1,
  season: 0,
  releaseDate: '2026-10-23',
  maxLevel: 68,
  maxWeaponUnlocks: 68,

  militaryUnlockLevels: [10, 19, 26, 34, 41, 48, 55, 62],
  specialCamos: [
    {
      id: 'splinter-rock',
      name: 'Splinter Rock',
      unlockRequirements: [{ type: 'weapon_level', level: 23 }],
      challenges: {
        multiplayer: challenge('longshot_kills', 20, 'players'),

        dmz: challenge('longshot_kills', 75, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'sunset-tropic',
      name: 'Sunset Tropic',
      unlockRequirements: [{ type: 'weapon_level', level: 45 }],
      challenges: {
        multiplayer: {
          ...challenge('grenade_launcher_kills', 25, 'players'),
          description: 'Get 25 Player Kills with the Miri 40mm Grenade Launcher',
        },

        dmz: {
          ...challenge('grenade_launcher_kills', 75, 'enemies'),
          description: 'Get 75 Enemy Kills with the Miri 40mm Grenade Launcher',
        },
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'cyan',
      name: 'Cyan',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 34 }],
      challenges: {
        multiplayer: challenge('kills_without_reloading', 2, 'players', 25),

        dmz: challenge('kills_without_reloading', 2, 'enemies', 50),
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
        { type: 'player_prestige_master_level', level: 70 },
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
