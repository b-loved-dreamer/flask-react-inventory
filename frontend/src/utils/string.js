export function capitalizeWords(str) {
  return str.toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function isUpperCase(c) {
  return c.toUpperCase() === c
}

export function addSpaceBeteweenCapitalized(str) {
  return str
    .split('')
    .map((c) => (isUpperCase(c) ? ` ${c}` : c))
    .join('')
    .trim()
}
