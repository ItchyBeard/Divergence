import { challenge, warzoneUnavailable } from '../../mw4/challenges'

export default {
  id: 'pm-40-anvil',
  name: 'PM-40 ANVIL',
  category: 'launchers',
  order: 2,
  season: 0,
  releaseDate: '2026-10-23',
  maxLevel: 46,

  militaryUnlockLevels: [6, 11, 16, 21, 26, 31, 36, 41],
  specialCamos: [
    {
      id: 'night-snow',
      name: 'Night Snow',
      unlockRequirements: [{ type: 'weapon_level', level: 16 }],
      challenges: {
        multiplayer: challenge('direct_shot_kills', 25, 'players'),

        dmz: challenge('direct_shot_kills', 25, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'recursive',
      name: 'Recursive',
      unlockRequirements: [{ type: 'weapon_level', level: 31 }],
      challenges: {
        multiplayer: challenge('kills_without_reloading', 2, 'players', 5),

        dmz: challenge('kills_without_reloading', 2, 'enemies', 20),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'urban-standard',
      name: 'Urban Standard',
      unlockRequirements: [{ type: 'weapon_level', level: 46 }],
      challenges: {
        multiplayer: challenge('moving_kills', 40, 'players'),

        dmz: challenge('moving_kills', 100, 'enemies'),
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
        { type: 'player_prestige_master_level', level: 47 },
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
