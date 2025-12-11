/**
 * @vitest-environment jsdom
 */

import { describe, expect, it } from "vitest"
import { getRouteFromUrl } from "../core/core"
import { preventSlashes } from "../core/helpers"
import { routeList } from "./_fixtures/routeList"

describe("getRouteFromUrl", () => {
  const base = "/custom/base"

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
    const routeProps = {
      params: { id: "my-id" },
      queryParams: {},
      hash: null,
      color: "blue",
    }
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
      queryParams: {},
      hash: null,
    })
  })

  it("should not get route from bad URL and return not found", () => {
    const getRoute = getRouteFromUrl({
      pUrl: preventSlashes(`${base}/bar/foo/bar/`),
      pRoutes: routeList,
      pBase: base,
    })
    expect(getRoute).toBeDefined()
    expect(getRoute.name).toBe("NotFoundPage")
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

  it("if history hash, it should get route from URL with params", () => {
    const pRoutes = [
      { path: "/a" },
      {
        path: "/b",
        children: [{ path: "/c" }, { path: "/d" }],
      },
    ]

    // params
    let getRoute = getRouteFromUrl({
      pRoutes,
      pUrl: "/b?foo=bar&lang=en",
      isHashHistory: true,
    })

    expect(getRoute.queryParams).toEqual({ foo: "bar", lang: "en" })
    expect(getRoute._fullPath).toEqual("/b")

    // no params
    getRoute = getRouteFromUrl({ pRoutes, pUrl: "/a", isHashHistory: true })
    expect(getRoute.queryParams).toEqual({})

    // Subroutes
    getRoute = getRouteFromUrl({
      pRoutes,
      pUrl: "/b/c",
      isHashHistory: true,
    })
    expect(getRoute._fullPath).toEqual("/b/c")
    expect(getRoute.queryParams).toEqual({})

    // Subroutes with params
    getRoute = getRouteFromUrl({
      pRoutes,
      pUrl: "/b/c?foo=bar&lang=en",
      isHashHistory: true,
    })
    expect(getRoute._fullPath).toEqual("/b/c")
    expect(getRoute.queryParams).toEqual({ foo: "bar", lang: "en" })
  })
})
