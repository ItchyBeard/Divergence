import { challenge, warzoneUnavailable } from '../../mw4/challenges'

export default {
  id: 'signal-50',
  name: 'SIGNAL 50',
  category: 'sniper-rifles',
  order: 2,
  season: 0,
  releaseDate: '2026-10-23',
  maxLevel: 73,
  maxWeaponUnlocks: 73,

  militaryUnlockLevels: [10, 18, 28, 35, 43, 52, 57, 67],
  specialCamos: [
    {
      id: 'anaconda',
      name: 'Anaconda',
      unlockRequirements: [{ type: 'weapon_level', level: 28 }],
      challenges: {
        multiplayer: {
          ...challenge('rapid_kills', 2, 'players', 10),
          description: 'Get 2 Player Kills within 5 Seconds 10 times',
        },

        dmz: {
          ...challenge('rapid_kills', 2, 'enemies', 25),
          description: 'Get 2 Kills within 5 Seconds 25 times',
        },
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'ripplewave',
      name: 'Ripplewave',
      unlockRequirements: [{ type: 'weapon_level', level: 52 }],
      challenges: {
        multiplayer: challenge('quickscope_kills', 20, 'players'),

        dmz: challenge('quickscope_kills', 30, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'sunburn',
      name: 'Sunburn',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 43 }],
      challenges: {
        multiplayer: challenge('longshot_kills', 40, 'players'),

        dmz: challenge('one_shot_kills', 100, 'enemies'),
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
        { type: 'player_prestige_master_level', level: 75 },
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
