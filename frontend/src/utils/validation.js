export const requiredEmailMsg = 'Please enter a valid email.'
export const requiredPostalCodeMsg = 'Please enter a 5-digits number.'
export const requiredErrorMsg = 'This field is required.'
export const nonNegativeErrorMsg = 'Please enter a non-negative integer.'
export const integerErrorMsg = 'Please enter an integer.'
export const tenthsDecimalErrorMsg = 'Please enter a number which has precision up to tenths place.'

export const regexEmail = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
export const regexPostalCode = /^[0-9]{5}$/
export const regexNonNegative = /^\d+$/
export const regexInteger = /^-?\d+$/
export const regexTenthsDecimal = /^(-?(\d+)?\.?\d?)$/
export const regexFloat = /^-?(\d+(\.\d*)?|\.\d+)$/

export function setValueAsInt(value) {
  if (value.trim() === '') {
    return null
  }

  if (regexInteger.test(value)) {
    return parseInt(value, 10)
  }

  return NaN
}

export function setValueAsFloat(value) {
  if (value.trim() === '') {
    return null
  }

  if (regexFloat.test(value)) {
    return parseFloat(value, 10)
  }

  return NaN
}

// For setValueAsInteger
export function validateInteger(num) {
  return !Number.isNaN(num) || integerErrorMsg
}

// For setValueAsInteger
export function validateNonNegative(num) {
  return (!Number.isNaN(num) && num >= 0) || nonNegativeErrorMsg
}

// For setValueAsFloat
export function validateTenthsDecimal(num) {
  if (Number.isNaN(num)) {
    return tenthsDecimalErrorMsg
  }

  return regexTenthsDecimal.test(parseFloat(num)) || tenthsDecimalErrorMsg
}
