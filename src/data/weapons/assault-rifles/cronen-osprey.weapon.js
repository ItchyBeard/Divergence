import { challenge, unavailable } from '../../mw4/challenges'

const pendingReason = 'Requirement pending. Camo progression details not published.'

export default {
  id: 'cronen-osprey',
  name: 'CRONEN OSPREY',
  category: 'assault-rifles',
  season: 1,
  releaseDate: '2026-11-06',
  maxLevel: 999,
  order: 8,
  militaryUnlockCounts: [6, 10, 12, 16, 19, 22, 24, 27],
  specialCamos: [
    ['In The Weeds', 'in-the-weeds.png', 12, challenge('hipfire_kills', 20, 'players')],
    ['Dark Ichor', 'dark-ichor.png', 23, challenge('ads_kills', 50, 'players')],
    ['Chained', 'chained.png', 29, challenge('kills_without_reloading', 2, 'players', 25)],
  ].map(([name, image, count, multiplayer], index) => ({
    id: `special-${index + 1}`,
    name,
    image,
    unlockRequirements: [{ type: 'weapon_unlocks', count }],
    challenges: {
      multiplayer,
      dmz: unavailable(pendingReason),
      warzone: unavailable(pendingReason),
    },
  })),
  prestigeCamos: ['pyroclast', 'pyroclast-terminus', 'pyroclast-scatter', 'pyroclast-cascade'].map(
    (id) => ({
      id,
      requirements: [{ type: 'unavailable', reason: pendingReason }],
    })
  ),
  exceptions: {
    challengeOverrides: [],
    notes: [],
  },
}
