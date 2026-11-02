/**
 * @vitest-environment jsdom
 */
import { it, expect } from "vitest"
import React, { useRef } from "react"
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
} from ".."

const playIns: string[] = []
const playOuts: string[] = []
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const page = (name: string, withSubRouter = false) =>
  React.forwardRef((props: any, handleRef) => {
    const rootRef = useRef(null)
    useStack({
      componentName: name,
      handleRef,
      rootRef,
      playIn: async () => void playIns.push(name),
      playOut: () => {
        playOuts.push(name)
        return sleep(100)
      },
    })
    const router = useRouter()
    if (!withSubRouter) return <div ref={rootRef}>{name}</div>
    const path = getPathByRouteName(router.routes, "about")
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
  { path: "/contact", component: page("Contact"), name: "contact" },
  {
    path: "/about",
    component: page("About", true),
    name: "about",
    children: [
      { path: "/foo", component: page("Foo"), name: "foo" },
      { path: "/bar", component: page("Bar"), name: "bar" },
    ],
  },
]

it("should not play in a page left during its transition", async () => {
  const history = createBrowserHistory()
  ;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
  await act(async () => {
    render(
      <Router id={1} routes={routes} history={history} base="/">
        <Stack />
      </Router>,
    )
  })
  // act() delays React updates until it ends, which would hide the timing tested here
  ;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = false
  const go = async (url: string, ms = 300) => {
    history.push(url)
    await sleep(ms)
  }
  await sleep(50)
  await go("/about/foo")

  // sub-router: Foo is still playing out when we leave, Bar must not play in
  playIns.length = 0
  await go("/about/bar", 20)
  await go("/contact")
  expect(playIns).toEqual(["Contact"])

  // root router: Contact is still playing out when we leave, About must not play in
  await go("/about/foo", 20)
  playIns.length = 0
  await go("/")
  expect(playIns).toEqual(["Home"])

  // to a parent router's route: the sub-page leaves with its parent, only the parent plays out
  await go("/about/foo")
  playOuts.length = 0
  await go("/contact")
  expect(playOuts).toEqual(["About"])

  // to the parent route: the parent stays, the sub-page has to play out
  await go("/about/foo")
  playOuts.length = 0
  await go("/about")
  expect(playOuts).toEqual(["Foo"])

  // back and forth after leaving: the new sub-router still handles its own routes
  await go("/about/bar")
  playIns.length = 0
  playOuts.length = 0
  await go("/about/foo")
  expect(playOuts).toEqual(["Bar"])
  expect(playIns).toEqual(["Foo"])
})
