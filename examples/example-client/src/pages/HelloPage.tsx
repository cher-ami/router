import React, { ForwardedRef, forwardRef, useRef } from "react"
import { useStack } from "@cher-ami/router"
import { transitionsHelper } from "../helper/transitionsHelper"

const componentName: string = "HelloPage"

interface IProps {}

export const HelloPage = forwardRef((props: IProps, handleRef: ForwardedRef<any>) => {
  const rootRef = useRef(null)

  useStack({
    componentName,
    handleRef,
    rootRef,
    playIn: () => transitionsHelper(rootRef.current, true),
    playOut: () => transitionsHelper(rootRef.current, false),
  })

  return (
    <div className={componentName} ref={rootRef}>
      {componentName}
    </div>
  )
})

HelloPage.displayName = componentName
export default HelloPage
