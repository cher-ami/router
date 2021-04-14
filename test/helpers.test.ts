import {
  buildUrl,
  getUrlByPath,
  getUrlByRouteName,
  joinPaths,
  preventSlashes,
  removeLastCharFromString,
} from "../src/api/helpers";
import { LangService } from "../src";

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
      { path: "/" },
      {
        path: "/hello",
        children: [
          { path: "/bar" },
          {
            path: "/foo",
            children: [{ path: "/:zoo" }, { path: "/bla" }],
          },
        ],
      },
    ];
    expect(getUrlByPath(routesList, "/foo")).toBe("/hello/foo");
    expect(getUrlByPath(routesList, "/:zoo")).toBe("/hello/foo/:zoo");
  });

  it("sound return full URL ", () => {
    LangService.init([{ key: "fr" }, { key: "en" }], true);
    const routesListLang = [
      {
        path: { fr: "/salut", en: "/hello" },
        children: [
          {
            path: { en: "/bar-en", fr: "/bar-fr" },
            children: [{ path: { en: "/foo-en", fr: "/foo-fr" } }, { path: "/foo" }],
          },
          { path: "/foo" },
        ],
      },
    ];

    expect(getUrlByPath(routesListLang, "/foo-fr")).toBe("/salut/bar-fr/foo-fr");
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
