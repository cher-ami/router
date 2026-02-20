import React, { ForwardedRef, forwardRef, useRef } from "react"
import {
  getPathByRouteName,
  getSubRouterBase,
  getSubRouterRoutes,
  Stack,
  Link,
  Router,
  useRouter,
  useStack,
  useLang,
} from "@cher-ami/router"
import { transitionsHelper } from "../helper/transitionsHelper"
import { routesList } from "../routes"

const componentName: string = "AboutPage"
interface IProps {
  todo: any
}
const AboutPage = forwardRef((props: IProps, handleRef: ForwardedRef<any>) => {
  const rootRef = useRef(null)
  const [lang] = useLang()
  const { currentRoute } = useRouter()

  useStack({
    componentName,
    handleRef,
    rootRef,
    playIn: () => transitionsHelper(rootRef.current, true, { x: -50 }, { x: 0 }),
    playOut: () => transitionsHelper(rootRef.current, false, { x: -0 }, { x: 50 }),
  })

  // prepare routes & base for subRouter
  const router = useRouter()
  const path = getPathByRouteName(routesList, "AboutPage")

  return (
    <div className={componentName} ref={rootRef}>
      <h1>
        {componentName} - {lang.key} - {props?.todo?.title}
      </h1>
      Query Params :
      <ul>
        <li>Foo : {currentRoute.queryParams?.foo} </li>
        <li>Zoo : {currentRoute.queryParams?.zoo} </li>
      </ul>
      Children :
      <Router
        id={4}
        base={getSubRouterBase(path, router.base, true)}
        routes={getSubRouterRoutes(path, router.routes)}
        isHashHistory={true}
      >
        <div className={componentName}>
          <nav>
            <ul>
              <li>
                <Link to={{ name: "LaPage" }}>La</Link>
              </li>
              <li>
                <Link to={{ name: "OurPage" }}>Our</Link>
              </li>
            </ul>
          </nav>

          <Stack />
        </div>
      </Router>
    </div>
  )
})

AboutPage.displayName = componentName
export default AboutPage
