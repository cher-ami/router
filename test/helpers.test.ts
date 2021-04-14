import {
  buildUrl,
  getUrlByPath,
  getUrlByRouteName,
  joinPaths,
  preventSlashes,
  removeLastCharFromString,
} from "../src/api/helpers";

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

describe("buildUrl", () => {
  it("should build url", () => {
    const parh = buildUrl("/foo/:id/bar", { id: "2" });
    expect(parh).toBe("/foo/2/bar");
  });
});

describe("preventSlashes", () => {
  it("should remove multi slashs", () => {
    expect(preventSlashes("///foo/")).toBe("/foo/");
    expect(preventSlashes("///foo/bar/////zoo")).toBe("/foo/bar/zoo");
  });
});

describe("buildUrl", () => {
  it("should build url", () => {
    const parh = buildUrl("/foo/:id/bar", { id: "2" });
    expect(parh).toBe("/foo/2/bar");
  });
});

describe("getUrlByPath", () => {
  it("should return full URL", () => {
    const routesList = [
      { path: "/", component: null },
      {
        path: "/hello",
        component: null,
        children: [
          { path: "/bar", component: null },
          {
            path: "/foo",
            component: null,
            children: [
              { path: "/:zoo", component: null },
              { path: "/bla", component: null },
            ],
          },
        ],
      },
    ];
    expect(getUrlByPath(routesList, "/foo")).toBe("/hello/foo");
    expect(getUrlByPath(routesList, "/zoo")).toBe("/hello/foo/:zoo");
  });
});

describe("getUrlByRouteName", () => {
  it("should return full URL with only page name and params", () => {
    const routesList = [
      { path: "/", component: null, name: "foo" },
      {
        path: "/hello",
        component: null,
        name: "bar",
        children: [
          { path: "/zoo", component: null, name: "ZooPage" },
          { path: "/:id", component: null, name: "BlaPage" },
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
