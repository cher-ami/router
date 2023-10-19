import React, { useState, useRef } from "react"
import { useStack } from "@cher-ami/router"
import { transitionsHelper } from "../helpers/transitionsHelper"

const componentName = "NotFoundPage"
function NotFoundPage(props, handleRef) {
  const rootRef = useRef(null)

  useStack({
    componentName,
    handleRef,
    rootRef,
    playIn: () => transitionsHelper(rootRef.current, true, { x: -50 }, { x: 0 }),
    playOut: () => transitionsHelper(rootRef.current, false, { x: -0 }, { x: 50 }),
  })

  return (
    <div className={componentName} ref={rootRef}>
      NOT FOUND NOT FOUNDNOT FOUNDNOT FOUNDNOT FOUNDNOT FOUNDNOT FOUNDNOT FOUNDNOT
      FOUNDNOT FOUNDNOT FOUNDNOT NOT FOUND NOT FOUNDNOT FOUNDNOT FOUNDNOT FOUNDNOT
      FOUNDNOT FOUNDNOT FOUNDNOT FOUNDNOT FOUNDNOT FOUNDNOT NOT FOUND NOT FOUNDNOT
      FOUNDNOT FOUNDNOT FOUNDNOT FOUNDNOT FOUNDNOT FOUNDNOT FOUNDNOT FOUNDNOT FOUNDNOT NOT
      FOUND NOT FOUNDNOT FOUNDNOT FOUNDNOT FOUNDNOT FOUNDNOT FOUNDNOT FOUNDNOT FOUNDNOT
      FOUNDNOT FOUNDNOT
    </div>
  )
}

export default React.forwardRef(NotFoundPage)
