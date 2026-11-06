import { challenge, warzoneUnavailable } from '../../mw4/challenges'

export default {
  id: 'x-58-nyx',
  name: 'X-58 NYX',
  category: 'submachine-guns',
  order: 4,
  season: 0,
  releaseDate: '2026-10-23',
  maxLevel: 53,
  maxWeaponUnlocks: 52,

  militaryUnlockCounts: [8, 14, 19, 24, 28, 34, 41, 46],
  specialCamos: [
    {
      id: 'sniper-veil',
      name: 'Sniper Veil',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 16 }],
      challenges: {
        multiplayer: challenge('moving_kills', 20, 'players'),

        dmz: challenge('moving_kills', 75, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'carbonated',
      name: 'Carbonated',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 34 }],
      challenges: {
        multiplayer: challenge('longshot_kills', 20, 'players'),

        dmz: challenge('longshot_kills', 75, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'lime',
      name: 'Lime',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 23 }],
      challenges: {
        multiplayer: challenge('headshot_kills', 40, 'players'),

        dmz: challenge('longshot_kills', 100, 'enemies'),
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
        { type: 'player_prestige_master_level', level: 54 },
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
