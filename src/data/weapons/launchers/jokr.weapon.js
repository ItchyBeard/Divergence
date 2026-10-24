import { challenge, warzoneUnavailable } from '../../mw4/challenges'

export default {
  id: 'jokr',
  name: 'JOKR',
  category: 'launchers',
  order: 0,
  season: 0,
  releaseDate: '2026-10-23',
  maxLevel: 46,

  militaryUnlockLevels: [6, 11, 16, 21, 26, 31, 36, 41],
  specialCamos: [
    {
      id: 'thicket',
      name: 'Thicket',
      unlockRequirements: [{ type: 'weapon_level', level: 16 }],
      challenges: {
        multiplayer: challenge('double_kills', 5, 'players'),

        dmz: challenge('double_kills', 15, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'tectonic',
      name: 'Tectonic',
      unlockRequirements: [{ type: 'weapon_level', level: 31 }],
      challenges: {
        multiplayer: challenge('longshot_kills', 10, 'players'),

        dmz: challenge('longshot_kills', 25, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'blue-tiger',
      name: 'Blue Tiger',
      unlockRequirements: [{ type: 'weapon_level', level: 46 }],
      challenges: {
        multiplayer: challenge('killstreaks_or_vehicles_destroyed', 30, 'equipment'),

        dmz: challenge('killstreaks_or_vehicles_destroyed', 50, 'equipment'),
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
