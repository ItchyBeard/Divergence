// Dates are calendar days in the user's locale. A missing date never means released.
export function weaponAvailability(weapon, now = Date.now()) {
  const seasonLabel = weapon.season === 0 ? '' : `Season ${weapon.season}`
  const label = (availability) => [seasonLabel, availability].filter(Boolean).join(' · ')
  if (weapon.releaseStatus === 'delayed') {
    return { available: false, label: label('Coming Soon · Delayed'), reason: 'Release delayed' }
  }
  if (!weapon.releaseDate) {
    return { available: false, label: label('Coming Soon'), reason: 'Release date unknown' }
  }
  const release = new Date(`${weapon.releaseDate}T00:00:00`)
  const available = now >= release.getTime()
  const dateLabel = release.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  return {
    available,
    label: available ? seasonLabel : label(`Available ${dateLabel}`),
    reason: available ? '' : `Available ${dateLabel}`,
  }
}
