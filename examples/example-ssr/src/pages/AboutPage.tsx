import React, { ForwardedRef, useEffect, useRef } from "react"
import {
  useStack,
  getSubRouterBase,
  getSubRouterRoutes,
  getSubRouterStaticLocation,
  Link,
  Router,
  Stack,
  useRouter,
} from "@cher-ami/router"
import { transitionsHelper } from "../helpers/transitionsHelper"
import { getPathByRouteName } from "@cher-ami/router"
import debug from "@cher-ami/debug"
import { useLang } from "@cher-ami/router"
import { EPages } from "../routes"

const componentName = "AboutPage"

interface IProps {
  todo: any
}
function AboutPage(props: IProps, handleRef: ForwardedRef<any>) {
  const rootRef = useRef(null)
  const [lang] = useLang()

  useStack({
    componentName,
    handleRef,
    rootRef,
    playIn: () => transitionsHelper(rootRef.current, true, { x: -50 }, { x: 0 }),
    playOut: () => transitionsHelper(rootRef.current, false, { x: -0 }, { x: 50 }),
  })

  // prepare routes & base for subRouter
  const router = useRouter()
  const path = getPathByRouteName(router.routes, EPages.ABOUT)
  const subRouterBase = getSubRouterBase(path, router.base, true)
  const surRouterRoutes = getSubRouterRoutes(path, router.routes)

  // Calculate staticLocation for sub-router during SSR
  const subRouterStaticLocation = getSubRouterStaticLocation(
    router.staticLocation,
    subRouterBase,
  )

  return (
    <div className={componentName} ref={rootRef}>
      {componentName} {lang.key} - {props?.todo?.title}
      <br />
      <Link to={{ name: EPages.FOO }}>Foo</Link>
      <br />
      <Link to={{ name: EPages.BAR, queryParams: { hello: "you" }, hash: "my-hash" }}>
        Bar
      </Link>
      <br />
      <Router
        id={2}
        isSubRouter
        base={subRouterBase}
        routes={surRouterRoutes}
        staticLocation={subRouterStaticLocation}
        initialStaticProps={router.initialStaticProps}
      >
        <Stack as="div" />
      </Router>
    </div>
  )
}

export default React.forwardRef(AboutPage)
