import { Routers } from "./Routers";
import debug from "@wbe/debug";
const componentName: string = "staticPropsCache";
const log = debug(`router:${componentName}`);

/**
 * Cache used to store getStaticProps result
 * @param cache
 */
export function staticPropsCache(cache = Routers.staticPropsCache) {
  /**
   * Get data in static props cache
   */
  const get = (key: string): any => {
    const dataAlreadyExist = Object.keys(cache).some((el) => el === key);

    if (!dataAlreadyExist) {
      log(`"${key}" key doesn't exist in cache, we need to request the API.`, cache);
      return null;
    }
    const dataCache = cache[key];
    log("current page data is already in 'cache', we use it.", dataCache);
    return dataCache;
  };

  /**
   * Set Data in static props cache
   */
  const set = (key: string, data): void => {
    cache[key] = data;
    log("cache after set", cache);
  };

  return Object.freeze({
    get,
    set,
  });
}
