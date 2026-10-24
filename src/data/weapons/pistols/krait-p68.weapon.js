import { challenge, warzoneUnavailable } from '../../mw4/challenges'

export default {
  id: 'krait-p68',
  name: 'KRAIT P68',
  category: 'pistols',
  order: 1,
  season: 0,
  releaseDate: '2026-10-23',
  maxLevel: 37,
  maxWeaponUnlocks: 37,

  militaryUnlockLevels: [10, 14, 18, 22, 25, 28, 32, 35],
  specialCamos: [
    {
      id: 'off-grid',
      name: 'Off Grid',
      unlockRequirements: [{ type: 'weapon_level', level: 13 }],
      challenges: {
        multiplayer: challenge('ledge_hanging_kills', 15, 'players'),

        dmz: challenge('ledge_hanging_kills', 50, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'urban-flamingo',
      name: 'Urban Flamingo',
      unlockRequirements: [{ type: 'weapon_level', level: 25 }],
      challenges: {
        multiplayer: challenge('point_blank_kills', 15, 'players'),

        dmz: challenge('point_blank_kills', 50, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'smokescreen',
      name: 'Smokescreen',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 34 }],
      challenges: {
        multiplayer: challenge('silenced_kills', 50, 'players'),

        dmz: challenge('silenced_kills', 125, 'enemies'),
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
