/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest"
import { addLangToUrl } from "../core/core"

describe("addLangToUrl", () => {
  it("should add lang to Url", () => {
    const url = "/foo/en/bar"
    expect(addLangToUrl(url, "en", true)).toBe(`/en${url}`)
    expect(addLangToUrl(url, "en", false)).toBe(`${url}`)
  })
})
