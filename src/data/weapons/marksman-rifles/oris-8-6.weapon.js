import { challenge, warzoneUnavailable } from '../../mw4/challenges'

export default {
  id: 'oris-8-6',
  name: 'ORIS 8.6',
  category: 'marksman-rifles',
  order: 1,
  season: 0,
  releaseDate: '2026-10-23',
  maxLevel: 69,
  maxWeaponUnlocks: 69,

  militaryUnlockLevels: [11, 18, 27, 33, 42, 49, 55, 61],
  specialCamos: [
    {
      id: 'hibiscus',
      name: 'Hibiscus',
      unlockRequirements: [{ type: 'weapon_level', level: 27 }],
      challenges: {
        multiplayer: challenge('quickscope_kills', 10, 'players'),

        dmz: challenge('quickscope_kills', 50, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'fire-topo',
      name: 'Fire Topo',
      unlockRequirements: [{ type: 'weapon_level', level: 49 }],
      challenges: {
        multiplayer: challenge('double_kills', 20, 'players'),

        dmz: challenge('double_kills', 50, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'deep-space',
      name: 'Deep Space',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 37 }],
      challenges: {
        multiplayer: challenge('kills_without_dying', 3, 'players', 15),

        dmz: challenge('kills_without_damage', 3, 'enemies', 50),
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
        { type: 'player_prestige_master_level', level: 71 },
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
