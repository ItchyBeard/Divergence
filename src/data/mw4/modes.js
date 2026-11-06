import { challenge } from './challenges'
import { launchRequirements } from './launchRequirements'

export const modeIds = ['multiplayer', 'dmz', 'warzone']

const track = (entries, firstCamoId = 'divergence') =>
  entries.map(([id, name, requirement, prerequisiteDescription], index) => ({
    id,
    name,
    stage: 'mastery',
    prerequisite: {
      ...(index === 0
        ? { scope: 'arsenal', camoId: firstCamoId, count: launchRequirements.weapons }
        : { scope: 'mode', camoId: entries[index - 1][0] }),
      ...(prerequisiteDescription && { description: prerequisiteDescription }),
    },
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
    mastery: track(
      [
        [
          'parallax',
          'Parallax',
          {
            ...challenge('kills_in_match', 5, 'players', 300),
            description: 'Get 5 kills in a match, 300 times.',
          },
          `Complete ${launchRequirements.weapons} Harmonic Break camo challenges.`,
        ],
        [
          'damascus-reforged',
          'Damascus Reforged',
          {
            ...challenge('kills_without_plating', 2, 'players', 200),
            description: 'Get 2 kills without plating, 200 times.',
          },
          'Complete the Parallax challenge.',
        ],
        [
          'empyros',
          'Empyros',
          {
            ...challenge('top_5_with_kills', 6, 'players', 75),
            description: 'Finish in the Top 5 with at least 6 kills, 75 times.',
          },
          'Complete the Damascus Reforged challenge.',
        ],
      ],
      'harmonic-break'
    ),
  },
}
