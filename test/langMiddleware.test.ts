import { langMiddleware, LangService, TRoute } from "../src";

/**
 * Add lang path param allows to test the same array before and after middleware
 * The middleware added langPath param even if it doesn't patch all routes
 * @param addLangPath
 */
const routesList = (addLangPath = false): TRoute[] => [
  {
    path: "/",
    ...(addLangPath ? { langPath: null } : {}),
  },
  {
    path: "/hello",
    ...(addLangPath ? { langPath: null } : {}),
    children: [
      { path: "/zoo", ...(addLangPath ? { langPath: null } : {}) },
      { path: "/:id", ...(addLangPath ? { langPath: null } : {}) },
    ],
  },
];

const patchRoutesList: TRoute[] = [
  {
    path: "/:lang",
    langPath: null,
  },
  {
    path: "/:lang/hello",
    langPath: null,
    children: [
      { path: "/zoo", langPath: null },
      { path: "/:id", langPath: null },
    ],
  },
];

describe("LangMiddleware", () => {
  LangService.init([{ key: "fr" }, { key: "en" }], true);
  it("should patch all first level routes if LangService is init", () => {
    expect(langMiddleware(routesList(), true)).toEqual(patchRoutesList);
  });

  it("should not patch routes if LangService is not init", () => {
    expect(langMiddleware(routesList(), false)).toEqual(routesList(true));
  });
});
