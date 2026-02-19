/**
 * @vitest-environment jsdom
 */

import { describe, expect, it } from "vitest"
import { requestStaticPropsFromRoute } from "../core/core"
import { routeList } from "./_fixtures/routeList"

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
      parentProps: { data: {} },
      parentName: "HelloPage",
      url: "/hello",
    })
  })
})

describe("getStaticPropsFromRoute", () => {
  it("should return promise result of staticProps request", async () => {
    const ssrStaticProps = await requestStaticPropsFromRoute({
      url: "/hello/bar",
      base: "/",
      routes: routeList,
    })

    expect(ssrStaticProps).toEqual({
      props: { data: {} },
      name: "BarPage",
      parentProps: { data: {} },
      parentName: "HelloPage",
      url: "/hello/bar",
    })
  })
})
