import { challenge, warzoneUnavailable } from '../../mw4/challenges'

export default {
  id: 'wz-55-striga',
  name: 'WZ.55 STRIGA',
  category: 'submachine-guns',
  order: 1,
  season: 0,
  releaseDate: '2026-10-23',
  maxLevel: 59,
  maxWeaponUnlocks: 59,

  militaryUnlockLevels: [12, 18, 23, 29, 36, 41, 47, 54],
  specialCamos: [
    {
      id: 'stellation',
      name: 'Stellation',
      unlockRequirements: [{ type: 'weapon_level', level: 20 }],
      challenges: {
        multiplayer: challenge('silenced_kills', 50, 'players'),

        dmz: challenge('silenced_kills', 125, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'rattlesnake',
      name: 'Rattlesnake',
      unlockRequirements: [{ type: 'weapon_level', level: 41 }],
      challenges: {
        multiplayer: challenge('jumping_kills', 20, 'players'),

        dmz: challenge('jumping_kills', 50, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'dark-tan',
      name: 'Dark Tan',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 31 }],
      challenges: {
        multiplayer: challenge('point_blank_kills', 40, 'players'),

        dmz: challenge('point_blank_kills', 100, 'enemies'),
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
