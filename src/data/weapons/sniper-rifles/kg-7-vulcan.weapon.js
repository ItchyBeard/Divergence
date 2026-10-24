import { challenge, unavailable, warzoneUnavailable } from '../../mw4/challenges'

export default {
  id: 'kg-7-vulcan',
  name: 'KG-7 VULCAN',
  category: 'sniper-rifles',
  order: 1,
  season: 0,
  releaseDate: '2026-10-23',
  maxLevel: 74,
  maxWeaponUnlocks: 74,

  militaryUnlockLevels: [13, 22, 31, 38, 47, 54, 61, 69],
  specialCamos: [
    {
      id: 'treeline',
      name: 'Treeline',
      unlockRequirements: [{ type: 'weapon_level', level: 22 }],
      challenges: {
        multiplayer: challenge('hipfire_kills', 10, 'players'),

        dmz: unavailable('Requirement pending: challenge threshold needs confirmation.'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'spidersilk',
      name: 'Spidersilk',
      unlockRequirements: [{ type: 'weapon_level', level: 47 }],
      challenges: {
        multiplayer: challenge('headshot_kills', 20, 'players'),

        dmz: challenge('focused_kills', 75, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'tension',
      name: 'Tension',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 46 }],
      challenges: {
        multiplayer: challenge('kills_without_damage', 2, 'players', 20),

        dmz: challenge('kills_without_damage', 2, 'enemies', 30),
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
        { type: 'player_prestige_master_level', level: 76 },
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
