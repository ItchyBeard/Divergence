import { challenge, warzoneUnavailable } from '../../mw4/challenges'

export default {
  id: 'mojave-357',
  name: 'MOJAVE .357',
  category: 'pistols',
  order: 2,
  season: 0,
  releaseDate: '2026-10-23',
  maxLevel: 43,
  maxWeaponUnlocks: 43,

  militaryUnlockLevels: [9, 13, 18, 22, 26, 30, 35, 40],
  specialCamos: [
    {
      id: 'miami',
      name: 'Miami',
      unlockRequirements: [{ type: 'weapon_level', level: 16 }],
      challenges: {
        multiplayer: challenge('headshot_kills', 20, 'players'),

        dmz: challenge('one_shot_kills', 50, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'wallpaper',
      name: 'Wallpaper',
      unlockRequirements: [{ type: 'weapon_level', level: 30 }],
      challenges: {
        multiplayer: challenge('kills_without_reloading', 2, 'players', 10),

        dmz: challenge('kills_without_reloading', 2, 'enemies', 20),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'garland',
      name: 'Garland',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 31 }],
      challenges: {
        multiplayer: challenge('point_blank_kills', 30, 'players'),

        dmz: challenge('point_blank_kills', 75, 'enemies'),
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
        { type: 'player_prestige_master_level', level: 45 },
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
