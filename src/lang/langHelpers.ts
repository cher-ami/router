import { LangService, TRoute } from "..";
import { ROUTERS } from "../api/routers";
import { getUrlByPath, joinPaths } from "../api/helpers";

const debug = require("debug")("router:langHelpers");

/**
 * Get current lang path by Lang
 *
 * ex:
 * const route = {
 *     component: ...,
 *     path: { en: "/about", fr: "/a-propos", de: "uber", name: "about" },
 * }
 *
 * selectLangPathByLang(route, "fr") // will return  "/a-propos"
 *
 * @param route
 * @param lang
 */
export function getLangPathByLang(
  route: TRoute,
  lang = LangService.currentLang?.key
): string {
  let selectedPath: string;
  if (typeof route.path === "string") {
    selectedPath = route.path;
  } else if (typeof route.path === "object") {
    Object.keys(route.path).find((el) => {
      if (el === lang) selectedPath = route.path?.[el];
    });
  }
  return selectedPath;
}

/**
 * Get lang path by another lang path
 * ex:
 *     path: { en: "/about", fr: "/a-propos", de: "uber", name: "about" },
 *
 * with "/about", we need "fr" path  "/a-propos"
 * selectLangPathByPath("/about", "fr", routes) // will return "/a-propos"
 *
 *
 * ex 2
 * Path can be an object with all available related lang path string too:
 *
 *  const pathsObj = path: { en: "/about", fr: "/a-propos", de: "uber", name: "about" };
 *  * selectLangPathByPath(pathsObj, "fr", routes) // will return "/a-propos"
 *
 * @param path: current path
 * @param base
 * @param lang: Lang key we want to get the alternate path
 * @param routes: Route liste
 */

type TGetLangPathByPath = {
  path: string | { [p: string]: string };
  base?: string;
  lang?: string | undefined;
  routes?: TRoute[] | undefined;
};

export function getLangPathByPath({
  path,
  base = null,
  lang = LangService.currentLang?.key,
  routes = ROUTERS?.routes,
}: TGetLangPathByPath): string {
  // check
  if (!routes || !lang) {
    debug("No routes or no lang is set, return", { routes, lang });
    return;
  }

  const localPath = [];

  /**
   *
   */
  const recursive = ({ pPath, pBase, pLang, pRoutes }) => {
    // selected path depend of what we recieve
    const sPath = pPath?.[pLang] || pPath;
    debug("sPath", sPath);
    if (!sPath) {
      debug("no sPath, return", sPath);
      return;
    }

    for (let route of pRoutes) {
      // if route path is route.path, no alernate path, just return it.
      if (typeof route.path === "string") {
        if (route.path === sPath) {
          localPath.push(route.path);
          debug("match ! sPath === route.path", { localPath });
          return joinPaths(localPath);
        }
      }

      // if route path is an object with different paths by lang
      else if (typeof route.path === "object") {
        const matchingPathLang = Object.keys(route.path as { [x: string]: string }).find(
          (langKey: string) => route.path?.[langKey] === sPath
        );

        if (matchingPathLang) {
          debug("match ! matchingPathLang", matchingPathLang, route.path?.[pLang]);
          return route.path?.[pLang];
        }
        // // if not matching but as children, return it
        // else if (route?.children?.length > 0) {
        //   for (let childRoute of route.children) {
        //     const test = recursive({
        //       pPath: childRoute.path?.[lang] || childRoute.path,
        //       pBase: joinPaths(localPath),
        //       pLang: lang,
        //       pRoutes: route.children,
        //     });
        //     if (test) {
        //       localPath.push(test);
        //       debug("localPath >>>", test, localPath);
        //       return test;
        //     }
        //   }
        // }
      }
    }
  };

  //debug("localPath ----", localPath);

  // start
  return recursive({ pPath: path, pBase: base, pLang: lang, pRoutes: routes });
}
