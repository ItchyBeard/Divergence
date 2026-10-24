import { challenge, warzoneUnavailable } from '../../mw4/challenges'

export default {
  id: 'vel-46',
  name: 'VEL 46',
  category: 'submachine-guns',
  order: 0,
  season: 0,
  releaseDate: '2026-10-23',
  maxLevel: 59,
  maxWeaponUnlocks: 59,

  militaryUnlockLevels: [9, 15, 22, 28, 33, 40, 47, 54],
  specialCamos: [
    {
      id: 'jungle-shadow',
      name: 'Jungle Shadow',
      unlockRequirements: [{ type: 'weapon_level', level: 19 }],
      challenges: {
        multiplayer: challenge('ads_kills', 50, 'players'),

        dmz: challenge('ads_kills', 125, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'ghast',
      name: 'Ghast',
      unlockRequirements: [{ type: 'weapon_level', level: 39 }],
      challenges: {
        multiplayer: challenge('prone_kills', 20, 'players'),

        dmz: challenge('prone_kills', 100, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'gunmetal',
      name: 'Gunmetal',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 59 }],
      challenges: {
        multiplayer: challenge('headshot_kills', 20, 'players'),

        dmz: challenge('headshot_kills', 75, 'enemies'),
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
