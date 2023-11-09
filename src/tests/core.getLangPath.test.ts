/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest"
import { getLangPath } from "../core/core"

describe("getLangPath", () => {
  it("should format routes properly", () => {
    const path = "/:lang/foo"
    const pathObj = { fr: "/:lang/foo-fr", en: "/:lang/foo-en" }
    expect(getLangPath(path, "fr")).toEqual("/foo")
    expect(getLangPath(pathObj, "en")).toEqual("/foo-en")
    expect(getLangPath(pathObj, "de")).toBeUndefined()
  })
})
