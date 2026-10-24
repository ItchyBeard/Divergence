import { challenge, warzoneUnavailable } from './challenges'

export const modeIds = ['multiplayer', 'dmz', 'warzone']

const track = (entries) =>
  entries.map(([id, name, requirement], index) => ({
    id,
    name,
    stage: 'mastery',
    prerequisite:
      index === 0
        ? { scope: 'arsenal', camoId: 'divergence' }
        : { scope: 'mode', camoId: entries[index - 1][0] },
    challenge: requirement,
  }))

// Mastery belongs to the mode, separately from the weapon's shared camos.
export const modes = {
  multiplayer: {
    name: 'MP',
    availableFromSeason: 0,
    mastery: track([
      ['mercurial-drift', 'Mercurial Drift', challenge('kills_in_match', 10, 'players', 250)],
      [
        'polyatomic-reforged',
        'Polyatomic Reforged',
        challenge('kills_without_damage', 3, 'players', 300),
      ],
      ['orion-reforged', 'Orion Reforged', challenge('kills_without_dying', 5, 'players', 500)],
    ]),
  },
  dmz: {
    name: 'DMZ',
    availableFromSeason: 0,
    mastery: track([
      ['chiral', 'Chiral', challenge('tier_3_plus_kills', 2500, 'enemies')],
      [
        'ripple-tide',
        'Ripple Tide',
        challenge('lt_dog_tags_exfil_in_deployment', 2, 'dog-tags', 50),
      ],
      ['helio', 'Helio', challenge('legendary_weapon_kills_max_level_operator', 25000, 'enemies')],
    ]),
  },
  warzone: {
    name: 'WZ',
    availableFromSeason: 1,
    mastery: track([
      ['parallax', 'Parallax', warzoneUnavailable()],
      ['damascus-reforged', 'Damascus Reforged', warzoneUnavailable()],
      ['empyros', 'Empyros', warzoneUnavailable()],
    ]),
  },
}
