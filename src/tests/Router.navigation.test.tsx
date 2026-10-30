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
  getSubRouterBase,
  getSubRouterRoutes,
  getPathByRouteName,
  Link,
} from ".."

const playIns: Record<string, number> = {}
const staticProps: Record<string, number> = {}
const routeEffects: Record<string, number> = {}
const count = (store, name) => (store[name] = (store[name] || 0) + 1)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const page = (name: string, withSubRouter = false) =>
  React.forwardRef((props: any, handleRef) => {
    const rootRef = useRef(null)
    useStack({
      componentName: name,
      handleRef,
      rootRef,
      playIn: async () => count(playIns, name),
    })
    const router = useRouter()
    useEffect(() => void count(routeEffects, name), [router.currentRoute])
    if (!withSubRouter)
      return (
        <div ref={rootRef}>
          {name + (props.queryParams?.x ?? "")}
          <Link to={{ name: "home" }} />
          <Link to={{ name: "foo" }} />
          <Link to="/fast" />
        </div>
      )
    const path = getPathByRouteName(router.routes, "about")
    return (
      <div ref={rootRef}>
        {name}
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

const getStaticProps =
  (name: string, delay = 0) =>
  async () => {
    count(staticProps, name)
    await sleep(delay)
    return {}
  }

const routes: any = [
  { path: "/", component: page("Home"), name: "home" },
  { path: "/slow", component: page("Slow"), getStaticProps: getStaticProps("Slow", 100) },
  { path: "/fast", component: page("Fast"), getStaticProps: getStaticProps("Fast") },
  {
    path: "/about",
    component: page("About", true),
    name: "about",
    getStaticProps: getStaticProps("About"),
    children: [
      {
        path: "/foo",
        component: page("Foo"),
        name: "foo",
        getStaticProps: getStaticProps("Foo"),
      },
      {
        path: "/bar",
        component: page("Bar"),
        name: "bar",
        getStaticProps: getStaticProps("Bar"),
      },
    ],
  },
]

// one render only: Routers store is global and keeps the first history
it("should navigate without double getStaticProps, double playIn or outdated page", async () => {
  const history = createBrowserHistory()
  const { container } = render(
    <Router id={1} routes={routes} history={history} base="/">
      <Stack />
    </Router>,
  )
  const wait = (ms = 50) => act(() => sleep(ms))
  await wait()

  await act(async () => history.push("/about/foo"))
  await wait()
  await act(async () => history.push("/about/bar"))
  await wait()
  expect(staticProps).toEqual({ About: 1, Foo: 1, Bar: 1 })
  expect(playIns).toEqual({ Home: 1, About: 1, Foo: 1, Bar: 1 })

  // links in a sub-router page resolve from the root router
  const hrefs = Array.from(container.querySelectorAll("a")).map((a) =>
    a.getAttribute("href"),
  )
  expect(hrefs).toEqual(["/", "/about/foo", "/fast"])

  // query param change: currentRoute and props update, page is not replayed
  const barEffects = routeEffects.Bar
  await act(async () => history.push("/about/bar?x=1"))
  await wait()
  expect(routeEffects.Bar).toBe(barEffects + 1)
  expect(container.textContent).toContain("Bar1")
  expect(playIns).toEqual({ Home: 1, About: 1, Foo: 1, Bar: 1 })

  // slow navigation resolving after a newer one must not replace it
  await act(async () => {
    history.push("/slow")
    history.push("/fast")
  })
  await wait(200)
  expect(container.textContent).toContain("Fast")
  expect(container.textContent).not.toContain("Slow")
})
