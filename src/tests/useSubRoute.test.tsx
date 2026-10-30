/**
 * @vitest-environment jsdom
 */
import { it, expect } from "vitest"
import React, { useEffect, useRef } from "react"
import { render, act } from "@testing-library/react"
import { createBrowserHistory } from "history"
import {
  Router,
  Stack,
  useStack,
  useRouter,
  useSubRoute,
  getSubRouterBase,
  getSubRouterRoutes,
  getPathByRouteName,
} from ".."

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const page = (name: string, parentRouteName?: string) =>
  React.forwardRef((props: any, handleRef) => {
    const rootRef = useRef(null)
    useStack({
      componentName: name,
      handleRef,
      rootRef,
      playIn: async () => {},
      playOut: () => sleep(50),
    })
    const router = useRouter()
    if (!parentRouteName) return <div ref={rootRef}>{name}</div>
    const path = getPathByRouteName(router.routes, parentRouteName)
    return (
      <div ref={rootRef}>
        <Router
          id={2}
          isSubRouter
          base={getSubRouterBase(path, router.base, false)}
          routes={getSubRouterRoutes(path, router.routes)}
        >
          <Stack as="div" />
        </Router>
      </div>
    )
  })

const routes: any = [
  { path: "/", component: page("Home"), name: "home" },
  {
    path: "/about",
    component: page("About", "about"),
    name: "about",
    children: [
      { path: "/foo", component: page("Foo"), name: "foo" },
      { path: "/bar", component: page("Bar"), name: "bar" },
    ],
  },
  {
    path: "/other",
    component: page("Other", "other"),
    name: "other",
    children: [{ path: "/baz", component: page("Baz"), name: "baz" }],
  },
]

it("should return the current route of the sub-router", async () => {
  const history = createBrowserHistory()
  const changes: any[] = []
  const Spy = () => {
    const subRoute = useSubRoute()
    useEffect(() => {
      changes.push(subRoute)
    }, [subRoute])
    return null
  }
  ;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
  await act(async () => {
    render(
      <Router id={1} routes={routes} history={history} base="/">
        <Spy />
        <Stack />
      </Router>,
    )
  })
  // act() delays React updates until it ends, which would hide the timing tested here
  ;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = false
  const go = async (url: string) => {
    history.push(url)
    await sleep(200)
    return changes.at(-1)
  }

  expect(changes.at(-1)).toBeUndefined()
  expect((await go("/about/foo"))?.name).toBe("foo")
  expect((await go("/about/bar"))?.name).toBe("bar")

  // query params change the sub-route, not the page: useEffect on it must trigger
  const count = changes.length
  expect((await go("/about/bar?id=1"))?.queryParams).toEqual({ id: "1" })
  expect(changes.length).toBe(count + 1)

  // the About page unmounts after the Other page mounted: it must not clear the new sub-route
  expect((await go("/other/baz"))?.name).toBe("baz")

  expect(await go("/")).toBeUndefined()
})
