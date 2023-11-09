/**
 * @vitest-environment jsdom
 */

import { it, expect, describe } from "vitest"
import {
  compileUrl,
  getPathByRouteName,
  getFullPathByPath,
  getUrlByRouteName,
  requestStaticPropsFromRoute,
  getRouteFromUrl,
  createUrl,
  getNotFoundRoute,
  getLangPath,
  addLangToUrl,
  getSubRouterBase,
  getSubRouterRoutes,
  patchMissingRootRoute,
  applyMiddlewaresToRoutes,
} from "../core/core"
import { preventSlashes } from "../core/helpers"
import { routeList } from "./_fixtures/routeList"
import { Routers, LangService } from ".."

/**
 * Public
 *
 *
 *
 */

describe("public", () => {
  describe("createUrl", () => {
    it("should create URL properly", () => {
      const base = "/"
      expect(createUrl("/", base, routeList)).toBe("/")
      expect(createUrl("/foo", base, routeList)).toBe("/foo")
      expect(createUrl({ name: "ZooPage" }, base, routeList)).toBe("/hello/foo/zoo")
    })

    it("should create URL properly if is base URL", () => {
      const routes = [
        { path: "/a", name: "a-page" },
        {
          path: "/b",
          name: "b-page",
          children: [
            { path: "/c", name: "c-page" },
            { path: "/d", name: "d-page" },
          ],
        },
      ]
      expect(createUrl("/a", "/foo/", routes)).toBe("/foo/a")
      expect(createUrl("/d", "/foo/", routes)).toBe("/foo/d")
    })

    it("should create URL with params and hash", () => {
      const base = "/custom-base/"
      const routes = [
        { path: "/a" },
        {
          path: "/b",
          name: "b-page",
          children: [{ path: "/c", name: "c-page" }, { path: "/d" }],
        },
      ]
      // test single param
      expect(
        createUrl({ name: "b-page", queryParams: { foo: "bar" } }, base, routes),
      ).toBe(`${base}b?foo=bar`)

      // test multiple params
      expect(
        createUrl(
          { name: "b-page", queryParams: { foo: "bar", zoo: "a,b" } },
          base,
          routes,
        ),
      ).toBe(`${base}b?foo=bar&zoo=a,b`)

      // test hash
      expect(createUrl({ name: "b-page", hash: "hello" }, base, routes)).toBe(
        `${base}b#hello`,
      )
      expect(createUrl({ name: "c-page", hash: "hello" }, base, routes)).toBe(
        `${base}b/c#hello`,
      )

      // test both
      expect(
        createUrl(
          { name: "c-page", hash: "hello", queryParams: { foo: "bar" } },
          base,
          routes,
        ),
      ).toBe(`${base}b/c?foo=bar#hello`)
    })
  })

  describe("getSubRouterBase", () => {
    it("should return subRouter base URL", () => {
      expect(getSubRouterBase("/foo", "")).toBe("/foo")
      expect(getSubRouterBase("/foo", "/")).toBe("/foo")
      expect(getSubRouterBase("/foo", "/hello/")).toBe("/hello/foo")
      expect(getSubRouterBase("/foo", "/hello")).toBe("/hello/foo")
      expect(getSubRouterBase("/foo", "/custom/base/hello/")).toBe(
        "/custom/base/hello/foo",
      )

      Routers.langService = new LangService({
        languages: [{ key: "en" }, { key: "fr" }],
      })
      const langPathTest = { en: "/foo-en", fr: "/foo-fr" }
      expect(getSubRouterBase(langPathTest, "/base/", true)).toBe("/base/:lang/foo-en")
      expect(getSubRouterBase(langPathTest, "/base/", false)).toBe("/base/foo-en")
      Routers.langService = undefined
    })

    it("should return subRouter base URL with 'showDefaultLangInUrl: false' option", () => {
      Routers.langService = new LangService({
        languages: [{ key: "en" }, { key: "fr" }],
        showDefaultLangInUrl: false,
      })
      ;["/", "/foo", "/foo/bar/biz"].forEach((e) => {
        expect(getSubRouterBase(e, "/base/", true)).toBe(`/base${e}`)
        expect(getSubRouterBase(e, "/base/", false)).toBe(`/base${e}`)
      })
      Routers.langService = undefined
    })
  })

  describe("getSubRouterRoutes", () => {
    it("should return subRouter route list", () => {
      const homeChildren = getSubRouterRoutes("/", routeList)
      expect(homeChildren).toEqual(routeList.find((e) => e.name === "HomePage").children)
      const aboutChildren = getSubRouterRoutes("/about", routeList)
      expect(aboutChildren).toEqual(
        routeList.find((e) => e.name === "AboutPage").children,
      )
    })
  })

  describe("getPathByRouteName", () => {
    it("should return the right path with name", () => {
      expect(getPathByRouteName(routeList, "HelloPage")).toEqual("/hello")
      expect(getPathByRouteName(routeList, "EndPage")).toEqual("/end")
      expect(getPathByRouteName(routeList, "FooPage")).toEqual("/foo")
      expect(getPathByRouteName(routeList, "ZooPage")).toEqual("/zoo/:id?")
    })
  })

  describe("getStaticPropsFromRoute", () => {
    it("should return promise result of staticProps request", async () => {
      const ssrStaticProps = await requestStaticPropsFromRoute({
        url: "/hello",
        base: "/",
        routes: routeList,
      })
      expect(ssrStaticProps).toEqual({
        props: { data: {} },
        name: "HelloPage",
        url: "/hello",
      })
    })
  })
})

