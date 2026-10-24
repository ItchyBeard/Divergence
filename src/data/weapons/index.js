import { createWeaponCatalog } from '../mw4/catalog'

// Suffix excludes the legacy category arrays beside this file, utilities and tests.
const modules = import.meta.glob('./*/*.weapon.js', { eager: true, import: 'default' })

export const weapons = createWeaponCatalog(modules)
export const weaponsById = Object.fromEntries(weapons.map((weapon) => [weapon.id, weapon]))
export default weapons
