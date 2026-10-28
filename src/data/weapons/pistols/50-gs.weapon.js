import { challenge, warzoneUnavailable } from '../../mw4/challenges'

export default {
  id: '50-gs',
  name: '.50 GS',
  category: 'pistols',
  order: 2,
  season: 0,
  releaseDate: '2026-10-23',
  maxLevel: 36,
  maxWeaponUnlocks: 36,

  militaryUnlockCounts: [6, 9, 11, 14, 17, 21, 25, 28],
  specialCamos: [
    {
      id: 'frosted',
      name: 'Frosted',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 10 }],
      challenges: {
        multiplayer: challenge('headshot_kills', 20, 'players'),

        dmz: challenge('headshot_kills', 75, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'splatter-ops',
      name: 'Splatter Ops',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 21 }],
      challenges: {
        multiplayer: challenge('double_kills', 7, 'players'),

        dmz: challenge('double_kills', 20, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'red-tiger',
      name: 'Red Tiger',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 32 }],
      challenges: {
        multiplayer: challenge('point_blank_kills', 30, 'players'),

        dmz: challenge('point_blank_kills', 75, 'enemies'),
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
        { type: 'player_prestige_master_level', level: 38 },
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
