import {
  compileUrl,
  getRoutePathByRouteName,
  getFullPathByPath,
  getUrlByRouteName,
  joinPaths,
  preventSlashes,
  removeLastCharFromString,
} from "./helpers";
import { TRoute } from "../components/Router";

// ------------------------------------------------------------ ROUTES

const routes: TRoute[] = [
  { path: "/", component: null, name: "Home" },
  {
    path: { en: "/about", fr: "/a-propos", de: "/uber" },
    component: { displayName: "About" } as any,
    children: [
      { path: "/foo" },
      {
        path: "/bar",
        children: [
          { path: "/", name: "1stLevelRoute" },
          { path: "/yolo/:id?", name: "YOLO" },
          { path: "/hello", name: "Hello" },
        ],
      },
    ],
  },
];

describe("getRoutePathByRouteName", () => {
  it("should return the right path with name", () => {
    expect(getRoutePathByRouteName(routes, "Home")).toEqual("/");
    expect(getRoutePathByRouteName(routes, "About")).toEqual({
      en: "/about",
      fr: "/a-propos",
      de: "/uber",
    });
    expect(getRoutePathByRouteName(routes, "YOLO")).toEqual("/yolo/:id?");
    expect(getRoutePathByRouteName(routes, "Hello")).toEqual("/hello");
  });
});

describe("getUrlByRouteName", () => {
  it("should return full URL with only page name and params", () => {
    const routesList = [
      { path: "/", name: "foo" },
      {
        path: "/hello",
        name: "bar",
        children: [
          { path: "/zoo", name: "ZooPage" },
          { path: "/:id", name: "BlaPage" },
        ],
      },
    ];
    expect(getUrlByRouteName(routesList, { name: "bar" })).toBe("/hello");
    expect(getUrlByRouteName(routesList, { name: "ZooPage" })).toBe("/hello/zoo");
    expect(getUrlByRouteName(routesList, { name: "BlaPage", params: { id: 2 } })).toBe(
      "/hello/2"
    );
  });
});

describe("getFullPathByPathPart", () => {
  it("should return the full path", () => {
    const routesList = [
      { path: "/" },
      {
        path: "/hello",
        name: "helloPage",
        children: [
          { path: "/bar", name: "barPage" },
          {
            path: "/foo",
            name: "fooPage",
            children: [
              { path: "/", name: "firstLevelRoute" },
              { path: "/:zoo", name: "zooPage" },
              {
                path: "/bla",
                name: "blaPage",
                children: [
                  { path: "/", name: "firstLevelRoute-2" },
                  { path: "/yes", name: "yesPage" },
                  { path: "/no", name: "noPage" },
                ],
              },
            ],
          },
        ],
      },
    ];
    expect(getFullPathByPath(routesList, "/foo", "fooPage")).toBe("/hello/foo");
    expect(getFullPathByPath(routesList, "/:zoo", "zooPage")).toBe("/hello/foo/:zoo");
    expect(getFullPathByPath(routesList, "/", "firstLevelRoute-2")).toBe(
      "/hello/foo/bla/"
    );
    expect(getFullPathByPath(routesList, "/no", "noPage")).toBe("/hello/foo/bla/no");
  });
});

// ------------------------------------------------------------ ROUTES

describe("getSubRouterBase", () => {});
describe("getSubRouterRoutes", () => {});

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

