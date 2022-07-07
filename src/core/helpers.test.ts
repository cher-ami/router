import {
  compileUrl,
  getPathByRouteName,
  getFullPathByPath,
  getUrlByRouteName,
  joinPaths,
  preventSlashes,
  removeLastCharFromString,
  requestStaticPropsFromRoute,
} from "./helpers";
import { createUrl } from "./helpers";

// ------------------------------------------------------------ ROUTES

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
              { path: "/no", name: "noPage", getStaticProps: async (props) =>
                  new Promise((resolve) => {
                    setTimeout(() => {
                      resolve({ fetchData: {} });
                    }, 100);
                  }), },
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

// ----------------------------------------------------------- TESTS

describe("get path by route name", () => {
  it("should return the right path with name", () => {
    expect(getPathByRouteName(routesList, "helloPage")).toEqual("/hello");
    expect(getPathByRouteName(routesList, "aboutPage")).toEqual({
      en: "/about",
      fr: "/a-propos",
      de: "/uber",
    });

    expect(getPathByRouteName(routesList, "endPage")).toEqual("/end");
    // FIXME: this is not working
    // expect(getPathByRouteName(routesList, "zooPage")).toEqual("/hello/foo/zoo/:id?");
  });
});

describe("get URL by route name", () => {
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

describe("getFullPathByPathPart", () => {
  it("should return the full path", () => {
    expect(getFullPathByPath(routesList, "/foo", "fooPage")).toBe("/hello/foo");
    expect(getFullPathByPath(routesList, "/yes", "yesPage")).toBe("/hello/foo/bla/yes");
    expect(getFullPathByPath(routesList, "/", "firstLevelRoute-2")).toBe(
      "/hello/foo/bla/"
    );
    expect(getFullPathByPath(routesList, "/no", "noPage")).toBe("/hello/foo/bla/no");
  });
});

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

// ------------------------------------------------------------ ROUTES

describe("getSubRouterBase", () => {});
describe("getSubRouterRoutes", () => {});

describe("getStaticPropsFromRoute", () => {
  it("should return promise result", async () => {
    // Request static props
    const ssrStaticProps = await requestStaticPropsFromRoute({
      url: "/hello",
      base: "/",
      routes: routesList,
    });
    console.log("ssrStaticProps", ssrStaticProps);
    expect(ssrStaticProps).toEqual({ props: { fetchData: {} }, name: "helloPage" });
  });
});

// ------------------------------------------------------------ UTILS

describe("removeLastCharFromString", () => {
  it("should not remove last character if string === lastChar", () => {
    const entry = "/";
    const result = removeLastCharFromString("/", "/", true);
    expect(result).toEqual(entry);
  });

  it("should remove last character if string is not lastChar", () => {
    const entry = "/";
    const result = removeLastCharFromString(entry, "/", false);
    expect(result).toEqual("");
  });

  it("should remove last charater from string", () => {
    const entry = "/master/";
    const result = removeLastCharFromString(entry, "/");
    expect(result).toEqual("/master");
  });
});

describe("joinPaths", () => {
  it("should join paths without error", () => {
    expect(joinPaths(["/foo", "/bar"])).toBe("/foo/bar");
  });
  it("should join paths and remove multi slash", () => {
    expect(joinPaths(["////foo/////////", "///bar//////////"])).toBe("/foo/bar/");
  });
});

describe("compileUrl", () => {
  it("should build url", () => {
    const parh = compileUrl("/foo/:id/bar", { id: "2" });
    expect(parh).toBe("/foo/2/bar");
  });
});

describe("preventSlashes", () => {
  it("should remove multi slashs", () => {
    expect(preventSlashes("///foo/")).toBe("/foo/");
    expect(preventSlashes("///foo/bar/////zoo")).toBe("/foo/bar/zoo");
  });
});
