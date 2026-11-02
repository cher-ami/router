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
      url: "/hello",
    })
  })
})

describe("getStaticPropsFromRoute", () => {
  it("should return props of the default child on parent route URL", async () => {
    const ssrStaticProps = await requestStaticPropsFromRoute({
      url: "/parent",
      base: "/",
      routes: [
        { path: "/", name: "HomePage" },
        {
          path: "/parent",
          name: "ParentPage",
          getStaticProps: async () => ({ from: "parent", parent: true }),
          children: [
            {
              path: "/",
              name: "DefaultChildPage",
              getStaticProps: async () => ({ from: "child" }),
            },
          ],
        },
      ],
    })

    expect(ssrStaticProps).toEqual({
      props: { from: "parent", parent: true },
      name: "ParentPage",
      url: "/parent",
      childRouteProps: {
        props: { from: "child", parent: true },
        name: "DefaultChildPage",
      },
    })
  })

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
