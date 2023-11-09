/**
 * @vitest-environment jsdom
 */

import { it, expect, describe } from "vitest"
import { getSubRouterBase } from "../core/core"
import { Routers, LangService } from ".."

describe("getSubRouterBase", () => {
  it("should return subRouter base URL", () => {
    expect(getSubRouterBase("/foo", "")).toBe("/foo")
    expect(getSubRouterBase("/foo", "/")).toBe("/foo")
    expect(getSubRouterBase("/foo", "/hello/")).toBe("/hello/foo")
    expect(getSubRouterBase("/foo", "/hello")).toBe("/hello/foo")
    expect(getSubRouterBase("/foo", "/custom/base/hello/")).toBe("/custom/base/hello/foo")

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
