import { challenge, warzoneUnavailable } from '../../mw4/challenges'

export default {
  id: 'type-73',
  name: 'TYPE 73',
  category: 'light-machine-guns',
  order: 1,
  season: 0,
  releaseDate: '2026-10-23',
  maxLevel: 64,
  maxWeaponUnlocks: 64,

  militaryUnlockLevels: [12, 19, 26, 34, 41, 48, 55, 61],
  specialCamos: [
    {
      id: 'ash-pine',
      name: 'Ash Pine',
      unlockRequirements: [{ type: 'weapon_level', level: 23 }],
      challenges: {
        multiplayer: challenge('mounted_kills', 20, 'players'),

        dmz: challenge('mounted_kills', 75, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'mineral',
      name: 'Outcrop',
      image: 'outcrop.png',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 23 }],
      challenges: {
        multiplayer: challenge('double_kills', 10, 'players'),

        dmz: challenge('double_kills', 30, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'tiger-swipe',
      name: 'Foxtrail',
      image: 'foxtrail.png',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 34 }],
      challenges: {
        multiplayer: challenge('headshot_kills', 40, 'players'),

        dmz: challenge('headshot_kills', 100, 'enemies'),
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
        { type: 'player_prestige_master_level', level: 66 },
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
