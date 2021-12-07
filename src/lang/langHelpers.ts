import { TRoute } from "../components/Router";
import debug from "@wbe/debug";
import { Routers } from "../api/Routers";

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
  lang = Routers.langService?.currentLang.key
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
 * Get lang path by Lang
 * a 'langPath' is '/about' or '/a-propos' in
 *  path: {en: "/about", fr: "/a-propos", de: "uber", name: "about"}
 *
 * If path is a string, return it
 *
 *
 * @param langPath
 * @param lang
 * @returns
 */
export const getLangPath = (
  langPath: string | { [p: string]: string },
  lang: string = Routers.langService?.currentLang.key
) => {
  let path;
  if (typeof langPath === "string") {
    path = langPath;
  } else if (typeof langPath === "object") {
    path = langPath?.[lang];
  }

  const removeLangFromPath = (path: string): string => {
    if (path?.includes(`/:lang`)) {
      return path?.replace("/:lang", "");
    } else return path;
  };

  return removeLangFromPath(path);
};
