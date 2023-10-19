import React, { ForwardedRef, forwardRef, useRef } from "react"
import {
  getPathByRouteName,
  getSubRouterBase,
  getSubRouterRoutes,
  useStack,
  Link,
  Router,
  Stack,
  useRouter,
} from "@cher-ami/router"
import { transitionsHelper } from "../helper/transitionsHelper"
import { routesList } from "../routes"
import debug from "@wbe/debug"

const componentName: string = "BarPage"
const log = debug(`router:${componentName}`)

interface IProps {}

export const BarPage = forwardRef((props: IProps, handleRef: ForwardedRef<any>) => {
  const rootRef = useRef(null)

  useStack({
    componentName,
    handleRef,
    rootRef,
    playIn: () => transitionsHelper(rootRef.current, true, { y: -20 }, { y: 0 }),
    playOut: () => transitionsHelper(rootRef.current, false, { y: -0 }, { y: 20 }),
  })

  const router = useRouter()
  const path = getPathByRouteName(router.routes, "BarPage")
  const subBase = getSubRouterBase(path, router.base)
  const subRoutes = getSubRouterRoutes(path, router.routes)

  return (
    <div className={componentName} ref={rootRef}>
      {componentName}
      <Router id={3} base={subBase} routes={subRoutes}>
        <div className={componentName}>
          <nav>
            <ul>
              <li>
                <Link to={{ name: "YoloPage" }}>Yolo</Link>
              </li>
              <li>
                <Link to={{ name: "HelloPage" }}>Hello</Link>
              </li>
            </ul>
          </nav>
          <Stack />
        </div>
      </Router>
    </div>
  )
})

BarPage.displayName = componentName
export default BarPage
