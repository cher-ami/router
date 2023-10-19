import React, { useRef } from "react"
import { useStack } from "@cher-ami/router"
import { transitionsHelper } from "../helpers/transitionsHelper"

const componentName = "BarPage"
function BarPage(props, handleRef) {
  const rootRef = useRef(null)

  useStack({
    componentName,
    handleRef,
    rootRef,
    playIn: () => transitionsHelper(rootRef.current, true, { x: -50 }, { x: 0 }),
    playOut: () => transitionsHelper(rootRef.current, false, { x: -0 }, { x: 50 }),
  })

  return (
    <div className={[componentName].filter((e) => e).join(" ")} ref={rootRef}>
      {componentName}
    </div>
  )
}

export default React.forwardRef(BarPage)
