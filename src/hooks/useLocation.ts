import { useState } from "react";
import { ERouterEvent, useHistory, useRootRouter } from "..";
import { getUrlByRouteName, TOpenRouteParams } from "../api/helpers";
import { ROUTERS } from "../api/routers";

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
  const [location, setLoc] = useState(window.location.pathname);

  useHistory((event) => {
    setLoc(event.location.pathname);
  }, []);

  /**
   * Prepare setLocation function, who push in history
   * @param args
   */
  function setLocation(args: string | TOpenRouteParams): void {
    let urlToPush: string;

    // prepare URL
    if (typeof args === "string") {
      urlToPush = args;
    } else if (typeof args === "object" && args.name) {
      urlToPush = getUrlByRouteName(rootRouter.routes, args);
    } else {
      throw new Error("ERROR: setLocation param isn't valid. return.");
    }

    ROUTERS.history.push(urlToPush);
  }

  return [location, setLocation];
};
