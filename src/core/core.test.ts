import {
  compileUrl,
  getPathByRouteName,
  getFullPathByPath,
  getUrlByRouteName,
  requestStaticPropsFromRoute,
  getRouteFromUrl,
  createUrl,
  getNotFoundRoute,
  applyMiddlewaresToRoutes,
  getLangPath,
  addLangToUrl,
} from "./core";
import { preventSlashes } from "./helpers";

import { TRoute } from "../components/Router";

// ----------------------------------------------------------------------------- STRUCT

const routesList = [
  { path: "/" },
  {
    path: {
      en: "/about",
      fr: "/a-propos",
      de: "/uber",
    },
    name: "aboutPage",
  },
  {
    path: "/hello",
    name: "helloPage",
    getStaticProps: async (props) =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({ fetchData: {} });
        }, 100);
      }),
    children: [
      { path: "/bar", name: "barPage" },
      {
        path: "/foo",
        name: "fooPage",
        children: [
          { path: "/", name: "firstLevelRoute" },
          { path: "/zoo/:id?", name: "zooPage" },
          {
            path: "/bla",
            name: "blaPage",
            children: [
              { path: "/", name: "firstLevelRoute-2" },
              { path: "/yes", name: "yesPage" },
              {
                path: "/no",
                name: "noPage",
                getStaticProps: async (props) =>
                  new Promise((resolve) => {
                    setTimeout(() => {
                      resolve({ fetchData: {} });
                    }, 100);
                  }),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "/end",
    name: "endPage",
  },
];

// ----------------------------------------------------------------------------- TESTS

/**
 * Public
 *
 *
 *
 */

describe("createUrl", () => {
  it("should create URL properly", () => {
    const base = "/";
    // // to = string
    expect(createUrl("/", base, routesList)).toBe("/");
    expect(createUrl("/foo", base, routesList)).toBe("/foo");
    // // to = object
    expect(createUrl({ name: "zooPage" }, base, routesList)).toBe("/hello/foo/zoo");
  });
});

describe("getSubRouterBase", () => {
  // TODO
});

describe("getSubRouterRoutes", () => {
  // TODO
});

describe("get path by route name", () => {
  it("should return the right path with name", () => {
    expect(getPathByRouteName(routesList, "helloPage")).toEqual("/hello");
    expect(getPathByRouteName(routesList, "aboutPage")).toEqual({
      en: "/about",
      fr: "/a-propos",
      de: "/uber",
    });

    expect(getPathByRouteName(routesList, "endPage")).toEqual("/end");
    // FIXME: this should work
    // expect(getPathByRouteName(routesList, "zooPage")).toEqual("/hello/foo/zoo/:id?");
  });
});

describe("getStaticPropsFromRoute", () => {
  it("should return promise result", async () => {
    // Request static props
    const ssrStaticProps = await requestStaticPropsFromRoute({
      url: "/hello",
      base: "/",
      routes: routesList,
    });
    expect(ssrStaticProps).toEqual({ props: { fetchData: {} }, name: "helloPage" });
  });
});

/**
 * Matcher
 *
 *
 *
 */
describe("matcher", () => {
  const routesList: TRoute[] = [
    {
      path: "/",
      name: "HomePage",
      children: [
        {
          path: "/hello",
          name: "HelloPage",
        },
        {
          path: "/hello-2",
          name: "Hello2Page",
        },
      ],
    },
    {
      path: "/bar/:id",
      name: "BarPage",
      props: {
        color: "blue",
      },
    },
    {
      path: "/about",
      name: "AboutPage",
      children: [
        {
          path: "/route2",
          name: "Route2Page",
          children: [
            {
              path: "/:testParam?",
              children: [
                {
                  path: "/foo4",
                  props: { color: "red" },
                  name: "Foo4Page",
                },
              ],
            },
          ],
        },
      ],
    },
    { path: "/end", name: "EndPage" },
    { path: "/:rest", name: "NotFoundPage" },
  ];
  const base = "/custom/base";

  describe("getRouteFromUrl", () => {
    it("should get right route from URL", () => {
      // exemple 1
      const getRoute = getRouteFromUrl({
        pUrl: preventSlashes(`${base}/bar/my-id`),
        pRoutes: routesList,
        pBase: base,
      });

      expect(getRoute.fullUrl).toBe(`${base}/bar/my-id`);
      expect(getRoute.fullPath).toBe(`${base}/bar/:id`);
      expect(getRoute.path).toBe("/bar/:id");
      expect(getRoute.url).toBe("/bar/my-id");
      expect(getRoute.name).toBe(`BarPage`);
      expect(getRoute.props).toEqual({ params: { id: "my-id" }, color: "blue" });

      // example-client 2
      // prettier-ignore
      const getRoute3 = getRouteFromUrl({ pUrl: "/hello-2", pRoutes: routesList, pBase: "/" });
      expect(getRoute3.fullPath).toBe(`/hello-2`);

      // example-client 3
      const getRoute2 = getRouteFromUrl({
        pUrl: "/end",
        pRoutes: routesList,
        pBase: "/",
      });
      expect(getRoute2.name).toBe(`EndPage`);
    });

    it("should get right route from URL with subRoute", () => {
      const getRoute = getRouteFromUrl({
        pUrl: "/about/route2/super-param/foo4",
        pRoutes: routesList,
        pBase: "/",
      });

      console.log("getRoute", getRoute);

      expect(getRoute.fullPath).toBe(`/about/route2/:testParam?/foo4`);
      expect(getRoute.path).toBe("/foo4");
      expect(getRoute.fullUrl).toBe(`/about/route2/super-param/foo4`);
      expect(getRoute.url).toBe("/foo4");
      expect(getRoute.base).toBe("/about/route2/:testParam?");
      expect(getRoute.name).toBe("Foo4Page");
      expect(getRoute.props).toEqual({
        color: "red",
        params: { testParam: "super-param" },
      });
    });

    it("should not get route from bad URL and return undefined", () => {
      const getRoute = getRouteFromUrl({
        pUrl: preventSlashes(`${base}/bar/foo/bar/`),
        pRoutes: routesList,
        pBase: base,
      });
      expect(getRoute).toBeUndefined();
    });
  });

  describe("getNotFoundRoute", () => {
    it("should return not found route", () => {
      expect(getNotFoundRoute(routesList)).toEqual({
        path: "/:rest",
        name: "NotFoundPage",
      });
    });
  });
});

/***
 * Routes
 *
 *
 *
 */

describe("patchMissingRootRoute", () => {
  it("should patch missing route", () => {
    // TODO
  });
});

describe("applyMiddlewaresToRoutes", () => {
  it("should apply middleware to routes", () => {
    // TODO
  });
});

describe("formatRoutes", () => {
  it("should format routes properly", () => {
    // TODO
  });
});

/***
 * Urls / paths
 *
 *
 *
 */

describe("compileUrl", () => {
  it("should build url", () => {
    const parh = compileUrl("/foo/:id/bar", { id: "2" });
    expect(parh).toBe("/foo/2/bar");
  });
});

describe("getFullPathByPath", () => {
  it("should return the full path", () => {
    expect(getFullPathByPath(routesList, "/foo", "fooPage")).toBe("/hello/foo");
    expect(getFullPathByPath(routesList, "/yes", "yesPage")).toBe("/hello/foo/bla/yes");
    expect(getFullPathByPath(routesList, "/", "firstLevelRoute-2")).toBe(
      "/hello/foo/bla/"
    );
    expect(getFullPathByPath(routesList, "/no", "noPage")).toBe("/hello/foo/bla/no");
  });
});

describe("getUrlByRouteName", () => {
  it("should return full URL with only page name and params", () => {
    expect(getUrlByRouteName(routesList, { name: "helloPage" })).toBe("/hello");
    expect(getUrlByRouteName(routesList, { name: "fooPage" })).toBe("/hello/foo");
    expect(getUrlByRouteName(routesList, { name: "blaPage", params: { id: 2 } })).toBe(
      "/hello/foo/bla"
    );
    expect(getUrlByRouteName(routesList, { name: "noPage", params: { id: 4 } })).toBe(
      "/hello/foo/bla/no"
    );
  });
});

describe("getLangPath", () => {
  it("should format routes properly", () => {
    const path = "/:lang/foo";
    const pathObj = { fr: "/:lang/foo-fr", en: "/:lang/foo-en" };
    expect(getLangPath(path, "fr")).toEqual("/foo");
    expect(getLangPath(pathObj, "en")).toEqual("/foo-en");
    expect(getLangPath(pathObj, "de")).toBeUndefined();
  });
});

describe("addLangToUrl", () => {
  it("should add lang to Url", () => {
    const url = "/foo/en/bar";
    expect(addLangToUrl(url, "en", true)).toBe(`/en${url}`);
    expect(addLangToUrl(url, "en", false)).toBe(`${url}`);
  });
});
