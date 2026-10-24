import { challenge, warzoneUnavailable } from '../../mw4/challenges'

export default {
  id: 'astaroth-57',
  name: 'ASTAROTH .57',
  category: 'sniper-rifles',
  order: 2,
  season: 0,
  releaseDate: '2026-10-23',
  maxLevel: 53,
  maxWeaponUnlocks: 53,

  militaryUnlockLevels: [10, 15, 20, 26, 32, 37, 42, 48],
  specialCamos: [
    {
      id: 'dry-brush',
      name: 'Dry Brush',
      unlockRequirements: [{ type: 'weapon_level', level: 20 }],
      challenges: {
        multiplayer: challenge('kills_without_dying', 3, 'players', 10),

        dmz: challenge('kills_without_damage', 3, 'enemies', 25),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'backcountry',
      name: 'Backcountry',
      unlockRequirements: [{ type: 'weapon_level', level: 37 }],
      challenges: {
        multiplayer: challenge('mounted_kills', 20, 'players'),

        dmz: challenge('mounted_kills', 75, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'dread-plague',
      name: 'Dread Plague',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 42 }],
      challenges: {
        multiplayer: {
          ...challenge('rapid_kills', 2, 'players', 20),
          description: 'Get 2 Player Kills within 5 Seconds 20 times',
        },

        dmz: {
          ...challenge('rapid_kills', 2, 'enemies', 50),
          description: 'Get 2 Enemy Kills within 5 Seconds 50 times',
        },
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
        { type: 'player_prestige_master_level', level: 55 },
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
