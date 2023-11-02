import { Routers } from "./Routers"
import debug from "@cher-ami/debug"
const componentName: string = "cache"
const log = debug(`router:${componentName}`)

/**
 * Cache used to store getStaticProps result
 * @param cache
 */
export function staticPropsCache(cache = Routers.staticPropsCache) {
  /**
   * Get data in static props cache
   */
  const get = (key: string): any => {
    const dataAlreadyExist = Object.keys(cache).some((el) => el === key)
    if (!dataAlreadyExist) {
      log(`"${key}" data doesn't exist in cache.`)
      return null
    }
    const dataCache = cache[key]
    log("data is already in cache, return it.", dataCache)
    return dataCache
  }
  /**
   * Set Data in static props cache
   */
  const set = (key: string, data): void => {
    cache[key] = data
    log("cache after set", cache)
  }

  return Object.freeze({
    get,
    set,
  })
}
