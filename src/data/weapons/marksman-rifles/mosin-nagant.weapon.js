import { challenge, warzoneUnavailable } from '../../mw4/challenges'

export default {
  id: 'mosin-nagant',
  name: 'MOSIN NAGANT',
  category: 'marksman-rifles',
  order: 0,
  season: 0,
  releaseDate: '2026-10-23',
  maxLevel: 69,
  maxWeaponUnlocks: 68,

  militaryUnlockLevels: [10, 17, 25, 31, 38, 47, 55, 61],
  specialCamos: [
    {
      id: 'ice-sheer',
      name: 'Ice Sheer',
      unlockRequirements: [{ type: 'weapon_level', level: 25 }],
      challenges: {
        multiplayer: challenge('headshot_kills', 25, 'players'),

        dmz: challenge('headshot_kills', 75, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'fractal-snow',
      name: 'Fractal Snow',
      unlockRequirements: [{ type: 'weapon_level', level: 47 }],
      challenges: {
        multiplayer: challenge('kills_without_reloading', 2, 'players', 10),

        dmz: challenge('kills_without_reloading', 2, 'enemies', 30),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'sticker-shock',
      name: 'Sticker Shock',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 37 }],
      challenges: {
        multiplayer: challenge('focused_kills', 100, 'players'),

        dmz: challenge('focused_kills', 250, 'enemies'),
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
        { type: 'player_prestige_master_level', level: 70 },
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
