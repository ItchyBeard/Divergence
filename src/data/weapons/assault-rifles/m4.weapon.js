import { challenge, warzoneUnavailable } from '../../mw4/challenges'

export default {
  id: 'm4',
  name: 'M4',
  category: 'assault-rifles',
  order: 1,
  season: 0,
  releaseDate: '2026-10-23',
  maxLevel: 71,
  maxWeaponUnlocks: 71,

  militaryUnlockLevels: [10, 18, 26, 35, 39, 44, 51, 59],
  specialCamos: [
    {
      id: 'myriad',
      name: 'Myriad',
      unlockRequirements: [{ type: 'weapon_level', level: 26 }],
      challenges: {
        multiplayer: challenge('point_blank_kills', 20, 'players'),

        dmz: challenge('point_blank_kills', 75, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'green',
      name: 'Green',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 42 }],
      challenges: {
        multiplayer: challenge('behind_kills', 25, 'players'),

        dmz: challenge('behind_kills', 100, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'night-ops',
      name: 'Night Ops',
      unlockRequirements: [{ type: 'weapon_level', level: 51 }],
      challenges: {
        multiplayer: challenge('mounted_kills', 20, 'players'),

        dmz: challenge('mounted_kills', 75, 'enemies'),
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
