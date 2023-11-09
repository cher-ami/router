/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest"
import { patchMissingRootRoute } from "../core/core"
import { routeList } from "./_fixtures/routeList"

describe("patchMissingRootRoute", () => {
  it("should patch missing route", () => {
    const patchedRoutes = patchMissingRootRoute(routeList[0].children)
    const firstRouteAdded = patchedRoutes[0]
    expect(firstRouteAdded.path).toBe("/")
    expect(firstRouteAdded.name).toContain("auto-generate-slash-route")
  })

  it("should not patch missing route if '/' route already exist", () => {
    const patchedRoutes = patchMissingRootRoute(routeList)
    const firstRouteAdded = patchedRoutes[0]
    expect(firstRouteAdded.path).toBe("/")
    expect(firstRouteAdded.name).toBe("HomePage")
  })
})
