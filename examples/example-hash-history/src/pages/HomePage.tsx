import React, { ForwardedRef, forwardRef, useRef } from "react"
import {
  getPathByRouteName,
  getSubRouterBase,
  getSubRouterRoutes,
  Link,
  Router,
  Stack,
  useLang,
  useRouter,
  useStack,
} from "@cher-ami/router"
import { transitionsHelper } from "../helper/transitionsHelper"
import debug from "@cher-ami/debug"

const componentName: string = "HomePage"
const log = debug(`router:${componentName}`)

interface IProps {
  params: {
    lang: string
  }
}

const HomePage = forwardRef((props: IProps, handleRef: ForwardedRef<any>) => {
  const rootRef = useRef(null)
  const [lang] = useLang()

  useStack({
    componentName,
    handleRef,
    rootRef,
    playIn: () => transitionsHelper(rootRef.current, true, { x: -50 }, { x: 0 }),
    playOut: () => transitionsHelper(rootRef.current, false, { x: -0 }, { x: 50 }),
  })

  const router = useRouter()
  const path = getPathByRouteName(router.routes, "HomePage")
  const subBase = getSubRouterBase(path, router.base)
  const subRoutes = getSubRouterRoutes(path, router.routes)

  return (
    <div className={componentName} ref={rootRef}>
      <h1>
        {componentName} {lang.key}
      </h1>
      <Router id={2} base={subBase} routes={subRoutes} isHashHistory={true}>
        <div className={componentName}>
          <nav>
            <ul>
              <li>
                <Link to={{ name: "FooPage" }}>Foo</Link>
              </li>
              <li>
                <Link to={{ name: "BarPage" }}>Bar (has sub router)</Link>
              </li>
            </ul>
          </nav>
          <Stack />
        </div>
      </Router>
    </div>
  )
})

HomePage.displayName = componentName
export default HomePage
