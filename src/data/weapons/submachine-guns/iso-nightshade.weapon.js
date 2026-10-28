import { challenge, warzoneUnavailable } from '../../mw4/challenges'

export default {
  id: 'iso-nightshade',
  name: 'ISO NIGHTSHADE',
  category: 'submachine-guns',
  order: 0,
  season: 0,
  releaseDate: '2026-10-23',
  maxLevel: 63,
  maxWeaponUnlocks: 63,

  militaryUnlockLevels: [12, 19, 25, 31, 38, 44, 50, 57],
  specialCamos: [
    {
      id: 'asphalt',
      name: 'Asphalt',
      unlockRequirements: [{ type: 'weapon_level', level: 22 }],
      challenges: {
        multiplayer: challenge('ads_kills', 50, 'players'),

        dmz: challenge('ads_kills', 125, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'black-topo',
      name: 'Black Topo',
      unlockRequirements: [{ type: 'weapon_level', level: 44 }],
      challenges: {
        multiplayer: challenge('double_kills', 10, 'players'),

        dmz: challenge('double_kills', 30, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'brown',
      name: 'Brown',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 26 }],
      challenges: {
        multiplayer: challenge('kills_without_dying', 3, 'players', 15),

        dmz: challenge('kills_without_damage', 3, 'enemies', 50),
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
        { type: 'player_prestige_master_level', level: 65 },
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
