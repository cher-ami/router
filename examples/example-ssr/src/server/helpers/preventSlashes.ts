/**
 * Prevent Multi Slashes
 * ex:
 *  - '///foo/' will return '/foo/'
 * @param str
 */
export function preventSlashes(str) {
  return str.replace(/(https?:\/\/)|(\/)+/g, "$1$2")
}
