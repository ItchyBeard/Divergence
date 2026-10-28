import { challenge, warzoneUnavailable } from '../../mw4/challenges'

export default {
  id: 'warlord',
  name: 'WARLORD',
  category: 'shotguns',
  order: 1,
  season: 0,
  releaseDate: '2026-10-23',
  maxLevel: 60,
  maxWeaponUnlocks: 59,

  militaryUnlockLevels: [13, 19, 25, 30, 37, 43, 49, 55],
  specialCamos: [
    {
      id: 'redshift',
      name: 'Redshift',
      unlockRequirements: [{ type: 'weapon_level', level: 21 }],
      challenges: {
        multiplayer: challenge('moving_kills', 20, 'players'),

        dmz: challenge('moving_kills', 75, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'corrupted-clay',
      name: 'Corrupted Clay',
      unlockRequirements: [{ type: 'weapon_level', level: 41 }],
      challenges: {
        multiplayer: challenge('double_kills', 10, 'players'),

        dmz: challenge('double_kills', 30, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'magma-ire',
      name: 'Magma Ire',
      unlockRequirements: [{ type: 'weapon_level', level: 60 }],
      challenges: {
        multiplayer: challenge('prone_kills', 50, 'players'),

        dmz: challenge('prone_kills', 125, 'enemies'),
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
