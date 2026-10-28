export const camoCdnBase = 'https://cdn.itchy-beard.co.uk/divergence/camouflages/'
export const missingCamoImageUrl = camoCdnBase + '_missing.png'

export function weaponSilhouetteUrl(id) {
  if (typeof id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) return null
  return `https://cdn.itchy-beard.co.uk/divergence/weapons/weapon-${id}.png`
}

export function camoImageUrl(camo) {
  if (!camo || camo.artworkStatus === 'pending' || camo.artworkPending === true) return null
  // Read an absent image key too, so Vue reacts when a confirmed filename is added.
  const image = camo.image
  // Unnamed Special slots are existing pending definitions, not confirmed filenames.
  // Keep null as their canonical artwork identity so Gallery designs never merge
  // merely because they display the same missing-image placeholder.
  if (!Object.hasOwn(camo, 'image') && /^special-\d+$/.test(camo.id)) return null
  const file = Object.hasOwn(camo, 'image')
    ? image
    : typeof camo.id === 'string'
    ? `${camo.id}.png`
    : null
  if (
    typeof file !== 'string' ||
    (file !== '_missing.png' && !/^[a-z0-9]+(?:-[a-z0-9]+)*\.png$/.test(file))
  )
    return null
  return `${camoCdnBase}${file}`
}
