import { challenge, warzoneUnavailable } from '../../mw4/challenges'

export default {
  id: 'mar-9',
  name: 'MAR-9',
  category: 'marksman-rifles',
  order: 1,
  season: 0,
  releaseDate: '2026-10-23',
  maxLevel: 72,
  maxWeaponUnlocks: 72,

  militaryUnlockLevels: [10, 19, 29, 38, 45, 52, 58, 69],
  specialCamos: [
    {
      id: 'mangrove',
      name: 'Mangrove',
      unlockRequirements: [{ type: 'weapon_level', level: 26 }],
      challenges: {
        multiplayer: challenge('mounted_kills', 20, 'players'),

        dmz: challenge('mounted_kills', 75, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'fungal-grid',
      name: 'Fungal Grid',
      unlockRequirements: [{ type: 'weapon_level', level: 49 }],
      challenges: {
        multiplayer: challenge('crouched_kills', 25, 'players'),

        dmz: challenge('crouched_kills', 75, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'white',
      name: 'White',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 43 }],
      challenges: {
        multiplayer: challenge('longshot_kills', 30, 'players'),

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
        { type: 'player_prestige_master_level', level: 74 },
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
