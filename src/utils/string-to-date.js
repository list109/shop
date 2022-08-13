export function stringToDate(stringDate) {
  return stringDate.length ? new Date(...stringDate.split(/[\\/.-]/)) : new Date()
}
