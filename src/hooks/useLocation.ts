import { useState } from "react";
import { useHistory, useRootRouter } from "..";
import {
  addBaseToUrl,
  addLangToUrl,
  getUrlByRouteName,
  TOpenRouteParams,
} from "../api/helpers";
import { ROUTERS } from "../api/routers";
import LangService from "../languages/LangService";

const componentName = "useLocation";
const debug = require("debug")(`router:${componentName}`);

/**
 * useLocation
 */
export const useLocation = (): [string, (param: string | TOpenRouteParams) => void] => {
  const rootRouter = useRootRouter();

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
    let urlToPush: string;

    if (typeof args === "string") {
      urlToPush = args;
    } else if (typeof args === "object" && args.name) {

      // add lang param if
      args.params = {
        ...args.params,
        ...(LangService.isInit ? { lang: LangService.currentLanguage.key } : {}),
      };
      urlToPush = getUrlByRouteName(rootRouter.routes, args);
    } else {
      throw new Error("ERROR: setLocation param isn't valid. return.");
    }

    // add base and lang to string URL like "/{base}/{lang}/foo"
    debug("args.params?.lang", args.params?.lang);

    if (!args.params?.lang) {
      urlToPush = addLangToUrl(urlToPush);
    }
    urlToPush = addBaseToUrl(urlToPush);
    // finally, push in history
    ROUTERS.history.push(urlToPush);
  }

  return [location, setLocation];
};
