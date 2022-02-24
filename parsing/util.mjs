/**
 * @param {Array} array 
 * @returns {Boolean}
 */
export function isEmpty(array) {
  return array.length === 0
}

/**
 * @param {String} message 
 */
export function error(message) {
  throw new Error(message)
}