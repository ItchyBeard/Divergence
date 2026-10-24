import { challenge, warzoneUnavailable } from '../../mw4/challenges'

export default {
  id: 'fss-carbon-edge-1095',
  name: 'FSS CARBON EDGE 1095',
  category: 'melee',
  order: 0,
  season: 0,
  releaseDate: '2026-10-23',
  maxLevel: 46,

  militaryUnlockLevels: [6, 11, 16, 21, 26, 31, 36, 41],
  specialCamos: [
    {
      id: 'raster-lite',
      name: 'Raster Lite',
      unlockRequirements: [{ type: 'weapon_level', level: 16 }],
      challenges: {
        multiplayer: challenge('jumping_kills', 25, 'players'),

        dmz: challenge('jumping_kills', 100, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'stockpile',
      name: 'Stockpile',
      unlockRequirements: [{ type: 'weapon_level', level: 31 }],
      challenges: {
        multiplayer: challenge('heavy_melee_finisher_kills', 25, 'enemies'),

        dmz: challenge('heavy_melee_finisher_kills', 75, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'deathbed',
      name: 'Deathbed',
      unlockRequirements: [{ type: 'weapon_level', level: 46 }],
      challenges: {
        multiplayer: challenge('rapid_kills', 2, 'enemies', 25),

        dmz: {
          ...challenge('rapid_kills', 2, 'enemies', 50),
          description: 'Get 2 Kills in 5 seconds against Enemies 50 times',
        },
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
