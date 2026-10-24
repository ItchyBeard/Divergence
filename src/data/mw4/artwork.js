export const camoCdnBase = 'https://cdn.itchy-beard.co.uk/divergence/camouflages/'

export function camoImageUrl(camo) {
  const file = camo.image || `${camo.id}.png`
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\.png$/.test(file)) return null
  return `${camoCdnBase}${file}`
}
