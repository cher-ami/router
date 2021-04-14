import { useState } from "react";
import { useHistory, useRootRouter } from "..";
import {
  addBaseToUrl,
  addLangToUrl,
  getUrlByRouteName,
  TOpenRouteParams,
} from "../api/helpers";
import { ROUTERS } from "../api/routers";
import { LangService } from "..";
const debug = require("debug")(`router:useLocation`);

/**
 * Prepare setLocation URL
 * @param args can be string or TOpenRouteParams object
 */
export const prepareSetLocationUrl = (args: string | TOpenRouteParams): string => {
  const rootRouter = useRootRouter();

  let urlToPush: string;

  // in case we recieve a string
  if (typeof args === "string") {
    urlToPush = args;
    urlToPush = addLangToUrl(urlToPush);

    // in case we recieve an object
  } else if (typeof args === "object" && args?.name) {
    if (LangService.isInit && !args.params?.lang) {
      args.params = {
        ...args.params,
        ...{ lang: LangService.currentLang.key },
      };
    }

    // Get URL by the route name
    urlToPush = getUrlByRouteName(rootRouter.routes, args);

    // in other case return.
  } else {
    console.warn("setLocation param isn't valid. return.");
    return;
  }

  // in each case, add base URL
  urlToPush = addBaseToUrl(urlToPush);
  return urlToPush;
};

/**
 * useLocation
 * @dec Allow to
 */
export const useLocation = (): [string, (param: string | TOpenRouteParams) => void] => {
  /**
   * Get dynamic current location
   */
  const [location, setLoc] = useState(ROUTERS.history.location.pathname);
  useHistory((event) => {
    setLoc(event.location.pathname);
  }, []);

  /**
   * Prepare setLocation function, who push in history
   * @param args
   */
  function setLocation(args: string & TOpenRouteParams): void {
    const urlToPush = prepareSetLocationUrl(args);
    ROUTERS.history.push(urlToPush);
  }

  return [location, setLocation];
};
