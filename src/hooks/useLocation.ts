import { useState } from "react";
import { useHistory, useRouter } from "..";
import {
  addBaseToUrl,
  addLangToUrl,
  getUrlByRouteName,
  TOpenRouteParams,
} from "../api/helpers";

// /**
//  * Prepare setLocation URL
//  * @param args can be string or TOpenRouteParams object
//  */
// export const prepareSetLocationUrl = (args: string | TOpenRouteParams): string => {
//   const rootRouter = useRootRouter();
//   let urlToPush: string;
//
//   // in case we recieve a string
//   if (typeof args === "string") {
//     urlToPush = args;
//     urlToPush = addLangToUrl(urlToPush);
//
//     // in case we recieve an object
//   } else if (typeof args === "object" && args?.name) {
//     if (LangService.isInit && !args.params?.lang) {
//       args.params = {
//         ...args.params,
//         ...{ lang: LangService.currentLang.key },
//       };
//     }
//
//     // Get URL by the route name
//     urlToPush = getUrlByRouteName(rootRouter.routes, args);
//
//     // in other case return.
//   } else {
//     console.warn("setLocation param isn't valid. return.");
//     return;
//   }
//
//   // in each case, add base URL
//   urlToPush = addBaseToUrl(urlToPush);
//   return urlToPush;
// };

/**
 * useLocation
 * @dec Allow to
 */
export const useLocation = (): [string, (param: string) => void] => {
  const { history } = useRouter();
  const [location, setLoc] = useState(history.location.pathname);

  useHistory((e) => {
    setLoc(e.location.pathname);
  });

  function setLocation(args: string): void {
    history.push(args);
  }

  return [location, setLocation];
};
