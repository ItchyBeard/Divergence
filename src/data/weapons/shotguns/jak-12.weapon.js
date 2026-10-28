import { unavailable } from '../../mw4/challenges'
import { completionistCamos } from '../../mw4/camos'
import { modeIds } from '../../mw4/modes'

const pendingReason = 'Requirement pending. Camo progression details not published.'

export default {
  id: 'jak-12',
  name: 'JAK 12',
  category: 'shotguns',
  season: 1,
  releaseDate: null,
  maxLevel: 999,
  order: 2,
  militaryUnlockLevels: null,
  specialCamos: [1, 2, 3].map((slot) => ({
    id: `special-${slot}`,
    name: `Special Camo ${slot} (pending)`,
    unlockRequirements: [{ type: 'unavailable', reason: pendingReason }],
    challenges: Object.fromEntries(modeIds.map((mode) => [mode, unavailable(pendingReason)])),
  })),
  prestigeCamos: ['pyroclast', 'pyroclast-terminus', 'pyroclast-scatter', 'pyroclast-cascade'].map(
    (id) => ({
      id,
      requirements: [{ type: 'unavailable', reason: pendingReason }],
    })
  ),
  exceptions: {
    challengeOverrides: completionistCamos
      .filter((camo) => !camo.award)
      .flatMap((camo) =>
        modeIds.map((mode) => ({
          camoId: camo.id,
          mode,
          challenge: unavailable(pendingReason),
          reason: pendingReason,
        }))
      ),
    notes: [],
  },
}
