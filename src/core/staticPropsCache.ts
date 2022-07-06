import { Routers } from "./Routers";
import debug from "@wbe/debug";
const componentName: string = "staticPropsCache";
const log = debug(`router:${componentName}`);

/**
 * Get data in static props cache
 */
export const getDataFromCache = (key: string): any => {
  const dataAlreadyExist = Object.keys(Routers.staticPropsCache).some((el) => el === key);

  if (!dataAlreadyExist) {
    log(
      `"${key}" key doesn't exist in 'Routers.staticPropsCache', we need to request the API.`,
      Routers.staticPropsCache
    );
    return null;
  }
  const dataCache = Routers.staticPropsCache[key];
  log(
    "current page data is already in 'Routers.staticPropsCache', we use it.",
    dataCache
  );
  return dataCache;
};

/**
 * Set Data in static props cache
 */
export const setDataInCache = (key: string, data): void => {
  Routers.staticPropsCache[key] = data;
  log("Routers.staticPropsCache after set", Routers.staticPropsCache);
};
