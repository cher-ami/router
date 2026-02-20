import React, { ForwardedRef, useRef } from "react"
import { Link, useRouter, useStack } from "@cher-ami/router"
import { transitionsHelper } from "~/helpers/transitionsHelper"
import { EPages } from "~/routes"

const componentName = "BarPage"
interface IProps {
  todo: any
}
function BarPage(props: IProps, handleRef: ForwardedRef<any>) {
  const rootRef = useRef(null)
  const { currentRoute } = useRouter()

  useStack({
    componentName,
    handleRef,
    rootRef,
    playIn: () => transitionsHelper(rootRef.current, true, { x: -50 }, { x: 0 }),
    playOut: () => transitionsHelper(rootRef.current, false, { x: -0 }, { x: 50 }),
  })

  return (
    <div className={[componentName].filter((e) => e).join(" ")} ref={rootRef}>
      <h1>{componentName}</h1> - {props?.todo?.title}
      Query Params :
      <ul>
        <li>Hello : {currentRoute.queryParams?.hello} </li>
      </ul>
      <br />
      <br />
      <Link to={{ name: EPages.FOO }}>link to FOO</Link>
    </div>
  )
}

export default React.forwardRef(BarPage)
