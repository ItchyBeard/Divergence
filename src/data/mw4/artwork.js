export const camoCdnBase = 'https://cdn.itchy-beard.co.uk/divergence/camouflages/'

export function weaponSilhouetteUrl(id) {
  if (typeof id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) return null
  return `https://cdn.itchy-beard.co.uk/divergence/weapons/weapon-${id}.png`
}

export function camoImageUrl(camo) {
  const file = camo.image || `${camo.id}.png`
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\.png$/.test(file)) return null
  return `${camoCdnBase}${file}`
}
