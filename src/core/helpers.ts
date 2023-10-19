/**
 * Join string paths array
 * @param paths
 * @param join
 */
export function joinPaths(paths: string[], join: string = ""): string {
  const preparePath = paths?.filter((str) => str).join(join)
  return preventSlashes(preparePath)
}

/**
 * Prevent Multi Slashes
 * ex:
 *  - '///foo/' will return '/foo/'
 * @param str
 */
export function preventSlashes(str: string): string {
  return str.replace(/(https?:\/\/)|(\/)+/g, "$1$2")
}

/**
 * Remove last caracter from string
 * @param str
 * @param lastChar
 * @param exeptIfStringIsLastChar if str is "/" and lastChar to remove is "/" do nothing
 */
export function removeLastCharFromString(
  str: string,
  lastChar: string,
  exeptIfStringIsLastChar = true,
): string {
  if (exeptIfStringIsLastChar && str === lastChar) return str
  if (str?.endsWith(lastChar)) str = str.slice(0, -1)
  return str
}

/**
 * Check if we are in SRR context
 */
export function isSSR() {
  return !(typeof window != "undefined" && window.document)
}
