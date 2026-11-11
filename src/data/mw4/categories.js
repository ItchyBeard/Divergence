import { challenge, unavailable, warzoneUnavailable } from './challenges'
import { launchRequirements } from './launchRequirements'

const rule = (type, multiplayerAmount, dmzAmount, conditions = {}) => ({
  type,
  challenges: {
    multiplayer:
      multiplayerAmount === undefined
        ? unavailable('Category objective published; count not published.')
        : challenge(type, multiplayerAmount, 'players', conditions.multiplayerTimes),
    dmz:
      dmzAmount === undefined
        ? unavailable(
            conditions.dmzUnavailableReason || 'Category objective published; count not published.'
          )
        : challenge(conditions.dmzType || type, dmzAmount, 'enemies', conditions.dmzTimes),
    warzone: conditions.warzone ?? warzoneUnavailable(),
  },
})

// Community source: supplied Axolwaffles workbook, Mastery Camos!X56:X64
// and the corresponding category challenge blocks (rows 125–364).
// Order remains the catalog category order.
export const categories = [
  {
    id: 'assault-rifles',
    name: 'Assault Rifles',
    goldRequired: launchRequirements.categories['assault-rifles'],
    platinum: rule('headshots', 50, 100, { warzone: challenge('headshots', 25, 'players') }),
    harmonicBreak: rule('double_kills', 25, 50, {
      warzone: {
        ...challenge('rapid_kills', 2, 'players', 15),
        description: 'Get 2 player kills within 10 seconds 15 times',
      },
    }),
  },
  {
    id: 'submachine-guns',
    name: 'Submachine Guns',
    goldRequired: launchRequirements.categories['submachine-guns'],
    platinum: rule('kills_from_behind', 25, 75, {
      warzone: challenge('kills_from_behind', 15, 'players'),
    }),
    harmonicBreak: rule('hipfire_kills', 50, 100, {
      warzone: challenge('hipfire_kills', 25, 'players'),
    }),
  },
  {
    id: 'shotguns',
    name: 'Shotguns',
    goldRequired: launchRequirements.categories.shotguns,
    platinum: rule('hipfire_kills', 50, 125),
    harmonicBreak: rule('kills_without_reloading', 2, 2, {
      multiplayerTimes: 25,
      dmzTimes: 50,
      warzone: challenge('kills_without_reloading', 2, 'players', 15),
    }),
  },
  {
    id: 'light-machine-guns',
    name: 'Light Machine Guns',
    goldRequired: launchRequirements.categories['light-machine-guns'],
    platinum: rule('kills_without_dying', 3, 3, {
      multiplayerTimes: 15,
      dmzTimes: 50,
      dmzType: 'kills_without_damage',
      warzone: challenge('kills_without_dying', 3, 'players', 10),
    }),
    harmonicBreak: rule('kills_without_releasing_trigger', 2, 2, {
      multiplayerTimes: 25,
      dmzTimes: 75,
      warzone: challenge('kills_without_releasing_trigger', 2, 'players', 15),
    }),
  },
  {
    id: 'marksman-rifles',
    name: 'Marksman Rifles',
    goldRequired: launchRequirements.categories['marksman-rifles'],
    platinum: rule('prone_kills', 75, 150, { warzone: challenge('prone_kills', 35, 'players') }),
    harmonicBreak: rule('one_shot_kills', 75, 150, {
      warzone: {
        ...challenge('kills_without_damage_from_target', 45, 'players'),
        description: 'Get 45 player kills without taking damage from the target',
      },
    }),
  },
  {
    id: 'sniper-rifles',
    name: 'Sniper Rifles',
    goldRequired: launchRequirements.categories['sniper-rifles'],
    platinum: rule('prone_kills', 75, 150, { warzone: challenge('prone_kills', 35, 'players') }),
    harmonicBreak: rule('one_shot_kills', 75, 150, {
      warzone: challenge('one_shot_kills', 35, 'players'),
    }),
  },
  {
    id: 'pistols',
    name: 'Pistols',
    goldRequired: launchRequirements.categories.pistols,
    platinum: rule('kills_from_behind', 20, 75, {
      warzone: challenge('kills_from_behind', 10, 'players'),
    }),
    harmonicBreak: rule('hipfire_kills', 40, 100, {
      warzone: challenge('hipfire_kills', 10, 'players'),
    }),
  },
  {
    id: 'launchers',
    name: 'Launchers',
    goldRequired: launchRequirements.categories.launchers,
    platinum: rule('kills_without_damage', 2, 2, {
      multiplayerTimes: 15,
      dmzTimes: 50,
      warzone: challenge('kills_without_damage', 2, 'players', 8),
    }),
    harmonicBreak: rule('kills_in_match', 10, 10, {
      multiplayerTimes: 7,
      dmzTimes: 15,
      warzone: {
        ...challenge('kills_in_match', 10, 'players', 5),
        description: 'Get 10 player kills in a single match 5 times',
      },
    }),
  },
  {
    id: 'melee',
    name: 'Melee',
    goldRequired: launchRequirements.categories.melee,
    platinum: rule('kills_without_dying', 3, 3, {
      multiplayerTimes: 15,
      dmzTimes: 50,
      dmzType: 'kills_without_damage',
      warzone: challenge('kills_without_dying', 3, 'players', 10),
    }),
    // O362 labels the DMZ target as Players. Keep its unresolved condition unavailable.
    harmonicBreak: rule('kills_from_behind', 25, undefined, {
      dmzUnavailableReason: 'Requirement pending: DMZ target needs confirmation.',
      warzone: challenge('kills_from_behind', 15, 'players'),
    }),
  },
]

export const categoriesById = Object.fromEntries(
  categories.map((category) => [category.id, category])
)
