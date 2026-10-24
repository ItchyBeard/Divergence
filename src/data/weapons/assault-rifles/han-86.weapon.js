import { challenge, warzoneUnavailable } from '../../mw4/challenges'

export default {
  id: 'han-86',
  name: 'HAN 86',
  category: 'assault-rifles',

  season: 0,
  releaseDate: '2026-10-23',
  maxLevel: 72,
  maxWeaponUnlocks: 71,
  order: 0,

  militaryUnlockLevels: [10, 18, 25, 34, 42, 50, 57, 65],

  specialCamos: [
    {
      id: 'smoke',
      name: 'Smoke',
      unlockRequirements: [{ type: 'weapon_level', level: 25 }],

      challenges: {
        multiplayer: challenge('mounted_kills', 20, 'players'),
        dmz: challenge('mounted_kills', 75, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },

    {
      id: 'stormwave',
      name: 'Stormwave',
      unlockRequirements: [{ type: 'weapon_level', level: 46 }],

      challenges: {
        multiplayer: challenge('silenced_kills', 50, 'players'),
        dmz: challenge('silenced_kills', 125, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },

    {
      id: 'red',
      name: 'Red',
      unlockRequirements: [{ type: 'weapon_level', level: 72 }],

      challenges: {
        multiplayer: challenge('kills_without_dying', 3, 'players', 15),
        dmz: challenge('kills_without_damage', 3, 'enemies', 50),
        warzone: warzoneUnavailable(),
      },
    },
  ],

  prestigeCamos: [
    { id: 'pyroclast', requirements: [{ type: 'weapon_prestige', required: true }] },
    {
      id: 'pyroclast-terminus',
      requirements: [
        { type: 'weapon_prestige', required: true },
        { type: 'player_prestige_master_level', level: 73 },
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
