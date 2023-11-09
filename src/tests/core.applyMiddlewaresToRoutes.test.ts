/**
 * @vitest-environment jsdom
 */

import { describe, expect, it } from "vitest"
import { applyMiddlewaresToRoutes } from "../core/core"

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
