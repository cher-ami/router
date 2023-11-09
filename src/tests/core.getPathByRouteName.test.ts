/**
 * @vitest-environment jsdom
 */

import { describe, expect, it } from "vitest"
import { getPathByRouteName } from "../core/core"
import { routeList } from "./_fixtures/routeList"

describe("getPathByRouteName", () => {
  it("should return the right path with name", () => {
    expect(getPathByRouteName(routeList, "HelloPage")).toEqual("/hello")
    expect(getPathByRouteName(routeList, "EndPage")).toEqual("/end")
    expect(getPathByRouteName(routeList, "FooPage")).toEqual("/foo")
    expect(getPathByRouteName(routeList, "ZooPage")).toEqual("/zoo/:id?")
  })
})
