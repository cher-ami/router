/**
 * @vitest-environment jsdom
 */

import { it, expect, describe } from "vitest"
import { createUrl } from "../core/core"
import { routeList } from "./_fixtures/routeList"

// prettier-ignore
describe("createUrl", () => {
    it("should create URL properly", () => {
      const base = "/"
      expect(createUrl("/", base, routeList)).toBe("/")
      expect(createUrl("/foo", base, routeList)).toBe("/foo")
      expect(createUrl({name: "ZooPage"}, base, routeList)).toBe("/hello/foo/zoo")
    })

    it("should create URL properly if is base URL", () => {
      const routes = [
        {path: "/a", name: "a-page"},
        {
          path: "/b",
          name: "b-page",
          children: [
            {path: "/c", name: "c-page"},
            {path: "/d", name: "d-page"},
          ],
        },
      ]
      expect(createUrl("/a", "/foo/", routes)).toBe("/foo/a")
      expect(createUrl("/d", "/foo/", routes)).toBe("/foo/d")
    })

    it.only("should create URL with _langPath ", () => {
      const routes = [
        {
          // path is set automatically by selected langPath
          path: "",
          // _langPath is auto-generated on formatRoute step
          // values used instead of path when we create URL
          _langPath: {en: "/a-en", fr: "/a-fr"},
          name: "a-page",
        },
        {
          path: "/b",
          name: "b-page",
          children: [
            {
              path: "",
              _langPath: {en: "/c-en", fr: "/c-fr"},
              name: "c-page",
            },
            {path: "/d", name: "d-page"},
          ],
        },
      ]
      expect(createUrl({name: "a-page", params: {lang: "fr"}}, "/", routes))
        .toBe("/a-fr")
      expect(createUrl({name: "d-page", params: {lang: "fr"}}, "/foo/", routes))
        .toBe("/foo/b/d")
      expect(createUrl({name: "c-page", params: {lang: "en"}}, "/foo/", routes))
        .toBe("/foo/b/c-en")
    })

    it("should create URL with params and hash", () => {
      const base = "/custom-base/"
      const routes = [
        {path: "/a"},
        {
          path: "/b",
          name: "b-page",
          children: [{path: "/c", name: "c-page"}, {path: "/d"}],
        },
      ]
      // test single param
      expect(createUrl({
        name: "b-page",
        queryParams: {foo: "bar"}
      }, base, routes))
        .toBe(`${base}b?foo=bar`)

      // test multiple params
      expect(createUrl({
        name: "b-page",
        queryParams: {foo: "bar", zoo: "a,b"}
      }, base, routes))
        .toBe(`${base}b?foo=bar&zoo=a,b`)

      // test hash
      expect(createUrl({name: "b-page", hash: "hello"}, base, routes))
        .toBe(`${base}b#hello`)
      expect(createUrl({name: "c-page", hash: "hello"}, base, routes))
        .toBe(`${base}b/c#hello`)

      // test both
      expect(createUrl({
        name: "c-page",
        hash: "hello",
        queryParams: {foo: "bar"}
      }, base, routes))
        .toBe(`${base}b/c?foo=bar#hello`)
    })

  })
