// An unavailable challenge is never equivalent to zero or an automatic unlock.
export const unavailable = (reason) => ({ status: 'unavailable', reason })

export const challenge = (type, amount, target, times) => ({
  status: 'available',
  type,
  amount,
  target,
  ...(times === undefined ? {} : { times }),
})

export const warzoneUnavailable = () =>
  unavailable('Not published; Warzone integration begins in Season 1.')
