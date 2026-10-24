import { challenge, warzoneUnavailable } from '../../mw4/challenges'

export default {
  id: 'ppsh-41',
  name: 'PPSH-41',
  category: 'submachine-guns',
  order: 3,
  season: 0,
  releaseDate: '2026-10-23',
  maxLevel: 61,
  maxWeaponUnlocks: 61,

  militaryUnlockLevels: [11, 17, 23, 31, 38, 44, 51, 57],
  specialCamos: [
    {
      id: 'blackwell',
      name: 'Blackwell',
      unlockRequirements: [{ type: 'weapon_level', level: 20 }],
      challenges: {
        multiplayer: challenge('double_kills', 10, 'players'),

        dmz: challenge('double_kills', 30, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'iron',
      name: 'Iron',
      unlockRequirements: [{ type: 'weapon_level', level: 41 }],
      challenges: {
        multiplayer: challenge('longshot_kills', 20, 'players'),

        dmz: challenge('longshot_kills', 75, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'currents',
      name: 'Currents',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 30 }],
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
        { type: 'player_prestige_master_level', level: 63 },
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