/**
 * Matcher
 *
 *
 *
 */
describe("matcher", () => {
  const base = "/custom/base"

  describe("getRouteFromUrl", () => {
    it("should get right route from URL", () => {
      let getRoute = getRouteFromUrl({
        pUrl: preventSlashes(`${base}/bar/my-id`),
        pRoutes: routeList,
        pBase: base,
      })
      expect(getRoute._fullUrl).toBe(`${base}/bar/my-id`)
      expect(getRoute._fullPath).toBe(`${base}/bar/:id`)
      expect(getRoute.path).toBe("/bar/:id")
      expect(getRoute.url).toBe("/bar/my-id")
      expect(getRoute.name).toBe(`BarPage`)
      const routeProps = { params: { id: "my-id" }, color: "blue" }
      expect(getRoute.props).toEqual(routeProps)
      // no parent route, so context object need to return same route information
      expect(getRoute._context.props).toEqual(routeProps)

      getRoute = getRouteFromUrl({
        pUrl: "/hello-2",
        pRoutes: routeList,
        pBase: "/",
      })
      expect(getRoute._fullPath).toBe(`/hello-2`)

      getRoute = getRouteFromUrl({
        pUrl: "/end",
        pRoutes: routeList,
        pBase: "/",
      })
      expect(getRoute.name).toBe(`EndPage`)
    })

    it("should get right route from URL with subRoute", () => {
      const getRoute = getRouteFromUrl({
        pUrl: "/about/route2/super-param/foo4",
        pRoutes: routeList,
        pBase: "/",
      })

      expect(getRoute._fullPath).toBe(`/about/route2/:testParam?/foo4`)
      expect(getRoute.path).toBe("/foo4")
      expect(getRoute._fullUrl).toBe(`/about/route2/super-param/foo4`)
      expect(getRoute.url).toBe("/foo4")
      expect(getRoute.base).toBe("/about/route2/:testParam?")
      expect(getRoute.name).toBe("Foo4Page")
      expect(getRoute.props).toEqual({
        color: "red",
        params: { testParam: "super-param" },
      })
    })

    it("should not get route from bad URL and return undefined", () => {
      const getRoute = getRouteFromUrl({
        pUrl: preventSlashes(`${base}/bar/foo/bar/`),
        pRoutes: routeList,
        pBase: base,
      })
      expect(getRoute).toBeUndefined()
    })

    it("should get route from URL with params and hash", () => {
      const pRoutes = [
        { path: "/a" },
        {
          path: "/b",
          children: [{ path: "/c" }, { path: "/d" }],
        },
      ]
      // only params
      let getRoute = getRouteFromUrl({ pRoutes, pUrl: "/b?foo=bar&lang=en" })
      expect(getRoute.queryParams).toEqual({ foo: "bar", lang: "en" })
      expect(getRoute._fullPath).toEqual("/b")

      // only hash
      getRoute = getRouteFromUrl({ pRoutes, pUrl: "/b/c#hash" })
      expect(getRoute._fullPath).toEqual("/b/c")
      expect(getRoute.queryParams).toEqual({})
      expect(getRoute.hash).toEqual("hash")

      // params and hash
      getRoute = getRouteFromUrl({ pRoutes, pUrl: "/b/c?foo=bar#hash" })
      expect(getRoute.queryParams).toEqual({ foo: "bar" })
      expect(getRoute.hash).toEqual("hash")

      // not hash and params
      getRoute = getRouteFromUrl({ pRoutes, pUrl: "/a" })
      expect(getRoute.queryParams).toEqual({})
      expect(getRoute.hash).toEqual(null)
    })
  })

  describe("getNotFoundRoute", () => {
    it("should return not found route", () => {
      expect(getNotFoundRoute(routeList)).toEqual({
        path: "/:rest",
        name: "NotFoundPage",
      })
    })
  })
})

