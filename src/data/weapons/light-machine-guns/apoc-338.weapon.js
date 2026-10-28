import { challenge, warzoneUnavailable } from '../../mw4/challenges'

export default {
  id: 'apoc-338',
  name: 'APOC 338',
  category: 'light-machine-guns',
  order: 2,
  season: 0,
  releaseDate: '2026-10-23',
  maxLevel: 56,
  maxWeaponUnlocks: 55,

  militaryUnlockLevels: [9, 15, 22, 26, 33, 40, 44, 51],
  specialCamos: [
    {
      id: 'phantom-flux',
      name: 'Phantom Flux',
      unlockRequirements: [{ type: 'weapon_level', level: 15 }],
      challenges: {
        multiplayer: challenge('hipfire_kills', 20, 'players'),

        dmz: challenge('hipfire_kills', 75, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'mineral',
      name: 'Mineral',
      unlockRequirements: [{ type: 'weapon_level', level: 36 }],
      challenges: {
        multiplayer: challenge('longshot_kills', 20, 'players'),

        dmz: challenge('longshot_kills', 75, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'tiger-swipe',
      name: 'Tiger Swipe',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 34 }],
      challenges: {
        multiplayer: challenge('prone_kills', 100, 'players'),

        dmz: challenge('prone_kills', 250, 'enemies'),
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
        { type: 'player_prestige_master_level', level: 57 },
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
