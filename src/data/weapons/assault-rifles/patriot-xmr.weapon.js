import { challenge, warzoneUnavailable } from '../../mw4/challenges'

export default {
  id: 'patriot-xmr',
  name: 'PATRIOT XMR',
  category: 'assault-rifles',
  order: 4,
  season: 0,
  releaseDate: '2026-10-23',
  maxLevel: 71,
  maxWeaponUnlocks: 71,

  militaryUnlockCounts: [10, 19, 27, 35, 42, 51, 58, 65],
  specialCamos: [
    {
      id: 'dune-sea',
      name: 'Dune Sea',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 23 }],
      challenges: {
        multiplayer: challenge('hipfire_kills', 20, 'players'),

        dmz: challenge('hipfire_kills', 75, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'scorch',
      name: 'Scorch',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 48 }],
      challenges: {
        multiplayer: challenge('silenced_kills', 50, 'players'),

        dmz: challenge('silenced_kills', 125, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'disperse',
      name: 'Disperse',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 44 }],
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
        { type: 'player_prestige_master_level', level: 73 },
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
