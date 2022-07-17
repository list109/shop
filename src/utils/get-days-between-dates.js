export const getDaysBetweenDates = (from, to) => {
  const millisecondsToDays = ms => ms / (24 * 60 * 60 * 1000)
  const milliseconds = Math.abs(new Date(to).setHours(24) - new Date(from))

  return millisecondsToDays(milliseconds)
}
