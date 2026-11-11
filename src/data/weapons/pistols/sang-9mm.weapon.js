import { challenge } from '../../mw4/challenges'

export default {
  id: 'sang-9mm',
  name: 'SANG 9MM',
  category: 'pistols',
  order: 0,
  season: 0,
  releaseDate: '2026-10-23',
  maxLevel: 37,
  maxWeaponUnlocks: 37,

  militaryUnlockCounts: [8, 12, 16, 20, 24, 27, 30, 34],
  specialCamos: [
    {
      id: 'autumn',
      name: 'Autumn',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 12 }],
      challenges: {
        multiplayer: challenge('ads_kills', 25, 'players'),

        dmz: challenge('ads_kills', 75, 'enemies'),
        warzone: challenge('ads_kills', 15, 'players'),
      },
    },
    {
      id: 'snakeskin',
      name: 'Snakeskin',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 24 }],
      challenges: {
        multiplayer: challenge('kills_without_dying', 3, 'players', 5),

        dmz: challenge('kills_without_damage', 3, 'enemies', 15),
        warzone: challenge('kills_without_dying', 3, 'players', 3),
      },
    },
    {
      id: 'space-time',
      name: 'Space Time',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 34 }],
      challenges: {
        multiplayer: challenge('akimbo_kills', 50, 'players'),

        dmz: challenge('akimbo_kills', 125, 'enemies'),
        warzone: challenge('akimbo_kills', 25, 'players'),
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
        { type: 'player_prestige_master_level', level: 39 },
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