/***
 * Routes
 *
 *
 *
 */
describe("routes", () => {
  describe("patchMissingRootRoute", () => {
    it("should patch missing route", () => {
      const pathchedRoutes = patchMissingRootRoute(routeList[0].children)
      const firstRouteAdded = pathchedRoutes[0]
      expect(firstRouteAdded.path).toBe("/")
      expect(firstRouteAdded.name).toContain("auto-generate-slash-route")
    })

    it("should not patch missing route if '/' route already exist", () => {
      const pathchedRoutes = patchMissingRootRoute(routeList)
      const firstRouteAdded = pathchedRoutes[0]
      expect(firstRouteAdded.path).toBe("/")
      expect(firstRouteAdded.name).toBe("HomePage")
    })
  })

  describe("applyMiddlewaresToRoutes", () => {
    it("should apply middleware to routes", () => {
      // TODO
      const transformFn = (r) => r.forEach((e) => (e.path = `-${e.path}`))
      const routes = [{ path: "/" }, { path: "/foo" }]
      const afterMiddlewareRoutes = [{ path: "-/" }, { path: "-/foo" }]
      const transformRoutes = applyMiddlewaresToRoutes(routes, [transformFn])
      expect(transformRoutes).toEqual(afterMiddlewareRoutes)
    })
  })
})

/***
 * Urls / paths
 *
 *
 *
 */
describe("URLs and paths", () => {
  describe("compileUrl", () => {
    it("should build url", () => {
      const parh = compileUrl("/foo/:id/bar", { id: "2" })
      expect(parh).toBe("/foo/2/bar")
    })
  })

  describe("getFullPathByPath", () => {
    it("should return the full path", () => {
      expect(getFullPathByPath(routeList, "/foo", "FooPage")).toBe("/hello/foo")
      expect(getFullPathByPath(routeList, "/yes", "YesPage")).toBe("/hello/foo/bla/yes")
      expect(getFullPathByPath(routeList, "/", "FirstLevelRoute-2")).toBe(
        "/hello/foo/bla/",
      )
      expect(getFullPathByPath(routeList, "/no", "NoPage")).toBe("/hello/foo/bla/no")
    })
  })

  describe("getUrlByRouteName", () => {
    it("should return full URL with only page name and params", () => {
      expect(getUrlByRouteName(routeList, { name: "HelloPage" })).toBe("/hello")
      expect(getUrlByRouteName(routeList, { name: "FooPage" })).toBe("/hello/foo")
      expect(getUrlByRouteName(routeList, { name: "BlaPage", params: { id: 2 } })).toBe(
        "/hello/foo/bla",
      )
      expect(getUrlByRouteName(routeList, { name: "NoPage", params: { id: 4 } })).toBe(
        "/hello/foo/bla/no",
      )
    })

    it("should return full URL with only page name with base URL", () => {
      // prettier-ignore
      const routes = [
        { path: "/a", name: "a-page" },
        {
          path: "/b",
          name: "b-page",
          children: [
            { path: "/c", name: "c-page" },
            { path: "/d", name: "d-page" }
          ],
        },
      ]
      expect(getUrlByRouteName(routes, { name: "b-page" })).toBe("/b")
      expect(getUrlByRouteName(routes, { name: "b-page" }, "/test/")).toBe("/test/b")
      expect(getUrlByRouteName(routes, { name: "c-page" }, "/test/")).toBe("/test/b/c")
    })
  })

  describe("getLangPath", () => {
    it("should format routes properly", () => {
      const path = "/:lang/foo"
      const pathObj = { fr: "/:lang/foo-fr", en: "/:lang/foo-en" }
      expect(getLangPath(path, "fr")).toEqual("/foo")
      expect(getLangPath(pathObj, "en")).toEqual("/foo-en")
      expect(getLangPath(pathObj, "de")).toBeUndefined()
    })
  })

  describe("addLangToUrl", () => {
    it("should add lang to Url", () => {
      const url = "/foo/en/bar"
      expect(addLangToUrl(url, "en", true)).toBe(`/en${url}`)
      expect(addLangToUrl(url, "en", false)).toBe(`${url}`)
    })
  })
})
