import { challenge, warzoneUnavailable } from '../../mw4/challenges'

export default {
  id: 'hyeon-burst',
  name: 'HYEON BURST',
  category: 'assault-rifles',
  order: 2,
  season: 0,
  releaseDate: '2026-10-23',
  maxLevel: 67,
  maxWeaponUnlocks: 67,

  militaryUnlockCounts: [9, 16, 25, 31, 39, 48, 54, 61],
  specialCamos: [
    {
      id: 'ponderosa',
      name: 'Ponderosa',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 22 }],
      challenges: {
        multiplayer: challenge('kills_without_reloading', 2, 'players', 10),

        dmz: challenge('kills_without_reloading', 2, 'enemies', 30),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'red-rain',
      name: 'Red Rain',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 45 }],
      challenges: {
        multiplayer: challenge('longshot_kills', 20, 'players'),

        dmz: challenge('longshot_kills', 75, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'kitty-kaos',
      name: 'Kitty Kaos',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 39 }],
      challenges: {
        multiplayer: challenge('silenced_kills', 100, 'players'),

        dmz: challenge('silenced_kills', 250, 'enemies'),
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
        { type: 'player_prestige_master_level', level: 69 },
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
