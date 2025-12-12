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
      NOT FOUND NOT FOUND NOT FOUND NOT FOUND NOT FOUND NOT FOUND NOT FOUND NOT FOUND NOT
      FOUND NOT FOUND NOT FOUND NOT NOT FOUND NOT FOUND NOT FOUND NOT FOUND NOT FOUND NOT
      FOUND NOT FOUND NOT FOUND NOT FOUND NOT FOUND NOT FOUND NOT NOT FOUND NOT FOUND NOT
      FOUND NOT FOUND NOT FOUND NOT FOUND NOT FOUND NOT FOUND NOT FOUND NOT FOUND NOT
      FOUND NOT NOT FOUND NOT FOUND NOT FOUND NOT FOUND NOT FOUND NOT FOUND NOT FOUND NOT
      FOUND NOT FOUND NOT FOUND NOT FOUND NOT
    </div>
  )
}

NotFoundPage.displayName = componentName
export default React.forwardRef(NotFoundPage)
