// Original 33-weapon launch roster. Never derive targets from catalog size/release state.
export const launchRequirements = Object.freeze({
  weapons: 33,
  sharedCamosPerWeapon: 15, // Eight Military, three Special, four Completionist.
  categories: Object.freeze({
    'assault-rifles': 8,
    'submachine-guns': 5,
    'shotguns': 2,
    'light-machine-guns': 3,
    'marksman-rifles': 3,
    'sniper-rifles': 3,
    'pistols': 4,
    'launchers': 4,
    'melee': 1,
  }),
})

export const progressPercentage = (completed, total) =>
  total > 0 ? Math.min(100, Math.max(0, (completed / total) * 100)) : 0

// Call with all eligible released weapons, never the visible/filtered subset.
// The best 33 substitute for one another, matching Singularity's progression model.
export function fixedSharedProgress(completions) {
  const total = launchRequirements.weapons * launchRequirements.sharedCamosPerWeapon
  const completed = completions.reduce((sum, entry) => sum + entry.completed, 0)
  const credited = [...completions]
    .sort((a, b) => b.completed / b.total - a.completed / a.total)
    .slice(0, launchRequirements.weapons)
    .reduce((sum, entry) => sum + entry.completed, 0)
  const complete =
    completions.filter((entry) => entry.total > 0 && entry.completed === entry.total).length >=
    launchRequirements.weapons
  // Keep 100% meaningful even when rounding a nearly complete grind.
  const percent = complete ? 100 : Math.min(99, Math.round(progressPercentage(credited, total)))
  return { completed, total, percent, complete }
}
