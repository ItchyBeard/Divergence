import { challenge, warzoneUnavailable } from '../../mw4/challenges'

export default {
  id: 'cronen-squall',
  name: 'CRONEN SQUALL',
  category: 'assault-rifles',
  order: 7,
  season: 0,
  releaseDate: '2026-10-23',
  maxLevel: 67,
  maxWeaponUnlocks: 66,

  militaryUnlockCounts: [9, 16, 23, 30, 38, 44, 53, 59],
  specialCamos: [
    {
      id: 'oni',
      name: 'Oni',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 23 }],
      challenges: {
        multiplayer: challenge('point_blank_kills', 20, 'players'),

        dmz: challenge('point_blank_kills', 75, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'urban-smoke',
      name: 'Urban Smoke',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 44 }],
      challenges: {
        multiplayer: challenge('mounted_kills', 20, 'players'),

        dmz: challenge('mounted_kills', 75, 'enemies'),
        warzone: warzoneUnavailable(),
      },
    },
    {
      id: 'optical-reverb',
      name: 'Optical Reverb',
      unlockRequirements: [{ type: 'weapon_unlocks', count: 66 }],
      challenges: {
        multiplayer: challenge('kills_without_dying', 3, 'players', 15),

        dmz: challenge('ads_kills', 50, 'enemies'),
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
        { type: 'player_prestige_master_level', level: 68 },
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
