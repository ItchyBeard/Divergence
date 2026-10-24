import { challenge, warzoneUnavailable } from '../../mw4/challenges'

export default {
  id: 'kastov-762',
  name: 'KASTOV 762',
  category: 'assault-rifles',
  order: 5,
  season: 0,
  releaseDate: '2026-10-23',
  maxLevel: 67,
  maxWeaponUnlocks: 67,

  militaryUnlockLevels: [10, 19, 27, 37, 45, 54, 61, 67],
  specialCamos: [
    {
      id: 'samnim',
      name: 'Samnim',
      unlockRequirements: [{ type: 'weapon_level', level: 23 }],
      challenges: {
        multiplayer: challenge('kills_without_dying', 4, 'players', 10),

        dmz: challenge('kills_without_damage', 5, 'enemies', 25),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'raster-aux',
      name: 'Raster Aux',
      unlockRequirements: [{ type: 'weapon_level', level: 48 }],
      challenges: {
        multiplayer: challenge('longshot_kills', 20, 'players'),

        dmz: challenge('longshot_kills', 75, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'yellow',
      name: 'Yellow',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 25 }],
      challenges: {
        multiplayer: challenge('hipfire_kills', 30, 'players'),

        dmz: challenge('hipfire_kills', 100, 'enemies'),
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
        { type: 'player_prestige_master_level', level: 69 },
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
