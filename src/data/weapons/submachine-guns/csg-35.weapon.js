import { challenge, unavailable } from '../../mw4/challenges'

const pendingReason = 'Requirement pending. Camo progression details not published.'

export default {
  id: 'csg-35',
  name: 'CSG-35',
  category: 'submachine-guns',
  season: 1,
  releaseDate: '2026-11-06',
  maxLevel: 999,
  order: 5,
  militaryUnlockCounts: [8, 10, 14, 16, 18, 22, 25, 28],
  specialCamos: [
    ['Polyhedron', 'polyhedron.png', 11, challenge('kills_without_dying', 3, 'players', 20)],
    ['Rind', 'rind.png', 20, challenge('silenced_kills', 50, 'players')],
    ['Black Grip', 'black-grip.png', 31, challenge('kills_while_moving', 50, 'players')],
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
