/**
 * @vitest-environment jsdom
 */

import { describe, expect, it } from "vitest"
import { getSubRouterRoutes } from "../core/core"
import { routeList } from "./_fixtures/routeList"

describe("getSubRouterRoutes", () => {
  it("should return subRouter route list", () => {
    const homeChildren = getSubRouterRoutes("/", routeList)
    expect(homeChildren).toEqual(routeList.find((e) => e.name === "HomePage").children)
    const aboutChildren = getSubRouterRoutes("/about", routeList)
    expect(aboutChildren).toEqual(routeList.find((e) => e.name === "AboutPage").children)
  })
})
