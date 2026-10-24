// MW4 only. Never use the legacy Singularity storage namespace.
export const gameId = 'mw4'
export const saveVersion = 1
export const storageKey = (production = false) =>
  production ? 'divergence:mw4:v1' : 'divergence:mw4:v1:dev'
