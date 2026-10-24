import { challenge, unavailable, warzoneUnavailable } from './challenges'

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
    warzone: warzoneUnavailable(),
  },
})

// Community source: supplied Axolwaffles workbook, Mastery Camos!X56:X64
// and the corresponding category challenge blocks (rows 125–364).
// Order remains the catalog category order; Warzone requirements remain unavailable.
export const categories = [
  {
    id: 'assault-rifles',
    name: 'Assault Rifles',
    goldRequired: 8,
    platinum: rule('headshots', 50, 100),
    harmonicBreak: rule('double_kills', 25, 50),
  },
  {
    id: 'submachine-guns',
    name: 'Submachine Guns',
    goldRequired: 5,
    platinum: rule('kills_from_behind', 25, 75),
    harmonicBreak: rule('hipfire_kills', 50, 100),
  },
  {
    id: 'shotguns',
    name: 'Shotguns',
    goldRequired: 2,
    platinum: rule('hipfire_kills', 50, 125),
    harmonicBreak: rule('kills_without_reloading', 2, 2, {
      multiplayerTimes: 25,
      dmzTimes: 50,
    }),
  },
  {
    id: 'light-machine-guns',
    name: 'Light Machine Guns',
    goldRequired: 3,
    platinum: rule('kills_without_dying', 3, 3, {
      multiplayerTimes: 15,
      dmzTimes: 50,
      dmzType: 'kills_without_damage',
    }),
    harmonicBreak: rule('kills_without_releasing_trigger', 2, 2, {
      multiplayerTimes: 25,
      dmzTimes: 75,
    }),
  },
  {
    id: 'marksman-rifles',
    name: 'Marksman Rifles',
    goldRequired: 3,
    platinum: rule('prone_kills', 75, 150),
    harmonicBreak: rule('one_shot_kills', 75, 150),
  },
  {
    id: 'sniper-rifles',
    name: 'Sniper Rifles',
    goldRequired: 3,
    platinum: rule('prone_kills', 75, 150),
    harmonicBreak: rule('one_shot_kills', 75, 150),
  },
  {
    id: 'pistols',
    name: 'Pistols',
    goldRequired: 4,
    platinum: rule('kills_from_behind', 20, 75),
    harmonicBreak: rule('hipfire_kills', 40, 100),
  },
  {
    id: 'launchers',
    name: 'Launchers',
    goldRequired: 4,
    platinum: rule('kills_without_damage', 2, 2, {
      multiplayerTimes: 15,
      dmzTimes: 50,
    }),
    harmonicBreak: rule('kills_in_match', 10, 10, {
      multiplayerTimes: 7,
      dmzTimes: 15,
    }),
  },
  {
    id: 'melee',
    name: 'Melee',
    goldRequired: 1,
    platinum: rule('kills_without_dying', 3, 3, {
      multiplayerTimes: 15,
      dmzTimes: 50,
      dmzType: 'kills_without_damage',
    }),
    // O362 labels the DMZ target as Players. Keep its unresolved condition unavailable.
    harmonicBreak: rule('kills_from_behind', 25, undefined, {
      dmzUnavailableReason: 'Requirement pending: DMZ target needs confirmation.',
    }),
  },
]

export const categoriesById = Object.fromEntries(
  categories.map((category) => [category.id, category])
)
